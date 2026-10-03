import React, { useState, useRef, useEffect } from 'react';
import { Tag, Plus, Check } from 'lucide-react';

interface LabelPickerProps {
  availableLabels: string[];
  selectedLabels: string[];
  onToggleLabel: (label: string) => void;
  onCreateLabel: (newLabel: string) => void;
  isOpen: boolean;
  onClose: () => void;
  position?: 'top' | 'bottom';
}

export const LabelPicker: React.FC<LabelPickerProps> = ({
  availableLabels,
  selectedLabels,
  onToggleLabel,
  onCreateLabel,
  isOpen,
  onClose,
  position = 'top',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredLabels = availableLabels.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase().trim())
  );

  const canCreate =
    search.trim().length > 0 &&
    !availableLabels.some((l) => l.toLowerCase() === search.trim().toLowerCase());

  const handleCreate = () => {
    if (!canCreate) return;
    const name = search.trim();
    onCreateLabel(name);
    onToggleLabel(name);
    setSearch('');
  };

  return (
    <div
      ref={containerRef}
      className={`absolute ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      } left-0 z-50 bg-white dark:bg-[#2d2e30] rounded-xl shadow-xl border border-gray-200 dark:border-[#5f6368] w-[240px] py-2 text-sm animate-in fade-in zoom-in-95 duration-100 text-gray-800 dark:text-gray-200`}
    >
      <div className="px-3 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        Label note
      </div>

      <div className="px-2 pb-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter label name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canCreate) {
              e.preventDefault();
              handleCreate();
            }
          }}
          className="w-full px-2.5 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div className="max-h-40 overflow-y-auto px-1">
        {filteredLabels.map((lbl) => {
          const isSelected = selectedLabels.includes(lbl);
          return (
            <label
              key={lbl}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#3c3f41] cursor-pointer text-xs select-none transition-colors"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleLabel(lbl)}
                className="w-3.5 h-3.5 rounded text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
              />
              <span className="truncate flex-1">{lbl}</span>
            </label>
          );
        })}

        {filteredLabels.length === 0 && !canCreate && (
          <div className="px-3 py-2 text-xs text-gray-400 text-center">No labels found</div>
        )}
      </div>

      {canCreate && (
        <button
          type="button"
          onClick={handleCreate}
          className="w-full text-left px-3 py-2 border-t border-gray-100 dark:border-[#3c3f41] mt-1 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create "{search.trim()}"</span>
        </button>
      )}
    </div>
  );
};
