import React, { useState, useRef, useEffect } from 'react';
import { Tag, Plus, Check, Trash2, Edit2, X } from 'lucide-react';

interface EditLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: string[];
  onCreateLabel: (name: string) => void;
  onRenameLabel: (oldName: string, newName: string) => void;
  onDeleteLabel: (name: string) => void;
}

export const EditLabelsModal: React.FC<EditLabelsModalProps> = ({
  isOpen,
  onClose,
  labels,
  onCreateLabel,
  onRenameLabel,
  onDeleteLabel,
}) => {
  const [newLabelInput, setNewLabelInput] = useState('');
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const newLabelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => newLabelInputRef.current?.focus(), 50);
    } else {
      setNewLabelInput('');
      setEditingLabel(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newLabelInput.trim();
    if (!trimmed) return;
    if (labels.some((l) => l.toLowerCase() === trimmed.toLowerCase())) return;
    onCreateLabel(trimmed);
    setNewLabelInput('');
  };

  const startEditing = (label: string) => {
    setEditingLabel(label);
    setEditingValue(label);
  };

  const saveEditing = (oldLabel: string) => {
    const trimmed = editingValue.trim();
    if (trimmed && trimmed !== oldLabel) {
      onRenameLabel(oldLabel, trimmed);
    }
    setEditingLabel(null);
    setEditingValue('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-[#202124] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95"
      >
        <div className="p-4 pb-2">
          <h2 className="text-base font-medium text-gray-800 dark:text-gray-100">
            Edit labels
          </h2>
        </div>

        {/* Create new label input */}
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
          <form onSubmit={handleCreate} className="flex items-center gap-3">
            {newLabelInput ? (
              <button
                type="button"
                onClick={() => setNewLabelInput('')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Plus className="w-4 h-4 text-gray-400 shrink-0" />
            )}
            <input
              ref={newLabelInputRef}
              type="text"
              placeholder="Create new label"
              value={newLabelInput}
              onChange={(e) => setNewLabelInput(e.target.value)}
              className="w-full text-sm bg-transparent focus:outline-none placeholder-gray-400"
            />
            {newLabelInput.trim() && (
              <button
                type="submit"
                className="p-1 text-amber-600 hover:text-amber-700 rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Existing labels list */}
        <div className="max-h-64 overflow-y-auto px-2 py-2 divide-y divide-transparent">
          {labels.map((label) => {
            const isBeingEdited = editingLabel === label;
            return (
              <div
                key={label}
                className="group flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#282a2d] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onDeleteLabel(label)}
                  title="Delete label"
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {isBeingEdited ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditing(label);
                      if (e.key === 'Escape') setEditingLabel(null);
                    }}
                    autoFocus
                    className="w-full text-sm px-1.5 py-0.5 border-b border-amber-500 bg-transparent focus:outline-none"
                  />
                ) : (
                  <span
                    onClick={() => startEditing(label)}
                    className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate cursor-text"
                  >
                    {label}
                  </span>
                )}

                {isBeingEdited ? (
                  <button
                    type="button"
                    onClick={() => saveEditing(label)}
                    className="p-1 text-amber-600 hover:text-amber-700 rounded-full"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditing(label)}
                    title="Rename label"
                    className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-opacity"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {labels.length === 0 && (
            <div className="py-6 text-center text-xs text-gray-400">
              No labels yet. Create one above!
            </div>
          )}
        </div>

        {/* Modal Done Footer */}
        <div className="flex justify-end p-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
