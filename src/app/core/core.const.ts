export const DEFAULT_WIDTH_BRANCH = 1;
export const DEFAULT_SIZE_GEN = 5;
export const MAX_SIZE = 10;
export const MIN_SIZE = 2;

export const DEFAULT_COLOR = '#bebebe';
export const WHITE_COLOR = '#ffffff';
export const SELECTED_COLOR = '#d20000';

export const LINE_380KV_COLOR = '#e4032f';
export const LINE_220KV_COLOR = '#04b494';

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
  [918, { genName: 'Innertkirchen', canton: 'BE' }],
  [933, { genName: 'Löbbia', canton: 'TI' }],
  [934, { genName: 'Pradella', canton: 'GR' }],
  [173, { genName: 'Riddes', canton: 'VS' }],
  [932, { genName: 'Rothenbrunnen', canton: 'GR' }],
  [924, { genName: 'Sedrun', canton: 'GR' }],
  [931, { genName: 'Sils', canton: 'GR' }],
  [915, { genName: 'Stalden', canton: 'VS' }],
  [927, { genName: 'Tavanasa', canton: 'GR' }],
  [923, { genName: 'Cavergno', canton: 'TI' }],
]);
export const ALGO_LIST = ['NBC', 'KNNC', 'SVC', 'RFC', 'GBC', 'MLPC', 'MLPR'];

export const GEN_DISPLAY_NAME = 'displayName';
export const GEN_INDEX = 'genIndex';

export const ALGO_TOOLTIP = new Map([
  [
    'NBC',
    'Gaussian Naive Bayes Classifier : A simple classifier algorithm based on conditional probabilities (Bayes theorem).',
  ],
  [
    'KNNC',
    'k-Nearest Neighbors Classifier : Classifier implementing the k-nearest neighbors algorithm. k is typically equal to 1, which means that the algorithm simply finds the closest example in the training set.',
  ],
  [
    'SVC',
    'Support Vector machine Classifier : Classifier based on the separation of features by a hyperplane in a large space.',
  ],
  [
    'RFC',
    'Random Forest Classifier : Classifier based on the most common outcome of multiple decision trees (around 100 in our case).',
  ],
  [
    'GBC',
    'Gradient Boosted decision tree Classifier : Simple decision tree optimized over 1000 boosting stages.',
  ],
  [
    'MLPC',
    'Multi-Layer Perceptron Classifier : A shallow neural network classifier with 2 to 4 layers of up to 500 fully-connected neurons per layer.',
  ],
  [
    'MLPR',
    'Multi-Layer Perceptron Regression : The unsupervised version of the multi-layer perceptron algorithm (MLP) that predicts an expected output value for each generator, as well as a sensitivity threshold. The alarm is raised if the actual output differs from the prediction by more than the threshold.',
  ],
]);
