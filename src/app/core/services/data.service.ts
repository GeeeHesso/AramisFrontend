import { Injectable } from '@angular/core';
import { Branch, Gen } from '@core/models/pantagruel';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public GEN_MAX_MAX_PROD!: number; // the higher value of field max prod of gen
  public GEN_MIN_MAX_PROD!: number; // the lowest value of field max prod of gen
  public BRANCH_MIN_P_MW!: number;
  public BRANCH_MAX_P_MW!: number;
  constructor() {
    //TODO: inject data, see other repo and co
    /*this.GEN_MAX_MAX_PROD = this._setGenMaxOfMaxProduction(data.gen);
    this.GEN_MIN_MAX_PROD = this._setGenMinOfMaxProduction(data.gen);
    this.BRANCH_MAX_P_MW = this._setBranchMaxPf(data.branch);
    this.BRANCH_MIN_P_MW = this._setBranchMinPf(data.branch);*/
  }

  /**
   * Find the highest value among the maximum production of the generators
   * @param gens
   * @private
   */
  private _setGenMaxOfMaxProduction(gens: { [key: string]: Gen }): number {
    let max: number = 0;
    Object.keys(gens).forEach((b) => {
      if (max < gens[b].maxW) {
        max = gens[b].maxW;
      }
    });
    return max;
  }

  /**
   * Find the smallest value among the maximum production of the generators
   * @param gens
   * @private
   */
  private _setGenMinOfMaxProduction(gens: { [key: string]: Gen }): number {
    let min: number = this.GEN_MAX_MAX_PROD;
    Object.keys(gens).forEach((b) => {
      if (min > gens[b].maxW) {
        min = gens[b].maxW;
      }
    });
    return min;
  }

  /**
   * Find the highest value among the thermal limits of the lines
   * @param branches
   * @private
   */
  private _setBranchMaxPf(branches: { [key: string]: Branch }): number {
    let max: number = 0;
    Object.keys(branches).forEach((b) => {
      if (max < branches[b].thermalRatingW) {
        max = branches[b].thermalRatingW;
      }
    });
    this.BRANCH_MAX_P_MW = Math.round(max); //@todo: see other repo to correct this
    return Math.round(max);
  }

  /**
   * Find the smallest value among the thermal limits of the lines
   * @param branches
   * @private
   */
  private _setBranchMinPf(branches: { [key: string]: Branch }): number {
    let min: number = this.BRANCH_MAX_P_MW;
    Object.keys(branches).forEach((b) => {
      if (min > branches[b].thermalRatingW) {
        min = branches[b].thermalRatingW;
      }
    });
    return Math.round(min);
  }
}
