export interface Meta {
    current: string;
    pct_layout: number[][];
    rep_layout: string[][];
    order: string[];
    increases: number[];
    deadlift: MetaExercise;
    bench: MetaExercise;
    squat: MetaExercise;
    overhead: MetaExercise;
    row: MetaExercise;
}

export interface MetaExercise {
    weight: number;
    week: number;
    primaries: string[];
    secondaries: string[];
}

export interface Month {
    onerm: number[];
    month: number;
    first: string[];
    second: string[];
    third: string[];
    fourth: string[];
}
