import {CommonModule, KeyValuePipe} from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BaseClass } from '@core/bases/base.class';
import {ALGORITHMS_RESULT, SELECTED_TARGETS} from '@core/models/base.const';
import { algorithmResult } from '@core/models/parameters';
import { BehaviorSubject, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dialog-result',
  standalone: true,
  imports: [
    KeyValuePipe,
    CommonModule,  // Add CommonModule to the imports array
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
    public algorithmsResult$: BehaviorSubject<algorithmResult>,
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
        this.dataSource = value.data
        this.displayedColumns = value.columns
        console.log(this.displayedColumns)
      });
    this.selectedTargets$
      .pipe(
        filter((event) => (event ? true : false)),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((value) => {
        this.selectedTargets = value
        console.log(this.selectedTargets)
      });

  }
  getRowClass(row: any): string {
    console.log("getRowClass")
    console.log("getRowClass",row)
    const genId = row.genId;
    const isSelectedTarget = this.selectedTargets.includes(genId);
    const hasTrueValue = this.displayedColumns.some(column => row[column] === true);
    if (isSelectedTarget) {
      console.log("isSelectedTarget")
      return 'highlight';
    }

    if (hasTrueValue && !isSelectedTarget) {
      return 'highlight-red';
    }

    if (hasTrueValue && isSelectedTarget) {
      return 'highlight-green';
    }

    return '';
  }
}
