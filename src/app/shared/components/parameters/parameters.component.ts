import { AsyncPipe, KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { POTENTIALTARGETS } from '@core/core.const';
import {
  ALGORITHMS_RESULT,
  API_LOADING,
  SELECTED_TARGETS,
} from '@core/models/base.const';
import { algorithmResult } from '@core/models/parameters';
import { MapService } from '@core/services/map/map.service';
import { BehaviorSubject } from 'rxjs';
import { DialogResultComponent } from '../DialogResult/dialogResult.component';

@Component({
  standalone: true,
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    KeyValuePipe,
    AsyncPipe,

    // Forms
    FormsModule,
    MatFormFieldModule,
    ReactiveFormsModule,

    // Mat
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatRadioModule,
    MatChipsModule,
  ],
})
export class ParametersComponent implements OnInit {
  seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
  days = ['Weekday', 'Weekend'];
  hours = new Map([
    ['22-2h', 0],
    ['2-6h', 4],
    ['6-10h', 8],
    ['10-14h', 12],
    ['14-18h', 16],
    ['18-22h', 20],
  ]);
  potentialTargets = POTENTIALTARGETS;

  algorithmList = ['NBC', 'MLPR', 'KNNC', 'RFC', 'SVC', 'GBC', 'MLPC'];

  form = this._formBuilder.group({
    season: ['', Validators.required],
    day: ['', Validators.required],
    hour: ['', Validators.required],
    selectedTargets: [[] as number[], Validators.required],
    selectedAlgo: [[] as string[], Validators.required],
  });

  constructor(
    @Inject(ALGORITHMS_RESULT)
    public algorithmsResult$: BehaviorSubject<algorithmResult>,
    @Inject(SELECTED_TARGETS)
    private _selectedTargets: BehaviorSubject<number[]>,
    @Inject(API_LOADING)
    private _apiLoading$: BehaviorSubject<boolean>,
    private _mapService: MapService,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form.get('selectedTargets')?.valueChanges.subscribe((value) => {
      this._selectedTargets.next(value as number[]);
    });

    this._selectedTargets.subscribe((targets) => {
      this.form.controls['selectedTargets'].patchValue(targets, {
        emitEvent: false,
      });
    });
  }

  launchSimulation(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this._apiLoading$.next(true);
    this._mapService.launchSimulation(this.form.getRawValue());
    this._apiLoading$.next(false);
  }

  handleButtonDetails() {
    this._dialog.open(DialogResultComponent);
  }
}
