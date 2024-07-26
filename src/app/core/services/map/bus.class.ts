import {
  DEFAULT_COLOR,
  INACTIVE_COLOR,
  MAX_SIZE,
  MIN_SIZE,
  POTENTIALTARGETS,
  SELECT_GEN_COLOR,
} from '@core/core.const';
import L, { Marker } from 'leaflet';
import { BehaviorSubject } from 'rxjs';

export class BusService {
  public genMarkers: Marker[] = [];

  public drawGen(
    map: L.Map,
    data: any,
    selectedTargets: BehaviorSubject<number[]>
  ): void {
    // @TODO: check removal
    this.genMarkers.forEach((marker) => {
      map.removeLayer(marker);
    });
    this.genMarkers = [];

    const zoom = map.getZoom();
    const targets = selectedTargets.getValue();

    Object.keys(data.gen).forEach((g) => {
      // Check if the current generator index is in the selectedTargets array
      const isSelected = targets.includes(data.gen[g].index);

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

      const svgHtml = this._constructFullSquareSVG(size, color);
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

      if (POTENTIALTARGETS.has(data.gen[g].index)) {
        genIcon.on('click', () => {
          this._toggleSelectedTarget(data.gen[g].index, selectedTargets);
        });
      }

      this.genMarkers.push(genIcon.addTo(map));
    });
  }

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
    }

    return size;
  }

  private _toggleSelectedTarget(
    targetId: number,
    selectedTargets: BehaviorSubject<number[]>
  ): void {
    const currentTargets = selectedTargets.getValue();
    const targetIdFound = currentTargets.indexOf(targetId);

    if (targetIdFound > -1) {
      currentTargets.splice(targetIdFound, 1);
    } else {
      currentTargets.push(targetId);
    }

    selectedTargets.next(currentTargets);
  }

  private _constructFullSquareSVG(size: number, color: string): string {
    return `<svg width="${size}" height="${size}" style="display: block">
        <rect width="${size}" height="${size}" fill="${color}"></rect>
        </svg>`;
  }
}
