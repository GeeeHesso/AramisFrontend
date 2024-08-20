import { CommonModule, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BaseClass } from '@core/bases/base.class';
import { GEN_DISPLAY_NAME } from '@core/core.const';
import {
  ALGORITHMS_RESULT_FOR_TABLE,
  SELECTED_ALGOS,
  SELECTED_TARGETS,
} from '@core/models/base.const';
import { algorithmResult } from '@core/models/parameters';
import { BehaviorSubject, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dialog-result',
  standalone: true,
  imports: [
    KeyValuePipe,
    CommonModule,
    // Mat
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    MatTooltipModule,
    MatIconModule,
  ],
  templateUrl: './dialogResult.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogResultComponent extends BaseClass {
  displayedColumns!: string[];
  dataSource!: algorithmResult[];
  selectedTargets!: number[];
  genDisplayName = GEN_DISPLAY_NAME;

  constructor(
    @Inject(ALGORITHMS_RESULT_FOR_TABLE)
    public algorithmsResult$: BehaviorSubject<algorithmResult[]>,
    @Inject(SELECTED_ALGOS)
    public selectedAlgos$: BehaviorSubject<string[]>,
    @Inject(SELECTED_TARGETS)
    private selectedTargets$: BehaviorSubject<number[]>
  ) {
    super();
  }

  ngOnInit() {
    this.algorithmsResult$
      .pipe(
        filter((event) => (event ? true : false)),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((value) => {
        this.dataSource = value.map((gen) => {
          return {
            ...gen,
            GEN_DISPLAY_NAME: gen[GEN_DISPLAY_NAME],
          };
        });
      });

    this.selectedAlgos$
      .pipe(
        filter((event) => (event ? true : false)),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((value) => {
        this.displayedColumns = [GEN_DISPLAY_NAME, ...value];
      });

    this.selectedTargets$
      .pipe(
        filter((event) => (event ? true : false)),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((value) => {
        this.selectedTargets = value;
      });
  }

  protected getRowClass(row: any): boolean {
    return this.selectedTargets.includes(parseInt(row.genIndex));
  }
  protected getCellClass(value: string): string {
    if (value === 'FP') return 'highlight-red';
    if (value === 'TP') return 'highlight-green';
    if (value === 'FN') return 'highlight-red';
    return '';
  }
}
