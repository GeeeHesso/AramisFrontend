import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { Subject } from 'rxjs';

interface MapView {
  center: L.LatLng;
  zoom: number;
  origin: 'top' | 'bottom';
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  //@TODO: analyze
  private view = new Subject<MapView>();
  viewChanged = this.view.asObservable();

  setView(center: L.LatLng, zoom: number, origin: any) {
    this.view.next({ center, zoom, origin });
  }

  public initMap(map: L.Map, mapName: string): void {
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
        minZoom: 7,
      }
    ).addTo(map);

    //@TODO: analyze
    fetch('assets/world_mask_without_switzerland.geojson')
      .then((response) => {
        if (!response.ok) {
          // @todo: why? there is a catch under, check if usefull
          throw new Error(
            //@todo: not a network error, improve error management
            'Network response was not ok ' + response.statusText
          );
        }
        return response.json();
      })
      .then((data) => {
        const mask = L.geoJSON(data, {
          style: {
            color: '#ffffff', // Color of the mask
            fillOpacity: 1, // Opacity of the mask
            weight: 0,
          },
        }).addTo(map);

        //@todo: delete is useless
        // Set the initial view to Switzerland after adding the mask
        //map.setView([46.8182, 8.2275], 10);
      })
      .catch((error) => {
        console.error('Error loading GeoJSON data:', error);
      });

    map.on('move', () => {
      this.setView(map.getCenter(), map.getZoom(), mapName);
    });

    this.viewChanged.subscribe((view) => {
      if (view.origin !== mapName) {
        map.setView(view.center, view.zoom, { animate: false });
      }
    });
  }
}
