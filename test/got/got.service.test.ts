import { Test, TestingModule } from '@nestjs/testing';
import got, { GotRequestFunction, OptionsOfJSONResponseBody, Response } from 'got';
import { Observable, SchedulerLike, asapScheduler } from 'rxjs';
import { GOT_INSTANCE_TOKEN } from '../../src/got/got.constant';
import { GotService } from '../../src/got/got.service';
import { PaginationService } from '../../src/paginate/paginate.service';
import { StreamService } from '../../src/stream/stream.service';

class MockGotService extends GotService {
  override get<T = any>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody | undefined,
    scheduler?: SchedulerLike | undefined,
  ): Observable<Response<T>> {
    return this.callMakeObservable(this.instance.get, url, options, scheduler);
  }
  callMakeObservable<T>(
    got: GotRequestFunction,
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
    scheduler?: SchedulerLike,
  ): Observable<Response<T>> {
    return this.makeObservable(got, url, options, scheduler);
  }
}

describe('GotService', () => {
  let service: GotService;
  let mockGotService: MockGotService;
  let streamService: StreamService;
  let paginationService: PaginationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GotService,
        {
          provide: GOT_INSTANCE_TOKEN,
          useValue: got,
        },
        { provide: StreamService, useValue: streamService },
        { provide: PaginationService, useValue: paginationService },
      ],
    }).compile();

    service = await module.resolve<GotService>(GotService);
    mockGotService = new MockGotService(streamService, paginationService, got);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should returned instance got', () => {
    const gotRef = service.gotRef;

    expect(gotRef).toBe(got);
  });

  it('should perform a GET request and return response', (done) => {
    const url = 'https://jsonplaceholder.typicode.com/todos/1';

    service.get(url).subscribe({
      next: (response) => {
        expect(response).toBeDefined();
        expect(response.body).toHaveProperty('id');
        expect(response.body.id).toBe(1);
        done();
      },
      error: (err) => {
        done.fail(err);
      },
    });
  });

  it('should perform a GET request and return response with correct parameters', (done) => {
    const url = 'https://jsonplaceholder.typicode.com/todos/1';

    service.get(url).subscribe({
      next: (response) => {
        expect(response).toBeDefined();
        expect(response.body).toHaveProperty('id');
        expect(response.body.id).toBe(1);
        done();
      },
      error: (err) => {
        done.fail(err);
      },
    });
  });

  describe('HTTP methods', () => {
    const url = 'https://jsonplaceholder.typicode.com/todos/1';
    const options = {};

    it('should call get method correctly', () => {
      const spy = jest.spyOn(service, 'get');

      service.get(url, options);
      expect(spy).toHaveBeenCalledWith(url, options);
    });

    it('should call post method correctly', () => {
      const spy = jest.spyOn(service, 'post');
      service.post(url, options);
      expect(spy).toHaveBeenCalledWith(url, options);
    });

    it('should call head method correctly', () => {
      const spy = jest.spyOn(service, 'head');
      service.head(url, options);
      expect(spy).toHaveBeenCalledWith(url, options);
    });

    it('should call delete method correctly', () => {
      const spy = jest.spyOn(service, 'delete');
      service.delete(url, options);
      expect(spy).toHaveBeenCalledWith(url, options);
    });

    it('should call put method correctly', () => {
      const spy = jest.spyOn(service, 'put');
      service.put(url, options);
      expect(spy).toHaveBeenCalledWith(url, options);
    });

    it('should call patch method correctly', () => {
      const spy = jest.spyOn(service, 'patch');
      service.patch(url, options);
      expect(spy).toHaveBeenCalledWith(url, options);
    });
  });

  describe('makeObservable method', () => {
    const url = 'https://jsonplaceholder.typicode.com/todos/1';
    const options = {};

    it('should call makeObservable with the correct parameters', () => {
      const spy = jest.spyOn(mockGotService, 'callMakeObservable');
      mockGotService.get(url, options, asapScheduler);
      expect(spy).toHaveBeenCalledWith(got.get, url, options, asapScheduler);
    });

    it('should call makeObservable with the optional parameters', () => {
      const spy = jest.spyOn(mockGotService, 'callMakeObservable');
      mockGotService.get(url);
      expect(spy).toHaveBeenCalledWith(got.get, url, undefined, undefined);
    });
  });
});
