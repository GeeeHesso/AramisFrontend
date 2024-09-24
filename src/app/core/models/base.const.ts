import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { algorithmResult } from './parameters';

export const ALGORITHMS_RESULT_FOR_TABLE = new InjectionToken<
  BehaviorSubject<algorithmResult[]>
>('algorithms.result');

export const SELECTED_TARGETS = new InjectionToken<BehaviorSubject<number[]>>(
  'selected.targets'
);

export const SELECTED_ALGOS = new InjectionToken<BehaviorSubject<string[]>>(
  'selected.algos'
);

export const API_LOADING = new InjectionToken<BehaviorSubject<boolean>>(
  'api.loading'
);
