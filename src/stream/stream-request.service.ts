import { Injectable, Scope } from '@nestjs/common';
import { createReadStream } from 'fs';
import { Got, GotStream, HTTPAlias, Request, StreamOptions } from 'got';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Readable } from 'stream';

@Injectable({ scope: Scope.TRANSIENT })
export class StreamRequest {
  private stream!: Request;

  /**
   * Initializes and starts a streaming request.
   * @param got Instance of Got client.
   * @param method HTTP method (e.g., 'get', 'post').
   * @param url URL for the request.
   * @param file Optional file or Readable stream to be sent.
   * @param streamOptions Optional additional options for the stream.
   * @returns The instance of this class.
   */
  process(got: Got, method: HTTPAlias, url: string | URL, file?: string | Readable, streamOptions: StreamOptions = {}) {
    this.stream = (got.stream[method] as GotStream)(url, {
      ...streamOptions,
      isStream: true,
    });

    this.handleFile(method, file);
    return this;
  }

  /**
   * Subscribes to specific events of the stream.
   * @param eventName Event name (e.g., 'data', 'error').
   * @returns Observable for the event.
   */
  on<T = unknown>(
    eventName:
      | 'end'
      | 'data'
      | 'error'
      | 'request'
      | 'readable'
      | 'response'
      | 'redirect'
      | 'uploadProgress'
      | 'downloadProgress',
  ): Observable<T> {
    return new Observable<T>((subscriber) => {
      const handler = (data: T) => subscriber.next(data);
      this.stream.on(eventName, handler);
      this.stream.once('error', (err) => subscriber.error(err));
      return () => this.stream.off(eventName, handler);
    }).pipe(
      catchError((error) => {
        console.error(`Error in stream event "${eventName}":`, error);
        return [];
      }),
    );
  }

  /**
   * Handles the file input and writes it to the stream.
   * @param file Optional file or Readable stream to be written.
   */
  private handleFile(method: HTTPAlias, file?: string | Readable): void {
    if (typeof file === 'string') {
      // Convert string file path to Readable stream
      file = createReadStream(file);
    }

    if (file instanceof Readable) {
      try {
        file.pipe(this.stream);
        file.on('end', () => {
          this.stream.end();
        });
      } catch (error) {
        console.error('Error handling file stream:', error);
      }
    } else if (['post', 'put', 'patch', 'delete'].includes(method)) {
      // End the stream if no file is provided for these methods
      this.stream.end();
    }
  }
}
