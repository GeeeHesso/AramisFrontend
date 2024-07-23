import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { ALGORITHMS_RESULT, SELECTED_TARGETS } from '@core/models/base.const';
import { BehaviorSubject } from 'rxjs';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ALGORITHMS_RESULT, useValue: new BehaviorSubject(null) },
    { provide: SELECTED_TARGETS, useValue: new BehaviorSubject([]) },

    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideHttpClient(),

    importProvidersFrom(CommonModule),
    importProvidersFrom(BrowserAnimationsModule),
    provideAnimationsAsync(),
  ],
};
