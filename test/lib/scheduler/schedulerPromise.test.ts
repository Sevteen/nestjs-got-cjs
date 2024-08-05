import { asyncScheduler } from 'rxjs';
import { schedulerPromise } from '../../../src/lib/scheduler/schedulerPromise';

async function examplePromise(): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve('result'), 100));
}

describe('schedulerPromise', () => {
  it('schedulerPromise resolves with value from promise', (done) => {
    schedulerPromise(examplePromise(), asyncScheduler).subscribe({
      next: (value) => {
        expect(value).toBe('result');
        done();
      },
      complete: () => done(),
      error: done.fail,
    });
  });

  it('schedulerPromise calls unsubscriber on complete', (done) => {
    const unsubscriber = jest.fn();

    schedulerPromise(examplePromise(), asyncScheduler, unsubscriber).subscribe({
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

  it('schedulerPromise handles promise rejection', (done) => {
    const failingPromise = new Promise<string>((_, reject) => setTimeout(() => reject('error'), 100));

    schedulerPromise(failingPromise, asyncScheduler).subscribe({
      next: () => done.fail('Should not emit any value'),
      complete: () => done.fail('Should not complete'),
      error: (err) => {
        expect(err).toBe('error');
        done();
      },
    });
  });
});
