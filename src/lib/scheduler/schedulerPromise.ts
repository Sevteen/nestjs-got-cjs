import { Observable, SchedulerLike, asyncScheduler, Subscriber, observeOn } from 'rxjs';

/**
 * Creates an Observable from a Promise, using the provided scheduler.
 * @param promise - The Promise to be converted.
 * @param scheduler - The scheduler used to manage execution timing.
 * @param unsubscriber - Optional cleanup function to be called when unsubscribed.
 * @returns An Observable that resolves to the Promise's value.
 */
export function schedulerPromise<T = any>(
  promise: Promise<T>,
  scheduler: SchedulerLike = asyncScheduler,
  unsubscriber?: () => void,
): Observable<T> {
  return new Observable<T>((subscriber: Subscriber<T>) => {
    let isUnsubscribed = false;

    const handlePromise = () => {
      if (isUnsubscribed) return;

      promise
        .then((result) => {
          if (!isUnsubscribed) {
            subscriber.next(result);
            subscriber.complete();
          }
        })
        .catch((error) => {
          if (!isUnsubscribed) {
            subscriber.error(error);
          }
        });
    };

    const subscription = scheduler.schedule(handlePromise);

    const cleanup = () => {
      if (isUnsubscribed) return;

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
