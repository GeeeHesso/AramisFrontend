import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, computed, OnInit, Signal} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import * as L from "leaflet";
import { CustomMarker } from "@models/CustomMarker";
import { INACTIVE_COLOR, SELECT_GEN_COLOR } from "@core/core.const";
import { BusService } from "@services/bus.service";
import { MapService } from '@core/services/map.service';
import { ParametersService } from '@core/services/parameters.service';
import {ApiService} from "@services/api.service";

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
    ReactiveFormsModule
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

  algorithmList = ["NBC", "KNNC", "RFC", "SVC", "GBC","MLPC"];

  constructor(private _mapService: MapService, private _apiService: ApiService, private _busService: BusService, public _parametersService: ParametersService) {
  }

  ngOnInit(): void {
    this._parametersService.getForm().get('selectedTargets')?.valueChanges.subscribe(value => {
      console.log("valueChanges");
      this.onSelectedTargetsChange(value);
      console.log(this._parametersService.getForm().get('selectedTargets')?.value)
    });
  }

  onSelectedTargetsChange(value: any): void {
    const targetsId = this._parametersService.getTargetsIdByNames(value, this._parametersService.potentialTargets);
    this._updateSelectedMarkersOnMap(this._mapService.mapTop, targetsId);
  }

  _updateSelectedMarkersOnMap(map: L.Map, selectedTargets: number[]) {
    map.eachLayer((marker: L.Layer) => {
      if (marker instanceof CustomMarker) {
        const markerGenId = marker.getGenBusId();
        if (selectedTargets.includes(markerGenId)) {
          this.setMarkerIcon(marker, SELECT_GEN_COLOR);
        } else {
          this.setMarkerIcon(marker, INACTIVE_COLOR);
        }
      }
    });
  }

  launchSimulation(): void {
    let parametersForm = this._parametersService.getForm();
    const formattedTargetsId= this._formatParameters(parametersForm)
    this._mapService.launchSimulation(parametersForm,formattedTargetsId);
  }

  private _formatParameters(parametersForm: FormGroup): number[] {
    const targetsId: number[] = [];
    const selectedTargets = parametersForm.value.selectedTargets as string[]; // Explicitly cast to string array

    if (Array.isArray(selectedTargets)) {
      selectedTargets.forEach((t: string) => {
        console.log("FOR T ",t)
        const foundIndex = this._mapService.findMarkerIndexByGenId(this._mapService.mapTop, t);
        if (foundIndex != null && foundIndex != undefined) { // Ensure foundIndex is not null or undefined
          targetsId.push(foundIndex);
        } else {
          console.log(foundIndex)
          throw new Error(`No genIndex found for genbusId: ${t}`);
        }
      });
    } else {
      throw new Error('selectedTargets is not an array');
    }

    console.log("new selected targets", targetsId);
    return targetsId;
  }

  private setMarkerIcon(foundMarker: CustomMarker, SELECT_GEN_COLOR: string) {
    const currentIconSize = foundMarker.getIcon().options.iconAnchor as L.PointExpression | undefined;
    let size: number;

    if (Array.isArray(currentIconSize)) {
      size = currentIconSize[0] * 2;
    } else {
      size = 25;
    }
    let svgHtml = this._busService._constructFullSquareSVG(size, SELECT_GEN_COLOR);
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
