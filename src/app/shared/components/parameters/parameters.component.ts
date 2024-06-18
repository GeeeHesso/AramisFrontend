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
  timeSlots = ['22-2h', '2-6h', '6-10h', '10-14h', '14-18h', '18-22h'];
  selectedData = { season: '', dayType: '', timeSlot: '' };

  //It's possible to do a chips autocomplete form: https://material.angular.io/components/chips/overview#autocomplete
  targets = [
    'Bärenburg',
    'Bâtiaz',
    'Bavona',
    'Biasca',
    'Bitsch',
    'Castasegna',
    'Cavergno',
    'Chamoson',
    'Ferrera',
    'Fionnay FMM',
    'Fionnay GD',
    'Göschenen',
    'Grimsel',
    'Handeck',
    'Innertkirchen',
    'Limmern',
    'Löbbia',
    'Mapragg',
    'Olivone',
    'Pradella',
    'Riddes',
    'Robiei',
    'Rothenbrunnen',
    'Sedrun',
    'Sils',
    'Stalden',
    'Tavanasa',
    'Tierfehd',
    'Verbano',
    'Veytaux',
  ];
  selectedTargets = [];

  algorithmList = ['MLPR', 'Random forest'];
  selectedAlgo = [];

  //TODO: learn how to do http request: https://angular.dev/guide/http/setup
  loadData() {
    console.log('selectedData', this.selectedData);
  }

  simulateAttack() {
    console.log('selectedTargets', this.selectedTargets);
  }

  testAlgo() {
    console.log('selectedAlgo', this.selectedAlgo);
  }
}
