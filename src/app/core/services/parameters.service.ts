import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Pantagruel} from "@models/pantagruel";

@Injectable({
  providedIn: 'root'
})
export class ParametersService {
  parametersForm: FormGroup;

  potentialTargets = new Map<number, string>();
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

  getTargetsIdByNames(targetsList: any[], targetsMap: Map<number, string>): number[] {
    const targetsId: number[] = [];

    targetsList.forEach(target => {
      const targetId = Array.from(targetsMap.entries()).find(([key, value]) => value === target)?.[0];
      if (targetId !== undefined) {
        targetsId.push(targetId);
      } else {
        targetsId.push(Number(target));
      }
    });

    return targetsId;
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
  populatePotentialTargets(data: Pantagruel) {
    const potentialTargetsFromBus = new Map<number, string>();
    console.log("populatePotentialTargets")
    console.log(data)
    Object.keys(data.bus).forEach(key => {
      const bus = data.bus[key];

      potentialTargetsFromBus.set(bus.index, bus.name);
    });
    console.log("potentialTargetsFromBus",potentialTargetsFromBus)
    Object.keys(data.gen).forEach(key => {
      const gen = data.gen[key];
      if (potentialTargetsFromBus.has(gen.gen_bus)) {
        const name = potentialTargetsFromBus.get(gen.gen_bus);
        if (name) {
          console.log(`Found a match for name ${name}`);
          this.potentialTargets.set(gen.gen_bus, name);
        }
      }
    });
    console.log("potentialTargets",this.potentialTargets)
  }
}
