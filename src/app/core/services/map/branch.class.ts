import {
  DEFAULT_COLOR,
  DEFAULT_WIDTH_BRANCH,
  LINE_220KV_COLOR,
  LINE_380KV_COLOR,
} from '@core/core.const';
import { Pantagruel } from '@core/models/pantagruel';
import L, { Polyline } from 'leaflet';

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
      // Position: WARNING lat long reverse, so [1][0]
      const pointA = new L.LatLng(
        data.branch[b].fromBus.coord[1],
        data.branch[b].fromBus.coord[0]
      );
      const pointB = new L.LatLng(
        data.branch[b].toBus.coord[1],
        data.branch[b].toBus.coord[0]
      );
      const pointList = [pointA, pointB];

      const weight = DEFAULT_WIDTH_BRANCH;

      // Determine initial color based on base_kv value
      let color: string;
      let dashArray: string | undefined; // Default is undefined (solid line)
      switch (data.branch[b].fromBus.base_kv) {
        case 220:
          color = LINE_220KV_COLOR;
          break;
        case 380:
          color = LINE_380KV_COLOR;
          break;
        default:
          color = DEFAULT_COLOR;
          break;
      }

      const loadPercentage =
        Math.abs(data.branch[b].pt / data.branch[b].rate_a) * 100;

      if (loadPercentage >= 100) {
        color = 'black';
        dashArray = '5, 5';
        //console.log(`Branch ${b}: loadPercentage is >= 100%, color set to black, dashed line`);
      } else if (loadPercentage >= 90) {
        color = 'yellow';
        //console.log(`Branch ${b}: loadPercentage is >= 90% and < 100%, color set to yellow`);
      }

      // Define line
      const branch = new L.Polyline(pointList, {
        weight: weight + zoom / 3,
        color: color,
        pane: 'shadowPane',
        dashArray: dashArray,
      });

      // Add branch to the layer
      this.branchMarker[data.branch[b].index] = branch.addTo(map);
    });
  }
}
