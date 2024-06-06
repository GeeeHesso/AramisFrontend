import {Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {MapService} from "../../services/map.service";
import 'leaflet/dist/leaflet.css';
@Component({
  selector: 'app-map-bottom',
  standalone: true,
  imports: [],
  templateUrl: './map-bottom.component.html',
  styleUrl: './map-bottom.component.css'
})
export class MapBottomComponent implements OnInit {
  map!: L.Map;  // Use definite assignment assertion

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    this.map = L.map('mapBottom', {
      center: [46.8182, 8.2275], // Centered on Switzerland
      zoom: 8,
      zoomControl: false, // Disable the default zoom control
      attributionControl: false // Disable the attribution control
    });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    }).addTo(this.map);

    this.map.on('move', () => {
      this.mapService.setView(this.map.getCenter(), this.map.getZoom(), 'bottom');
    });

    this.mapService.viewChanged.subscribe(view => {
      if (view.origin !== 'bottom') {
        this.map.setView(view.center, view.zoom, { animate: false });
      }
    });
  }
}
