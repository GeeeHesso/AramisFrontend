import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { ApiService } from '@core/services/api.service';
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
    //Material
    MatToolbarModule,
    MatSidenavModule,
    // Component
    ParametersComponent,
  ],
})
export class AppComponent implements OnInit {
  constructor(
    private apiManagementService: ApiService,
    public mapService: MapService
  ) {}

  ngOnInit(): void {
    this.mapService.initMaps();
    this.apiManagementService.getInitialGrid();
  }
}
