import { Injectable, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Pantagruel } from '@models/pantagruel';

@Injectable({
  providedIn: 'root',
})
export class ParametersService {
  public parametersForm: FormGroup;
  private _potentialTargets = signal<Map<number, string>>(
    new Map<number, string>()
  );
  private _listOfBusIdAndName = new Map<number, string>();
  private _listOfIndexAndName = new Map<number, string>();
  private _algorithmsResult$ = signal<
    Array<{
      name: string;
      results: Array<{ indexName: string; result: boolean }>;
    }>
  >([]);

  constructor(private _fb: FormBuilder) {
    this.parametersForm = this._fb.group({
      season: ['', Validators.required],
      day: ['', Validators.required],
      hour: ['', Validators.required],
      selectedTargets: [[], Validators.required],
      selectedAlgo: [[], Validators.required],
    });
  }

  get algorithmsResult(): WritableSignal<
    Array<{
      name: string;
      results: Array<{ indexName: string; result: boolean }>;
    }>
  > {
    return this._algorithmsResult$;
  }

  set algorithmsResult(
    value: WritableSignal<
      Array<{
        name: string;
        results: Array<{ indexName: string; result: boolean }>;
      }>
    >
  ) {
    this._algorithmsResult$ = value;
  }

  get listofBusIdAndName(): Map<number, string> {
    return this._listOfBusIdAndName;
  }

  set listofBusIdAndName(value: Map<number, string>) {
    this._listOfBusIdAndName = value;
  }

  get listOfIndexAndName(): Map<number, string> {
    return this._listOfIndexAndName;
  }

  set listOfIndexAndName(value: Map<number, string>) {
    this._listOfIndexAndName = value;
  }

  get potentialTargets(): Map<number, string> {
    return this._potentialTargets();
  }

  setPotentialTargets(newTargets: Map<number, string>): void {
    this._potentialTargets.set(newTargets);
  }

  getSelectedTargets() {
    return this.parametersForm.get('selectedTargets')?.value;
  }

  addSelectedTarget(target: any) {
    const currentTargets =
      this.parametersForm.get('selectedTargets')?.value || [];
    this.parametersForm
      .get('selectedTargets')
      ?.setValue([...currentTargets, target]);
  }

  getForm(): FormGroup {
    return this.parametersForm;
  }

  getTargetsIdByNames(
    targetsList: any[],
    targetsMap: Map<number, string>
  ): number[] {
    const targetsId: number[] = [];
    targetsList.forEach((target) => {
      const targetId = Array.from(targetsMap.entries()).find(
        ([key, value]) => value === target
      )?.[0];
      if (targetId !== undefined) {
        targetsId.push(targetId);
      } else {
        targetsId.push(Number(target));
      }
    });

    return targetsId;
  }

  addOrRemoveSelectedTarget(targetId: number) {
    const currentTargets =
      this.parametersForm.get('selectedTargets')?.value || [];
    const targetIndex = currentTargets.indexOf(targetId);

    if (targetIndex > -1) {
      currentTargets.splice(targetIndex, 1);
    } else {
      currentTargets.push(targetId);
    }

    this.parametersForm.get('selectedTargets')?.setValue(currentTargets);
  }

  populatePotentialTargets(data: Pantagruel) {
    const onlyVisiblePowerplantsList = new Map([
      [2239, 'Cavergno'],
      [5540, 'Innertkirchen'],
      [5594, 'Löbbia'],
      [5612, 'Pradella'],
      [2339, 'Riddes'],
      [5591, 'Rothenbrunnen'],
      [5573, 'Sedrun'],
      [5589, 'Sils'],
      [5518, 'Stalden'],
      [5582, 'Tavanasa'],
    ]);
    const potentialTargetsTemp = new Map<number, string>();

    Object.keys(data.bus).forEach((key) => {
      const bus = data.bus[key];
      this._listOfBusIdAndName.set(bus.index, bus.name);
    });

    Object.keys(data.gen).forEach((key) => {
      const gen = data.gen[key];
      if (this._listOfBusIdAndName.has(gen.gen_bus)) {
        const name = this._listOfBusIdAndName.get(gen.gen_bus);
        if (name) {
          potentialTargetsTemp.set(gen.gen_bus, name);
          this._listOfIndexAndName.set(gen.index, name);
        }
      }
    });

    // Temporary filtering logic
    {
      const filteredTargets = new Map<number, string>();
      potentialTargetsTemp.forEach((name, index) => {
        if (onlyVisiblePowerplantsList.has(index)) {
          filteredTargets.set(index, name);
        }
      });
      this._potentialTargets.set(filteredTargets);
    }
    // End of temporary filtering logic

    //console.log('potentialTargets', this._potentialTargets);
    //console.log('listOfBusGen', this._listOfIndexAndName);
    //console.log('listofBusIdAndName', this._listofBusIdAndName);
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

    this._algorithmsResult$.set(algorithmsResult);
    //console.log('algorithmsResult', this._algorithmsResult());
  }
}
