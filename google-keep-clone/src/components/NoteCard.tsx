import React, { useState, useRef } from 'react';
import {
  Pin,
  Bell,
  Palette,
  Archive,
  MoreVertical,
  Check,
  Trash2,
  RotateCcw,
  Copy,
  Tag,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Clock,
  X,
} from 'lucide-react';
import { Note, KeepColor } from '../types/note';
import { getColorClasses } from '../utils/helpers';
import { ColorPalette } from './ColorPalette';
import { ReminderPicker } from './ReminderPicker';
import { LabelPicker } from './LabelPicker';

interface NoteCardProps {
  note: Note;
  onUpdateNote: (updated: Note) => void;
  onDeleteNote: (id: string) => void; // move to trash
  onRestoreNote?: (id: string) => void;
  onDeleteForever?: (id: string) => void;
  onDuplicateNote: (note: Note) => void;
  onOpenModal: (note: Note) => void;
  availableLabels: string[];
  onCreateLabel: (label: string) => void;
  onSelectLabelFilter?: (label: string) => void;
  // Drag and drop
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  isDragging?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onUpdateNote,
  onDeleteNote,
  onRestoreNote,
  onDeleteForever,
  onDuplicateNote,
  onOpenModal,
  availableLabels,
  onCreateLabel,
  onSelectLabelFilter,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false,
}) => {
  const [showPalette, setShowPalette] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  const colorStyles = getColorClasses(note.color);

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateNote({ ...note, pinned: !note.pinned, updatedAt: Date.now() });
  };

  const toggleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateNote({
      ...note,
      archived: !note.archived,
      pinned: false, // unpin on archive
      updatedAt: Date.now(),
    });
  };

  const handleColorSelect = (newColor: KeepColor) => {
    onUpdateNote({ ...note, color: newColor, updatedAt: Date.now() });
  };

  const handleToggleChecklistItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    const updatedItems = note.checklistItems.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateNote({ ...note, checklistItems: updatedItems, updatedAt: Date.now() });
  };

  const toggleLabel = (label: string) => {
    const updatedLabels = note.labels.includes(label)
      ? note.labels.filter((l) => l !== label)
      : [...note.labels, label];
    onUpdateNote({ ...note, labels: updatedLabels, updatedAt: Date.now() });
  };

  // Close menus on outside click
  React.useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showMoreMenu]);

  const activeChecklist = note.checklistItems.filter((i) => !i.completed);
  const completedChecklist = note.checklistItems.filter((i) => i.completed);

  return (
    <div
      draggable={!note.inTrash}
      onDragStart={(e) => onDragStart && onDragStart(e, note.id)}
      onDragOver={(e) => onDragOver && onDragOver(e, note.id)}
      onDrop={(e) => onDrop && onDrop(e, note.id)}
      onClick={() => onOpenModal(note)}
      className={`group relative flex flex-col justify-between rounded-xl border transition-all duration-200 cursor-default select-none overflow-hidden ${
        colorStyles.bg
      } ${colorStyles.border} ${
        isDragging ? 'opacity-40 scale-95 border-dashed border-amber-400' : 'hover:shadow-md'
      }`}
    >
      {/* Top Banner Images */}
      {note.images && note.images.length > 0 && (
        <div className="w-full overflow-hidden bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5">
          <img
            src={note.images[0]}
            alt={note.title || 'Note image'}
            className="w-full max-h-56 object-cover transition-transform duration-300 group-hover:scale-102"
          />
          {note.images.length > 1 && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-medium">
              +{note.images.length - 1} more
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 pb-2">
        {/* Header: Title and Pin */}
        <div className="flex items-start justify-between gap-2 mb-2">
          {note.title ? (
            <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-snug break-words flex-1">
              {note.title}
            </h3>
          ) : (
            <div className="flex-1" />
          )}

          {!note.inTrash && (
            <button
              type="button"
              onClick={togglePin}
              title={note.pinned ? 'Unpin note' : 'Pin note'}
              className={`p-1.5 rounded-full transition-all shrink-0 ${
                note.pinned
                  ? 'opacity-100 text-amber-600 dark:text-amber-400'
                  : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Pin className={`w-4 h-4 ${note.pinned ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Note Body Text */}
        {!note.isChecklist && note.content && (
          <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed max-h-64 overflow-hidden">
            {note.content}
          </p>
        )}

        {/* Note Checklist Items */}
        {note.isChecklist && (
          <div className="space-y-1 my-1">
            {activeChecklist.slice(0, 8).map((item) => (
              <div
                key={item.id}
                onClick={(e) => handleToggleChecklistItem(e, item.id)}
                className="flex items-center gap-2 group/item text-xs text-gray-800 dark:text-gray-200 hover:opacity-80 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 text-gray-400 group-hover/item:text-amber-500 shrink-0" />
                <span className="truncate break-words flex-1">{item.text}</span>
              </div>
            ))}

            {completedChecklist.length > 0 && (
              <div className="pt-1 text-[11px] text-gray-400 dark:text-gray-500 italic">
                +{completedChecklist.length} completed {completedChecklist.length === 1 ? 'item' : 'items'}
              </div>
            )}
            {activeChecklist.length > 8 && (
              <div className="text-[11px] text-gray-400 italic">
                +{activeChecklist.length - 8} more items...
              </div>
            )}
          </div>
        )}

        {/* Reminder Badge */}
        {note.reminder && (
          <div className="mt-2.5 flex items-center">
            <span
              onClick={(e) => {
                e.stopPropagation();
                setShowReminder(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{note.reminder.label}</span>
            </span>
          </div>
        )}

        {/* Label Chips */}
        {note.labels && note.labels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {note.labels.map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectLabelFilter) onSelectLabelFilter(lbl);
                }}
                title={`Filter by label ${lbl}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-black/10 transition-colors"
              >
                <span>{lbl}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card Action Toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`px-3 py-1.5 flex items-center justify-between text-gray-500 dark:text-gray-400 transition-opacity duration-150 ${
          showPalette || showReminder || showLabelPicker || showMoreMenu
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {!note.inTrash ? (
          <>
            <div className="flex items-center gap-0.5">
              {/* Reminder button */}
              <div className="relative">
                <button
                  type="button"
                  title="Remind me"
                  onClick={() => {
                    setShowReminder(!showReminder);
                    setShowPalette(false);
                    setShowLabelPicker(false);
                    setShowMoreMenu(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>
                <ReminderPicker
                  currentReminder={note.reminder}
                  onSetReminder={(r) =>
                    onUpdateNote({ ...note, reminder: r, updatedAt: Date.now() })
                  }
                  isOpen={showReminder}
                  onClose={() => setShowReminder(false)}
                  position="top"
                />
              </div>

              {/* Color button */}
              <div className="relative">
                <button
                  type="button"
                  title="Background options"
                  onClick={() => {
                    setShowPalette(!showPalette);
                    setShowReminder(false);
                    setShowLabelPicker(false);
                    setShowMoreMenu(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>
                <ColorPalette
                  selectedColor={note.color}
                  onSelectColor={handleColorSelect}
                  isOpen={showPalette}
                  onClose={() => setShowPalette(false)}
                  position="top"
                />
              </div>

              {/* Archive button */}
              <button
                type="button"
                title={note.archived ? 'Unarchive' : 'Archive'}
                onClick={toggleArchive}
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>

              {/* More menu button */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  type="button"
                  title="More actions"
                  onClick={() => {
                    setShowMoreMenu(!showMoreMenu);
                    setShowPalette(false);
                    setShowReminder(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {showMoreMenu && (
                  <div className="absolute left-0 bottom-full mb-1 w-44 bg-white dark:bg-[#2d2e30] rounded-xl shadow-xl border border-gray-200 dark:border-[#5f6368] py-1 z-50 text-xs text-gray-700 dark:text-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteNote(note.id);
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Delete note</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowLabelPicker(true);
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center gap-2"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Add label</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onDuplicateNote(note);
                        setShowMoreMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Make a copy</span>
                    </button>
                  </div>
                )}

                <LabelPicker
                  availableLabels={availableLabels}
                  selectedLabels={note.labels}
                  onToggleLabel={toggleLabel}
                  onCreateLabel={onCreateLabel}
                  isOpen={showLabelPicker}
                  onClose={() => setShowLabelPicker(false)}
                  position="top"
                />
              </div>
            </div>
          </>
        ) : (
          /* Trash View Actions: Restore or Delete Forever */
          <div className="flex items-center gap-2 w-full justify-end py-1">
            <button
              type="button"
              onClick={() => onRestoreNote && onRestoreNote(note.id)}
              title="Restore"
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore</span>
            </button>
            <button
              type="button"
              onClick={() => onDeleteForever && onDeleteForever(note.id)}
              title="Delete forever"
              className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors flex items-center gap-1 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete forever</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
