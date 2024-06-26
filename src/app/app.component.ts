import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { MapBottomComponent } from '@shared/components/maps/map-bottom/map-bottom.component';
import { MapTopComponent } from '@shared/components/maps/map-top/map-top.component';
import { ParametersComponent } from '@shared/components/parameters/parameters.component';
import {ApiManagementService} from "@services/api/api-management.service";

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
    MapTopComponent,
    MapBottomComponent,
    ParametersComponent,
  ],
})
export class AppComponent implements OnInit {
  constructor(private apiManagementService: ApiManagementService) {}

  ngOnInit(): void {
    this.apiManagementService.getInitialGrid();
  }
}
