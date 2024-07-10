import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ParametersService {
  parametersForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.parametersForm = this.fb.group({
      season: ['', Validators.required],
      day: ['', Validators.required],
      hour: ['', Validators.required],
      selectedTargets: [[], Validators.required],
      selectedAlgo: [[], Validators.required],
    });
  }

  getSelectedTargets() {
    return this.parametersForm.get('selectedTargets')?.value;
  }

  addSelectedTarget(target: any) {
    const currentTargets = this.parametersForm.get('selectedTargets')?.value || [];
    this.parametersForm.get('selectedTargets')?.setValue([...currentTargets, target]);
  }

  getForm(): FormGroup {
    return this.parametersForm;
  }

  updateSelectedTargets(targetsList: any[], targetsMap: Map<string, number>) :number[] {
    return targetsList.map(target => {
      const targetId = targetsMap.get(target);
      return targetId !== undefined ? targetId : Number(target);
    });
  }

  addOrRemoveSelectedTarget(targetId: number) {
    const currentTargets = this.parametersForm.get('selectedTargets')?.value || [];
    const targetIndex = currentTargets.indexOf(targetId);

    if (targetIndex > -1) {

      currentTargets.splice(targetIndex, 1);
    } else {

      currentTargets.push(targetId);
    }

    this.parametersForm.get('selectedTargets')?.setValue(currentTargets);
  }
}
