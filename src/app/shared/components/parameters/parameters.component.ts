import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { algorithmsParameters, targetsParameters, timeParameters } from '@core/models/parameters';
import { ApiService } from '@core/services/api.service';
import { MapService } from '@core/services/map.service';

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
    this.parametersForm.valueChanges.subscribe(value => {
      console.log('Form changes', value);
    });
  }

  launchSimulation(): void {
      const formattedParameters = this._formatParameters();
      console.log('All parameters selected:', formattedParameters);
  }

  private _formatParameters(): algorithmsParameters {
    const formValue = this.parametersForm.value;
    const targetsId: number[] = formValue.selectedTargets.map((t: string) => this.targets.get(t));
    return {
      season: formValue.season.toLowerCase(),
      day: formValue.day.toLowerCase(),
      hour: formValue.hour,
      attacked_gens: targetsId,
      algorithms: formValue.selectedAlgo
    };
  }

  printme() {
    console.log('Form Values:', this.parametersForm.value);
  }
}
