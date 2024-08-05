import { Observable, SchedulerLike, Subscriber, asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

/**
 * Creates an Observable from an AsyncIterator, using the provided scheduler.
 * @param input - The AsyncIterator to be converted.
 * @param scheduler - The scheduler used to manage execution timing.
 * @param unsubscriber - Optional cleanup function to be called when unsubscribed.
 * @returns An Observable that emits values from the AsyncIterator.
 */
export function schedulerAsyncIterable<T = any, TReturn = any>(
  input: AsyncIterator<T, TReturn>,
  scheduler: SchedulerLike = asyncScheduler,
  unsubscriber?: () => void,
): Observable<T> {
  return new Observable<T>((subscriber: Subscriber<T>) => {
    let isUnsubscribed = false;

    const handleIteration = async () => {
      if (isUnsubscribed) return;

      try {
        const result = await input.next();
        if (result.done) {
          subscriber.complete();
        } else {
          subscriber.next(result.value);
          scheduler.schedule(handleIteration);
        }
      } catch (error) {
        if (!isUnsubscribed) {
          console.error('Error in iteration:', error);
          subscriber.error(error);
        }
      }
    };

    const subscription = scheduler.schedule(handleIteration);

    const cleanup = () => {
      isUnsubscribed = true;
      if (unsubscriber) {
        unsubscriber();
      }
      subscription.unsubscribe();
    };

    subscriber.add(cleanup);

    return cleanup;
  }).pipe(observeOn(scheduler));
}
