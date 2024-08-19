import { Inject, Injectable } from '@angular/core';
import {
  ALGORITHMS_RESULT_FOR_TABLE,
  SELECTED_TARGETS,
} from '@core/models/base.const';
import { MapView } from '@core/models/map';
import { Pantagruel } from '@core/models/pantagruel';
import { algorithmResult } from '@models/parameters';
import * as L from 'leaflet';
import { LatLng } from 'leaflet';
import { BehaviorSubject, Subject } from 'rxjs';
import { DataService } from '../data.service';
import { BranchService } from './branch.class';
import { BusService } from './bus.class';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public mapTop!: L.Map;
  public mapBottom!: L.Map;

  private _center = new LatLng(46.8, 11.5); // Centered on Switzerland
  private _zoom = 7;
  private _zoomControl = false; // Disable the default zoom control
  private _attributionControl = false; // Disable the attribution control

  private _view$ = new Subject<MapView>(); // Correct : not a behavior subject because, behaviorSubject need to be initialize

  private _busService = new BusService();
  private _branchService = new BranchService();

  constructor(
    @Inject(SELECTED_TARGETS)
    private _selectedTargets$: BehaviorSubject<number[]>,
    @Inject(ALGORITHMS_RESULT_FOR_TABLE)
    private _algorithmsResult$: BehaviorSubject<algorithmResult[]>,

    private _dataService: DataService
  ) {}

  initMaps(): void {
    this.mapTop = L.map('mapTop', {
      center: this._center,
      zoom: this._zoom,
      zoomControl: this._zoomControl, // Disable the default zoom control
      attributionControl: this._attributionControl, // Disable the attribution control
      zoomSnap: 0.1,
    });
    this.mapBottom = L.map('mapBottom', {
      center: this._center,
      zoom: this._zoom,
      zoomControl: this._zoomControl, // Disable the default zoom control
      attributionControl: this._attributionControl, // Disable the attribution control
      zoomSnap: 0.1,
    });

    this._initBaseMap(this.mapTop);
    this._initBaseMap(this.mapBottom);
  }

  drawOnMap(map: L.Map, grid: Pantagruel): void {
    this.clearMap(map); // normally not use
    this._branchService.drawBranch(map, grid);
    this._busService.drawGen(
      map,
      grid,
      this._selectedTargets$,
      this._algorithmsResult$.getValue()
    );
  }

  getFormattedPantagruelData(data: Pantagruel): Pantagruel {
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

  private _initBaseMap(map: L.Map) {
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
        minZoom: 6,
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

  clearMap(map: L.Map): void {
    if (map) {
      map.eachLayer((layer) => {
        layer.remove();
      });
      this._initBaseMap(map);
    }
  }
}
