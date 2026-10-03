import React from 'react';
import {
  Lightbulb,
  Bell,
  Tag,
  Edit2,
  Archive,
  Trash2,
  X,
} from 'lucide-react';
import { ViewTab } from '../types/note';
import { KeepLogo } from './KeepLogo';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isExpanded: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  labels: string[];
  onOpenEditLabels: () => void;
  counts: {
    notes: number;
    reminders: number;
    archive: number;
    trash: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isExpanded,
  isMobileOpen,
  onCloseMobile,
  labels,
  onOpenEditLabels,
  counts,
}) => {
  const navItems = [
    {
      id: 'notes',
      label: 'Notes',
      icon: Lightbulb,
      count: counts.notes,
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: Bell,
      count: counts.reminders,
    },
  ];

  const bottomItems = [
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      count: counts.archive,
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: Trash2,
      count: counts.trash,
    },
  ];

  const renderContent = (isMobileView: boolean) => (
    <div className="flex flex-col h-full py-2 select-none">
      {/* Mobile Drawer Header */}
      {isMobileView && (
        <div className="flex items-center justify-between px-4 pb-3 mb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <KeepLogo size={32} />
            <span className="font-medium text-lg text-gray-800 dark:text-gray-100">
              Keep
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Nav Items */}
      <div className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                if (isMobileView) onCloseMobile();
              }}
              title={item.label}
              className={`w-full flex items-center gap-6 py-2.5 transition-colors relative ${
                isExpanded || isMobileView
                  ? 'rounded-r-full pr-4 pl-6 text-sm font-medium'
                  : 'rounded-full justify-center px-0 mx-auto w-12 h-12'
              } ${
                isActive
                  ? 'bg-amber-100 text-gray-900 dark:bg-[#41331c] dark:text-amber-300 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2d2e30]'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {(isExpanded || isMobileView) && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.count > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">
                      {item.count}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* LABELS SECTION */}
      <div className="mt-4 pt-3 border-t border-gray-200/70 dark:border-gray-700/60">
        {(isExpanded || isMobileView) && (
          <div className="px-6 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Labels
          </div>
        )}

        <div className="space-y-0.5">
          {labels.map((lbl) => {
            const tabId = `label:${lbl}`;
            const isActive = currentTab === tabId;
            return (
              <button
                key={lbl}
                type="button"
                onClick={() => {
                  onSelectTab(tabId);
                  if (isMobileView) onCloseMobile();
                }}
                title={lbl}
                className={`w-full flex items-center gap-6 py-2.5 transition-colors relative ${
                  isExpanded || isMobileView
                    ? 'rounded-r-full pr-4 pl-6 text-sm font-medium'
                    : 'rounded-full justify-center px-0 mx-auto w-12 h-12'
                }`}
                style={{
                  backgroundColor: isActive
                    ? 'var(--active-bg, rgba(254, 240, 138, 0.4))'
                    : undefined,
                }}
              >
                <Tag
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'
                  }`}
                />
                {(isExpanded || isMobileView) && (
                  <span
                    className={`truncate text-left ${
                      isActive
                        ? 'font-semibold text-gray-900 dark:text-amber-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {lbl}
                  </span>
                )}
              </button>
            );
          })}

          {/* Edit labels trigger */}
          <button
            type="button"
            onClick={() => {
              onOpenEditLabels();
              if (isMobileView) onCloseMobile();
            }}
            title="Edit labels"
            className={`w-full flex items-center gap-6 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2d2e30] transition-colors ${
              isExpanded || isMobileView
                ? 'rounded-r-full pr-4 pl-6 text-sm font-medium'
                : 'rounded-full justify-center px-0 mx-auto w-12 h-12'
            }`}
          >
            <Edit2 className="w-5 h-5 shrink-0 text-gray-500" />
            {(isExpanded || isMobileView) && <span>Edit labels</span>}
          </button>
        </div>
      </div>

      {/* ARCHIVE & TRASH SECTION */}
      <div className="mt-4 pt-3 border-t border-gray-200/70 dark:border-gray-700/60">
        <div className="space-y-0.5">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  if (isMobileView) onCloseMobile();
                }}
                title={item.label}
                className={`w-full flex items-center gap-6 py-2.5 transition-colors relative ${
                  isExpanded || isMobileView
                    ? 'rounded-r-full pr-4 pl-6 text-sm font-medium'
                    : 'rounded-full justify-center px-0 mx-auto w-12 h-12'
                }`}
                style={{
                  backgroundColor: isActive
                    ? 'var(--active-bg, rgba(254, 240, 138, 0.4))'
                    : undefined,
                }}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'
                  }`}
                />
                {(isExpanded || isMobileView) && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span
                      className={`truncate ${
                        isActive
                          ? 'font-semibold text-gray-900 dark:text-amber-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.count > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 overflow-y-auto ${
          isExpanded ? 'w-64 pr-2' : 'w-18'
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer (Overlay + Slide in) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-out Panel */}
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#202124] h-full shadow-2xl z-10 overflow-y-auto">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
