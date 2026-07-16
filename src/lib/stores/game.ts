import { writable } from 'svelte/store';
import type { Player, GamePhase, WordPair } from '$lib/types';
import wordsData from '$lib/data/words.json';

const WORDS: WordPair[] = wordsData as WordPair[];

export const players = writable<Player[]>([]);
export const currentPhase = writable<GamePhase>('setup');
export const currentTurnIndex = writable<number>(0);
export const gameConfig = writable({
  totalPlayers: 4,
  undercovers: 1,
  mrWhites: 0,
  showRoles: false
});
export const currentWordPairId = writable<number | null>(null);

// Functions to interact with stores
export const resetGame = () => {
  // We don't reset the players list completely yet because we need their names for the next setup, 
  // but players will be regenerated on start anyway.
  currentPhase.set('setup');
  currentTurnIndex.set(0);
  currentWordPairId.set(null);
};

export const advanceTurn = () => {
  currentTurnIndex.update(n => n + 1);
};
