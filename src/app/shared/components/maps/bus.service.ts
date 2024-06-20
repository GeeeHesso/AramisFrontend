import { Injectable } from '@angular/core';
import {
  DEFAULT_COLOR,
  DEFAULT_SIZE_GEN,
  INACTIVE_COLOR,
} from '@core/core.const';
import L, { CircleMarker } from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class BusService {
  private _zoomFactor = 0.6; // Factor multiplying zoom value for relative size of gen and load
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
      const size = DEFAULT_SIZE_GEN + zoom;

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
}
