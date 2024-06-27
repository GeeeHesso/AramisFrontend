import { Injectable } from '@angular/core';
import {
  DEFAULT_COLOR,
  INACTIVE_COLOR,
  MAX_SIZE,
  MIN_SIZE,
} from '@core/core.const';
import L, { CircleMarker } from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class BusService {
  public busMarkers: CircleMarker[] = [];

  /**
   * Draw generators (square) on the map
   * @param map
   * @param data Pantagruel reprocessed data
   */
  public drawGen(map: L.Map, data: any): void {
    const zoom = map.getZoom();

    Object.keys(data.gen).forEach((g) => {
      // Style
      const color = data.gen[g].status == 1 ? DEFAULT_COLOR : INACTIVE_COLOR;
      const size =
        this._getSizeProportionalMax(
          data.gen[g].pmax,
          data.GEN_MIN_MAX_PROD,
          data.GEN_MAX_MAX_PROD
        ) + zoom;

      let svgHtml = this._constructFullSquareSVG(size, color);

      const svgIcon = L.divIcon({
        html: svgHtml,
        className: 'svg-icon',
        iconAnchor: [size / 2, size / 2],
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
   * Generator SVG object when it is more than 94
   * @param gen
   * @private
   */
  private _constructFullSquareSVG(size: number, color: string): string {
    return (
      `<svg width="` +
      size +
      `" height="` +
      size +
      `" style="display: block">
        <rect width="` +
      size +
      `" height="` +
      size +
      `" fill="` +
      color +
      `"></rect>
        </svg>`
    );
  }

  /**
   * Calculate the size of an element according to max
   * @param val
   * @param minValue
   * @param maxValue
   * @private
   */
  private _getSizeProportionalMax(
    val: number,
    minValue: number,
    maxValue: number
  ): number {
    //@TODO: Gwen you can improve this
    let size = (val / (maxValue - minValue)) * 50;
    if (size < MIN_SIZE) {
      console.log('too small: ' + size);
      size = MIN_SIZE;
    } else if (size > MAX_SIZE) {
      console.log('too big: ' + size);
      size = MAX_SIZE;
    } else {
      console.log(size);
    }
    return size;
  }
}
