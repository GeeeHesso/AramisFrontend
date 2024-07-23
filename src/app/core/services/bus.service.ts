import { Injectable } from '@angular/core';
import {
  DEFAULT_COLOR,
  INACTIVE_COLOR,
  MAX_SIZE,
  MIN_SIZE,
  SELECT_GEN_COLOR,
} from '@core/core.const';
import { constructFullSquareSVG } from '@core/models/helpers';
import { CustomMarker } from '@models/CustomMarker';
import L, { CircleMarker } from 'leaflet';
import { ParametersService } from './parameters.service';

@Injectable({
  providedIn: 'root',
})
export class BusService {
  public busMarkers: CircleMarker[] = [];

  constructor(public parametersService: ParametersService) {}

  /**
   * Draw generators (square) on the map
   * @param map
   * @param data Pantagruel reprocessed data
   */
  public drawGen(map: L.Map, data: any): void {
    const zoom = map.getZoom();
    const selectedTargets =
      this.parametersService.form.get('selectedTargets')?.value || [];

    Object.keys(data.gen).forEach((g) => {
      // Check if the current generator index is in the selectedTargets array
      const isSelected = selectedTargets.includes(data.gen[g].gen_bus);

      // Style
      const color = isSelected
        ? SELECT_GEN_COLOR
        : data.gen[g].status == 1
        ? DEFAULT_COLOR
        : INACTIVE_COLOR;
      const size =
        this._getSizeProportionalMax(
          data.gen[g].pmax,
          data.GEN_MIN_MAX_PROD,
          data.GEN_MAX_MAX_PROD
        ) + zoom;

      let svgHtml = constructFullSquareSVG(size, color);
      const svgIcon = L.divIcon({
        html: svgHtml,
        className: 'svg-icon',
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, 0],
      });

      var customMarker = new CustomMarker(data.gen[g].coord, {
        icon: svgIcon,
        pane: 'shadowPane', // important to force bus go over svg (to bind popup)
      }).addTo(map);

      customMarker.setGenBusId(data.gen[g].gen_bus);
      customMarker.setIndex(data.gen[g].index);
      customMarker
        .on('click', () => this._addSelectedGenUsingTheMap(customMarker))
        .addTo(map);
    });
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
      size = MIN_SIZE;
    } else if (size > MAX_SIZE) {
      size = MAX_SIZE;
    } else {
    }
    return size;
  }

  _addSelectedGenUsingTheMap(marker: CustomMarker) {
    this.parametersService.addOrRemoveSelectedTarget(marker.getGenBusId());
  }
}
