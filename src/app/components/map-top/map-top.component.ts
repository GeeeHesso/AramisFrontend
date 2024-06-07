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
      maxZoom: 16,
      minZoom: 8
    }).addTo(this.map);

    console.log('Fetching GeoJSON data');
    fetch('assets/world_mask_without_switzerland.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        console.log('GeoJSON data loaded', data);
        const mask = L.geoJSON(data, {
          style: {
            color: '#ffffff', // Color of the mask
            fillOpacity: 1, // Opacity of the mask
            weight: 0
          }
        }).addTo(this.map);

        // Set the initial view to Switzerland after adding the mask
        this.map.setView([46.8182, 8.2275], 8);
      })
      .catch(error => {
        console.error('Error loading GeoJSON data:', error);
      });

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
