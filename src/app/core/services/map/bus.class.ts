import {
  DEFAULT_COLOR,
  GEN_DISPLAY_NAME,
  GEN_INDEX,
  MAX_SIZE,
  MIN_SIZE,
  POTENTIALTARGETS,
  SELECTED_COLOR,
  WHITE_COLOR,
} from '@core/core.const';
import { Pantagruel } from '@core/models/pantagruel';
import { algorithmResult } from '@core/models/parameters';
import L, { Marker } from 'leaflet';
import { BehaviorSubject } from 'rxjs';

export class BusService {
  public genMarkers: Marker[] = [];

  public drawGen(
    map: L.Map,
    data: Pantagruel,
    selectedTargets: BehaviorSubject<number[]>,
    algorithmsResult: algorithmResult[] = [] // not mandatory parameter, only use to draw bottom map
  ): void {
    this.genMarkers.forEach((marker) => {
      map.removeLayer(marker);
    });
    this.genMarkers = [];

    const zoom = map.getZoom();
    const targets = selectedTargets.getValue();

    Object.keys(data.gen).forEach((g) => {
      // Check if the current generator index is in the selectedTargets array
      const isSelected = targets.includes(data.gen[g].index);

      // Color
      let color = WHITE_COLOR;
      if (map.getContainer().id == 'mapTop' && isSelected) {
        color = SELECTED_COLOR;
      } else if (map.getContainer().id == 'mapBottom' && algorithmsResult) {
        color = this._getColorGenBottomMap(algorithmsResult, data.gen[g].index);
      }

      // Size
      const size =
        this._getSizeProportionalMax(
          data.gen[g].pmax,
          data.GEN_MIN_MAX_PROD,
          data.GEN_MAX_MAX_PROD
        ) + zoom;

      // Icon
      let svgHtml = '';
      if (POTENTIALTARGETS.has(data.gen[g].index)) {
        svgHtml = this._constructStrokeSquareSVG(size, color);
      } else {
        svgHtml = this._constructFullSquareSVG(size);
      }
      const svgIcon = L.divIcon({
        html: svgHtml,
        className: 'svg-icon',
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, 0],
      });

      const genIcon = L.marker([data.gen[g].coord[0], data.gen[g].coord[1]], {
        icon: svgIcon,
        pane: 'markerPane', // force to go over branch
      });

      genIcon.bindTooltip(
        `<b>${data.gen[g].busName}</b> ${data.gen[g].percentage}% <br> ${data.gen[g].produceMW} / ${data.gen[g].maxMW} MW`
      );

      const genMarker = genIcon.addTo(map);

      // Action on click + store list of markers of potential target
      if (
        POTENTIALTARGETS.has(data.gen[g].index) &&
        map.getContainer().id !== 'mapBottom'
      ) {
        this.genMarkers.push(genMarker);
        genIcon.on('click', () => {
          this._toggleSelectedTarget(data.gen[g].index, selectedTargets);
        });
      }
    });
  }

  private _getColorGenBottomMap(
    algorithmsResult: algorithmResult[],
    genIndex: number
  ): string {
    let gen = algorithmsResult.find(
      (r: algorithmResult) => r[GEN_INDEX] == genIndex.toString()
    );

    if (gen) {
      // Count number of positive result
      let count = 0;
      let nbOfAlgo = 0;
      Object.keys(gen).forEach((genResult) => {
        if (genResult !== GEN_INDEX && genResult !== GEN_DISPLAY_NAME) {
          nbOfAlgo++;
          if (gen[genResult] == 'TP' || gen[genResult] == 'FP') {
            count++;
          }
        }
      });

      // Define color
      const baseNotDetected = 255;
      const baseDetected = 210;
      const otherColor = Math.round(
        baseNotDetected - (count / nbOfAlgo) * baseNotDetected
      );
      const red = Math.round(
        (count / nbOfAlgo) * (baseDetected - baseNotDetected) + baseNotDetected
      );
      return this._rgbToHex(red, otherColor, otherColor);
    } else {
      // Gen is not in list of result, display like above
      return DEFAULT_COLOR;
    }
  }

  private _rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      this._componentToHex(r) +
      this._componentToHex(g) +
      this._componentToHex(b)
    );
  }
  private _componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
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

  private _constructFullSquareSVG(size: number): string {
    return `<svg width="${size}" height="${size}" style="display: block">
        <rect width="${size}" height="${size}" fill="${DEFAULT_COLOR}"></rect>
        </svg>`;
  }

  private _constructStrokeSquareSVG(size: number, color: string): string {
    return `<svg width="${size}" height="${size}" style="display: block">
        <rect width="${size}" height="${size}" " style="fill:${color};stroke:black;stroke-width:3;fill-opacity:1;stroke-opacity:1"></rect>
        </svg>`;
  }
}
