import { SchedulerLike, asapScheduler } from 'rxjs';
import { scheduled } from '../../../src/lib/scheduler/scheduled';
import { schedulerPromise } from '../../../src/lib/scheduler/schedulerPromise';
import { schedulerAsyncIterable } from '../../../src/lib/scheduler/schedulerAsyncIterable';

jest.mock('../../../src/lib/scheduler/schedulerPromise');
jest.mock('../../../src/lib/scheduler/schedulerAsyncIterable');

describe('scheduled', () => {
  const mockScheduler: SchedulerLike = asapScheduler;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call schedulerPromise when input is a Promise', () => {
    const mockPromise = Promise.resolve('test');
    const mockUnsubscriber = jest.fn();

    // Mock implementation
    (schedulerPromise as jest.Mock).mockReturnValue('mockObservable');

    const result = scheduled(mockPromise, mockScheduler, mockUnsubscriber);

    expect(schedulerPromise).toHaveBeenCalledWith(mockPromise, mockScheduler, mockUnsubscriber);
    expect(result).toBe('mockObservable');
  });

  it('should call schedulerAsyncIterable when input is an AsyncIterator', () => {
    const mockAsyncIterator: AsyncIterator<string> = {
      next: jest.fn().mockResolvedValue({ value: 'test', done: false }),
      return: jest.fn(),
      throw: jest.fn(),
    };
    const mockUnsubscriber = jest.fn();

    // Mock implementation
    (schedulerAsyncIterable as jest.Mock).mockReturnValue('mockObservable');

    const result = scheduled(mockAsyncIterator, mockScheduler, mockUnsubscriber);

    expect(schedulerAsyncIterable).toHaveBeenCalledWith(mockAsyncIterator, mockScheduler, mockUnsubscriber);
    expect(result).toBe('mockObservable');
  });
});
