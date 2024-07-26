import { Directive, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Directive()
export abstract class BaseClass implements OnDestroy {
  protected _unsubscribe$: Subject<void> = new Subject();

  ngOnDestroy(): void {
    this._unsubscribe$.next(); // emit
    this._unsubscribe$.complete(); // auto destroy, same as unsubscribe (to check)
    this._extendedDestroy();
  }

  protected _extendedDestroy() {}
}
