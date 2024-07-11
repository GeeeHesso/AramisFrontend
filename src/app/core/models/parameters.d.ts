export interface timeParameters {
  season: string;
  day: string;
  hour: string;
}
export interface targetsParameters {
  season: string;
  day: string;
  hour: string;
  attacked_gens: string[];
}

export interface algorithmsParameters {
  season: string;
  day: string;
  hour: string;
  attacked_gens: number[];
  algorithms: string[];
}
