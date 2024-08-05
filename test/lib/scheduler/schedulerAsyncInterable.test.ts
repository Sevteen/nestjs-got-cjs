import { asapScheduler, asyncScheduler } from 'rxjs';
import { take } from 'rxjs/operators';
import { schedulerAsyncIterable } from '../../../src/lib/scheduler/schedulerAsyncIterable';

// Utility function to create a simple async iterator
async function* createAsyncIterator(values: any[]) {
  for (const value of values) {
    yield value;
  }
}

describe('schedulerAsyncIterable', () => {
  it('emits values from async iterator', (done) => {
    const values = [1, 2, 3];
    const asyncIterator = createAsyncIterator(values);

    schedulerAsyncIterable(asyncIterator, asyncScheduler)
      .pipe(take(values.length))
      .subscribe({
        next: (value) => {
          expect(values).toContain(value);
        },
        complete: () => done(),
        error: (err) => done(err),
      });
  });

  it('calls unsubscriber on complete', (done) => {
    const values = [1, 2, 3];
    const asyncIterator = createAsyncIterator(values);

    const unsubscriber = jest.fn();

    schedulerAsyncIterable(asyncIterator, asapScheduler, unsubscriber).subscribe({
      next: () => {},
      complete: () => {
        expect(unsubscriber).toHaveBeenCalled();
        done();
      },
      error: (err) => {
        done(err);
      },
    });
  });

  it('handles empty iterator', (done) => {
    const asyncIterator = createAsyncIterator([]);

    schedulerAsyncIterable(asyncIterator, asyncScheduler).subscribe({
      next: () => {
        done.fail('Should not emit any value');
      },
      complete: () => done(),
      error: (err) => done(err),
    });
  });
});
