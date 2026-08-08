export type Duration = 1 | 2 | 4 | 8;

export type Cell = {
  fret: string;
  pause?: boolean;
};

export type Measure = {
  id: string;
  cells: Cell[][];
  durations: Duration[];
};

export type Tab = {
  title: string;
  artist: string;
  tempo: number;
  measures: Measure[];
};
