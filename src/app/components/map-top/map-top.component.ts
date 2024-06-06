import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import {MapService} from "../../services/map.service";
import 'leaflet/dist/leaflet.css';
@Component({
  selector: 'app-map-top',
  standalone: true,
  imports: [],
  templateUrl: './map-top.component.html',
  styleUrl: './map-top.component.css'
})
export class MapTopComponent implements OnInit {
  map!: L.Map;  // Use definite assignment assertion

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    this.map = L.map('mapTop').setView([51.505, -0.09], 13);
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
}
