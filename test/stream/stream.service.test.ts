import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
import { Got, got } from 'got-cjs-compat';
import { GOT_INSTANCE_TOKEN } from '../../src/got/got.constant';
import { StreamRequest } from '../../src/stream/stream-request.service';
import { StreamService } from '../../src/stream/stream.service';

describe('StreamService', () => {
  let service: StreamService;
  let mockGot: Got;
  let mockStreamRequest: StreamRequest;

  beforeEach(async () => {
    mockGot = got as Got;
    mockStreamRequest = { process: jest.fn() } as unknown as StreamRequest;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamService,
        { provide: GOT_INSTANCE_TOKEN, useValue: mockGot },
        { provide: StreamRequest, useValue: mockStreamRequest },
      ],
    }).compile();

    service = module.get<StreamService>(StreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call makeRequest with correct parameters for get method', () => {
    const url = 'http://google.com';
    const options = { retry: { limit: 2 } };
    const spy = jest.spyOn(mockStreamRequest, 'process');

    service.get(url, options);

    expect(spy).toHaveBeenCalledWith(mockGot, 'get', url, undefined, options);
  });

  it('should call makeRequest with correct parameters for head method', () => {
    const url = 'http://google.com';
    const options = { retry: { limit: 2 } };
    const spy = jest.spyOn(mockStreamRequest, 'process');

    service.head(url, options);

    expect(spy).toHaveBeenCalledWith(mockGot, 'head', url, undefined, options);
  });

  it('should call makeRequest with correct parameters for delete method', () => {
    const url = 'http://google.com';
    const filePath = 'path/to/file';
    const options = { throwHttpErrors: false };
    const spy = jest.spyOn(mockStreamRequest, 'process');

    service.delete(url, filePath, options);

    expect(spy).toHaveBeenCalledWith(mockGot, 'delete', url, filePath, options);
  });

  it('should call makeRequest with correct parameters for post method', () => {
    const url = 'http://google.com';
    const stream = new Readable();
    const options = { headers: { 'Content-Type': 'application/json' } };
    const spy = jest.spyOn(mockStreamRequest, 'process');

    service.post(url, stream, options);

    expect(spy).toHaveBeenCalledWith(mockGot, 'post', url, stream, options);
  });

  it('should call makeRequest with correct parameters for patch method', () => {
    const url = 'http://google.com';
    const filePath = 'path/to/file';
    const options = { retry: { limit: 2 } };
    const spy = jest.spyOn(mockStreamRequest, 'process');

    service.patch(url, filePath, options);

    expect(spy).toHaveBeenCalledWith(mockGot, 'patch', url, filePath, options);
  });

  it('should call makeRequest with correct parameters for put method', () => {
    const url = 'http://google.com';
    const stream = new Readable();
    const options = { headers: { Accept: 'application/json' } };
    const spy = jest.spyOn(mockStreamRequest, 'process');

    service.put(url, stream, options);

    expect(spy).toHaveBeenCalledWith(mockGot, 'put', url, stream, options);
  });
});
