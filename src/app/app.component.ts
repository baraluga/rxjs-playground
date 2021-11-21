import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Observable,
  of,
  OperatorFunction,
  pipe,
  Subject,
  throwError,
} from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  mergeMap,
  pluck,
  skip,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

enum RxJSOperator {
  MAP = 'map(fn)',
  FILTER = 'filter(fn)',
  MERGE_MAP = 'mergeMap(fn)',
  SWITCH_MAP = 'switchMap(fn)',
  DELAY = 'delay(number)',
  DEBOUNCE_TIME = 'debounceTime(number)',
  DISTINCT_UNTIL_CHANGED = 'disctinctUntilChanged()',
  PLUCK = 'pluck(keyOfObject)',
  TAP = 'tap(fn)',
  TAKE = 'take(number)',
  SKIP = 'skip(number)',
  CATCH_ERROR = 'catchError(fn)',
  FINALIZE = 'finalize(fn)',
  WITH_LATEST_FROM = 'withLatesFrom(observable$)',
}

type ValidOperatorFn = OperatorFunction<
  number | undefined,
  number | unknown[] | undefined
>;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private nextSubject = new Subject<number>();

  selectedOperator: RxJSOperator = this.operators[0];
  nextValue = 1;

  get operators(): RxJSOperator[] {
    return Object.values(RxJSOperator);
  }

  get operatorImpl(): Record<RxJSOperator, ValidOperatorFn> {
    return {
      [RxJSOperator.MAP]: map((num) => num! * 2),
      [RxJSOperator.FILTER]: filter((num) => num! < 0),
      [RxJSOperator.DEBOUNCE_TIME]: debounceTime(1000),
      [RxJSOperator.TAP]: tap(() =>
        console.log('do something not affecting the stream!')
      ),
      [RxJSOperator.TAKE]: take(3),
      [RxJSOperator.MERGE_MAP]: mergeMap((num) =>
        of(num! * 3).pipe(delay(1000))
      ),
      [RxJSOperator.DELAY]: delay(2000),
      [RxJSOperator.FINALIZE]: finalize(() =>
        console.log('think "finally" in try/catches!')
      ),
      [RxJSOperator.PLUCK]: pipe(
        map(() => ({ name: 'Brian', age: 29 })),
        pluck('age')
      ),
      [RxJSOperator.WITH_LATEST_FROM]: withLatestFrom(of('BRLG')),
      [RxJSOperator.SWITCH_MAP]: switchMap((num) =>
        of(num! * 3).pipe(delay(1000))
      ),
      [RxJSOperator.DISTINCT_UNTIL_CHANGED]: distinctUntilChanged(),
      [RxJSOperator.CATCH_ERROR]: pipe(
        mergeMap(() => throwError('simulated error!')),
        catchError((error) => of(error))
      ),
      [RxJSOperator.SKIP]: skip(3),
    };
  }

  constructor() {
    this.subscribeToAllImplOperators();
  }

  onNext(): void {
    this.nextSubject.next(this.nextValue);
  }

  onComplete(): void {
    this.nextSubject.complete();
  }

  private subscribeToAllImplOperators(): void {
    Object.entries(this.operatorImpl).forEach(([operator, fn]) =>
      this.subscribeToOperatorImplForLogging(operator as RxJSOperator, fn)
    );
  }

  private subscribeToOperatorImplForLogging(
    operator: RxJSOperator,
    fn: ValidOperatorFn
  ): void {
    this.filterOnlyMatchingOperator(operator)
      .pipe(fn)
      .subscribe((num) => this.log(num!));
  }

  private filterOnlyMatchingOperator(
    operator: RxJSOperator
  ): Observable<number> {
    return this.nextSubject.pipe(
      filter(() => this.selectedOperator === operator)
    );
  }

  private log(value: unknown): void {
    console.log(
      `-- ${this.selectedOperator} Operator --\nBEFORE: ${
        this.nextValue
      }\nAFTER: ${value}\ntimestamp: ${new Date()}`
    );
  }
}
