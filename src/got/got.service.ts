import { Inject, Injectable } from '@nestjs/common';
import { Got, GotRequestFunction, OptionsOfJSONResponseBody, Response, got } from 'got-cjs-compat';
import { Observable, SchedulerLike, asyncScheduler } from 'rxjs';
import { scheduled } from '../lib/scheduler/scheduled';
import { PaginationService } from '../paginate/paginate.service';
import { StreamService } from '../stream/stream.service';
import { GOT_INSTANCE_TOKEN } from './got.constant';

@Injectable()
export class GotService {
  constructor(
    readonly stream: StreamService,
    readonly paginate: PaginationService,
    @Inject(GOT_INSTANCE_TOKEN) protected readonly instance: Got = got,
  ) {}

  get<T = any>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
    scheduler?: SchedulerLike,
  ): Observable<Response<T>> {
    return this.makeObservable<T>(this.instance.get, url, options, scheduler);
  }

  post<T = any>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
    scheduler?: SchedulerLike,
  ): Observable<Response<T>> {
    return this.makeObservable<T>(this.instance.post, url, options, scheduler);
  }

  head<T = any>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
    scheduler?: SchedulerLike,
  ): Observable<Response<T>> {
    return this.makeObservable<T>(this.instance.head, url, options, scheduler);
  }

  delete<T = any>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
    scheduler?: SchedulerLike,
  ): Observable<Response<T>> {
    return this.makeObservable<T>(this.instance.delete, url, options, scheduler);
  }

  put<T = any>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
    scheduler?: SchedulerLike,
  ): Observable<Response<T>> {
    return this.makeObservable<T>(this.instance.put, url, options, scheduler);
  }

  patch<T = any>(
    url: string | URL,
    options?: OptionsOfJSONResponseBody,
    scheduler?: SchedulerLike,
  ): Observable<Response<T>> {
    return this.makeObservable<T>(this.instance.patch, url, options, scheduler);
  }

  get gotRef(): Got {
    return this.instance;
  }

  protected makeObservable<T>(
    gotFunction: GotRequestFunction,
    url: string | URL,
    options: OptionsOfJSONResponseBody = {},
    scheduler: SchedulerLike = asyncScheduler,
  ): Observable<Response<T>> {
    const request = gotFunction<T>(url, {
      ...options,
      responseType: 'json',
      isStream: false,
    });

    return scheduled<Response<T>>(request, scheduler, request.cancel.bind(request));
  }
}
