import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { Pantagruel } from '@core/models/pantagruel';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapComponent } from '../map.component';

@Component({
  selector: 'app-map-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-top.component.html',
})
export class MapTopComponent extends MapComponent implements AfterViewInit {
  protected map!: L.Map;

  ngAfterViewInit(): void {


    //@todo: check if inheritance can be improve
    this.map = L.map('mapTop', {
      center: this.center,
      zoom: this.zoom,
      zoomControl: this.zoomControl, // Disable the default zoom control
      attributionControl: this.attributionControl, // Disable the attribution control
    });

    this._mapService.initMap(this.map, 'mapTop');
    // example how to load data on map
    //@todo: search how to remove "any"
    this._mapService.drawOnMap(this.map);
  }
}
