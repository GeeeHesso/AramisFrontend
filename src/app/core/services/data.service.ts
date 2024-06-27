import { Injectable } from '@angular/core';
import { Gen, Pantagruel } from '@core/models/pantagruel';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public setConstOfDataSet(data: Pantagruel): void {
    data.GEN_MAX_MAX_PROD = this._setGenMaxOfMaxProduction(data.gen);
    data.GEN_MIN_MAX_PROD = this._setGenMinOfMaxProduction(
      data.gen,
      data.GEN_MAX_MAX_PROD
    );
  }

  /**
   * Find the highest value among the maximum production of the generators
   * @param gens
   * @private
   */
  private _setGenMaxOfMaxProduction(gens: { [key: string]: Gen }): number {
    let max: number = 0;
    Object.keys(gens).forEach((b) => {
      if (max < gens[b].pmax) {
        max = gens[b].pmax;
      }
    });
    return max;
  }

  /**
   * Find the smallest value among the maximum production of the generators
   * @param gens
   * @private
   */
  private _setGenMinOfMaxProduction(
    gens: { [key: string]: Gen },
    max: number
  ): number {
    let min: number = max;
    Object.keys(gens).forEach((b) => {
      if (min > gens[b].pmax) {
        min = gens[b].pmax;
      }
    });
    return min;
  }
}
