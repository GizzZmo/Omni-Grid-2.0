export type WidgetType =
  // Original
  | 'TRANSFORMER'
  | 'SCRATCHPAD'
  | 'FOCUS_HUD'
  | 'DEV_OPTIC'
  | 'CIPHER_VAULT'
  | 'CHROMA_LAB'
  | 'TEMPORAL'
  | 'SONIC'
  | 'CALC'
  | 'ASSET'
  | 'POLYGLOT'
  | 'WRITEPAD'
  | 'WEATHER'
  | 'VALUTA'
  | 'SYSTEM'
  | 'HELP'
  | 'ARCHITECT'
  | 'THEME_ENGINE'
  | 'GHOST'
  | 'RADIO'
  | 'SUDOKU'
  // Developer
  | 'DOCU_HUB'
  | 'GIT_PULSE'
  | 'PROJECT_TRACKER'
  | 'WEB_TERMINAL'
  | 'CYBER_EDITOR'
  // Researcher
  | 'NEWS_FEED'
  | 'CIPHER_PAD'
  | 'PDF_VIEWER'
  | 'RESEARCH_BROWSER'
  // Financial / Smart Grid
  | 'SECURE_CALENDAR'
  | 'MACRO_NET'
  | 'CHAIN_PULSE'
  | 'REG_RADAR'
  | 'MARKET'
  // New Additions
  | 'STRATEGIC'
  | 'CLIPBOARD';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  minW: number;
  minH: number;
}

export interface GridItemData {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GhostData {
  id: string;
  reason: string;
  suggestedWidgetId: string;
  previewContent?: string;
}

export interface Note {
  id: string;
  content: string;
  lastUpdated: number;
}

export interface Task {
  id: string;
  text: string;
  status: 'todo' | 'done';
}

export enum SoundType {
  BROWN_NOISE = 'BROWN_NOISE',
  RAIN = 'RAIN',
  OFF = 'OFF',
}

export interface AppTheme {
  name: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    accent: string;
  };
  font: string;
  radius: string;
}
