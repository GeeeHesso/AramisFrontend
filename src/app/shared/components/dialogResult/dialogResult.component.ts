import { CommonModule, KeyValuePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BaseClass } from '@core/bases/base.class';
import {
  ALGORITHMS_RESULT,
  SELECTED_ALGOS,
  SELECTED_TARGETS,
} from '@core/models/base.const';
import { algorithmResult } from '@core/models/parameters';
import { BehaviorSubject, filter, takeUntil } from 'rxjs';
import {POTENTIALTARGETS} from "@core/core.const";

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
  templateUrl: './dialogResult.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogResultComponent extends BaseClass {
  displayedColumns!: string[];
  dataSource!: algorithmResult[];
  selectedTargets!: number[];
  potentialTargets = new Map([...POTENTIALTARGETS].sort((a, b) => a[1].name.localeCompare(b[1].name)));
  constructor(
    @Inject(ALGORITHMS_RESULT)
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
        this.dataSource = value.map((item) => {
          const target = this.potentialTargets.get(parseInt(item["genIndex"]));
          return {
            ...item,
            genName: target ? target.name : '',
            canton: target ? target.canton : '',
          };
        }).sort((a, b) => a.genName.localeCompare(b.genName)); // Sorting by genName

        console.log("datasource", this.dataSource);
      });

    this.selectedAlgos$
      .pipe(
        filter((event) => (event ? true : false)),
        takeUntil(this._unsubscribe$)
      )
      .subscribe((value) => {
        this.displayedColumns = ['genName','canton', ...value];
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
    if (value === 'FP' || value === 'FN') return 'highlight-red';
    if (value === 'TP' || value === 'TN') return 'highlight-green';
    return '';
  }
}
