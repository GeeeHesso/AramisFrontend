import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { API_LOADING } from '@core/models/base.const';
import { algorithmResult } from '@core/models/parameters';
import { MapService } from '@core/services/map.service';
import { ParametersComponent } from '@shared/components/parameters/parameters.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,

    // Material
    MatSidenavModule,
    MatProgressBarModule,

    // Component
    ParametersComponent,
  ],
})
export class AppComponent implements AfterViewInit {
  constructor(
    public mapService: MapService,

    @Inject(API_LOADING)
    public apiLoading: BehaviorSubject<algorithmResult>
  ) {}

  ngAfterViewInit(): void {
    // Need map to be initialized before anything else
    this.mapService.initMaps();
  }
}
