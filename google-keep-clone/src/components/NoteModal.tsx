import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  Bell,
  Palette,
  Archive,
  MoreVertical,
  CheckSquare,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Trash2,
  Copy,
  GripVertical,
} from 'lucide-react';
import { Note, KeepColor, ChecklistItem, NoteReminder } from '../types/note';
import { getColorClasses, generateId, formatRelativeDate } from '../utils/helpers';
import { ColorPalette } from './ColorPalette';
import { ReminderPicker } from './ReminderPicker';
import { LabelPicker } from './LabelPicker';

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNote: (updated: Note) => void;
  onDeleteNote: (id: string) => void;
  availableLabels: string[];
  onCreateLabel: (label: string) => void;
  onSelectLabelFilter?: (label: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  note,
  isOpen,
  onClose,
  onUpdateNote,
  onDeleteNote,
  availableLabels,
  onCreateLabel,
  onSelectLabelFilter,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isChecklist, setIsChecklist] = useState(false);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [color, setColor] = useState<KeepColor>('default');
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [reminder, setReminder] = useState<NoteReminder | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  // Popovers
  const [showPalette, setShowPalette] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newChecklistRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setIsChecklist(note.isChecklist);
      setChecklistItems(note.checklistItems || []);
      setColor(note.color);
      setIsPinned(note.pinned);
      setIsArchived(note.archived);
      setReminder(note.reminder || null);
      setSelectedLabels(note.labels || []);
      setImages(note.images || []);
    }
  }, [note]);

  const handleSaveAndClose = () => {
    if (!note) {
      onClose();
      return;
    }

    const updatedNote: Note = {
      ...note,
      title: title.trim(),
      content: content.trim(),
      isChecklist,
      checklistItems: isChecklist ? checklistItems.filter((i) => i.text.trim()) : [],
      color,
      pinned: isPinned,
      archived: isArchived,
      reminder,
      labels: selectedLabels,
      images,
      updatedAt: Date.now(),
    };

    onUpdateNote(updatedNote);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleSaveAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, note, title, content, isChecklist, checklistItems, color, isPinned, isArchived, reminder, selectedLabels, images]);

  if (!isOpen || !note) return null;

  const colorStyles = getColorClasses(color);

  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleUpdateChecklistItem = (id: string, text: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddChecklistItem = (text: string) => {
    if (!text.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      { id: generateId(), text: text.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImages((prev) => [...prev, event.target!.result as string]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const activeChecklist = checklistItems.filter((i) => !i.completed);
  const completedChecklist = checklistItems.filter((i) => i.completed);

  return (
    <div
      onClick={handleSaveAndClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl rounded-2xl shadow-2xl border transition-all duration-150 overflow-hidden my-8 ${colorStyles.bg} ${colorStyles.border} animate-in fade-in zoom-in-95`}
      >
        {/* Images banner */}
        {images.length > 0 && (
          <div className="relative p-2 flex flex-wrap gap-2 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5">
            {images.map((img, idx) => (
              <div key={idx} className="relative group max-h-60 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={img} alt="Attachment" className="max-h-60 object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal Header: Title & Pin */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-lg font-medium placeholder-gray-500 bg-transparent focus:outline-none text-gray-900 dark:text-gray-100"
          />
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            title={isPinned ? 'Unpin note' : 'Pin note'}
            className={`p-2 rounded-full transition-colors ${
              isPinned
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Modal Body: Text or Checklist */}
        {!isChecklist ? (
          <div className="px-5 py-2">
            <textarea
              placeholder="Note"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full text-sm leading-relaxed placeholder-gray-500 bg-transparent focus:outline-none resize-none text-gray-800 dark:text-gray-200"
            />
          </div>
        ) : (
          <div className="px-4 py-2 space-y-1">
            {activeChecklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 group py-1">
                <GripVertical className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab" />
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleChecklistItem(item.id)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleUpdateChecklistItem(item.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      newChecklistRef.current?.focus();
                    }
                  }}
                  className="w-full text-sm bg-transparent focus:outline-none text-gray-800 dark:text-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteChecklistItem(item.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add list item */}
            <div className="flex items-center gap-2 py-1 pl-5">
              <Plus className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                ref={newChecklistRef}
                type="text"
                placeholder="List item"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newChecklistText.trim()) {
                    e.preventDefault();
                    handleAddChecklistItem(newChecklistText);
                  }
                }}
                onBlur={() => {
                  if (newChecklistText.trim()) {
                    handleAddChecklistItem(newChecklistText);
                  }
                }}
                className="w-full text-sm placeholder-gray-400 bg-transparent focus:outline-none"
              />
            </div>

            {/* Completed accordion */}
            {completedChecklist.length > 0 && (
              <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 py-1"
                >
                  {showCompleted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{completedChecklist.length} completed {completedChecklist.length === 1 ? 'item' : 'items'}</span>
                </button>

                {showCompleted && (
                  <div className="space-y-1 pt-1">
                    {completedChecklist.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 py-1 pl-5">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklistItem(item.id)}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <span className="text-sm line-through text-gray-400 dark:text-gray-500 flex-1">
                          {item.text}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteChecklistItem(item.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Chips (Reminder & Labels) */}
        {(reminder || selectedLabels.length > 0) && (
          <div className="flex flex-wrap gap-1.5 px-5 py-2">
            {reminder && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <span>{reminder.label}</span>
                <button
                  type="button"
                  onClick={() => setReminder(null)}
                  className="hover:text-red-500 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedLabels.map((lbl) => (
              <span
                key={lbl}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300"
              >
                <span>{lbl}</span>
                <button
                  type="button"
                  onClick={() => toggleLabel(lbl)}
                  className="hover:text-red-500 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Timestamp Footer */}
        <div className="px-5 py-1 text-[11px] text-gray-400 dark:text-gray-500 text-right">
          Edited {formatRelativeDate(note.updatedAt || note.createdAt)}
        </div>

        {/* Bottom Toolbar & Close */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-black/5 dark:border-white/5 relative">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
            {/* Reminder */}
            <div className="relative">
              <button
                type="button"
                title="Remind me"
                onClick={() => {
                  setShowReminder(!showReminder);
                  setShowPalette(false);
                  setShowLabelPicker(false);
                }}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <Bell className="w-4 h-4" />
              </button>
              <ReminderPicker
                currentReminder={reminder}
                onSetReminder={setReminder}
                isOpen={showReminder}
                onClose={() => setShowReminder(false)}
                position="top"
              />
            </div>

            {/* Color */}
            <div className="relative">
              <button
                type="button"
                title="Background options"
                onClick={() => {
                  setShowPalette(!showPalette);
                  setShowReminder(false);
                  setShowLabelPicker(false);
                }}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <Palette className="w-4 h-4" />
              </button>
              <ColorPalette
                selectedColor={color}
                onSelectColor={setColor}
                isOpen={showPalette}
                onClose={() => setShowPalette(false)}
                position="top"
              />
            </div>

            {/* Add Image */}
            <button
              type="button"
              title="Add image"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Archive */}
            <button
              type="button"
              title={isArchived ? 'Unarchive' : 'Archive'}
              onClick={() => setIsArchived(!isArchived)}
              className={`p-2 rounded-full transition-colors ${
                isArchived
                  ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Archive className="w-4 h-4" />
            </button>

            {/* Label picker */}
            <div className="relative">
              <button
                type="button"
                title="More"
                onClick={() => {
                  setShowLabelPicker(!showLabelPicker);
                  setShowPalette(false);
                  setShowReminder(false);
                }}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <LabelPicker
                availableLabels={availableLabels}
                selectedLabels={selectedLabels}
                onToggleLabel={toggleLabel}
                onCreateLabel={onCreateLabel}
                isOpen={showLabelPicker}
                onClose={() => setShowLabelPicker(false)}
                position="top"
              />
            </div>

            {/* Delete to Trash */}
            <button
              type="button"
              title="Delete note"
              onClick={() => {
                onDeleteNote(note.id);
                onClose();
              }}
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Close & Save Button */}
          <button
            type="button"
            onClick={handleSaveAndClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-100 transition-colors tracking-wide"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
