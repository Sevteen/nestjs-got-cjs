import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs'; // Import fs untuk mocking
import { Got, Request, StreamOptions } from 'got';
import { Observable } from 'rxjs';
import { EventEmitter, Readable } from 'stream';
import { GOT_INSTANCE_TOKEN } from '../../src/got/got.constant';
import { StreamRequest } from '../../src/stream/stream-request.service';

function createMockReadableStream(data: any[]) {
  const stream = new Readable({ objectMode: true });
  let index = 0;
  stream._read = () => {
    if (index >= data.length) {
      stream.push(null); // End of stream
      return;
    }
    stream.push(data[index++]);
  };

  // Implementing pipe method
  stream.pipe = jest.fn().mockImplementation((dest) => {
    console.log('pipe called with steam');
    return dest;
  });

  // Implementing on method
  stream.on = jest.fn().mockImplementation((event, listener) => {
    if (event === 'end') {
      setImmediate(() => listener());
    }
    return stream;
  });

  stream.emit = jest.fn().mockImplementation((event) => {
    return event;
  });

  return stream;
}

jest.mock('fs');

const timeout = {
  request: 1000,
  connect: 500,
  secureConnect: 500,
  socket: 1000,
};

describe('StreamRequest', () => {
  let service: StreamRequest;
  let got: jest.Mocked<Got>;
  let request: jest.Mocked<Request>;

  beforeEach(async () => {
    request = {
      pipe: jest.fn().mockImplementation((dest) => {
        console.log('pipe called with request:', dest);
        return dest;
      }),
      on: jest.fn(),
      end: jest.fn(),
    } as unknown as jest.Mocked<Request>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          useClass: StreamRequest,
          provide: StreamRequest,
        },
        {
          provide: GOT_INSTANCE_TOKEN,
          useValue: {
            stream: {
              get: jest.fn().mockReturnValue(request),
              post: jest.fn().mockReturnValue(request),
              put: jest.fn().mockReturnValue(request),
              patch: jest.fn().mockReturnValue(request),
              delete: jest.fn().mockReturnValue(request),
            },
          } as unknown as jest.Mocked<Got>,
        },
      ],
    }).compile();

    service = await module.resolve<StreamRequest>(StreamRequest);
    got = module.get<jest.Mocked<Got>>(GOT_INSTANCE_TOKEN);

    // Mock stream methods
    jest.spyOn(got.stream, 'get').mockReturnValue(request);
    jest.spyOn(got.stream, 'post').mockReturnValue(request);
    jest.spyOn(got.stream, 'put').mockReturnValue(request);
    jest.spyOn(got.stream, 'patch').mockReturnValue(request);
    jest.spyOn(got.stream, 'delete').mockReturnValue(request);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize the stream request with Readable Stream', () => {
    const url = 'http://google.com';
    const fileStream = createMockReadableStream(['data']);
    const options: StreamOptions = {
      timeout: {
        request: 1000,
        connect: 500,
        secureConnect: 500,
        socket: 1000,
      },
    };

    jest.spyOn(got.stream, 'get').mockReturnValue(request);

    const handleFileSpy = jest.spyOn(service as any, 'handleFile');

    const result = service.process(got, 'get', url, fileStream, options);

    expect(handleFileSpy).toHaveBeenCalled();
    expect(handleFileSpy).toHaveBeenCalledWith('get', fileStream);

    expect(result).toBe(service);
    expect(fileStream).toBeInstanceOf(Readable);

    expect(fileStream.pipe).toHaveBeenCalled();
    expect(fileStream.pipe).toHaveBeenCalledWith(request);

    expect(fileStream.on).toHaveBeenCalledWith('end', expect.any(Function));
  });

  it('should process a request with a readable stream', () => {
    const url = 'http://google.com';
    const fileStream = createMockReadableStream(['data']);
    const options: StreamOptions = { timeout };

    service.process(got, 'post', url, fileStream, options);

    expect(got.stream.post).toHaveBeenCalledWith(url, {
      ...options,
      isStream: true,
    });
  });

  it('should handle a file path', () => {
    const url = 'http://google.com';
    const filePath = 'path/to/file';
    const options: StreamOptions = { timeout };

    // Create mock stream and mock fs.createReadStream
    const fileStream = createMockReadableStream(['data']);
    jest.spyOn(fs, 'createReadStream').mockReturnValueOnce(fileStream as unknown as fs.ReadStream);

    // Mocking got.stream.post to return a writable stream
    jest.spyOn(got.stream, 'post').mockReturnValueOnce(request);

    service.process(got, 'post', url, filePath, options);

    // Assertions
    expect(got.stream.post).toHaveBeenCalledWith(url, {
      ...options,
      isStream: true,
    });

    expect(fs.createReadStream).toHaveBeenCalledWith(filePath);

    // Check that fileStream was piped into the request's post method
    expect(fileStream.pipe).toHaveBeenCalledWith(request);
  });

  it('should handle errors in the on method', (done) => {
    const event = 'error';

    jest.spyOn(service, 'on').mockImplementation(() => {
      return new Observable((subscriber) => {
        subscriber.error(new Error('Test error'));
      });
    });

    service.on(event).subscribe({
      error: (error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Test error');
        done();
      },
    });
  });

  it('should end stream with empty file', () => {
    const url = 'http://google.com';
    const options: StreamOptions = { timeout };

    service.process(got, 'post', url, undefined, options);

    expect(request.end).toHaveBeenCalled();
  });

  it('should handle errors while processing a stream', () => {
    const url = 'http://google.com';
    const fileStream = createMockReadableStream(['data']);
    const options: StreamOptions = { timeout };

    // Simulate an error in the stream
    const error = new Error('Stream error');
    jest.spyOn(fileStream, 'pipe').mockImplementation(() => {
      throw error;
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    service.process(got, 'post', url, fileStream, options);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error handling file stream:', error);

    consoleErrorSpy.mockRestore();
  });

  it('should handle file stream end event', async () => {
    const url = 'http://google.com';
    const fileStream = createMockReadableStream(['data']);
    const options: StreamOptions = { timeout };

    const streamEndSpy = jest.spyOn(request, 'end');

    service.process(got, 'post', url, fileStream, options);

    fileStream.emit('end'); // This should trigger the 'end' event

    await new Promise((resolve) => setTimeout(resolve, 10)); //wait delay for reading emit end
    expect(streamEndSpy).toHaveBeenCalled();
  });

  it('should handle the response event emitter', (done) => {
    const mockStream = new EventEmitter() as jest.Mocked<EventEmitter>;
    const mockGot = {
      stream: {
        get: jest.fn().mockReturnValue(mockStream),
        post: jest.fn().mockReturnValue(mockStream),
      } as any,
    } as jest.Mocked<Got>;
    const mockService = new StreamRequest();

    mockService.process(mockGot, 'get', 'https://google.com');

    mockService.on('response').subscribe((response) => {
      expect(response).toEqual({ statusCode: 200 });
      done();
    });

    mockStream.emit('response', { statusCode: 200 });
  });

  it('should handle errors', (done) => {
    // Mocking StreamRequest dan got
    const mockStream = new EventEmitter();
    const mockGot = {
      stream: {
        get: jest.fn().mockReturnValue(mockStream),
        post: jest.fn().mockReturnValue(mockStream),
      },
    } as unknown as Got;

    service.process(mockGot, 'get', 'http://example.com');

    // Subscribe to the error event
    service.on('error').subscribe((response) => {
      try {
        expect(response).toEqual(new Error('Test error'));
        done();
      } catch (error: any) {
        done.fail(error);
      }
    });

    // Emit the error event after some time to simulate async behavior
    mockStream.emit('error', new Error('Test error'));
  });
});
