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

  constructor(private fb: FormBuilder, private _mapService: MapService, private _apiService: ApiService) {
    this.parametersForm = this.fb.group({
      season: ['', Validators.required],
      day: ['', Validators.required],
      hour: ['', Validators.required],
      selectedTargets: [[], Validators.required],
      selectedAlgo: [[], Validators.required],
    });
  }
  ngOnInit(): void {
    // Subscribe only to the selectedTargets form control value changes
    this.parametersForm.get('selectedTargets')?.valueChanges.subscribe(value => {
      this.onSelectedTargetsChange(value);
    });
  }
  onSelectedTargetsChange(value: any): void {
    const listOfAllTargetsName = value
    console.log("listOfAllTargetsName",listOfAllTargetsName)
    const targetsId: number[] = listOfAllTargetsName.map((t: string) => this.targets.get(t));

    targetsId.map(value => {
      this._selectTheMarker(value.toString());
    })

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

  private _selectTheMarker(genId: string) {
    console.log("_selectTheMarker")
    this._mapService.findMarkerByGenId(this._mapService.mapTop,genId)
  }
}
