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

  public branchMarkers: Polyline[] = [];

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
      let dashArray: string = '0,0';
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

      if (data.branch[b].percentage >= 100) {
        dashArray = '8, 12';
      } else if (data.branch[b].percentage >= 90) {
        dashArray = '2, 6';
      }

      // Define line
      const branch = new L.Polyline(pointList, {
        weight: weight + zoom / 3,
        color: color,
        pane: 'shadowPane',
        dashArray: dashArray,
      });

      branch.bindTooltip(this.getTooltip(data, b));

      // Add branch to the layer
      this.branchMarkers.push(branch.addTo(map));
    });
  }

  getTooltip(data: Pantagruel, b: string) {
    // Init array of branches draw at the same place
    data.branch[b].sameBranchesFT = [];
    data.branch[b].sameBranchesTF = [];
    // Add the current branch
    data.branch[b].sameBranchesFT.push(data.branch[b]);

    Object.keys(data.branch).forEach((searchBranch) => {
      if (
        data.branch[searchBranch].fromBus.coord[0] ==
          data.branch[b].fromBus.coord[0] &&
        data.branch[searchBranch].fromBus.coord[1] ==
          data.branch[b].fromBus.coord[1] &&
        data.branch[searchBranch].toBus.coord[0] ==
          data.branch[b].toBus.coord[0] &&
        data.branch[searchBranch].toBus.coord[1] ==
          data.branch[b].toBus.coord[1] &&
        data.branch[searchBranch].index !== data.branch[b].index
      ) {
        data.branch[b].sameBranchesFT.push(data.branch[searchBranch]);
      }
    });
    Object.keys(data.branch).forEach((searchBranch) => {
      if (
        data.branch[searchBranch].fromBus.coord[0] ==
          data.branch[b].toBus.coord[0] &&
        data.branch[searchBranch].fromBus.coord[1] ==
          data.branch[b].toBus.coord[1] &&
        data.branch[searchBranch].toBus.coord[0] ==
          data.branch[b].fromBus.coord[0] &&
        data.branch[searchBranch].toBus.coord[1] ==
          data.branch[b].fromBus.coord[1]
      ) {
        data.branch[b].sameBranchesTF.push(data.branch[searchBranch]);
      }
    });

    let tooltip = '';

    data.branch[b].sameBranchesFT.forEach((bFT) => {
      tooltip =
        tooltip +
        `<b>${bFT.index}</b> ${bFT.percentage}% <br> ${bFT.powerMW} / ${bFT.thermalRatingMW} MW <br>`;
    });

    return tooltip;
  }
}
