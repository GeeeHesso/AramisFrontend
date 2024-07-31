import {
  AsyncPipe,
  CommonModule,
  KeyValue,
  KeyValuePipe,
  NgClass,
} from '@angular/common';
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
  ALGORITHMS_RESULT_FOR_TABLE,
  API_LOADING,
  SELECTED_ALGOS,
  SELECTED_TARGETS,
} from '@core/models/base.const';
import {
  algorithmResult,
  algorithmsParameters,
  algorithmsParametersForm,
  algorithmsResultAPI,
  detectedTarget,
  detectedTargets1Algo,
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
    CommonModule,
    KeyValuePipe,
    AsyncPipe,

    // Forms
    NgClass,
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
    season: [SEASONS[0], Validators.required],
    day: [DAYS[0], Validators.required],
    hour: [HOURS.entries().next().value[1], Validators.required],
    percentageFactor: [PERCENTAGE, Validators.required],
    selectedTargets: [[] as number[], Validators.required],
    selectedAlgos: [[] as string[], Validators.required],
  });

  detectedTargetsByAlgo$: BehaviorSubject<detectedTargets1Algo[]> =
    new BehaviorSubject<detectedTargets1Algo[]>([]);

  showResult$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(ALGORITHMS_RESULT_FOR_TABLE)
    public algorithmsResultForTable$: BehaviorSubject<algorithmResult[]>,
    @Inject(SELECTED_TARGETS)
    private _selectedTargets$: BehaviorSubject<number[]>,
    @Inject(SELECTED_ALGOS)
    private _selectedAlgos$: BehaviorSubject<string[]>,
    @Inject(API_LOADING)
    private _apiLoading$: BehaviorSubject<boolean>,
    private _mapService: MapService,
    private _apiService: ApiService,
    private _notificationService: NotificationService,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    // When "Data source" are selected in form, update UI
    // If a listener is put on the all form, updateUI is calling twice because selectedTarget can be updated by the map
    this.form.get('season')?.valueChanges.subscribe(() => {
      this._updateUI();
    });
    this.form.get('day')?.valueChanges.subscribe(() => {
      this._updateUI();
    });
    this.form.get('hour')?.valueChanges.subscribe(() => {
      this._updateUI();
    });
    this.form.get('percentageFactor')?.valueChanges.subscribe(() => {
      this._updateUI();
    });

    // When "Target" are selected in form, update global list of selected target to update top map
    this.form.get('selectedTargets')?.valueChanges.subscribe((value) => {
      this._selectedTargets$.next(value as number[]);
    });
    // Update UI at each change of the global list of selected target
    this._selectedTargets$.subscribe((targets) => {
      this.form.controls['selectedTargets'].patchValue(targets, {
        emitEvent: false,
      });
      this._updateUI();
    });

    // When "Algorithm" are selected in form, update global list of selected algos and update UI
    this.form.get('selectedAlgos')?.valueChanges.subscribe((value) => {
      this._selectedAlgos$.next(value as string[]);
      this._updateUI();
    });
  }

  private _updateUI(): void {
    // Reset UI
    this.showResult$.next(false);
    this._mapService.clearMap(this._mapService.mapTop);
    this._mapService.clearMap(this._mapService.mapBottom);
    this._notificationService.closeSnackBar();

    const formValue = this.form.getRawValue();

    this._callPostRealNetwork(formValue);
  }

  private _callPostRealNetwork(formValue: algorithmsParametersForm) {
    if (
      !formValue.season ||
      !formValue.day ||
      (!formValue.hour && formValue.hour !== 0) ||
      !formValue.percentageFactor
    ) {
      return;
    }
    this._apiLoading$.next(true);

    const commonParams: timeParameters = {
      season: formValue.season.toLowerCase(),
      day: formValue.day.toLowerCase(),
      hour: formValue.hour,
      scale_factor: formValue.percentageFactor,
    };
    this._apiService.postRealNetwork({ ...commonParams }).subscribe({
      next: (data) => {
        const formattedData = this._mapService.getFormattedPantagruelData(data);
        // Update "Real data" map
        this._mapService.drawOnMap(this._mapService.mapTop, formattedData);
        // Update "Operator data" map and "Algorithm result"
        this._callPostAlgorithmResults(commonParams, formValue);
      },
      error: (error) => {
        this._notificationService.openSnackBar(
          'Real data cannot be loaded',
          'Close'
        );
        console.error('Error:', error);
        this._apiLoading$.next(false);
        this.showResult$.next(false);
        return;
      },
    });
  }

  // "Post Algorithm Results" allows to update the bottom map and the result, that is why it must be called before "Post Attacked Network"
  private _callPostAlgorithmResults(
    commonParams: timeParameters,
    formValue: algorithmsParametersForm
  ) {
    const selectedTargets = formValue.selectedTargets || [];
    const selectedAlgos = formValue.selectedAlgos || [];

    if (selectedTargets.length < 1 || selectedAlgos.length < 1) {
      this._apiLoading$.next(false);
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
    this._apiService.postAlgorithmResults(algorithmParams).subscribe({
      next: (data) => {
        this._populateAlgorithmResult(data);
        // Complete "Operator data" map
        this._callPostAttackedNetwork(targetParams);
      },
      error: (error) => {
        this._notificationService.openSnackBar(
          'Algorithms results cannot be loaded',
          'Close'
        );
        console.error(error);

        this._apiLoading$.next(false);
        this.showResult$.next(false);

        return;
      },
    });
  }

  // Complete "Operator data" map
  private _callPostAttackedNetwork(targetParams: targetsParameters) {
    this._apiService
      .postAttackedNetwork(targetParams)
      .pipe(
        finalize(() => {
          this._apiLoading$.next(false);
        })
      )
      .subscribe({
        next: (data) => {
          const formattedData =
            this._mapService.getFormattedPantagruelData(data);
          this._mapService.drawOnMap(this._mapService.mapBottom, formattedData);
        },
        error: (error) => {
          //@todo:simulate this error
          this._notificationService.openSnackBar(
            'Operator data cannot be loaded',
            'Close'
          );
          console.error(error);
          this.showResult$.next(false);
          return;
        },
      });
  }

  protected selectAllTargets() {
    const potentialTargets: number[] = Array.from(POTENTIALTARGETS.keys());
    this.form.controls['selectedTargets'].setValue(potentialTargets);
  }

  protected alphabeticalOrder = (
    a: KeyValue<any, any>,
    b: KeyValue<any, any>
  ): number => {
    return a.value.genName.localeCompare(b.value.genName);
  };

  protected selectAllAlgos() {
    this.form.controls['selectedAlgos'].setValue(ALGO_LIST);
  }

  protected handleButtonDetails() {
    this._dialog.open(DialogResultComponent, {
      maxWidth: '80vw',
    });
  }

  private _populateAlgorithmResult(data: algorithmsResultAPI) {
    let detectedTargetsByAlgo: detectedTargets1Algo[] = []; // Use for summary result in left panel
    let algorithmsResultForTable: algorithmResult[] = []; // Use for dialog result

    // Iterate through each algo return by the API
    for (const [algoName, algoResults] of Object.entries(data)) {
      let detectedTargets: detectedTarget[] = [];

      // Iterate through each genIndex return by the API inside the current algo
      for (const [genIndex, genValue] of Object.entries(algoResults)) {
        // Gen information of the target
        const target = this.potentialTargets.get(+genIndex);
        const genName = target ? target.genName : genIndex;
        const genCanton = target ? target.canton : '';
        const displayName = `${genName} (${genCanton})`;

        // Specify value for table
        let TPFPFNTN = '';
        let isFalsePositive = false; // stored value for CSS
        const selectedTargets = this._selectedTargets$.getValue();
        if (genValue) {
          if (selectedTargets.includes(parseInt(genIndex))) {
            TPFPFNTN = 'TP'; // True positive
          } else {
            TPFPFNTN = 'FP'; // False positive
            isFalsePositive = true;
          }
        } else {
          if (selectedTargets.includes(parseInt(genIndex))) {
            TPFPFNTN = 'FN'; // False negative
          } else {
            TPFPFNTN = 'TN'; // True negative
          }
        }

        // Store result for the result table in dialog
        const targetResult = algorithmsResultForTable.find(
          (d) => displayName === d['displayName']
        );
        // If target already store in result, we have to just define the TPFPFNTN result for the current algo, if not we have to push name and result to algorithmsResult
        if (targetResult) {
          targetResult[algoName] = TPFPFNTN;
        } else {
          algorithmsResultForTable.push({
            displayName: displayName,
            [algoName]: TPFPFNTN,
            genIndex: genIndex,
          });
        }

        // Store result by target for summary result
        if (data[algoName][genIndex]) {
          detectedTargets.push({
            genIndex: genIndex,
            genName: genName,
            isFalsePositive: isFalsePositive,
          });
        }
      }

      detectedTargetsByAlgo.push({
        algoName: algoName,
        targetsDetected: detectedTargets,
      });
      this.detectedTargetsByAlgo$.next(detectedTargetsByAlgo);
      this.algorithmsResultForTable$.next(
        algorithmsResultForTable.sort((a, b) =>
          a['displayName'].localeCompare(b['displayName'])
        )
      );
      this.showResult$.next(true);
    }
  }

  // Comparator function for the keyvalue pipe used in the html @for loop, keeps the original order of the Map
  protected originalOrder = (a: KeyValue<any, any>, b: KeyValue<any, any>) => {
    return 0;
  };
}
