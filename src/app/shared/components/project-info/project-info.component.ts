import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-project-info',
  standalone: true,
  imports: [
    //Material
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './project-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectInfoComponent {
  constructor(private _dialogRef: MatDialogRef<ProjectInfoComponent>) {}

  close() {
    this._dialogRef.close(false);
  }
}
