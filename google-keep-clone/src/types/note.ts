export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type KeepColor =
  | 'default'
  | 'coral'
  | 'peach'
  | 'sand'
  | 'mint'
  | 'sage'
  | 'fog'
  | 'storm'
  | 'dusk'
  | 'blossom'
  | 'clay'
  | 'chalk';

export interface NoteReminder {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  label: string; // e.g. "Tomorrow, 8:00 AM"
  timestamp: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isChecklist: boolean;
  checklistItems: ChecklistItem[];
  color: KeepColor;
  pinned: boolean;
  archived: boolean;
  inTrash: boolean;
  trashedAt?: number;
  reminder?: NoteReminder | null;
  labels: string[];
  images: string[];
  createdAt: number;
  updatedAt: number;
  order: number;
}

export type ViewTab = 'notes' | 'reminders' | 'archive' | 'trash' | string; // string for label filter "label:work"

export interface ColorDef {
  id: KeepColor;
  name: string;
  lightBg: string;
  lightBorder: string;
  darkBg: string;
  darkBorder: string;
}

export const KEEP_COLORS: ColorDef[] = [
  { id: 'default', name: 'Default', lightBg: 'bg-white', lightBorder: 'border-gray-200', darkBg: 'dark:bg-[#202124]', darkBorder: 'dark:border-[#5f6368]' },
  { id: 'coral', name: 'Coral', lightBg: 'bg-[#faafa8]', lightBorder: 'border-[#f28b82]', darkBg: 'dark:bg-[#77172e]', darkBorder: 'dark:border-[#8c1d37]' },
  { id: 'peach', name: 'Peach', lightBg: 'bg-[#f39f76]', lightBorder: 'border-[#f08653]', darkBg: 'dark:bg-[#692b17]', darkBorder: 'dark:border-[#7e351d]' },
  { id: 'sand', name: 'Sand', lightBg: 'bg-[#fff8b8]', lightBorder: 'border-[#fde68a]', darkBg: 'dark:bg-[#7c4a03]', darkBorder: 'dark:border-[#965a05]' },
  { id: 'mint', name: 'Mint', lightBg: 'bg-[#e2f6cb]', lightBorder: 'border-[#ccf0a5]', darkBg: 'dark:bg-[#264d3b]', darkBorder: 'dark:border-[#2f5e49]' },
  { id: 'sage', name: 'Sage', lightBg: 'bg-[#b4ddd3]', lightBorder: 'border-[#91cfc2]', darkBg: 'dark:bg-[#0c625d]', darkBorder: 'dark:border-[#107973]' },
  { id: 'fog', name: 'Fog', lightBg: 'bg-[#d4e4ed]', lightBorder: 'border-[#b8d7e6]', darkBg: 'dark:bg-[#256377]', darkBorder: 'dark:border-[#2e778f]' },
  { id: 'storm', name: 'Storm', lightBg: 'bg-[#aeccdc]', lightBorder: 'border-[#94bdd2]', darkBg: 'dark:bg-[#284255]', darkBorder: 'dark:border-[#33536b]' },
  { id: 'dusk', name: 'Dusk', lightBg: 'bg-[#d3bfdb]', lightBorder: 'border-[#c1a7cc]', darkBg: 'dark:bg-[#472e5b]', darkBorder: 'dark:border-[#57396f]' },
  { id: 'blossom', name: 'Blossom', lightBg: 'bg-[#f6e2dd]', lightBorder: 'border-[#edd0c7]', darkBg: 'dark:bg-[#6c394f]', darkBorder: 'dark:border-[#82455f]' },
  { id: 'clay', name: 'Clay', lightBg: 'bg-[#e9e3d4]', lightBorder: 'border-[#ded4bf]', darkBg: 'dark:bg-[#4b443a]', darkBorder: 'dark:border-[#5d5448]' },
  { id: 'chalk', name: 'Chalk', lightBg: 'bg-[#efeff1]', lightBorder: 'border-[#e0e0e3]', darkBg: 'dark:bg-[#232427]', darkBorder: 'dark:border-[#383a3e]' },
];
