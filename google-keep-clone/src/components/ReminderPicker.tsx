import React, { useState, useRef, useEffect } from 'react';
import { NoteReminder } from '../types/note';
import { Clock, Calendar, ChevronRight, X, ArrowLeft } from 'lucide-react';

interface ReminderPickerProps {
  currentReminder?: NoteReminder | null;
  onSetReminder: (reminder: NoteReminder | null) => void;
  isOpen: boolean;
  onClose: () => void;
  position?: 'top' | 'bottom';
}

export const ReminderPicker: React.FC<ReminderPickerProps> = ({
  currentReminder,
  onSetReminder,
  isOpen,
  onClose,
  position = 'top',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customDate, setCustomDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [customTime, setCustomTime] = useState('08:00');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
        setShowCustom(false);
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

  const handleSetLaterToday = () => {
    const now = new Date();
    now.setHours(20, 0, 0, 0);
    const dateStr = now.toISOString().split('T')[0];
    onSetReminder({
      date: dateStr,
      time: '20:00',
      label: 'Later today, 8:00 PM',
      timestamp: now.getTime(),
    });
    onClose();
  };

  const handleSetTomorrow = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(8, 0, 0, 0);
    const dateStr = now.toISOString().split('T')[0];
    onSetReminder({
      date: dateStr,
      time: '08:00',
      label: 'Tomorrow, 8:00 AM',
      timestamp: now.getTime(),
    });
    onClose();
  };

  const handleSetNextWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const daysUntilNextMon = ((8 - day) % 7) || 7;
    now.setDate(now.getDate() + daysUntilNextMon);
    now.setHours(8, 0, 0, 0);
    const dateStr = now.toISOString().split('T')[0];
    onSetReminder({
      date: dateStr,
      time: '08:00',
      label: `Next Mon, 8:00 AM`,
      timestamp: now.getTime(),
    });
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate || !customTime) return;
    const [year, month, day] = customDate.split('-').map(Number);
    const [hour, minute] = customTime.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hour, minute);

    const formattedDate = dateObj.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });
    const formattedTime = dateObj.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    onSetReminder({
      date: customDate,
      time: customTime,
      label: `${formattedDate}, ${formattedTime}`,
      timestamp: dateObj.getTime(),
    });
    onClose();
    setShowCustom(false);
  };

  return (
    <div
      ref={containerRef}
      className={`absolute ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      } left-0 z-50 bg-white dark:bg-[#2d2e30] rounded-xl shadow-xl border border-gray-200 dark:border-[#5f6368] w-[270px] py-1.5 text-sm animate-in fade-in zoom-in-95 duration-100 text-gray-800 dark:text-gray-200`}
    >
      {!showCustom ? (
        <div>
          <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Reminder:
          </div>
          <button
            type="button"
            onClick={handleSetLaterToday}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center justify-between transition-colors"
          >
            <span>Later today</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">8:00 PM</span>
          </button>
          <button
            type="button"
            onClick={handleSetTomorrow}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center justify-between transition-colors"
          >
            <span>Tomorrow</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">8:00 AM</span>
          </button>
          <button
            type="button"
            onClick={handleSetNextWeek}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center justify-between transition-colors"
          >
            <span>Next week</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Mon, 8:00 AM</span>
          </button>

          <div className="border-t border-gray-100 dark:border-[#3c3f41] my-1" />

          <button
            type="button"
            onClick={() => setShowCustom(true)}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span>Select date & time</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {currentReminder && (
            <button
              type="button"
              onClick={() => {
                onSetReminder(null);
                onClose();
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center gap-2 transition-colors border-t border-gray-100 dark:border-[#3c3f41] mt-1"
            >
              <X className="w-4 h-4" />
              <span>Remove reminder</span>
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleCustomSubmit} className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#3c3f41] text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              Select date and time
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                Date
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202124] text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
                Time
              </label>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202124] text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-gray-100 dark:border-[#3c3f41]">
            <button
              type="button"
              onClick={() => setShowCustom(false)}
              className="px-3 py-1 text-xs rounded-md hover:bg-gray-100 dark:hover:bg-[#3c3f41] text-gray-600 dark:text-gray-400 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs rounded-md bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-xs"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
