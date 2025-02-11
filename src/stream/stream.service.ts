import { Readable } from 'stream';
import { Inject, Injectable } from '@nestjs/common';
import { Got, HTTPAlias, StreamOptions } from 'got';
import { StreamRequest } from './stream-request.service';
import { GOT_INSTANCE_TOKEN } from '../got/got.constant';

@Injectable()
export class StreamService {
  constructor(
    @Inject(GOT_INSTANCE_TOKEN) private readonly got: Got,
    private readonly request: StreamRequest,
  ) {}

  get(url: string | URL, options?: StreamOptions): StreamRequest {
    return this.makeRequest('get', url, undefined, options);
  }

  head(url: string | URL, options?: StreamOptions): StreamRequest {
    return this.makeRequest('head', url, undefined, options);
  }

  delete(url: string | URL, filePathOrStream?: string | Readable, options?: StreamOptions): StreamRequest {
    return this.makeRequest('delete', url, filePathOrStream, options);
  }

  post(url: string | URL, filePathOrStream?: string | Readable, options?: StreamOptions): StreamRequest {
    return this.makeRequest('post', url, filePathOrStream, options);
  }

  patch(url: string | URL, filePathOrStream?: string | Readable, options?: StreamOptions): StreamRequest {
    return this.makeRequest('patch', url, filePathOrStream, options);
  }

  put(url: string | URL, filePathOrStream?: string | Readable, options?: StreamOptions): StreamRequest {
    return this.makeRequest('put', url, filePathOrStream, options);
  }

  private makeRequest(
    verb: HTTPAlias,
    url: string | URL,
    filePathOrStream?: string | Readable,
    options?: StreamOptions,
  ): StreamRequest {
    return this.request.process(this.got, verb, url, filePathOrStream, options);
  }
}
