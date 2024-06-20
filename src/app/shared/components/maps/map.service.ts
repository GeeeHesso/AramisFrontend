import {Injectable} from '@angular/core';
import {Pantagruel} from '@core/models/pantagruel';
import * as L from 'leaflet';
import {catchError, of, Subject} from 'rxjs';
import {BranchService} from './branch.service';
import {BusService} from './bus.service';
import {HttpClient} from "@angular/common/http";

interface MapView {
  center: L.LatLng;
  zoom: number;
  origin: 'mapTop' | 'mapBottom';
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(
    public _busService: BusService,
    public _branchService: BranchService,
    private http: HttpClient
  ) {
  }

  private _view$ = new Subject<MapView>();

  public initMap(map: L.Map, origin: 'mapTop' | 'mapBottom'): void {
    this._initBaseMap(map);

    // Synchronize maps
    map.on('move', () => {
      this._view$.next({
        center: map.getCenter(),
        zoom: map.getZoom(),
        origin: origin,
      });
    });
    this._view$.subscribe((view) => {
      if (view.origin !== origin) {
        map.setView(view.center, view.zoom, {animate: false});
      }
    });
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

    this.http.get<any>('assets/world_mask_without_switzerland.geojson')
      .pipe(
        catchError(error => {
          console.error('Error loading GeoJSON data:', error);
          return of(null);
        })
      )
      .subscribe(data => {
        if (data) {
          const mask = L.geoJSON(data, {
            style: {
              color: '#ffffff', // Color of the mask
              fillOpacity: 1, // Opacity of the mask
              weight: 0,
            },
          }).addTo(map);
        } else {
          console.error('GeoJSON data is null, cannot add to map.');
        }
      });
  }

  public drawOnMap(map: L.Map, data: Pantagruel): void {
    this.clearMap(map); // in case of loading new data
    var formattedData = this._getFormattedPantagruelData(data);
    this._branchService.drawBranch(map, formattedData);
    this._busService.drawGen(map, formattedData);
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
  private _getFormattedPantagruelData(data: Pantagruel): Pantagruel {
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
}
