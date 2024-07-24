import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { algorithmsResult } from './parameters';

export const ALGORITHMS_RESULT = new InjectionToken<
  BehaviorSubject<algorithmsResult>
>('aramis.algorithms.result');

export const SELECTED_TARGETS = new InjectionToken<BehaviorSubject<number[]>>(
  'aramis.selected.targets'
);

export const API_LOADING = new InjectionToken<BehaviorSubject<boolean>>(
  'aramis.api.loading'
);
