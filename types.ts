
export interface Level {
  id: number;
  title: string;
  content: string;
  description: string;
}

export interface GameStats {
  wpm: number;
  accuracy: number;
  timeInSeconds: number;
  errorCount: number;
  totalChars: number;
}

export type GameState = 'LOBBY' | 'LEVEL_SELECT' | 'PLAYING' | 'RESULTS';
