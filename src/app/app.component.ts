import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { MapBottomComponent } from './components/map-bottom/map-bottom.component';
import { MapTopComponent } from './components/map-top/map-top.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,

    // Material
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,

    // Component
    MapTopComponent,
    MapBottomComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
