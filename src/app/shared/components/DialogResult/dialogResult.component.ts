import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';
import { ALGORITHMS_RESULT } from '@core/models/base.const';
import { algorithmResult } from '@core/models/parameters';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dialog-result',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatSortModule],
  templateUrl: './dialogResult.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogResultComponent {
  public algorithmsResult: any;
  constructor(
    @Inject(ALGORITHMS_RESULT)
    public algorithmsResult$: BehaviorSubject<algorithmResult>
  ) {
    //@Todo: I didn't manage to use the behavior subject in html
    this.algorithmsResult = algorithmsResult$.getValue();
  }
}
