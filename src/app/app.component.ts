import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, OperatorFunction, Subject } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';

enum RxJSOperator {
  MAP = 'map',
  FILTER = 'filter',
  DEBOUNCE_TIME = 'debounceTime',
}

type ValidOperatorFn = OperatorFunction<number | undefined, number | undefined>;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private before = new Subject<number>();

  selectedOperator: RxJSOperator = this.operators[0];
  nextValue = 1;

  get operators(): RxJSOperator[] {
    return Object.values(RxJSOperator);
  }

  get operatorImpl(): Record<RxJSOperator, ValidOperatorFn> {
    return {
      [RxJSOperator.MAP]: map((num) => num! * 1.23),
      [RxJSOperator.FILTER]: filter((num) => num! < 0),
      [RxJSOperator.DEBOUNCE_TIME]: debounceTime(1000),
    };
  }

  constructor() {
    this.subscribeToAllImplOperators();
  }

  onNext(): void {
    this.before.next(this.nextValue);
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
    return this.before.pipe(filter(() => this.selectedOperator === operator));
  }

  private log(value: number): void {
    console.log(
      `-- ${this.selectedOperator.toUpperCase()} Operator --\nBEFORE: ${
        this.nextValue
      }\nAFTER: ${value}\ntimestamp: ${new Date()}`
    );
  }
}
