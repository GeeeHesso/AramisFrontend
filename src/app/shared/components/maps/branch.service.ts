import { Injectable } from '@angular/core';
import {
  DEFAULT_COLOR,
  DEFAULT_WIDTH_BRANCH,
  INACTIVE_COLOR,
} from '@core/core.const';
import { Branch, Pantagruel } from '@core/models/pantagruel';
import L, { Polyline } from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  /**
   * Draw each branches/lines on the map
   * @param map
   * @param data Pantagruel reprocessed data
   * @param showColor boolean to show color of branch (actual load)
   * @param showWidth boolean to show proportional width (thermal rate)
   * @param showArrow boolean to show arrow when zoom is fairly high
   */

  public branchMarker: Polyline[] = [];

  public drawBranch(
    map: L.Map,
    data: Pantagruel,
    showColor: boolean,
    showWidth: boolean
  ): void {
    const zoom = map.getZoom();

    // Draw all the branches
    Object.keys(data.branch).forEach((b) => {
      //Position: WARNING lat long reverse, so [1][0]
      const pointA = new L.LatLng(
        data.branch[b].fromBus.coord[1],
        data.branch[b].fromBus.coord[0]
      );
      const pointB = new L.LatLng(
        data.branch[b].toBus.coord[1],
        data.branch[b].toBus.coord[0]
      );
      const pointList = [pointA, pointB];

      // Style of line
      const weight = showWidth
        ? this._getWidth(data.branch[b].rate_a)
        : DEFAULT_WIDTH_BRANCH;
      var color = 'black';

      if (data.branch[b].br_status == 0) {
        color = INACTIVE_COLOR;
      } else {
        color = showColor
          ? this._getColorOfBranch(data.branch[b])
          : DEFAULT_COLOR;
      }

      // Define line
      const branch = new L.Polyline(pointList, {
        weight: weight + zoom / 3,
        color: color,
      });

      // Add branch to the layer
      this.branchMarker[data.branch[b].index] = branch.addTo(map);
    });

    // Draw a dashed branches over the other if  load injected > 150
    if (showColor) {
      // WARNING lat long reverse, so [1][0]
      Object.keys(data.branch).forEach((b) => {
        if (data.branch[b].loadInjected > 100) {
          //Position: WARNING lat long reverse, so [1][0]
          const pointA = new L.LatLng(
            data.branch[b].fromBus.coord[1],
            data.branch[b].fromBus.coord[0]
          );
          const pointB = new L.LatLng(
            data.branch[b].toBus.coord[1],
            data.branch[b].toBus.coord[0]
          );
          const pointList = [pointA, pointB];

          // Style of line
          const weight = showWidth
            ? this._getWidth(data.branch[b].rate_a)
            : DEFAULT_WIDTH_BRANCH;

          // Define line
          const dashedBranch = new L.Polyline(pointList, {
            weight: weight + zoom / 3,
            color: 'black',
            dashArray: '5, 10',
          });

          // Add branch to the layer
          dashedBranch.addTo(map);
        }
      });
    }
  }

  /**
   * Define the width of a branch/line
   * @param rate_a
   * @private
   */
  private _getWidth(rate_a: number): number {
    //@todo : redo with max and min (dataService: _setBranchMaxPf and _setBranchMinPf)
    const WIDTH_LOW = 0.1;
    const WIDTH_MEDIUM = 1;
    const WIDTH_HIGH = 2;
    const WIDTH_MAX = 3;

    let width = 0;

    if (rate_a < 1500) {
      width = WIDTH_LOW;
    } else if (rate_a < 2000) {
      width = WIDTH_MEDIUM;
    } else if (rate_a < 2500) {
      // Adjusted condition
      width = WIDTH_HIGH;
    } else if (rate_a < 3000) {
      width = WIDTH_HIGH;
    } else {
      // > 3000
      width = WIDTH_MAX;
    }

    return width;
  }

  /**
   * Definition of the color of the branch/transformer
   * @param branch use to know if the object is inactive and the %
   * @private
   */
  private _getColorOfBranch(branch: Branch): string {
    // Without power
    if (isNaN(branch.loadInjected)) return DEFAULT_COLOR;

    const percentage = branch.loadInjected;
    let r = 255;
    let g = 255;
    let b = 255;

    if (percentage > 100) {
      return this._rgbToHex(255, 0, 0);
    }
    // if 50% --> green
    else if (percentage == 50) {
      r = 0;
      b = 0;
    }
    // if < 50 % --> blue to cyan
    if (percentage < 50) {
      r = 0;
      // if < 25 --> blue
      if (percentage < 25) {
        g = (percentage / 25) * 255;
      }
      // if 25 < X < 50 --> cyan
      else {
        b = 255 - ((percentage - 25) / 25) * 255;
      }
    }
    // if > 50 % --> yellow to red
    else {
      b = 0;
      // if 50 < X < 75 --> yellow
      if (percentage < 75) {
        r = ((percentage - 50) / 25) * 255;
      }
      // if > 75 --> red
      else {
        g = 255 - ((percentage - 75) / 25) * 255;
      }
    }
    return this._rgbToHex(Math.round(r), Math.round(g), Math.round(b));
  }

  /**
   * Transform r, g, b value to hexadecimal color
   * @param r red value on 255
   * @param g green value on 255
   * @param b blue value on 255
   */
  private _rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      this._componentToHex(r) +
      this._componentToHex(g) +
      this._componentToHex(b)
    );
  }

  /**
   * Transform a color value to hexadecimal
   * @param c : color value on 255
   * @private
   */
  private _componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }
}
