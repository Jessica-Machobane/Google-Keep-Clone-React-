import React from 'react';
import { Trash2 } from 'lucide-react';

interface TrashBannerProps {
  onEmptyTrash: () => void;
  count: number;
}

export const TrashBanner: React.FC<TrashBannerProps> = ({ onEmptyTrash, count }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 mb-6 bg-amber-50/70 dark:bg-[#282a2d] border border-amber-200/60 dark:border-[#3c3f41] rounded-xl text-sm text-gray-700 dark:text-gray-300 max-w-2xl mx-auto shadow-xs">
      <div className="flex items-center gap-2.5 italic">
        <Trash2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>Notes in Trash are deleted after 7 days. ({count} {count === 1 ? 'note' : 'notes'})</span>
      </div>
      {count > 0 && (
        <button
          type="button"
          onClick={onEmptyTrash}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-950/40 transition-colors whitespace-nowrap"
        >
          Empty Trash
        </button>
      )}
    </div>
  );
};
