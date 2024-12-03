import { Inject, Injectable } from '@angular/core';
import {
  ALGORITHMS_RESULT_FOR_TABLE,
  SELECTED_TARGETS,
} from '@core/models/base.const';
import { Pantagruel } from '@core/models/pantagruel';
import { algorithmResult } from '@models/parameters';
import * as L from 'leaflet';
import 'leaflet.sync';
import { BehaviorSubject } from 'rxjs';
import { DataService } from '../data.service';
import { BranchService } from './branch.class';
import { BusService } from './bus.class';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public mapTop!: L.Map;
  public mapBottom!: L.Map;

  private _center = new L.LatLng(46.8, 8.2); // Centered on Switzerland
  private _zoom = 7;
  private _zoomControl = false; // Disable the default zoom control

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
      attributionControl: false, // Disable the attribution control
      zoomSnap: 0.1,
    });
    this.mapBottom = L.map('mapBottom', {
      center: this._center,
      zoom: this._zoom,
      zoomControl: this._zoomControl, // Disable the default zoom control
      zoomSnap: 0.1,
    });

    this._initBaseMap(this.mapTop);
    this._initBaseMap(this.mapBottom);
    this.mapTop.sync(this.mapBottom);
    this.mapBottom.sync(this.mapTop);
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
      data.gen[g].busName = data.bus[data.gen[g].gen_bus].name;
      data.gen[g].percentage = Math.round(
        (Math.abs(data.gen[g].pg) / data.gen[g].pmax + Number.EPSILON) * 100
      );
      data.gen[g].produceMW =
        Math.round((data.gen[g].pg * data.baseMVA + Number.EPSILON) * 100) /
        100;
      data.gen[g].maxMW =
        Math.round((data.gen[g].pmax * data.baseMVA + Number.EPSILON) * 100) /
        100;
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

      data.branch[br].percentage = Math.round(
        (Math.abs(data.branch[br].pf) / data.branch[br].rate_a +
          Number.EPSILON) *
          100
      );
      data.branch[br].powerMW =
        Math.round(
          (Math.abs(data.branch[br].pf) * data.baseMVA + Number.EPSILON) * 100
        ) / 100;
      data.branch[br].thermalRatingMW =
        Math.round(
          (Math.abs(data.branch[br].rate_a) * data.baseMVA + Number.EPSILON) *
            100
        ) / 100;

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
        attribution:
          'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ | Grid by HES-SO - <a href="https://etranselec.ch/">research group of Prof. Philippe Jacquod</a>',
        maxZoom: 16,
        minZoom: 6,
        bounds: [
          [48, 11],
          [46, 6],
        ],
      }
    ).addTo(map);

    // Hide other country
    let fetchPass = false; // fetch is done twice without this condition
    fetch('assets/world_mask_without_switzerland.geojson').then(
      async (json) => {
        if (!fetchPass) {
          L.geoJSON(await json.json(), {
            style: {
              color: '#ffffff', // Color of the mask
              fillOpacity: 1, // To not show only border
            },
          }).addTo(map);
          fetchPass = true;
        }
      }
    );
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
