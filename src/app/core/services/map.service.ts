import { Injectable } from '@angular/core';
import { Pantagruel } from '@core/models/pantagruel';

import { MapView } from '@core/models/map';
import * as L from 'leaflet';
import { LatLng } from 'leaflet';
import { Subject } from 'rxjs';
import { BranchService } from './branch.service';
import { BusService } from './bus.service';
import { DataService } from './data.service';
import {ApiService} from "@services/api.service";

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public mapTop!: L.Map;
  public mapBottom!: L.Map;
  private center = new LatLng(46.8182, 8.2275); // Centered on Switzerland
  private zoom = 8;
  private zoomControl = false; // Disable the default zoom control
  private attributionControl = false; // Disable the attribution control
  constructor(
    private _busService: BusService,
    private _branchService: BranchService,
    private _dataService: DataService,
    private _apiService: ApiService
  ) {}

  private _view$ = new Subject<MapView>(); // Correct that it is not a behavior subject becasue, behaviorSubject need to be initialize

  public initMaps(): void {
    this.mapTop = L.map('mapTop', {
      center: this.center,
      zoom: this.zoom,
      zoomControl: this.zoomControl, // Disable the default zoom control
      attributionControl: this.attributionControl, // Disable the attribution control
    });
    this.mapBottom = L.map('mapBottom', {
      center: this.center,
      zoom: this.zoom,
      zoomControl: this.zoomControl, // Disable the default zoom control
      attributionControl: this.attributionControl, // Disable the attribution control
    });

    this._initBaseMap(this.mapTop);
    this._initBaseMap(this.mapBottom);
    this._defaultgrid(this.mapTop)
  }

  private _initBaseMap(map: L.Map) {
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
        minZoom: 7,
      }
    ).addTo(map);

    // Hide other country
    fetch('assets/world_mask_without_switzerland.geojson')
      .then((res) => res.json())
      .then((json) => {
        L.geoJSON(json, {
          style: {
            color: '#ffffff', // Color of the mask
            fillOpacity: 1, // Opacity of the mask
            weight: 0,
          },
        }).addTo(map);
      });

    // Synchronize maps
    map.on('move', () => {
      this._view$.next({
        center: map.getCenter(),
        zoom: map.getZoom(),
        map: map,
      });
    });


    this._view$.subscribe((view) => {
      if (view.map !== map) {
        map.setView(view.center, view.zoom, { animate: false });
      }
    });
  }

  public drawOnMap(map: L.Map, grid: Pantagruel): void {
    this.clearMap(map); // in case of loading new data
    this._branchService.drawBranch(map, grid);
    this._busService.drawGen(map, grid);
  }

  public clearMap(map: L.Map): void {
    map.eachLayer((layer) => {
      layer.remove();
    });
    this._initBaseMap(map);
  }

  /**
   * Complete data sata with value use in display
   * branch: loadInjected, totalPowerMW, losses, from bus coordinates, to bus coordinates
   * gen: bus coordinates
   * load: bus coordinates, bus population
   */
  public getFormattedPantagruelData(data: Pantagruel): Pantagruel {
    this._dataService.setConstOfDataSet(data);
    // WARNING lat long reverse, so [1][0]
    // Assign coord to know where to draw it
    Object.keys(data.gen).forEach((g) => {
      data.gen[g].coord = [
        data.bus[data.gen[g].gen_bus].coord[1],
        data.bus[data.gen[g].gen_bus].coord[0],
      ];
    });

    Object.keys(data.branch).forEach((br) => {
      if (
        data.bus[data.branch[br].f_bus] == undefined ||
        data.bus[data.branch[br].t_bus] == undefined
      ) {
        console.warn(
          'Branch ' +
            br +
            ' is not show because fromBus ' +
            data.branch[br].f_bus +
            ' or/and toBus ' +
            data.branch[br].t_bus +
            ' not found in dataset'
        );
        delete data.branch[br];
        return;
      }

      // Define the direction of the branch depends on the value of pf (negative go other way)
      if (data.branch[br].pf >= 0) {
        data.branch[br].fromBus = data.bus[data.branch[br].f_bus];
        data.branch[br].toBus = data.bus[data.branch[br].t_bus];
      } else {
        data.branch[br].fromBus = data.bus[data.branch[br].t_bus];
        data.branch[br].toBus = data.bus[data.branch[br].f_bus];
      }

      if (
        !data.branch[br].transformer && // by definition transformer connect 2 points in the same location
        data.branch[br].fromBus.coord[0] == data.branch[br].toBus.coord[0] &&
        data.branch[br].fromBus.coord[1] == data.branch[br].toBus.coord[1]
      )
        console.warn(
          'The branch ' +
            data.branch[br].index +
            ' cannot be display. The FROM coordinates are the same as the TO coordinates'
        );
    });

    return data;
  }

  private _defaultgrid(mapTop: L.Map) {
    // example with get
    this._apiService.getInitialGrid().subscribe({
      next: (data) => {
        const formattedData = this.getFormattedPantagruelData(data);
        console.log(formattedData);
        this.drawOnMap(mapTop, formattedData);
      },
      error: (error) => {
        //@todo
      },
    });
  }
}
