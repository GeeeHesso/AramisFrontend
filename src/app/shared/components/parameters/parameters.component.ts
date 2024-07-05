import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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

  targets = new Map([
    ['Cavergno', 908],
    ['Innertkirchen', 910],
    ['Löbbia', 912],
    ['Pradella', 913],
    ['Riddes', 915],
    ['Rothenbrunnen', 916],
    ['Sedrun', 917],
    ['Sils', 920],
    ['Stalden', 921],
    ['Tavanasa', 923],
  ]);
  targetsTrue = new Map([
    ['Cavergno', 16],
    ['Innertkirchen', 15],
    ['Löbbia', 7],
    ['Pradella', 29],
    ['Riddes', 30],
    ['Rothenbrunnen', 36],
    ['Sedrun', 35],
    ['Sils', 18],
    ['Stalden', 6],
    ['Tavanasa', 24],
  ]);
  algorithmList = ['MLPR'];

  constructor(private _mapService: MapService, private _apiService: ApiService, private _busService: BusService, public parametersService: ParametersService) {}

  ngOnInit(): void {
    this.parametersService.getForm().get('selectedTargets')?.valueChanges.subscribe(value => {
      console.log("valueChanges");
      this.onSelectedTargetsChange(value);
      console.log(this.parametersService.getForm().get('selectedTargets')?.value)
    });
  }

  onSelectedTargetsChange(value: any): void {
    const targetsId = this.parametersService.updateSelectedTargets(value, this.targets);
    this._updateSelectedMarkersOnMap(this._mapService.mapTop, targetsId);
  }

  _updateSelectedMarkersOnMap(map: L.Map, selectedTargets: number[]) {
    map.eachLayer((marker: L.Layer) => {
      if (marker instanceof CustomMarker) {
        const markerGenId = marker.getGenId();
        if (selectedTargets.includes(markerGenId)) {
          this.setMarkerIcon(marker, SELECT_GEN_COLOR);
        } else {
          this.setMarkerIcon(marker, INACTIVE_COLOR);
        }
      }
    });
  }

  launchSimulation(): void {
    const parametersForm = this.parametersService.getForm();
    this._formatParameters(parametersForm);
    this._mapService.launchSimulation(parametersForm);
  }

  private _formatParameters(parametersForm: FormGroup): FormGroup {
    const targetsId: number[] = parametersForm.value.selectedTargets.map((t: string) => this.targets.get(t));
    parametersForm.value.selectedTargets = targetsId;
    return parametersForm;
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
