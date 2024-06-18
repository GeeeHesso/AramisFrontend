import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { MapBottomComponent } from './components/map-bottom/map-bottom.component';
import { MapTopComponent } from './components/map-top/map-top.component';
import { ParametersComponent } from './components/parameters/parameters.component';

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
export class AppComponent {}
