import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import L from 'leaflet';
import { MapComponent } from '../map.component';

@Component({
  selector: 'app-map-bottom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-bottom.component.html',
})
export class MapBottomComponent extends MapComponent implements AfterViewInit {
  map!: L.Map;

  ngAfterViewInit(): void {
    this.map = L.map('mapBottom', {
      center: this.center,
      zoom: this.zoom,
      zoomControl: this.zoomControl, // Disable the default zoom control
      attributionControl: this.attributionControl, // Disable the attribution control
    });

    this._mapService.initMap(this.map, 'mapBottom');
  }
}
