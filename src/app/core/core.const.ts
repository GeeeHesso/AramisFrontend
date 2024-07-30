export const DEFAULT_WIDTH_BRANCH = 1;
export const DEFAULT_SIZE_GEN = 5;
export const MAX_SIZE = 10;
export const MIN_SIZE = 2;

// Please change color grey and baseRed for bottom if you change the 2 colors below
export const DEFAULT_COLOR = '#bebebe';
export const SELECT_GEN_COLOR = '#d20000';

export const LINE_380KV_COLOR = '#6e0606';
export const LINE_220KV_COLOR = '#0f6e06';

export const SEASONS = ['Winter', 'Spring', 'Summer', 'fall'];
export const DAYS = ['Weekday', 'Weekend'];
export const HOURS = new Map([
  ['2-6h', 4],
  ['6-10h', 8],
  ['10-14h', 12],
  ['14-18h', 16],
  ['18-22h', 20],
  ['22-2h', 24],
]);
export const PERCENTAGE = 100;

export const POTENTIALTARGETS = new Map([
  [918, 'Innertkirchen'],
  [933, 'Löbbia'],
  [934, 'Pradella'],
  [173, 'Riddes'],
  [932, 'Rothenbrunnen'],
  [924, 'Sedrun'],
  [931, 'Sils'],
  [915, 'Stalden'],
  [927, 'Tavanasa'],
  [923, 'Cavergno'],
]);
export const ALGO_LIST = ['NBC', 'MLPR', 'KNNC', 'RFC', 'SVC', 'GBC', 'MLPC'];
