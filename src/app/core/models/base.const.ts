import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { algorithmResult } from './parameters';

export const ALGORITHMS_RESULT = new InjectionToken<
  BehaviorSubject<algorithmResult[]>
>('aramis.algorithms.result');

export const SELECTED_TARGETS = new InjectionToken<BehaviorSubject<number[]>>(
  'aramis.selected.targets'
);

export const SELECTED_ALGOS = new InjectionToken<BehaviorSubject<string[]>>(
  'aramis.selected.algos'
);

export const API_LOADING = new InjectionToken<BehaviorSubject<boolean>>(
  'aramis.api.loading'
);
