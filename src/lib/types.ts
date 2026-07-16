export type Role = 'Civilian' | 'Undercover' | 'Mr. White';
export type GamePhase = 'setup' | 'distribution' | 'game' | 'vote' | 'end';
export interface Player { id: string; name: string; role: Role; word: string; isEliminated: boolean; hasSpoken: boolean; }
export interface WordPair { id: number; words: string[]; }
