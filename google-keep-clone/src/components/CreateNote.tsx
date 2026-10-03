import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Image as ImageIcon,
  PenTool,
  Pin,
  PinOff,
  Bell,
  Palette,
  Archive,
  MoreVertical,
  Undo2,
  Redo2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import { ChecklistItem, KeepColor, Note, NoteReminder } from '../types/note';
import { ColorPalette } from './ColorPalette';
import { ReminderPicker } from './ReminderPicker';
import { LabelPicker } from './LabelPicker';
import { getColorClasses, generateId } from '../utils/helpers';

interface CreateNoteProps {
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  availableLabels: string[];
  onCreateLabel: (label: string) => void;
  onOpenDrawingModal: () => void;
  drawingImageAttachment?: string | null;
  onClearDrawingAttachment?: () => void;
}

export const CreateNote: React.FC<CreateNoteProps> = ({
  onAddNote,
  availableLabels,
  onCreateLabel,
  onOpenDrawingModal,
  drawingImageAttachment,
  onClearDrawingAttachment,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Popover state
  const [showPalette, setShowPalette] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const newChecklistInputRef = useRef<HTMLInputElement>(null);

  // Auto-expand if drawing was created
  useEffect(() => {
    if (drawingImageAttachment) {
      setImages((prev) => [...prev, drawingImageAttachment]);
      setIsExpanded(true);
      if (onClearDrawingAttachment) onClearDrawingAttachment();
    }
  }, [drawingImageAttachment, onClearDrawingAttachment]);

  // Click outside to auto-save and close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isExpanded) {
          saveAndClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, title, content, checklistItems, color, isPinned, isArchived, reminder, selectedLabels, images]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setIsChecklist(false);
    setChecklistItems([]);
    setNewChecklistText('');
    setColor('default');
    setIsPinned(false);
    setIsArchived(false);
    setReminder(null);
    setSelectedLabels([]);
    setImages([]);
    setIsExpanded(false);
    setShowPalette(false);
    setShowReminder(false);
    setShowLabelPicker(false);
  };

  const saveAndClose = () => {
    const hasText = title.trim() || content.trim();
    const hasItems = checklistItems.some((i) => i.text.trim());
    const hasImages = images.length > 0;

    if (hasText || hasItems || hasImages) {
      onAddNote({
        title: title.trim(),
        content: content.trim(),
        isChecklist,
        checklistItems: isChecklist ? checklistItems.filter((i) => i.text.trim()) : [],
        color,
        pinned: isPinned,
        archived: isArchived,
        inTrash: false,
        reminder,
        labels: selectedLabels,
        images,
      });
    }
    resetForm();
  };

  const handleStartChecklist = () => {
    setIsChecklist(true);
    setIsExpanded(true);
    if (!checklistItems.length) {
      setChecklistItems([{ id: generateId(), text: '', completed: false }]);
    }
    setTimeout(() => newChecklistInputRef.current?.focus(), 50);
  };

  const handleAddChecklistItem = (text: string) => {
    if (!text.trim()) return;
    setChecklistItems((prev) => [
      ...prev,
      { id: generateId(), text: text.trim(), completed: false },
    ]);
    setNewChecklistText('');
  };

  const handleUpdateChecklistItem = (id: string, text: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImages((prev) => [...prev, event.target!.result as string]);
        setIsExpanded(true);
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

  const colorStyles = getColorClasses(color);
  const completedItems = checklistItems.filter((i) => i.completed);
  const activeItems = checklistItems.filter((i) => !i.completed);

  return (
    <div className="w-full max-w-xl mx-auto px-4 mb-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div
        ref={containerRef}
        className={`relative rounded-xl border transition-all duration-200 ${
          isExpanded
            ? `${colorStyles.bg} ${colorStyles.border} shadow-lg ring-1 ring-black/5`
            : 'bg-white dark:bg-[#202124] border-gray-200 dark:border-[#5f6368] shadow-sm hover:shadow-md'
        }`}
      >
        {/* COLLAPSED VIEW */}
        {!isExpanded ? (
          <div
            onClick={() => {
              setIsExpanded(true);
              setTimeout(() => contentInputRef.current?.focus(), 50);
            }}
            className="flex items-center justify-between px-4 py-3 cursor-text text-gray-500 dark:text-gray-400 select-none"
          >
            <span className="text-sm font-normal">Take a note…</span>

            <div className="flex items-center gap-1 -mr-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleStartChecklist}
                title="New list"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2e30] text-gray-600 dark:text-gray-300 transition-colors"
              >
                <CheckSquare className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onOpenDrawingModal}
                title="New note with drawing"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2e30] text-gray-600 dark:text-gray-300 transition-colors"
              >
                <PenTool className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="New note with image"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2e30] text-gray-600 dark:text-gray-300 transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* EXPANDED VIEW */
          <div className="flex flex-col">
            {/* Image Attachments */}
            {images.length > 0 && (
              <div className="relative p-2 flex flex-wrap gap-2">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative group max-h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={imgUrl} alt="Attachment" className="max-h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove image"
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full opacity-90 hover:opacity-100 hover:bg-black/80 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Note Title & Pin */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-base font-medium placeholder-gray-500 dark:placeholder-gray-400 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                title={isPinned ? 'Unpin note' : 'Pin note'}
                className={`p-1.5 rounded-full transition-colors ${
                  isPinned
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Pin className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Note Body (Text or Checklist) */}
            {!isChecklist ? (
              <div className="px-4 py-2">
                <textarea
                  ref={contentInputRef}
                  placeholder="Take a note…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  className="w-full text-sm placeholder-gray-500 dark:placeholder-gray-400 bg-transparent focus:outline-none resize-none"
                />
              </div>
            ) : (
              /* Checklist Items */
              <div className="px-3 py-2 space-y-1">
                {activeItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group py-0.5">
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
                          newChecklistInputRef.current?.focus();
                        }
                      }}
                      className="w-full text-sm bg-transparent focus:outline-none"
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

                {/* Add new checklist item input */}
                <div className="flex items-center gap-2 py-1 pl-5">
                  <Plus className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    ref={newChecklistInputRef}
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

                {/* Completed items accordion */}
                {completedItems.length > 0 && (
                  <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                    <button
                      type="button"
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 py-1"
                    >
                      {showCompleted ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{completedItems.length} completed {completedItems.length === 1 ? 'item' : 'items'}</span>
                    </button>

                    {showCompleted && (
                      <div className="space-y-1 pt-1">
                        {completedItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 py-0.5 pl-5">
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

            {/* Badges / Chips: Reminders & Labels */}
            {(reminder || selectedLabels.length > 0) && (
              <div className="flex flex-wrap gap-1.5 px-4 py-1.5">
                {reminder && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200">
                    <Bell className="w-3 h-3 text-amber-500" />
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
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300"
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

            {/* Bottom Toolbar & Action Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-transparent relative">
              <div className="flex items-center gap-0.5 text-gray-600 dark:text-gray-300">
                {/* Reminder button */}
                <div className="relative">
                  <button
                    type="button"
                    title="Remind me"
                    onClick={() => {
                      setShowReminder(!showReminder);
                      setShowPalette(false);
                      setShowLabelPicker(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                  <ReminderPicker
                    currentReminder={reminder}
                    onSetReminder={setReminder}
                    isOpen={showReminder}
                    onClose={() => setShowReminder(false)}
                    position="bottom"
                  />
                </div>

                {/* Color Palette button */}
                <div className="relative">
                  <button
                    type="button"
                    title="Background options"
                    onClick={() => {
                      setShowPalette(!showPalette);
                      setShowReminder(false);
                      setShowLabelPicker(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    <Palette className="w-4 h-4" />
                  </button>
                  <ColorPalette
                    selectedColor={color}
                    onSelectColor={setColor}
                    isOpen={showPalette}
                    onClose={() => setShowPalette(false)}
                    position="bottom"
                  />
                </div>

                {/* Add Image */}
                <button
                  type="button"
                  title="Add image"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Add Drawing */}
                <button
                  type="button"
                  title="Add drawing"
                  onClick={onOpenDrawingModal}
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <PenTool className="w-4 h-4" />
                </button>

                {/* Archive toggle */}
                <button
                  type="button"
                  title={isArchived ? 'Unarchive' : 'Archive'}
                  onClick={() => setIsArchived(!isArchived)}
                  className={`p-1.5 rounded-full transition-colors ${
                    isArchived
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                </button>

                {/* Label Picker / More options */}
                <div className="relative">
                  <button
                    type="button"
                    title="More"
                    onClick={() => {
                      setShowLabelPicker(!showLabelPicker);
                      setShowPalette(false);
                      setShowReminder(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
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
                    position="bottom"
                  />
                </div>

                {/* Toggle Checklist / Plain text */}
                <button
                  type="button"
                  title={isChecklist ? 'Hide checkboxes' : 'Show checkboxes'}
                  onClick={() => {
                    if (!isChecklist) {
                      handleStartChecklist();
                    } else {
                      // Convert checklist to plain text
                      const text = checklistItems.map((i) => i.text).join('\n');
                      setContent((prev) => (prev ? prev + '\n' + text : text));
                      setIsChecklist(false);
                    }
                  }}
                  className={`p-1.5 rounded-full transition-colors ${
                    isChecklist
                      ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={saveAndClose}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors tracking-wide"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
