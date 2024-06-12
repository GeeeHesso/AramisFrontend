import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from '../../services/map.service';
import 'leaflet/dist/leaflet.css';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-bottom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-bottom.component.html',
  styleUrls: ['./map-bottom.component.scss']
})
export class MapBottomComponent implements AfterViewInit {
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

    fetch('assets/world_mask_without_switzerland_v2.geojson')
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
        this.map.setView([46.8182, 8.2275], 10);
      })
      .catch(error => {
        console.error('Error loading GeoJSON data:', error);
      });


    this.map.on('move', () => {
      this.mapService.setView(this.map.getCenter(), this.map.getZoom(), 'bottom');
    });

    this.mapService.viewChanged.subscribe(view => {
      if (view.origin !== 'bottom') {
        this.map.setView(view.center, view.zoom, { animate: false });
      }
    });
  }

  private initMap(): void {
    this.map = L.map('mapBottom', {
      center: [46.8182, 8.2275], // Centered on Switzerland
      zoom: 10,
      zoomControl: false, // Disable the default zoom control
      attributionControl: false // Disable the attribution control
    });
  }
}
