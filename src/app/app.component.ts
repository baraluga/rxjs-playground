import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

enum RxJSOperator {
  MAP = 'map',
  FILTER = 'filter',
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private before = new Subject<number>();
  private after = new Subject<number>();

  selectedOperator: RxJSOperator = this.operators[0];
  nextValue = 1;

  get operators(): RxJSOperator[] {
    return Object.values(RxJSOperator);
  }

  constructor() {
    this.subscribeToAfterForLogging();

    this.subscribeForMapOperator();
    this.subscribeForFilterOperator();
  }

  onNext(): void {
    this.before.next(this.nextValue);
  }

  private subscribeToAfterForLogging(): void {
    this.after.subscribe((after) => this.log(after));
  }

  private subscribeForFilterOperator(): void {
    this.filterOnlyMatchingOperator(RxJSOperator.FILTER)
      .pipe(filter((num) => num > 1))
      .subscribe((num) => this.after.next(num));
  }

  private subscribeForMapOperator(): void {
    this.filterOnlyMatchingOperator(RxJSOperator.MAP)
      .pipe(map((num: number) => num * 5))
      .subscribe((num) => this.after.next(num));
  }

  private log(value: number): void {
    console.log(
      `-- ${this.selectedOperator.toUpperCase()} Operator --\nBEFORE: ${
        this.nextValue
      }\nAFTER: ${value}\ntimestamp: ${new Date()}`
    );
  }

  private filterOnlyMatchingOperator(
    operator: RxJSOperator
  ): Observable<number> {
    return this.before.pipe(filter(() => this.selectedOperator === operator));
  }
}
