import { Observable, SchedulerLike } from 'rxjs';
import { schedulerPromise } from './schedulerPromise';
import { schedulerAsyncIterable } from './schedulerAsyncIterable';
import { isPromise } from '../utils';

export const scheduled = <T>(
  input: Promise<T> | AsyncIterator<T>,
  scheduler: SchedulerLike,
  unsubscriber?: () => void,
): Observable<T> => {
  if (isPromise(input)) {
    return schedulerPromise<T>(input as Promise<T>, scheduler, unsubscriber);
  }

  return schedulerAsyncIterable<T>(input as AsyncIterator<T>, scheduler, unsubscriber);
};
