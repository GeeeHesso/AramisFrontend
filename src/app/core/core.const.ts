export const DEFAULT_WIDTH_BRANCH = 1;
export const DEFAULT_SIZE_GEN = 5;
export const MAX_SIZE = 10;
export const MIN_SIZE = 2;

// Please change color grey and baseRed for bottom if you change the 2 colors below
export const DEFAULT_COLOR = '#bebebe';
export const SELECT_GEN_COLOR = '#d20000';

export const LINE_380KV_COLOR = '#6e0606';
export const LINE_220KV_COLOR = '#0f6e06';

export const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'];
export const DAYS = ['Weekday', 'Weekend'];
export const HOURS = new Map([
  [4, '2-6h'],
  [8, '6-10h'],
  [12, '10-14h'],
  [16, '14-18h'],
  [20, '18-22h'],
  [24, '22-2h'],
]);
export const PERCENTAGE = 100;

export const POTENTIALTARGETS = new Map([
  [918, { genName: 'Innertkirchen', canton: 'Bern' }],
  [933, { genName: 'Löbbia', canton: 'Ticino' }],
  [934, { genName: 'Pradella', canton: 'Graubünden' }],
  [173, { genName: 'Riddes', canton: 'Valais' }],
  [932, { genName: 'Rothenbrunnen', canton: 'Graubünden' }],
  [924, { genName: 'Sedrun', canton: 'Graubünden' }],
  [931, { genName: 'Sils', canton: 'Graubünden' }],
  [915, { genName: 'Stalden', canton: 'Valais' }],
  [927, { genName: 'Tavanasa', canton: 'Graubünden' }],
  [923, { genName: 'Cavergno', canton: 'Ticino' }],
]);
export const ALGO_LIST = ['NBC', 'MLPR', 'KNNC', 'RFC', 'SVC', 'GBC', 'MLPC'];
