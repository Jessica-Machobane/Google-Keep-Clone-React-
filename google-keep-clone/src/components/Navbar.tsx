import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  X,
  RotateCw,
  LayoutGrid,
  Rows3,
  Sun,
  Moon,
  Settings,
  Grid,
  Filter,
  Check,
  FileDown,
  FileUp,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { KeepLogo } from './KeepLogo';
import { KeepColor, KEEP_COLORS } from '../types/note';

interface NavbarProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterType: 'all' | 'checklist' | 'reminder' | 'image';
  onFilterTypeChange: (type: 'all' | 'checklist' | 'reminder' | 'image') => void;
  filterColor?: KeepColor;
  onFilterColorChange: (color: KeepColor) => void;
  isGridView: boolean;
  onToggleViewMode: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onRefresh: () => void;
  onExportNotes: () => void;
  onImportNotes: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSampleNotes: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterColor = 'default',
  onFilterColorChange,
  isGridView,
  onToggleViewMode,
  isDarkMode,
  onToggleDarkMode,
  onRefresh,
  onExportNotes,
  onImportNotes,
  onResetSampleNotes,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showAppsMenu, setShowAppsMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (settingsRef.current && !settingsRef.current.contains(target)) {
        setShowSettingsMenu(false);
      }
      if (appsRef.current && !appsRef.current.contains(target)) {
        setShowAppsMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
      if (filterRef.current && !filterRef.current.contains(target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const hasActiveFilters = filterType !== 'all' || filterColor !== 'default';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#202124] border-b border-gray-200 dark:border-[#3c3f41] px-2 sm:px-4 py-2 transition-colors duration-150">
      <input
        ref={importInputRef}
        type="file"
        accept=".json"
        onChange={onImportNotes}
        className="hidden"
      />

      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* LEFT SECTION: Hamburger + Logo + Title */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            title="Main menu"
            className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2e30] text-gray-600 dark:text-gray-300 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer select-none shrink-0 pl-0.5">
            <KeepLogo size={38} className="shrink-0" />
            <span className="text-[22px] font-medium tracking-tight text-[#5f6368] dark:text-[#e8eaed] inline-block select-none">
              Keep
            </span>
          </div>
        </div>

        {/* CENTER SECTION: Search Bar with Filters */}
        <div className="flex-1 max-w-2xl px-1 sm:px-4">
          <div
            className={`relative flex items-center w-full transition-all duration-200 rounded-lg ${
              isSearchFocused
                ? 'bg-white dark:bg-[#202124] shadow-md ring-1 ring-gray-300 dark:ring-gray-600'
                : 'bg-[#f1f3f4] dark:bg-[#2d2e30] hover:bg-[#e8eaed] dark:hover:bg-[#35363a]'
            }`}
          >
            <button
              type="button"
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 shrink-0"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Search notes, labels, lists..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full py-2 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />

            {/* Clear Search Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                title="Clear search"
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Filter Toggle Menu */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                title="Filter notes"
                className={`p-2 rounded-full transition-colors mr-1 ${
                  hasActiveFilters
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>

              {/* Filter Dropdown */}
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#2d2e30] rounded-xl shadow-xl border border-gray-200 dark:border-[#5f6368] p-3 z-50 text-xs text-gray-800 dark:text-gray-200 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-[#3c3f41]">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">
                      Search Filters
                    </span>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={() => {
                          onFilterTypeChange('all');
                          onFilterColorChange('default');
                        }}
                        className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Types */}
                  <div className="mb-3">
                    <span className="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">
                      Type
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'all', label: 'All types' },
                        { id: 'checklist', label: 'Lists' },
                        { id: 'reminder', label: 'Reminders' },
                        { id: 'image', label: 'Images' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onFilterTypeChange(t.id as any)}
                          className={`px-2 py-1.5 rounded-lg text-left font-medium transition-colors ${
                            filterType === t.id
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
                              : 'hover:bg-gray-100 dark:hover:bg-[#3c3f41] text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <span className="block text-[11px] font-medium text-gray-400 dark:text-gray-500 mb-1.5">
                      Color
                    </span>
                    <div className="grid grid-cols-6 gap-1">
                      {KEEP_COLORS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          title={c.name}
                          onClick={() => onFilterColorChange(c.id)}
                          className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 flex items-center justify-center ${
                            filterColor === c.id
                              ? 'ring-2 ring-amber-500 ring-offset-1'
                              : ''
                          } ${
                            c.id === 'default'
                              ? 'bg-white dark:bg-[#202124] border-gray-300'
                              : `${c.lightBg} ${c.darkBg} ${c.lightBorder} ${c.darkBorder}`
                          }`}
                        >
                          {filterColor === c.id && <Check className="w-3 h-3 text-gray-700" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Quick Tools, View Toggle, Dark Mode, Profile */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 text-gray-600 dark:text-gray-300">
          {/* Refresh */}
          <button
            type="button"
            onClick={handleRefreshClick}
            title="Refresh"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2e30] transition-colors"
          >
            <RotateCw
              className={`w-5 h-5 transition-transform duration-500 ${
                isRefreshing ? 'rotate-180 text-amber-500' : ''
              }`}
            />
          </button>

          {/* Grid / List View Toggle */}
          <button
            type="button"
            onClick={onToggleViewMode}
            title={isGridView ? 'List view' : 'Grid view'}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2e30] transition-colors"
          >
            {isGridView ? <Rows3 className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2e30] transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Settings Menu */}
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              title="Settings"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2e30] transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#2d2e30] rounded-xl shadow-xl border border-gray-200 dark:border-[#5f6368] py-1.5 z-50 text-xs text-gray-700 dark:text-gray-200 animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    onExportNotes();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center gap-2.5"
                >
                  <FileDown className="w-4 h-4 text-amber-600" />
                  <span>Export notes (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    importInputRef.current?.click();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center gap-2.5"
                >
                  <FileUp className="w-4 h-4 text-blue-600" />
                  <span>Import notes</span>
                </button>

                <div className="border-t border-gray-100 dark:border-[#3c3f41] my-1" />

                <button
                  type="button"
                  onClick={() => {
                    onResetSampleNotes();
                    setShowSettingsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex items-center gap-2.5 text-amber-700 dark:text-amber-400"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Reload sample Keep notes</span>
                </button>
              </div>
            )}
          </div>

          {/* Google Apps 9-dots Grid */}
          <div className="relative" ref={appsRef}>
            <button
              type="button"
              onClick={() => setShowAppsMenu(!showAppsMenu)}
              title="Google apps"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2d2e30] transition-colors"
            >
              <Grid className="w-5 h-5" />
            </button>

            {showAppsMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white dark:bg-[#2d2e30] rounded-2xl shadow-xl border border-gray-200 dark:border-[#5f6368] z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">
                  Google Workspace
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-gray-700 dark:text-gray-300">
                  <div className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex flex-col items-center gap-1 cursor-pointer">
                    <KeepLogo size={28} />
                    <span>Keep</span>
                  </div>
                  <div className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex flex-col items-center gap-1 cursor-pointer opacity-70">
                    <span className="text-xl">📁</span>
                    <span>Drive</span>
                  </div>
                  <div className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex flex-col items-center gap-1 cursor-pointer opacity-70">
                    <span className="text-xl">✉️</span>
                    <span>Gmail</span>
                  </div>
                  <div className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex flex-col items-center gap-1 cursor-pointer opacity-70">
                    <span className="text-xl">📅</span>
                    <span>Calendar</span>
                  </div>
                  <div className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex flex-col items-center gap-1 cursor-pointer opacity-70">
                    <span className="text-xl">📝</span>
                    <span>Docs</span>
                  </div>
                  <div className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3c3f41] flex flex-col items-center gap-1 cursor-pointer opacity-70">
                    <span className="text-xl">📊</span>
                    <span>Sheets</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="ml-1 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white font-medium text-xs flex items-center justify-center ring-2 ring-transparent hover:ring-amber-400 transition-all select-none shadow-xs"
              title="Google Account"
            >
              S
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 p-4 bg-white dark:bg-[#2d2e30] rounded-2xl shadow-xl border border-gray-200 dark:border-[#5f6368] z-50 text-xs animate-in fade-in zoom-in-95 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white text-xl font-bold flex items-center justify-center shadow-md mb-2">
                  S
                </div>
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                  Sundar Pichai
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-xs mb-3">
                  sundar@google.com
                </div>
                <div className="inline-block px-3 py-1 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-[11px] font-medium mb-3">
                  Google Workspace Pro
                </div>
                <div className="border-t border-gray-100 dark:border-[#3c3f41] pt-2 text-[11px] text-gray-400">
                  Google Keep Clone • Marks Edition 💯
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
