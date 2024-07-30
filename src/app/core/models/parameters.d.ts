export interface algorithmsParametersForm {
  season: string | null;
  day: string | null;
  hour: any;
  percentageFactor: number | null;
  selectedTargets: number[] | null;
  selectedAlgos: string[] | null;
}

export interface timeParameters {
  season: string;
  day: string;
  hour: number;
  scale_factor: number;
}

export interface targetsParameters extends timeParameters {
  attacked_gens: string[];
}

export interface algorithmsParameters extends targetsParameters {
  algorithms: string[];
}

export interface algorithmsResultAPI {
  [key: string]: { [key: string]: boolean };
}

export interface algorithmResult {
  [key: string]: string;
}
