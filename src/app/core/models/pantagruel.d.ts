export interface Pantagruel {
  bus: { [key: string]: Bus };
  name: string;
  dcline: {};
  gen: { [key: string]: Gen };
  branch: { [key: string]: Branch };
  storage: {};
  switch: {};
  multinetwork: boolean;
  baseMVA: number;
  per_unit: boolean;
  shunt: {};
  multiinfrastructure: boolean;
  load: { [key: string]: Load };
  date: { day: number; month: number; year: number; hour: number };
  country: { [key: string]: { pd: number; qd: number } };
  // Added properties

  GEN_MAX_MAX_PROD: number;
  GEN_MIN_MAX_PROD: number;
}

export interface Bus {
  // Currently used in frontend
  coord: number[]; // ! coordinates of bus [longitude, latitude]
  name: string; // ! name of bus
  status: number; // ! status of bus (0: inactive, 1: active)
  country: string; // ! country of bus
  index: number; // ! index of bus
  population: number; // ! population assigned to this bus
  base_kv: number; // ! base voltage

  // Currently not used in frontend
  bus_type: number; // type of bus // PQ bus: Voltage and Reactive Power Controlled Bus // PV bus: Voltage and Active Power Controlled Bus // Slack bus: Swing Bus or Reference Bus // Isolated: Bus that stands alone
  vmax: number; // maximum allowed voltage
  load_prop: number; // proportion of the population of the bus country assigned to this specific bus
  vmin: number; // minimum allowed voltage
  va: number; // voltage angle
  vm: number; // voltage angle per unit (vm = 1 means voltage is base voltage)
}

export interface Branch {
  // Currently used in frontend
  rate_a: number; // ! thermal rating: how much power the branch can carry
  pt: number; // ! real power injected at the "to" bus
  f_bus: number; // ! use the fromBus.index to work with direction -> ! index of the "from" bus
  br_status: number; // ! branch status (0: inactive, 1: active)
  t_bus: number; // ! use the toBus.index to work with direction -> ! index of the "to" bus
  index: number; // ! index of branch
  transformer: boolean; // ! bool for wether branch is transformer
  pf: number; // ! real power injected at the "from" bus

  // Currently not used in frontend
  br_r: number; // branch resistance
  br_x: number; // branch reactance

  // Not important
  shift: number; // voltage angle shift, only applicable for transformers, must be present in each entry
  g_to: number; // branch charging conductance at "to" bus
  g_fr: number; // branch charging conductance at "from" bus
  b_fr: number; // branch charging susceptance at the "from" bus
  b_to: number; // branch charging susceptance at the "to" bus
  qf: number; // reactive power injected at the "from" bus
  angmin: number; // minimal allowed voltage difference between "to" and "from" bus
  angmax: number; // maximal allowed voltage difference between "to" and "from" bus
  qt: number; // reactive power injected at the "to" bus
  tap: number; // current tap setting, only applicable for transformers, must be present in each entry

  // Added properties
  fromBus: Bus; // !!! correspond to t_bus if pf negative
  toBus: Bus; // !!! correspond to f_bus if pf negative
}

export interface Gen {
  // Currently used
  pg: number; // ! active power generated
  gen_bus: number; // ! bus to which generator is connected
  pmax: number; // ! active power generation capacity
  category: string; // ! category of generator (C, N, F, O, G, H, R, X)
  index: number; // ! index of generator
  gen_status: number; // ! status (0: out of service, 1: in service)
  type: string; // ! type of generator (Hydro, Nuclear, etc)

  // Currently not used in frontend
  mbase: number; //  base power of generator (should be the same as baseMVA) // ! baseMVA used instead
  vg: number; // voltage of generator
  pmin: number; // minimum active power generation (most of the time it's 0)

  // Not important
  model: number; // generation cost model (1: piecewise linear, 2: polynomial)
  qg: number; // reactive power generated // might be used in the future
  cost: number[]; // cost of generation, vector which lengths depends on order of cost function
  qmax: number; // maximum reactive power generation
  qmin: number; // minimum reactive power generation
  ncost: number; // order of cost model

  // Added properties
  coord: number[];
}
