import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as L from 'leaflet';

interface MapView {
  center: L.LatLng;
  zoom: number;
  origin: 'top' | 'bottom';
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private view = new Subject<MapView>();
  viewChanged = this.view.asObservable();

  setView(center: L.LatLng, zoom: number, origin: 'top' | 'bottom') {
    this.view.next({ center, zoom, origin });
  }
}
