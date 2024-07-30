export interface algorithmsParametersForm {
  season: string | null;
  day: string | null;
  hour: number;
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

// This type dynamic key-value is use for dynamic table in dialog result
export interface algorithmResult {
  [key: string]: string;
}

// Use for summary result under form
export interface detectedTargets1Algo {
  algoName: string;
  targetsDetected: detectedTarget[];
}
export interface detectedTarget {
  genIndex: string;
  genName: string;
  isFalsePositive: boolean;
}
