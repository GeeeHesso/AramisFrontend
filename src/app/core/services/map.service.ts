import {Injectable} from '@angular/core';
import {Pantagruel} from '@core/models/pantagruel';

import {MapView} from '@core/models/map';
import * as L from 'leaflet';
import {LatLng} from 'leaflet';
import {Subject} from 'rxjs';
import {BranchService} from './branch.service';
import {BusService} from './bus.service';
import {DataService} from './data.service';
import {ApiService} from "@services/api.service";
import {FormControl, FormGroup} from "@angular/forms";
import {algorithmsParameters, targetsParameters, timeParameters} from "@models/parameters";
import {CustomMarker} from "@models/CustomMarker";
import {INACTIVE_COLOR, SELECT_GEN_COLOR} from "@core/core.const";
import {ParametersService} from "@services/parameters.service";

@Injectable({
  providedIn: 'root',
})
export class MapService {
  public mapTop!: L.Map;
  public mapBottom!: L.Map;
  private center = new LatLng(46.73233101286786, 10.387573242187502); // Centered on Switzerland
  private zoom = 7;
  private zoomControl = false; // Disable the default zoom control
  private attributionControl = false; // Disable the attribution control
  constructor(
    private _parametersService: ParametersService,
    private _busService: BusService,
    private _branchService: BranchService,
    private _dataService: DataService,
    private _apiService: ApiService
  ) {
  }

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
    this._defaultgridInit(this.mapTop)
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
      console.log(`Center: ${center.lat}, ${center.lng}, Zoom: ${zoom}`);
      this._view$.next({
        center: center,
        zoom: zoom,
        map: map,
      });
    });


    this._view$.subscribe((view) => {
      if (view.map !== map) {
        map.setView(view.center, view.zoom, {animate: false});
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

  private _defaultgridInit(mapTop: L.Map) {
    this._apiService.getInitialGrid().subscribe({
      next: (data) => {
        const formattedData = this.getFormattedPantagruelData(data);
        console.log(formattedData)
        this.drawOnMap(mapTop, formattedData);
        this._parametersService.populatePotentialTargets(data)
      },
      error: (error) => {
        //@todo
      },
    });
  }

  launchSimulation(data: FormGroup, formattedTargetsId: number[]) {
    const formValue = data.value;
    const commonParams = {
      season: formValue.season.toLowerCase(),
      day: formValue.day.toLowerCase(),
      hour: formValue.hour,
    };

    const timeParams: timeParameters = { ...commonParams };

    const selectedTargets = this._parametersService.getForm().get('selectedTargets')?.value;

    if (!Array.isArray(selectedTargets)) {
      console.error("Selected targets are not an array:", selectedTargets);
      return;
    }

    const attackParams: targetsParameters = {
      ...commonParams,
      attacked_gens: formattedTargetsId.map(String), // Convert to array of strings
    };
    const algorithmParams: algorithmsParameters = {
      ...attackParams,
      algorithms: formValue.selectedAlgo.map(String), // Convert to array of strings
    };
    console.log("timeParams", timeParams);
    this._apiService.postRealNetwork(timeParams).subscribe({
      next: (data) => {
        const formattedData = this.getFormattedPantagruelData(data);
        this.drawOnMap(this.mapTop, formattedData);
      },
      error: (error) => {
        console.error('Error:', error);
      },
    });

    console.log("attackParams", attackParams);
    this._apiService.postAttackedNetwork(attackParams).subscribe({
      next: (data) => {
        const formattedData = this.getFormattedPantagruelData(data);
        this.drawOnMap(this.mapBottom, formattedData);
      },
      error: (error) => {
        console.error(error);
      },
    });
    console.log("algorithmParams",algorithmParams)
    this._apiService.postAlgorithmResults(algorithmParams).subscribe({
      next: (data) => {
       this._parametersService.populateAlgorithmResult(data);
      },
      error: (error) => {
        console.error(error);
      },
    });
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

    const currentIconHtml = foundMarker.getElement()?.querySelector('.svg-icon')?.innerHTML;
    const currentIconSize = foundMarker.getIcon().options.iconSize as L.PointExpression | undefined
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

    let svgHtml = this._busService._constructFullSquareSVG(size, newColor);
    const newIcon = L.divIcon({
      html: svgHtml,
      className: 'svg-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, 0],
    });


    foundMarker.setIcon(newIcon);
  }


}
