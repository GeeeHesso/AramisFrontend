import {CommonModule, KeyValuePipe} from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BaseClass } from '@core/bases/base.class';
import {ALGORITHMS_RESULT, SELECTED_ALGOS, SELECTED_TARGETS} from '@core/models/base.const';
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
  ],
  styleUrls: ['./dialogResult.component.scss'],
  templateUrl: './dialogResult.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogResultComponent extends BaseClass {
  displayedColumns!: string[];
  dataSource!: any;
  selectedTargets!: number[];
  constructor(
    @Inject(ALGORITHMS_RESULT)
    public algorithmsResult$: BehaviorSubject<algorithmResult[]>,
    @Inject(SELECTED_ALGOS)
    public selectedAlgos$: BehaviorSubject<string[]>,
    @Inject(SELECTED_TARGETS)
    private selectedTargets$: BehaviorSubject<number[]>,

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
        this.dataSource = value;
      });

    this.selectedAlgos$
      .pipe(
        filter((event) => (event ? true : false)),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((value) => {
        this.displayedColumns = ['genName', ...value];

      });
    this.selectedTargets$
      .pipe(
        filter((event) => !!event),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((value) => {
        this.selectedTargets = value;

      });
  }
  getRowClass(row: any): string {
    const genId = parseInt(row.genIndex, 10); // Convert genId to integer
    const isSelectedTarget = this.selectedTargets.includes(genId);
    return isSelectedTarget ? 'highlight' : '';
  }
  getColumnClass(value: string): string {
    if (value === 'FP' || value === 'FN') return 'highlight-red';
    if (value === 'TP' || value === 'TN') return 'highlight-green';
    return '';
  }
}
