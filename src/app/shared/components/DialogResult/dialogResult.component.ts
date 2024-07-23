import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ParametersService } from '@core/services/parameters.service';

@Component({
  selector: 'app-dialog-result',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './dialogResult.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogResultComponent {
  //todo: use @Inject(MAT_DIALOG_DATA) public data: any
  constructor(public parametersService: ParametersService) {}
}
