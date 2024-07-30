import { AsyncPipe, KeyValue, KeyValuePipe, NgClass } from '@angular/common';
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
import { MatSliderModule } from '@angular/material/slider';
import {
  ALGO_LIST,
  DAYS,
  HOURS,
  PERCENTAGE,
  POTENTIALTARGETS,
  SEASONS,
} from '@core/core.const';
import {
  ALGORITHMS_RESULT,
  API_LOADING,
  SELECTED_ALGOS,
  SELECTED_TARGETS,
} from '@core/models/base.const';
import {
  algorithmResult,
  algorithmsParameters,
  algorithmsParametersForm,
  algorithmsResultAPI,
  targetsParameters,
  timeParameters,
} from '@core/models/parameters';
import { ApiService } from '@core/services/api.service';
import { MapService } from '@core/services/map/map.service';
import { NotificationService } from '@core/services/notification.service';
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
    NgClass,

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
    MatSliderModule,
  ],
})
export class ParametersComponent implements OnInit {
  seasons = SEASONS;
  days = DAYS;
  hours = HOURS;
  percentageFactor = PERCENTAGE;
  potentialTargets = POTENTIALTARGETS;
  algorithmList = ALGO_LIST;

  form = this._formBuilder.group({
    season: [this.seasons[0], Validators.required],
    day: [this.days[0], Validators.required],
    hour: [this.hours.entries().next().value[1], Validators.required],
    percentageFactor: [this.percentageFactor, Validators.required],
    selectedTargets: [[] as number[], Validators.required],
    selectedAlgos: [[] as string[], Validators.required],
  });

  positiveResults$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  showResult$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(ALGORITHMS_RESULT)
    public algorithmsResult$: BehaviorSubject<algorithmResult[]>,
    @Inject(SELECTED_TARGETS)
    private _selectedTargets: BehaviorSubject<number[]>,
    @Inject(SELECTED_ALGOS)
    private _selectedAlgos: BehaviorSubject<string[]>,
    @Inject(API_LOADING)
    private _apiLoading$: BehaviorSubject<boolean>,
    private _mapService: MapService,
    private _apiService: ApiService,
    private _notificationService: NotificationService,
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

    this.form.get('selectedAlgos')?.valueChanges.subscribe((value) => {
      this._selectedAlgos.next(value as string[]);
    });
  }

  handleButtonLaunchSimulation(): void {
    // Check form
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this._notificationService.openSnackBar('Select all option', 'Close');
      return;
    }
    this._apiLoading$.next(true);

    const formValue = this.form.getRawValue();

    // Update "Real data" map
    if (
      !formValue.season ||
      !formValue.day ||
      !formValue.hour ||
      !formValue.percentageFactor
    )
      return;

    const commonParams: timeParameters = {
      season: formValue.season.toLowerCase(),
      day: formValue.day.toLowerCase(),
      hour: formValue.hour,
      scale_factor: formValue.percentageFactor,
    };
    this._apiService.postRealNetwork({ ...commonParams }).subscribe({
      next: (data) => {
        const formattedData = this._mapService.getFormattedPantagruelData(data);
        this._mapService.drawOnMap(this._mapService.mapTop, formattedData);
        this._processAlgoResult(commonParams, formValue);
      },
      error: (error) => {
        this._notificationService.openSnackBar(
          'Real data cannot be loaded',
          'Close'
        );
        console.error('Error:', error);

        this._mapService.clearMap(this._mapService.mapTop);
        this._mapService.clearMap(this._mapService.mapBottom);
        this.showResult$.next(false);
        return;
      },
    });
  }

  private _processAlgoResult(
    commonParams: timeParameters,
    formValue: algorithmsParametersForm
  ) {
    const selectedTargets = formValue.selectedTargets;
    if (!Array.isArray(selectedTargets)) {
      console.error('Selected targets are not an array:', selectedTargets);
      return;
    }

    const selectedAlgos = formValue.selectedAlgos;
    if (!Array.isArray(selectedAlgos)) {
      console.error('Selected targets are not an array:', selectedAlgos);
      return;
    }

    const targetParams: targetsParameters = {
      ...commonParams,
      attacked_gens: selectedTargets.map(String),
    };

    const algorithmParams: algorithmsParameters = {
      ...targetParams,
      algorithms: selectedAlgos,
    };

    // Calculate algo
    this._apiService
      .postAlgorithmResults(algorithmParams)
      .pipe(
        finalize(() => {
          this._apiLoading$.next(false);
        })
      )
      .subscribe({
        next: (data) => {
          this._populateAlgorithmResult(data);
          this._notificationService.closeSnackBar();

          this._displayOperatorData(targetParams);
        },
        error: (error) => {
          this._notificationService.openSnackBar(
            'Algorithms results cannot be loaded',
            'Close'
          );
          console.error(error);

          //@todo:simulate this error
          this.algorithmsResult$.next([]);

          let positiveResult: (string | undefined)[] = [];
          this.positiveResults$.next(positiveResult);

          this.showResult$.next(false);

          return;
        },
      });
  }

  private _displayOperatorData(targetParams: targetsParameters) {
    // Complete "Operator data" map
    this._apiService.postAttackedNetwork(targetParams).subscribe({
      next: (data) => {
        const formattedData = this._mapService.getFormattedPantagruelData(data);
        this._mapService.drawOnMap(this._mapService.mapBottom, formattedData);
      },
      error: (error) => {
        this._notificationService.openSnackBar(
          'Operator data cannot be loaded',
          'Close'
        );
        console.error(error);

        //@todo:simulate this error
        this._mapService.clearMap(this._mapService.mapBottom);
        this.showResult$.next(false);
        return;
      },
    });
  }

  handleButtonDetails() {
    this._dialog.open(DialogResultComponent, {
      maxWidth: '80vw',
    });
  }

  private _populateAlgorithmResult(data: algorithmsResultAPI) {
    let positiveResultsAlgo: {
      algoName: string;
      targetsDetected: any[];
    }[] = [];

    let algorithmsResult: algorithmResult[] = [];

    for (const [algoName, algoResults] of Object.entries(data)) {
      let positiveResults: any[] = [];

      for (const [genIndex, genValue] of Object.entries(algoResults)) {
        const genName = this.potentialTargets.get(+genIndex) || genIndex;

        const targetData = algorithmsResult.find(
          (d) => genName === d['genName']
        );

        let TPFPFNTN = '';
        let isFalsePositive = true;
        const selectedTargets = this._selectedTargets.getValue();
        if (genValue) {
          if (selectedTargets.includes(parseInt(genIndex))) {
            TPFPFNTN = 'TP'; // True positive
            isFalsePositive = false;
          } else {
            TPFPFNTN = 'FP'; // False positive
          }
        } else {
          if (selectedTargets.includes(parseInt(genIndex))) {
            TPFPFNTN = 'FN'; // False negative
          } else {
            TPFPFNTN = 'TN'; // True negative
          }
        }

        if (targetData) {
          targetData[algoName] = TPFPFNTN;
        } else {
          algorithmsResult.push({
            genName: genName,
            [algoName]: TPFPFNTN,
            genIndex: genIndex,
          });
        }

        if (data[algoName][genIndex]) {
          positiveResults.push({
            genIndex: genIndex,
            name: this.potentialTargets.get(parseInt(genIndex)),
            isFalsePositive: isFalsePositive,
          });
        }
      }
      positiveResultsAlgo.push({
        algoName: algoName,
        targetsDetected: positiveResults,
      });
      this.positiveResults$.next(positiveResultsAlgo);
      this.algorithmsResult$.next(algorithmsResult);
      this.showResult$.next(true);
    }
  }

  // Comparator function for the keyvalue pipe used in the html @for loop,
  // keeps the original order of the Map
  originalOrder = (a: KeyValue<any, any>, b: KeyValue<any, any>) => {
    return 0;
  };
}
