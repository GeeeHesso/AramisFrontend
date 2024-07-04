import {CommonModule} from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {algorithmsParameters, targetsParameters, timeParameters} from '@core/models/parameters';
import {ApiService} from '@core/services/api.service';
import {MapService} from '@core/services/map.service';
import * as L from "leaflet";
import {CustomMarker} from "@models/CustomMarker";
import {INACTIVE_COLOR, SELECT_GEN_COLOR} from "@core/core.const";
import {BusService} from "@services/bus.service";

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
export class ParametersComponent implements OnInit{
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

  parametersForm: FormGroup;

  constructor(private fb: FormBuilder, private _mapService: MapService, private _apiService: ApiService, private _busService: BusService) {
    this.parametersForm = this.fb.group({
      season: ['', Validators.required],
      day: ['', Validators.required],
      hour: ['', Validators.required],
      selectedTargets: [[], Validators.required],
      selectedAlgo: [[], Validators.required],
    });
  }
  ngOnInit(): void {
    this.parametersForm.get('selectedTargets')?.valueChanges.subscribe(value => {
      console.log("valueChanges")
      this.onSelectedTargetsChange(value);
    });
  }
  onSelectedTargetsChange(value: any): void {
    const listOfAllTargetsName = value
    const targetsId: number[] = listOfAllTargetsName.map((t: string) => this.targets.get(t));

  //  targetsId.map(value => {
  //    let foundMarker : CustomMarker | null = this._mapService.findMarkerByGenId(this._mapService.mapTop,value)
  //    if (foundMarker) {
  //      this._mapService.markMarkerAsSelectedOrUnselected(foundMarker);
  //    }
  //  })
    this._updateSelectedMarkersOnMap(this._mapService.mapTop,targetsId)
  }
  _updateSelectedMarkersOnMap(map: L.Map, selectedTargets: number[] ) {
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
    this.parametersForm = this._formatParameters(this.parametersForm)
    this._mapService.launchSimulation(this.parametersForm)
  }

  private _formatParameters(parametersForm: FormGroup): FormGroup {
    const targetsId: number[] = this.parametersForm.value.selectedTargets.map((t: string) => this.targets.get(t));
    this.parametersForm.value.selectedTargets = targetsId
    return parametersForm;
  }

  private setMarkerIcon(foundMarker: CustomMarker, SELECT_GEN_COLOR: string) {
    const currentIconSize = foundMarker.getIcon().options.iconSize as L.PointExpression | undefined
    let size: number;

    if (Array.isArray(currentIconSize)) {
      size = currentIconSize[0];
      console.log("if one")
    } else {
      console.log("else")
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
