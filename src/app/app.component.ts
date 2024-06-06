import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MapTopComponent} from "./components/map-top/map-top.component";
import {MapBottomComponent} from "./components/map-bottom/map-bottom.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MapTopComponent, MapBottomComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'swissgrid';
}
