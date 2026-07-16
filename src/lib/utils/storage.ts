import type { WordPair, Player, Role } from '$lib/types';
import wordsData from '$lib/data/words.json';

const STORAGE_KEY = 'undercover_used_words';

export function getUsedWordIds(): number[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function saveUsedWordId(id: number) {
  if (typeof window === 'undefined') return;
  const used = getUsedWordIds();
  if (!used.includes(id)) {
    used.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(used));
  }
}

export function getRandomWordPair(): WordPair {
  const usedIds = getUsedWordIds();
  const availableWords = (wordsData as WordPair[]).filter(w => !usedIds.includes(w.id));
  
  if (availableWords.length === 0) {
    // If all words are used, clear history and use all words again
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    const randomIndex = Math.floor(Math.random() * wordsData.length);
    return wordsData[randomIndex];
  }

  const randomIndex = Math.floor(Math.random() * availableWords.length);
  return availableWords[randomIndex];
}

export function generatePlayers(
  names: string[], 
  numUndercovers: number, 
  numMrWhites: number
): Player[] {
  const totalPlayers = names.length;
  const roles: Role[] = [];

  for (let i = 0; i < numUndercovers; i++) roles.push('Undercover');
  for (let i = 0; i < numMrWhites; i++) roles.push('Mr. White');
  while (roles.length < totalPlayers) roles.push('Civilian');

  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  const wordPair = getRandomWordPair();
  saveUsedWordId(wordPair.id);

  // Randomly assign which word is Civilian and which is Undercover
  const isReverse = Math.random() > 0.5;
  const civilianWord = isReverse ? wordPair.words[1] : wordPair.words[0];
  const undercoverWord = isReverse ? wordPair.words[0] : wordPair.words[1];

  return names.map((name, index) => {
    let word = '';
    if (roles[index] === 'Civilian') word = civilianWord;
    else if (roles[index] === 'Undercover') word = undercoverWord;
    
    return {
      id: crypto.randomUUID(),
      name: name || `Player ${index + 1}`,
      role: roles[index],
      word,
      isEliminated: false,
      hasSpoken: false
    };
  });
}
