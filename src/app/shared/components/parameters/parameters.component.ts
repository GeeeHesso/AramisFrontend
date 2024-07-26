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
import {
  algorithmsParameters,
  algorithmsResult,
  algorithmsResultAPI,
  targetsParameters,
  timeParameters,
} from '@core/models/parameters';
import { ApiService } from '@core/services/api.service';
import { MapService } from '@core/services/map/map.service';
import { BehaviorSubject, finalize } from 'rxjs';
import { DialogResultComponent } from '../dialogResult/dialogResult.component';

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

  positiveResult: any[] = [];

  constructor(
    @Inject(ALGORITHMS_RESULT)
    public algorithmsResult$: BehaviorSubject<algorithmsResult>,
    @Inject(SELECTED_TARGETS)
    private _selectedTargets: BehaviorSubject<number[]>,
    @Inject(API_LOADING)
    private _apiLoading$: BehaviorSubject<boolean>,
    private _mapService: MapService,
    private _apiService: ApiService,
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

  handleButtonLaunchSimulation(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      //@TODO: show message to user
      return;
    }
    this._apiLoading$.next(true);

    const formValue = this.form.getRawValue();

    // Update "Real data" map
    if (!formValue.season || !formValue.day || !formValue.hour) return;

    const commonParams: timeParameters = {
      season: formValue.season.toLowerCase(),
      day: formValue.day.toLowerCase(),
      hour: formValue.hour,
    };

    this._apiService.postRealNetwork({ ...commonParams }).subscribe({
      next: (data) => {
        const formattedData = this._mapService.getFormattedPantagruelData(data);
        this._mapService.drawOnMap(this._mapService.mapTop, formattedData);
      },
      error: (error) => {
        //@TODO: show snackbar
        console.error('Error:', error);
      },
    });

    // Complete "Operator data" map
    const selectedTargets = formValue.selectedTargets;
    if (!Array.isArray(selectedTargets)) {
      console.error('Selected targets are not an array:', selectedTargets);
      return;
    }

    const attackParams: targetsParameters = {
      ...commonParams,
      attacked_gens: selectedTargets.map(String),
    };
    this._apiService.postAttackedNetwork(attackParams).subscribe({
      next: (data) => {
        const formattedData = this._mapService.getFormattedPantagruelData(data);
        this._mapService.drawOnMap(this._mapService.mapBottom, formattedData);
      },
      error: (error) => {
        //@TODO: show snackbar if none before
        console.error(error);
      },
    });

    // Calculate algo
    const selectedAlgo = formValue.selectedAlgo;
    if (!Array.isArray(selectedAlgo)) {
      console.error('Selected targets are not an array:', selectedAlgo);
      return;
    }
    const algorithmParams: algorithmsParameters = {
      ...attackParams,
      algorithms: selectedAlgo,
    };
    this._apiService
      .postAlgorithmResults(algorithmParams)
      .pipe(
        finalize(() => {
          this._apiLoading$.next(false);
        })
      )
      .subscribe({
        next: (data) => {
          this.algorithmsResult$.next(data);
          this._populateAlgorithmResult(data);
        },
        error: (error) => {
          //@TODO: show snackbar if none before
          console.error(error);
        },
      });
  }

  handleButtonDetails() {
    this._dialog.open(DialogResultComponent);
  }

  private _populateAlgorithmResult(data: algorithmsResultAPI) {
    console.log('populateAlgorithmResult', data);

    let selectedAlgo = Object.keys(data);
    let positiveResultsAlgo: {
      algoName: string;
      targetsDetected: (string | undefined)[];
    }[] = [];
    let detectedTarget: any = []; // Why cannot use type algorithmsResult?
    //@TODO: improve this, need help
    Object.keys(data).forEach((algo, index) => {
      let positiveResult: (string | undefined)[] = [];
      if (index == 0) {
        Object.keys(data[algo]).forEach((result) => {
          detectedTarget.push({
            genIndex: parseInt(result),
            genName: this.potentialTargets.get(parseInt(result)),
            algoList: selectedAlgo, //@TODO: stored in each line, not optimal
          });
        });
      }
      Object.keys(data[algo]).forEach((result) => {
        let targetIndexInArray = detectedTarget.findIndex(
          (target: { genIndex: number }) => target.genIndex == parseInt(result)
        );
        detectedTarget[targetIndexInArray] = {
          ...detectedTarget[targetIndexInArray],
          [algo]: data[algo][result],
        };

        if (data[algo][result]) {
          positiveResult.push(this.potentialTargets.get(parseInt(result)));
        }
      });
      positiveResultsAlgo.push({
        algoName: algo,
        targetsDetected: positiveResult,
      });
    });
    this.positiveResult = positiveResultsAlgo;

    this.algorithmsResult$.next(detectedTarget);
  }
}
