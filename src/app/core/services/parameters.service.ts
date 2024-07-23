import { Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ParametersService {
  form = this._fb.group({
    season: ['', Validators.required],
    day: ['', Validators.required],
    hour: ['', Validators.required],
    selectedTargets: [[] as number[], Validators.required],
    selectedAlgo: [[] as string[], Validators.required],
  });

  algorithmsResult$ = signal<
    Array<{
      name: string;
      results: Array<{ indexName: string; result: boolean }>;
    }>
  >([]);

  constructor(private _fb: FormBuilder) {}

  getSelectedTargets() {
    return this.form.get('selectedTargets')?.value;
  }

  addSelectedTarget(target: any) {
    const currentTargets = this.form.get('selectedTargets')?.value || [];
    this.form.get('selectedTargets')?.setValue([...currentTargets, target]);
  }

  addOrRemoveSelectedTarget(targetId: number) {
    const currentTargets = this.form.get('selectedTargets')?.value || [];
    const targetIndex = currentTargets.indexOf(targetId);

    if (targetIndex > -1) {
      currentTargets.splice(targetIndex, 1);
    } else {
      currentTargets.push(targetId);
    }

    this.form.get('selectedTargets')?.setValue(currentTargets);
  }

  populateAlgorithmResult(data: any) {
    //console.log('populateAlgorithmResult', data);

    const algorithmsResult = Object.keys(data).map((algorithmName) => {
      const results = Object.keys(data[algorithmName]).map((indexName) => ({
        indexName: indexName,
        result: data[algorithmName][indexName],
      }));
      return { name: algorithmName, results: results };
    });

    this.algorithmsResult$.set(algorithmsResult);
  }
}
