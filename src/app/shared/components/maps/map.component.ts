import { Directive } from '@angular/core';
import { LatLng } from 'leaflet';
import { MapService } from './map.service';

@Directive()
export abstract class MapComponent {
  protected center = new LatLng(46.8182, 8.2275); // Centered on Switzerland
  protected zoom = 8;
  protected zoomControl = false; // Disable the default zoom control
  protected attributionControl = false; // Disable the attribution control
  constructor(protected _mapService: MapService) {}
}
