import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapService } from '../../services/map.service';

@Component({
  selector: 'app-map-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-top.component.html',
})
export class MapTopComponent implements AfterViewInit {
  map!: L.Map;
  constructor(private _mapService: MapService) {}

  ngAfterViewInit(): void {
    this.map = L.map('mapTop', {
      center: [46.8182, 8.2275], // Centered on Switzerland
      zoom: 10,
      zoomControl: false, // Disable the default zoom control
      attributionControl: false, // Disable the attribution control
    });

    this._mapService.initMap(this.map, 'mapTop');
  }
}
