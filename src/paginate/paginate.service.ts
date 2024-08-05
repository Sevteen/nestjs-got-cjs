// prettier-ignore
import {
    Got,
    GotPaginate,
    OptionsWithPagination
  } from 'got-cjs';
import { Inject, Injectable } from '@nestjs/common';
import { Observable, asapScheduler, SchedulerLike } from 'rxjs';
import { GOT_INSTANCE_TOKEN } from '../got/got.constant';
import { scheduled } from '../lib/scheduler/scheduled';

/**
 * `PaginationService` provides methods for handling pagination on HTTP requests using `got`.
 * This code is adapted from https://github.com/toondaey/nestjs-got/blob/2d51cdc8b2fdf13c3618047d25445b8ad63cb144/lib/paginate.service.ts.
 *
 * @export
 * @class PaginationService
 */
@Injectable()
export class PaginationService {
  /**
   * Constructs the `PaginationService` with `Got` as a dependency.
   *
   * @param {Got} got - The `Got` instance injected using `GOT_INSTANCE_TOKEN`.
   */
  constructor(@Inject(GOT_INSTANCE_TOKEN) private readonly got: Got) {}

  /**
   * Returns an `Observable` that emits items one by one from the paginated results.
   *
   * @param {string | URL} url - The URL or string URL for the HTTP request.
   * @param {OptionsWithPagination<T, R>} [options] - Pagination options for the request.
   * @param {SchedulerLike} [scheduler] - RxJS scheduler for managing observables.
   * @returns {Observable<T>} - `Observable` that emits items one by one.
   */
  each<T = any, R = unknown>(
    url: string | URL,
    options?: OptionsWithPagination<T, R>,
    scheduler?: SchedulerLike,
  ): Observable<T> {
    return this.makeObservable<T, R>(this.got.paginate.each, url, options, scheduler);
  }

  /**
   * Returns an `Observable` that emits an array of all items from the paginated results.
   *
   * @param {string | URL} url - The URL or string URL for the HTTP request.
   * @param {OptionsWithPagination<T, R>} [options] - Pagination options for the request.
   * @param {SchedulerLike} [scheduler] - RxJS scheduler for managing observables.
   * @returns {Observable<T[]>} - `Observable` that emits an array of all items.
   */
  all<T = any, R = unknown>(
    url: string | URL,
    options?: OptionsWithPagination<T, R>,
    scheduler?: SchedulerLike,
  ): Observable<T[]> {
    return this.makeObservable<T, R>(this.got.paginate.all, url, options, scheduler);
  }

  /**
   * Private method to convert the result from `got.paginate` into an `Observable`.
   * Uses `scheduled` to manage observables with the given scheduler.
   *
   * @param {GotPaginate['all'] | GotPaginate['each']} paginate - The pagination method from `got.paginate`.
   * @param {string | URL} url - The URL or string URL for the HTTP request.
   * @param {OptionsWithPagination<T, R>} [options] - Pagination options for the request.
   * @param {SchedulerLike} [scheduler] - RxJS scheduler for managing observables.
   * @returns {Observable<T | T[]>} - `Observable` of the paginated results.
   */
  private makeObservable<T, R>(
    paginate: GotPaginate['all'],
    url: string | URL,
    options?: OptionsWithPagination<T, R>,
    scheduler?: SchedulerLike,
  ): Observable<T[]>;
  private makeObservable<T, R>(
    paginate: GotPaginate['each'],
    url: string | URL,
    options?: OptionsWithPagination<T, R>,
    scheduler?: SchedulerLike,
  ): Observable<T>;
  private makeObservable<T, R>(
    paginate: <TBody, TBodyType>(
      url: string | URL,
      options: OptionsWithPagination<TBody, TBodyType>,
    ) => Promise<TBody[]> | AsyncIterableIterator<TBody>,
    url: string | URL,
    options?: OptionsWithPagination<T, R>,
    scheduler: SchedulerLike = asapScheduler,
  ): Observable<T | T[]> {
    options = { ...options, isStream: false };

    return scheduled<T | T[]>(paginate<T, R>(url, options), scheduler);
  }
}
