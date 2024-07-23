import { Inject, Injectable } from '@angular/core';
import { INACTIVE_COLOR, SELECT_GEN_COLOR } from '@core/core.const';
import { ALGORITHMS_RESULT, SELECTED_TARGETS } from '@core/models/base.const';
import { constructFullSquareSVG } from '@core/models/helpers';
import { MapView } from '@core/models/map';
import { Pantagruel } from '@core/models/pantagruel';
import { CustomMarker } from '@models/CustomMarker';
import {
  algorithmResult,
  algorithmsParameters,
  algorithmsParametersForm,
  targetsParameters,
  timeParameters,
} from '@models/parameters';
import { ApiService } from '@services/api.service';
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

  private _center = new LatLng(46.73233101286786, 10.387573242187502); // Centered on Switzerland
  private _zoom = 7;
  private _zoomControl = false; // Disable the default zoom control
  private _attributionControl = false; // Disable the attribution control

  private _view$ = new Subject<MapView>(); // Correct that it is not a behavior subject because, behaviorSubject need to be initialize

  private _busService = Inject(BusService);
  private _branchService = Inject(BranchService);

  constructor(
    @Inject(ALGORITHMS_RESULT)
    private _algorithmsResult: BehaviorSubject<algorithmResult>,
    @Inject(SELECTED_TARGETS)
    private _selectedTargets: BehaviorSubject<number[]>,
    private _dataService: DataService,
    private _apiService: ApiService
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
    this._initDefaultGrid(this.mapTop);
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
      const center = map.getCenter();
      const zoom = map.getZoom();
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

  drawOnMap(map: L.Map, grid: Pantagruel): void {
    this.clearMap(map); // in case of loading new data
    this._branchService.drawBranch(map, grid);
    this._busService.drawGen(map, grid, this._selectedTargets);
  }

  clearMap(map: L.Map): void {
    map.eachLayer((layer) => {
      layer.remove();
    });
    this._initBaseMap(map);
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

  launchSimulation(formValue: algorithmsParametersForm) {
    if (!formValue.season || !formValue.day || !formValue.hour) return;

    const commonParams: timeParameters = {
      season: formValue.season.toLowerCase(),
      day: formValue.day.toLowerCase(),
      hour: formValue.hour,
    };

    this._apiService.postRealNetwork({ ...commonParams }).subscribe({
      next: (data) => {
        const formattedData = this.getFormattedPantagruelData(data);
        this.drawOnMap(this.mapTop, formattedData);
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });

    const selectedTargets = formValue.selectedTargets;
    if (!Array.isArray(selectedTargets)) {
      console.error('Selected targets are not an array:', selectedTargets);
      return;
    }

    const attackParams: targetsParameters = {
      ...commonParams,
      attacked_gens: selectedTargets.map(String),
    };
    this._apiService.postAttackedNetwork(attackParams).subscribe({
      next: (data) => {
        const formattedData = this.getFormattedPantagruelData(data);
        this.drawOnMap(this.mapBottom, formattedData);
      },
      error: (error) => {
        console.error(error);
      },
    });

    const selectedAlgo = formValue.selectedAlgo;
    if (!Array.isArray(selectedAlgo)) {
      console.error('Selected targets are not an array:', selectedAlgo);
      return;
    }
    const algorithmParams: algorithmsParameters = {
      ...attackParams,
      algorithms: selectedAlgo,
    };
    this._apiService.postAlgorithmResults(algorithmParams).subscribe({
      next: (data) => {
        this._algorithmsResult.next(data);
        this.populateAlgorithmResult(data);
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  // @ToDo: See where to add this method
  populateAlgorithmResult(data: any) {
    // @ToDo: See how to format the code

    //console.log('populateAlgorithmResult', data);

    // const algorithmsResult = Object.keys(data).map((algorithmName) => {
    //   const results = Object.keys(data[algorithmName]).map((indexName) => ({
    //     indexName: indexName,
    //     result: data[algorithmName][indexName],
    //   }));
    //   return { name: algorithmName, results: results };
    // });

    this._algorithmsResult.next(data);
  }

  //TODO dissociate the selection for the "finding", create method selectmMarker & deselectMarker that turn into red the marker
  //TODO return the marker not void
  findMarkerIndexByGenId(map: L.Map, genIdToSearch: string): number | null {
    let foundIndex: number | null = null;

    map.eachLayer((layer: L.Layer) => {
      if (layer instanceof CustomMarker) {
        const markerGenId = layer.getGenBusId();

        if (markerGenId == genIdToSearch) {
          foundIndex = layer.getIndex();
        }
      }
    });

    return foundIndex;
  }

  markMarkerAsSelectedOrUnselected(foundMarker: CustomMarker) {
    const currentIconHtml = foundMarker
      .getElement()
      ?.querySelector('.svg-icon')?.innerHTML;
    const currentIconSize = foundMarker.getIcon().options.iconSize as
      | L.PointExpression
      | undefined;
    let size: number;

    let newColor = SELECT_GEN_COLOR;
    if (currentIconHtml?.includes(SELECT_GEN_COLOR)) {
      newColor = INACTIVE_COLOR;
    }

    if (Array.isArray(currentIconSize)) {
      size = currentIconSize[0];
    } else {
      size = 25;
    }

    const svgHtml = constructFullSquareSVG(size, newColor);
    const newIcon = L.divIcon({
      html: svgHtml,
      className: 'svg-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, 0],
    });

    foundMarker.setIcon(newIcon);
  }

  private _initDefaultGrid(mapTop: L.Map) {
    this._apiService.getInitialGrid().subscribe({
      next: (data) => {
        const formattedData = this.getFormattedPantagruelData(data);
        this.drawOnMap(mapTop, formattedData);
      },
      error: (error) => {
        console.warn('_initDefaultGrid: ', error);
        //@todo
      },
    });
  }
}
