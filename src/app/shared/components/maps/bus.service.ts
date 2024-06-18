import { Injectable } from '@angular/core';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE_GEN,
  INACTIVE_COLOR,
} from '@core/core.const';
import { Gen, Pantagruel } from '@core/models/pantagruel';
import { DataService } from '@core/services/data.service';
import L, { CircleMarker, LatLngExpression } from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class BusService {
  private _sizeGen = DEFAULT_SIZE_GEN;
  private _colorGen = DEFAULT_COLOR;
  private _zoomFactor = 0.6; // Factor multiplying zoom value for relative size of gen and load
  public busMarkers: CircleMarker[] = [];

  constructor(private _dataService: DataService) {}

  /**
   * Draw bus (simple grey disk) on the map
   * @param map
   * @param data Pantagruel reprocessed data
   */
  public drawBus(map: L.Map, data: Pantagruel): void {
    Object.keys(data.bus).forEach((b) => {
      //Position: WARNING lat long reverse, so [1][0]
      const latLng: LatLngExpression = [
        data.bus[b].coord[1],
        data.bus[b].coord[0],
      ];

      // Color
      const color = data.bus[b].status == 1 ? DEFAULT_COLOR : INACTIVE_COLOR;

      // Define icon
      const busIcon = L.circleMarker(latLng, {
        radius: 2,
        pane: 'markerPane', // explicit position,
        fillColor: color,
        fillOpacity: 0.5,
        // invisible stroke to easily click on it
        color: INACTIVE_COLOR,
        opacity: 0,
        weight: 15,
      });

      // Add icon to the map
      this.busMarkers[data.bus[b].index] = busIcon.addTo(map);
    });
  }

  /**
   * Draw generators (square) on the map
   * @param map
   * @param data Pantagruel reprocessed data
   * @param showIcon boolean to construct different icon (actual production)
   * @param showSize boolean to construct proportional size (max production)
   * @param showColor boolean to construct icon with different color (category)
   */
  public drawGen(
    map: L.Map,
    data: any,
    showIcon: boolean,
    showSize: boolean,
    showColor: boolean
  ): void {
    const zoom = map.getZoom();

    Object.keys(data.gen).forEach((g) => {
      if (showSize) {
        this._sizeGen =
          this._getSizeProportionalMax(
            data.gen[g].maxMW,
            this._dataService.GEN_MAX_MAX_PROD
          ) +
          zoom * this._zoomFactor;
      } else {
        this._sizeGen = DEFAULT_SIZE_GEN + zoom * this._zoomFactor;
      }

      // Color and type of icon (with cross inactive, full >94, half 6<X<94, empty <6)
      if (!showColor || data.gen[g].pg == undefined) {
        this._colorGen = DEFAULT_COLOR;
      } else {
        this._colorGen = this._getColorOfGen(data.gen[g]);
      }

      let svgHtml: string = this._constructFullSquareSVG(data.gen[g]);
      if (showIcon) {
        if (data.gen[g].pg == undefined) {
          svgHtml = this._constructFullSquareSVG(data.gen[g]);
        } else if (data.gen[g].gen_status == 0) {
          svgHtml = this._constructCrossSquareSVG(data.gen[g]);
        } else if ((data.gen[g].pg / data.gen[g].pmax) * 100 > 94) {
          svgHtml = this._constructFullSquareSVG(data.gen[g]);
        } else if ((data.gen[g].pg / data.gen[g].pmax) * 100 < 6) {
          svgHtml = this._constructStrokeSquareSVG(data.gen[g]);
        } else {
          svgHtml = this._constructHalfStrokeSquareSVG(data.gen[g]);
        }
      }

      // Size of icon
      const svgIcon = L.divIcon({
        html: svgHtml,
        className: 'svg-icon',
        //iconSize: [this._sizeGen, this._sizeGen],
        iconAnchor: [this._sizeGen / 2, this._sizeGen / 2],
        popupAnchor: [0, 0],
      });
      const genIcon = L.marker(data.gen[g].coord, {
        icon: svgIcon,
        pane: 'shadowPane', // important to force bus go over svg (to bind popup)
      });

      genIcon.addTo(map);
    });
  }

  /**
   * Calculate the size of an element according to max
   * @param val
   * @param maxValue
   * @private
   */
  private _getSizeProportionalMax(val: number, maxValue: number): number {
    let size = (val / maxValue) * 100;
    //TODO: use GEN_MIN_MAX_PROD
    if (size < 2) {
      //console.log("<1: "+ size)
      // set a min
      size = 2;
    } else if (size > 10) {
      //console.log(">10: "+ size)
      size = 10;
    } else {
      //console.log(size)
    }
    return size;
  }

  /**
   * Define the color of a gen based on his category
   * @param gen
   * @private
   */
  private _getColorOfGen(gen: Gen): string {
    let color = '#000000';
    if (gen.category == 'C') color = '#ac4022';
    else if (gen.category == 'F') color = '#afafaf';
    else if (gen.category == 'G') color = '#ff9f36';
    else if (gen.category == 'H') color = '#008cff';
    else if (gen.category == 'N') color = '#ff0000';
    else if (gen.category == 'O') color = '#a233ff';
    else if (gen.category == 'R') color = '#6aff43';
    else if (gen.category == 'X') color = '#000000';

    return color;
  }

  /**
   * Generator SVG object when it is more than 94
   * @param gen
   * @private
   */
  private _constructFullSquareSVG(gen: Gen): string {
    return (
      `<svg width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="display: block">
        <rect width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" fill="` +
      this._colorGen +
      `"></rect>
        </svg>`
    );
  }

  /**
   * Generator SVG object when it is inactive (stroke colored)
   * @param gen
   * @private
   */
  private _constructCrossSquareSVG(gen: Gen): string {
    return (
      `<svg width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="display: block">
        <rect width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="fill:` +
      INACTIVE_COLOR +
      `;stroke:` +
      this._colorGen +
      `;stroke-width:2;fill-opacity:1;stroke-opacity:1"></rect>
        <path d="M 0 ` +
      this._sizeGen +
      ` L ` +
      this._sizeGen +
      ` 0 L ` +
      this._sizeGen +
      ` ` +
      this._sizeGen +
      `" style="stroke:` +
      this._colorGen +
      `;stroke-width:1;fill-opacity:0;stroke-opacity:1"></path>
        <path d="M 0 0 L` +
      this._sizeGen +
      ` ` +
      this._sizeGen +
      ` L ` +
      this._sizeGen +
      ` 0" style="stroke:` +
      this._colorGen +
      `;stroke-width:1;fill-opacity:0;stroke-opacity:1"></path>
        </svg>`
    );
  }

  /**
   * Generator SVG object when it is between 6 and 94 % (stroke colored)
   * @param gen
   * @private
   */
  private _constructHalfStrokeSquareSVG(gen: Gen): string {
    return (
      `<svg width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="display: block">
        <rect width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="fill:` +
      INACTIVE_COLOR +
      `;stroke:` +
      this._colorGen +
      `;stroke-width:2;fill-opacity:1;stroke-opacity:1"></rect>
        <path d="M 0 ` +
      this._sizeGen +
      ` L ` +
      this._sizeGen +
      ` 0 L ` +
      this._sizeGen +
      ` ` +
      this._sizeGen +
      `" fill="` +
      this._colorGen +
      `"></path>
        </svg>`
    );
  }

  /**
   * Generator SVG object when it is less than 6% (stroke colored)
   * @param gen
   * @private
   */
  private _constructStrokeSquareSVG(gen: Gen): string {
    return (
      `<svg width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="display: block">
       <rect width="` +
      this._sizeGen +
      `" height="` +
      this._sizeGen +
      `" style="fill:` +
      INACTIVE_COLOR +
      `;stroke:` +
      this._colorGen +
      `;stroke-width:3;fill-opacity:1;stroke-opacity:1"></rect>
    </svg>`
    );
  }
}
