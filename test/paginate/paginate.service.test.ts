import { Test, TestingModule } from '@nestjs/testing';
import { Got, OptionsWithPagination } from 'got-cjs';
import { SchedulerLike, asapScheduler, of } from 'rxjs';
import { PaginationService } from '../../src/paginate/paginate.service';
import { GOT_INSTANCE_TOKEN } from '../../src/got/got.constant';
import * as scheduled from '../../src/lib/scheduler/scheduled';

type MockedGotPaginate = {
  each: jest.Mock<AsyncIterableIterator<any>>;
  all: jest.Mock<AsyncIterableIterator<any>>;
};

describe('PaginationService', () => {
  let service: PaginationService;
  let mockedGotPaginate: MockedGotPaginate;

  beforeEach(async () => {
    mockedGotPaginate = {
      each: jest.fn(),
      all: jest.fn(),
    };

    const mockGot = {
      paginate: mockedGotPaginate,
    } as unknown as Got;

    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginationService, { provide: GOT_INSTANCE_TOKEN, useValue: mockGot }],
    }).compile();

    service = module.get<PaginationService>(PaginationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('each', () => {
    it('should return Observable<T> from each paginated result', (done) => {
      const mockResponse = [1, 2, 3]; // Example response
      const url = 'http://example.com';
      const options: OptionsWithPagination<any, any> = {};
      const scheduler: SchedulerLike = asapScheduler;

      const asyncIterable: AsyncIterableIterator<number> = (async function* () {
        for (const item of mockResponse) {
          yield item;
        }
      })();

      mockedGotPaginate.each.mockReturnValueOnce(asyncIterable);

      const emittedValues: number[] = [];
      service.each<number>(url, options, scheduler).subscribe({
        next(value) {
          emittedValues.push(value);
        },
        complete() {
          expect(emittedValues).toEqual(mockResponse);
          done();
        },
      });
    });

    it('should return Observable<T> from each paginated result without optional parameter', (done) => {
      const mockResponse = [1, 2, 3]; // Example response
      const url = 'http://example.com';

      const asyncIterable: AsyncIterableIterator<number> = (async function* () {
        for (const item of mockResponse) {
          yield item;
        }
      })();

      mockedGotPaginate.each.mockReturnValueOnce(asyncIterable);

      const emittedValues: number[] = [];
      service.each<number>(url).subscribe({
        next(value) {
          emittedValues.push(value);
        },
        complete() {
          expect(emittedValues).toEqual(mockResponse);
          done();
        },
      });
    });
  });

  describe('all', () => {
    it('should return Observable<T[]> from all paginated results', () => {
      const mockResponse = [1, 2, 3]; // Example response
      const url = 'http://example.com';
      const options: OptionsWithPagination<any, any> = {};
      const scheduler: SchedulerLike = asapScheduler;

      const asyncIterable: AsyncIterableIterator<number[]> = (async function* () {
        yield mockResponse;
      })();

      mockedGotPaginate.all.mockReturnValueOnce(asyncIterable);

      service.all<number>(url, options, scheduler).subscribe((result: any) => {
        expect(result).toEqual(mockResponse);
      });
    });

    it('should return Observable<T[]> from all paginated results without optional parameter', () => {
      const mockResponse = [1, 2, 3]; // Example response
      const url = 'http://example.com';

      const asyncIterable: AsyncIterableIterator<number[]> = (async function* () {
        yield mockResponse;
      })();

      mockedGotPaginate.all.mockReturnValueOnce(asyncIterable);

      service.all<number>(url).subscribe((result: any) => {
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('makeObservable', () => {
    it('should call scheduled with the result of paginate.all', () => {
      const mockResponse = [1, 2, 3];
      const url = 'http://example.com';
      const options: OptionsWithPagination<any, any> = {};
      const scheduler: SchedulerLike = asapScheduler;

      const scheduledObservable = of(mockResponse);
      jest.spyOn(scheduled, 'scheduled').mockReturnValueOnce(scheduledObservable);

      const observable = service['makeObservable'](mockedGotPaginate.all, url, options, scheduler);

      observable.subscribe({
        next(value) {
          expect(value).toEqual(mockResponse);
        },
        complete() {
          expect(scheduled.scheduled).toHaveBeenCalledWith(mockedGotPaginate.all(url, options), scheduler);
        },
      });
    });

    it('should call scheduled with the result of paginate.each', () => {
      const mockResponse = [1, 2, 3];
      const url = 'http://example.com';
      const options: OptionsWithPagination<any, any> = {};
      const scheduler: SchedulerLike = asapScheduler;

      const scheduledObservable = of(...mockResponse);
      jest.spyOn(scheduled, 'scheduled').mockReturnValueOnce(scheduledObservable);

      // Call `makeObservable` directly
      const observable = service['makeObservable'](mockedGotPaginate.each, url, options, scheduler);

      observable.subscribe({
        next(value) {
          expect(value).toBeOneOf(mockResponse);
        },
        complete() {
          expect(scheduled.scheduled).toHaveBeenCalledWith(mockedGotPaginate.each(url, options), scheduler);
        },
      });
    });
  });
});
