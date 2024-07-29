import { AsyncPipe, KeyValue, KeyValuePipe } from '@angular/common';
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
import { POTENTIALTARGETS } from '@core/core.const';
import {
  ALGORITHMS_RESULT,
  API_LOADING,
  SELECTED_TARGETS,
} from '@core/models/base.const';
import {
  algorithmResult,
  algorithmsParameters,
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
  seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
  days = ['Weekday', 'Weekend'];
  hours = new Map([
    ['2-6h', 4],
    ['6-10h', 8],
    ['10-14h', 12],
    ['14-18h', 16],
    ['18-22h', 20],
    ['22-2h', 0],
  ]);
  percentageFactor = 100;
  potentialTargets = POTENTIALTARGETS;
  algorithmList = ['NBC', 'MLPR', 'KNNC', 'RFC', 'SVC', 'GBC', 'MLPC'];

  form = this._formBuilder.group({
    season: [this.seasons[0], Validators.required],
    day: [this.days[0], Validators.required],
    hour: ['10-14h', Validators.required],
    percentageFactor: [this.percentageFactor, Validators.required],
    selectedTargets: [[] as number[], Validators.required],
    selectedAlgo: [[] as string[], Validators.required],
  });

  positiveResult$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  showResult$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(ALGORITHMS_RESULT)
    public algorithmsResult$: BehaviorSubject<algorithmResult>,
    @Inject(SELECTED_TARGETS)
    private _selectedTargets: BehaviorSubject<number[]>,
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
  }

  handleButtonLaunchSimulation(): void {
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
      percentage_factor: formValue.percentageFactor,
    };

    this._apiService.postRealNetwork({ ...commonParams }).subscribe({
      next: (data) => {
        const formattedData = this._mapService.getFormattedPantagruelData(data);
        this._mapService.drawOnMap(this._mapService.mapTop, formattedData);
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
          this._populateAlgorithmResult(data);
          this._notificationService.closeSnackBar();
        },
        error: (error) => {
          this._notificationService.openSnackBar(
            'Algorithms results cannot be loaded',
            'Close'
          );
          console.error(error);

          //@todo:simulate this error
          let detectedTarget: algorithmResult = {
            columns: [],
            data: [],
          };
          this.algorithmsResult$.next(detectedTarget);

          let positiveResult: (string | undefined)[] = [];
          this.positiveResult$.next(positiveResult);

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
      targetsDetected: (string | undefined)[];
    }[] = [];

    let detectedTarget: algorithmResult = {
      columns: ['genName', ...Object.keys(data)],
      data: [],
    };

    for (const [algoName, algoResults] of Object.entries(data)) {
      let positiveResult: (string | undefined)[] = [];

      for (const [genIndex, genValue] of Object.entries(algoResults)) {
        const genName = this.potentialTargets.get(+genIndex) || genIndex;

        const targetData = detectedTarget.data.find(
          (d) => genName === d['genName']
        );

        if (targetData) {
          targetData[algoName] = genValue;
        } else {
          detectedTarget.data.push({
            genName: genName,
            [algoName]: genValue,
          });
        }

        if (data[algoName][genIndex]) {
          positiveResult.push(this.potentialTargets.get(parseInt(genIndex)));
        }
      }
      positiveResultsAlgo.push({
        algoName: algoName,
        targetsDetected: positiveResult,
      });
    }
    this.positiveResult$.next(positiveResultsAlgo);
    this.algorithmsResult$.next(detectedTarget);
    this.showResult$.next(true);
  }

  originalOrder = (a: KeyValue<any, any>, b: KeyValue<any, any>) => {
    return 0;
  };
}
