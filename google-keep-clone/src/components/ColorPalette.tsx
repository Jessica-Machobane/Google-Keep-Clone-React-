import React, { useRef, useEffect } from 'react';
import { KeepColor, KEEP_COLORS } from '../types/note';
import { Check, Droplet } from 'lucide-react';

interface ColorPaletteProps {
  selectedColor: KeepColor;
  onSelectColor: (color: KeepColor) => void;
  isOpen: boolean;
  onClose: () => void;
  position?: 'top' | 'bottom';
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedColor,
  onSelectColor,
  isOpen,
  onClose,
  position = 'top',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      } left-0 z-50 p-2 bg-white dark:bg-[#2d2e30] rounded-xl shadow-xl border border-gray-200 dark:border-[#5f6368] w-[260px] animate-in fade-in zoom-in-95 duration-100`}
    >
      <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 px-1 mb-1.5 flex items-center gap-1">
        <Droplet className="w-3 h-3 text-amber-500" />
        Note background
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {KEEP_COLORS.map((col) => {
          const isSelected = selectedColor === col.id;
          return (
            <button
              key={col.id}
              type="button"
              title={col.name}
              onClick={(e) => {
                e.stopPropagation();
                onSelectColor(col.id);
                onClose();
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-115 active:scale-95 border ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-[#2d2e30]'
                  : 'hover:border-gray-400 dark:hover:border-gray-400'
              } ${
                col.id === 'default'
                  ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202124]'
                  : `${col.lightBg} ${col.darkBg} ${col.lightBorder} ${col.darkBorder}`
              }`}
            >
              {isSelected && (
                <Check className={`w-3.5 h-3.5 ${col.id === 'default' ? 'text-gray-700 dark:text-gray-200' : 'text-gray-800 dark:text-white'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
