import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MapTopComponent} from "./components/map-top/map-top.component";
import {MapBottomComponent} from "./components/map-bottom/map-bottom.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import {CommonModule} from "@angular/common";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,
    MatSidenavModule,RouterOutlet, MapTopComponent, MapBottomComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'swissgrid';
}
