import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrl: './parameters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    // Material
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatRadioModule,
    MatChipsModule,
  ],
})
export class ParametersComponent {
  seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];
  dayTypes = ['Weekday', 'Weekend'];
  times = new Map([
    ['22-2h', 0],
    ['2-6h', 4],
    ['6-10h', 8],
    ['10-14h', 12],
    ['14-18h', 16],
    ['18-22h', 20],
  ]);

  selectedData = { season: '', dayType: '', time: '' };

  targets = new Map([
    ['Cavergno', 16], //id bus: 163, id gen: 16
    ['Innertkirchen', 15], //id bus: 17, id gen: 15
    ['Löbbia', 7], //id bus: 3, id gen: 7
    ['Pradella', 29], //id bus: 21, id gen: 29
    ['Riddes', 30], //id bus: 56, id gen: 30
    ['Rothenbrunnen', 36], //id bus: 175, id gen: 36
    ['Sedrun', 35], //id bus: 119, id gen: 35
    ['Sils', 18], //id bus: 72, id gen: 18
    ['Stalden', 6], //id bus: 50, id gen: 6
    ['Tavanasa', 24], //id bus: 19, id gen: 24
  ]);
  selectedTargets = [];

  algorithmList = ['MLPR'];
  selectedAlgo = [];

  //TODO: learn how to do http request: https://angular.dev/guide/http/setup
  loadData() {
    console.log('selectedData', this.selectedData);
    const time = this.times.get(this.selectedData.time);
    console.log('time to send', time);
  }

  simulateAttack() {
    //@todo: send selectedDAta + selected target
    console.log('selectedTargets', this.selectedTargets);

    var targetsId: any[] = [];
    this.selectedTargets.forEach((t) => {
      targetsId.push({ id: this.targets.get(t), name: t });
    });
    console.log('targets to send', targetsId);
  }

  testAlgo() {
    //@todo: send selectedDAta + selected target + selected algo
    console.log('selectedAlgo', this.selectedAlgo);
  }
}
