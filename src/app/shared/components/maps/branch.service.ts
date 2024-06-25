import { Injectable } from '@angular/core';
import {
  DEFAULT_COLOR,
  DEFAULT_WIDTH_BRANCH,
  INACTIVE_COLOR,
} from '@core/core.const';
import { Pantagruel } from '@core/models/pantagruel';
import L, { Polyline } from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  /**
   * Draw each branches/lines on the map
   * @param map
   * @param data Pantagruel reprocessed data
   */

  public branchMarker: Polyline[] = [];

  public drawBranch(map: L.Map, data: Pantagruel): void {
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
      const weight = DEFAULT_WIDTH_BRANCH;
      const color =
        data.branch[b].br_status == 1 ? DEFAULT_COLOR : INACTIVE_COLOR;

      // Define line
      const branch = new L.Polyline(pointList, {
        weight: weight + zoom / 3,
        color: color,
        pane: 'shadowPane', // to go on the mask
      });

      // Add branch to the layer
      this.branchMarker[data.branch[b].index] = branch.addTo(map);
    });
  }
}
