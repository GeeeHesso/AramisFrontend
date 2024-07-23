import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { MapService } from '@core/services/map.service';
import { ParametersComponent } from '@shared/components/parameters/parameters.component';

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
    MatToolbarModule,
    MatSidenavModule,

    // Component
    ParametersComponent,
  ],
})
export class AppComponent implements AfterViewInit {
  constructor(public mapService: MapService) {}

  ngAfterViewInit(): void {
    // Need map to be initialized before anything else
    this.mapService.initMaps();
  }
}
