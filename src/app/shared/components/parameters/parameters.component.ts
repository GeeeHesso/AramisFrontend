import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { INACTIVE_COLOR, SELECT_GEN_COLOR } from '@core/core.const';
import { constructFullSquareSVG } from '@core/models/helpers';
import { MapService } from '@core/services/map.service';
import { ParametersService } from '@core/services/parameters.service';
import { CustomMarker } from '@models/CustomMarker';
import * as L from 'leaflet';
import { DialogResultComponent } from '../dialogResult/dialogResult.component';

@Component({
  standalone: true,
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatChipsModule,
    ReactiveFormsModule,
  ],
})
export class ParametersComponent implements OnInit {
  seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
  day = ['Weekday', 'Weekend'];
  hours = new Map([
    ['22-2h', 0],
    ['2-6h', 4],
    ['6-10h', 8],
    ['10-14h', 12],
    ['14-18h', 16],
    ['18-22h', 20],
  ]);
  potentialTargets = new Map([
    [5540, 'Innertkirchen'],
    [5594, 'Löbbia'],
    [5612, 'Pradella'],
    [2339, 'Riddes'],
    [5591, 'Rothenbrunnen'],
    [5573, 'Sedrun'],
    [5589, 'Sils'],
    [5518, 'Stalden'],
    [5582, 'Tavanasa'],
  ]);
  algorithmList = ['NBC', 'MLPR', 'KNNC', 'RFC', 'SVC', 'GBC', 'MLPC'];

  constructor(
    private _mapService: MapService,
    public parametersService: ParametersService,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.parametersService.form
      .get('selectedTargets')
      ?.valueChanges.subscribe((value) => {
        //console.log( 'valueChanges', this._parametersService.form.get('selectedTargets')?.value);

        this._onSelectedTargetsChange(value as number[]);
      });
  }

  private _onSelectedTargetsChange(value: number[]): void {
    console.log(value);
    // const targetsId = this.parametersService.getTargetsIdByNames(value);
    this._updateSelectedMarkersOnMap(this._mapService.mapTop, value);
  }

  private _updateSelectedMarkersOnMap(map: L.Map, selectedTargets: number[]) {
    map.eachLayer((marker: L.Layer) => {
      if (marker instanceof CustomMarker) {
        const markerGenId = marker.getGenBusId();
        if (selectedTargets.includes(markerGenId)) {
          this._setMarkerIcon(marker, SELECT_GEN_COLOR);
        } else {
          this._setMarkerIcon(marker, INACTIVE_COLOR);
        }
      }
    });
  }

  launchSimulation(): void {
    if (this.parametersService.form.invalid) {
      this.parametersService.form.markAllAsTouched();
      return;
    }

    this._mapService.launchSimulation(
      this.parametersService.form.getRawValue()
    );
  }

  handleButtonDetails() {
    this._dialog.open(DialogResultComponent);
  }

  private _setMarkerIcon(foundMarker: CustomMarker, SELECT_GEN_COLOR: string) {
    const currentIconSize = foundMarker.getIcon().options.iconAnchor as
      | L.PointExpression
      | undefined;
    let size: number;

    if (Array.isArray(currentIconSize)) {
      size = currentIconSize[0] * 2;
    } else {
      size = 25;
    }
    const svgHtml = constructFullSquareSVG(size, SELECT_GEN_COLOR);

    const newIcon = L.divIcon({
      html: svgHtml,
      className: 'svg-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, 0],
    });
    foundMarker.setIcon(newIcon);
  }
}
