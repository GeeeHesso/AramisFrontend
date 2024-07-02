import { CommonModule } from '@angular/common';
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import {
  algorithmsParameters,
  targetsParameters,
  timeParameters,
} from '@core/models/parameters';
import { ApiService } from '@core/services/api.service';
import { MapService } from '@core/services/map.service';

@Component({
  standalone: true,
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrl: './parameters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    // Material
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatChipsModule,  ReactiveFormsModule
  ],
})
export class ParametersComponent {
  seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
  day = ['Weekday', 'Weekend'];
  //  @TODO discuss with mark to adapt back to receive value not range (second value is useless for now)
  hours = new Map([
    ['22-2h', 0],
    ['2-6h', 4],
    ['6-10h', 8],
    ['10-14h', 12],
    ['14-18h', 16],
    ['18-22h', 20],
  ]);

  targets = new Map([
    ['Cavergno', 16], //id bus: 163, id gen: 16
    ['Innertkirchen', 15], //id bus: 17, id gen: 15
    ['Löbbia', 7], //id bus: 3, id gen: 7
    ['Pradella', 29], //id bus: 21, id gen: 29
    ['Riddes', 30], //id bus: 56, id gen: 30
    ['Rothenbrunnen', 36], //id bus: 175, id gen: 36
    ['Sedrun', 35], //id bus: 119, id gen: 35
    ['Sils', 18], //id bus: 72, id gen: 18
    ['Stalden', 6], //id bus: 50, id gen: 6
    ['Tavanasa', 24], //id bus: 19, id gen: 24
  ]);
  selectedTargets = [];

  algorithmList = ['MLPR'];
  selectedAlgo = [];
  parametersForm: FormGroup;
  constructor(private fb: FormBuilder,
    private _mapService: MapService,
    private _apiService: ApiService
  ) {
    this.parametersForm = this.fb.group({
      season: ['', Validators.required],
      day: ['', Validators.required],
      hour: ['', Validators.required]
    });
  }

  loadData() {
    //@todo: made selectedData mandatory (courage c'est la plus compliqué les formulaires angular, fais pas du custom apprendre mnt c'est gagné beaucoup de temps ensuite)

    var formattedParameters = this._formatTimeParameters();
    console.log('formattedParameters', formattedParameters);
    // Example to get value from range, SEE TODO before hours line 34
    /*const hourValue = this.hours.get(this.selectedData.hour);
    var formattedParameters = {
      season: this.selectedData.season.toLowerCase(),
      day: this.selectedData.day.toLowerCase(),
      hour: hourValue,
    };*/

    // example with get
    console.log("called postRealNetwork ")
    this._apiService.postRealNetwork(formattedParameters).subscribe({
      next: (data) => {
        console.log("in data ")
        const formattedData = this._mapService.getFormattedPantagruelData(data);
        console.log("formattedData");
        console.log(formattedData);
        this._mapService.clearMap(this._mapService.mapTop)
        this._mapService.drawOnMap(this._mapService.mapTop, formattedData);
      },
      error: (error) => {
        console.log(error)
      },
    });

    // not working with post
    this._apiService.postRealNetwork(formattedParameters).subscribe({
      next: (data) => {
        const formattedData = this._mapService.getFormattedPantagruelData(data);
        console.log(formattedData);
        this._mapService.drawOnMap(this._mapService.mapTop, formattedData);
      },
      error: (error) => {
        //@todo
      },
    });
  }

  simulateAttack() {
    //@todo: send selectedDAta + selected target
    console.log('selectedTargets', this.selectedTargets);

    var formattedParameters = this._formatTargetParameters();

    console.log('formattedParameters', formattedParameters);
  }

  testAlgo() {
    //@todo: send selectedDAta + selected target + selected algo
    console.log('selectedAlgo', this.selectedAlgo);
    var formattedParameters: algorithmsParameters =
      this._formatAlgorithmsParameters();
    console.log('formattedParameters', formattedParameters);
  }

  private _formatTimeParameters(): timeParameters {
    const formValue = this.parametersForm.value;
    return {
      ...formValue,
      season: formValue.season.toLowerCase(),
      day: formValue.day.toLowerCase(),
    };
  }

  private _formatTargetParameters(): targetsParameters {
    var targetsId: any[] = [];
    this.selectedTargets.forEach((t) => {
      targetsId.push(this.targets.get(t));
    });
    return {
      ...this._formatTimeParameters(),
      attacked_gens: targetsId,
    };
  }

  private _formatAlgorithmsParameters(): algorithmsParameters {
    return {
      ...this._formatTargetParameters(),
      algorithms: this.selectedAlgo,
    };
  }

}
