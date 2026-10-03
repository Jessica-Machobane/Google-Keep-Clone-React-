import { KeepColor, KEEP_COLORS, Note } from '../types/note';

export const getColorClasses = (color: KeepColor = 'default') => {
  const def = KEEP_COLORS.find((c) => c.id === color) || KEEP_COLORS[0];
  return {
    bg: `${def.lightBg} ${def.darkBg}`,
    border: `${def.lightBorder} ${def.darkBorder}`,
    name: def.name,
  };
};

export const generateId = (): string => {
  return 'note_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
};

export const formatRelativeDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
};

export const filterNotes = (
  notes: Note[],
  query: string,
  filterType: 'all' | 'checklist' | 'reminder' | 'image' = 'all',
  filterColor?: KeepColor
): Note[] => {
  let list = notes;

  if (filterType === 'checklist') {
    list = list.filter((n) => n.isChecklist);
  } else if (filterType === 'reminder') {
    list = list.filter((n) => !!n.reminder);
  } else if (filterType === 'image') {
    list = list.filter((n) => n.images && n.images.length > 0);
  }

  if (filterColor && filterColor !== 'default') {
    list = list.filter((n) => n.color === filterColor);
  }

  if (!query.trim()) return list;

  const q = query.toLowerCase().trim();
  return list.filter((note) => {
    const matchTitle = note.title.toLowerCase().includes(q);
    const matchContent = note.content.toLowerCase().includes(q);
    const matchLabels = note.labels.some((l) => l.toLowerCase().includes(q));
    const matchChecklist = note.checklistItems?.some((item) =>
      item.text.toLowerCase().includes(q)
    );
    return matchTitle || matchContent || matchLabels || matchChecklist;
  });
};
