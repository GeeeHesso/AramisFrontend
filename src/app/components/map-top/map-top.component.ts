import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '../../services/map.service';
import 'leaflet/dist/leaflet.css';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-top.component.html',
  styleUrls: ['./map-top.component.css']
})
export class MapTopComponent implements AfterViewInit {
  map!: L.Map; // Use definite assignment assertion

  constructor(private mapService: MapService) {}

  ngAfterViewInit(): void {
    // DOM manipulation and third-party library initialization
    this.initMap();

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    }).addTo(this.map);

    this.map.on('move', () => {
      this.mapService.setView(this.map.getCenter(), this.map.getZoom(), 'top');
    });

    this.mapService.viewChanged.subscribe(view => {
      if (view.origin !== 'top') {
        this.map.setView(view.center, view.zoom, { animate: false });
      }
    });
  }

  private initMap(): void {
    this.map = L.map('mapTop', {
      center: [46.8182, 8.2275], // Centered on Switzerland
      zoom: 8,
      zoomControl: false, // Disable the default zoom control
      attributionControl: false // Disable the attribution control
    });
  }
}
