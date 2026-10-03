/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Note, ViewTab, KeepColor } from './types/note';
import { INITIAL_NOTES, INITIAL_LABELS } from './data/initialNotes';
import { filterNotes, generateId } from './utils/helpers';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CreateNote } from './components/CreateNote';
import { NoteCard } from './components/NoteCard';
import { NoteModal } from './components/NoteModal';
import { EditLabelsModal } from './components/EditLabelsModal';
import { DrawingModal } from './components/DrawingModal';
import { TrashBanner } from './components/TrashBanner';
import { Toast, ToastMessage } from './components/Toast';
import { KeepLogo } from './components/KeepLogo';
import {
  Lightbulb,
  Bell,
  Archive,
  Trash2,
  Tag,
  Search,
  Plus,
} from 'lucide-react';

const STORAGE_NOTES_KEY = 'google_keep_clone_notes_v2';
const STORAGE_LABELS_KEY = 'google_keep_clone_labels_v2';
const STORAGE_THEME_KEY = 'google_keep_clone_theme_v2';
const STORAGE_VIEW_KEY = 'google_keep_clone_view_v2';

export default function App() {
  // 1. Core State
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
    return INITIAL_NOTES;
  });

  const [labels, setLabels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LABELS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load labels from localStorage', e);
    }
    return INITIAL_LABELS;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved !== null) return saved === 'dark';
    } catch (e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isGridView, setIsGridView] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VIEW_KEY);
      if (saved !== null) return saved === 'grid';
    } catch (e) {}
    return true;
  });

  const [currentTab, setCurrentTab] = useState<ViewTab>('notes');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'checklist' | 'reminder' | 'image'>('all');
  const [filterColor, setFilterColor] = useState<KeepColor>('default');

  // Modals & Sheets
  const [activeModalNote, setActiveModalNote] = useState<Note | null>(null);
  const [isEditLabelsOpen, setIsEditLabelsOpen] = useState(false);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [drawingAttachment, setDrawingAttachment] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Drag and drop state
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);

  // 2. LocalStorage and Dark Mode sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes', e);
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LABELS_KEY, JSON.stringify(labels));
    } catch (e) {
      console.error('Failed to save labels', e);
    }
  }, [labels]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, isDarkMode ? 'dark' : 'light');
    } catch (e) {}
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VIEW_KEY, isGridView ? 'grid' : 'list');
    } catch (e) {}
  }, [isGridView]);

  // 3. Tab and Counts computations
  const counts = useMemo(() => {
    let notesCount = 0;
    let remindersCount = 0;
    let archiveCount = 0;
    let trashCount = 0;

    for (const n of notes) {
      if (n.inTrash) {
        trashCount++;
      } else if (n.archived) {
        archiveCount++;
      } else {
        notesCount++;
        if (n.reminder) remindersCount++;
      }
    }

    return {
      notes: notesCount,
      reminders: remindersCount,
      archive: archiveCount,
      trash: trashCount,
    };
  }, [notes]);

  // 4. Tab-filtered notes
  const activeTabNotes = useMemo(() => {
    if (currentTab === 'trash') {
      return notes.filter((n) => n.inTrash);
    }
    if (currentTab === 'archive') {
      return notes.filter((n) => !n.inTrash && n.archived);
    }
    if (currentTab === 'reminders') {
      return notes.filter((n) => !n.inTrash && !n.archived && !!n.reminder);
    }
    if (currentTab.startsWith('label:')) {
      const labelName = currentTab.replace('label:', '');
      return notes.filter(
        (n) => !n.inTrash && !n.archived && n.labels.includes(labelName)
      );
    }
    // Default 'notes' tab
    return notes.filter((n) => !n.inTrash && !n.archived);
  }, [notes, currentTab]);

  // Apply search query, type filter, color filter
  const displayedNotes = useMemo(() => {
    return filterNotes(activeTabNotes, searchQuery, filterType, filterColor);
  }, [activeTabNotes, searchQuery, filterType, filterColor]);

  // Split into Pinned vs Others
  const { pinnedNotes, otherNotes } = useMemo(() => {
    const pinned: Note[] = [];
    const others: Note[] = [];

    // Pinning is only visually partitioned in notes tab or labels tab when not in trash
    const shouldPartition = currentTab === 'notes' || currentTab.startsWith('label:');

    for (const n of displayedNotes) {
      if (shouldPartition && n.pinned) {
        pinned.push(n);
      } else {
        others.push(n);
      }
    }

    return { pinnedNotes: pinned, otherNotes: others };
  }, [displayedNotes, currentTab]);

  // 5. Actions: Add Note
  const handleAddNote = (
    noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'order'>
  ) => {
    const newNote: Note = {
      ...noteData,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: notes.length,
      // If currently on a label tab, automatically assign that label!
      labels: currentTab.startsWith('label:')
        ? Array.from(new Set([...noteData.labels, currentTab.replace('label:', '')]))
        : noteData.labels,
    };

    setNotes((prev) => [newNote, ...prev]);

    setToast({
      id: generateId(),
      message: 'Note created',
      onUndo: () => {
        setNotes((prev) => prev.filter((n) => n.id !== newNote.id));
      },
    });
  };

  // 6. Action: Update Note
  const handleUpdateNote = (updated: Note) => {
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    if (activeModalNote?.id === updated.id) {
      setActiveModalNote(updated);
    }
  };

  // 7. Action: Move to Trash
  const handleDeleteNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, inTrash: true, trashedAt: Date.now() } : n))
    );

    setToast({
      id: generateId(),
      message: 'Note moved to trash',
      onUndo: () => {
        setNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, inTrash: false } : n))
        );
      },
    });
  };

  // 8. Action: Restore Note from Trash
  const handleRestoreNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, inTrash: false } : n))
    );
    setToast({
      id: generateId(),
      message: 'Note restored',
    });
  };

  // 9. Action: Delete forever
  const handleDeleteForever = (id: string) => {
    const target = notes.find((n) => n.id === id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setToast({
      id: generateId(),
      message: 'Note deleted forever',
      onUndo: target
        ? () => {
            setNotes((prev) => [target, ...prev]);
          }
        : undefined,
    });
  };

  // 10. Action: Duplicate note
  const handleDuplicateNote = (source: Note) => {
    const copy: Note = {
      ...source,
      id: generateId(),
      title: source.title ? `${source.title} (Copy)` : '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: notes.length,
    };
    setNotes((prev) => [copy, ...prev]);
    setToast({
      id: generateId(),
      message: 'Note copied',
    });
  };

  // 11. Action: Empty Trash
  const handleEmptyTrash = () => {
    const trashed = notes.filter((n) => n.inTrash);
    setNotes((prev) => prev.filter((n) => !n.inTrash));
    setToast({
      id: generateId(),
      message: 'Trash emptied',
      onUndo: () => {
        setNotes((prev) => [...prev, ...trashed]);
      },
    });
  };

  // 12. Label Management
  const handleCreateLabel = (labelName: string) => {
    const trimmed = labelName.trim();
    if (!trimmed || labels.includes(trimmed)) return;
    setLabels((prev) => [...prev, trimmed]);
  };

  const handleRenameLabel = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    setLabels((prev) => prev.map((l) => (l === oldName ? trimmed : l)));
    // Also update notes with this label
    setNotes((prev) =>
      prev.map((n) => ({
        ...n,
        labels: n.labels.map((l) => (l === oldName ? trimmed : l)),
      }))
    );
    if (currentTab === `label:${oldName}`) {
      setCurrentTab(`label:${trimmed}`);
    }
  };

  const handleDeleteLabel = (labelName: string) => {
    setLabels((prev) => prev.filter((l) => l !== labelName));
    // Remove label from notes
    setNotes((prev) =>
      prev.map((n) => ({
        ...n,
        labels: n.labels.filter((l) => l !== labelName),
      }))
    );
    if (currentTab === `label:${labelName}`) {
      setCurrentTab('notes');
    }
  };

  // 13. Drag and Drop Reordering
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedNoteId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedNoteId || draggedNoteId === targetId) return;

    setNotes((prev) => {
      const draggedIndex = prev.findIndex((n) => n.id === draggedNoteId);
      const targetIndex = prev.findIndex((n) => n.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const updated = [...prev];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, draggedItem);
      return updated;
    });

    setDraggedNoteId(null);
  };

  // 14. Export & Import Notes
  const handleExportNotes = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `google_keep_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToast({ id: generateId(), message: 'Notes backup exported' });
  };

  const handleImportNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setNotes(imported);
          setToast({ id: generateId(), message: `Imported ${imported.length} notes` });
        }
      } catch (err) {
        setToast({ id: generateId(), message: 'Failed to import JSON file' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSampleNotes = () => {
    setNotes(INITIAL_NOTES);
    setLabels(INITIAL_LABELS);
    setToast({ id: generateId(), message: 'Reset to Google Keep demo notes' });
  };

  // Helper for empty states
  const getEmptyStateDetails = () => {
    if (searchQuery.trim() || filterType !== 'all' || filterColor !== 'default') {
      return {
        icon: Search,
        title: 'No matching notes found',
        description: 'Try adjusting your search terms or filters.',
      };
    }
    if (currentTab === 'reminders') {
      return {
        icon: Bell,
        title: 'Notes with upcoming reminders appear here',
        description: 'Set a reminder by clicking the bell icon on any note.',
      };
    }
    if (currentTab === 'archive') {
      return {
        icon: Archive,
        title: 'Your archived notes appear here',
        description: 'Archive notes to declutter your main view without deleting them.',
      };
    }
    if (currentTab === 'trash') {
      return {
        icon: Trash2,
        title: 'No notes in Trash',
        description: 'Deleted notes stay here for 7 days before permanent removal.',
      };
    }
    if (currentTab.startsWith('label:')) {
      return {
        icon: Tag,
        title: `No notes with label "${currentTab.replace('label:', '')}"`,
        description: 'Add this label to notes to organize them together.',
      };
    }
    return {
      icon: Lightbulb,
      title: 'Notes you add appear here',
      description: 'Capture ideas, to-do lists, drawings, and reminders.',
    };
  };

  const emptyState = getEmptyStateDetails();
  const EmptyIcon = emptyState.icon;

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-[#202124] dark:text-[#e8eaed] flex flex-col font-sans transition-colors duration-150">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => {
          setIsSidebarExpanded(!isSidebarExpanded);
          setIsMobileSidebarOpen(!isMobileSidebarOpen);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        filterColor={filterColor}
        onFilterColorChange={setFilterColor}
        isGridView={isGridView}
        onToggleViewMode={() => setIsGridView(!isGridView)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onRefresh={() => {
          setToast({ id: generateId(), message: 'Notes synced' });
        }}
        onExportNotes={handleExportNotes}
        onImportNotes={handleImportNotes}
        onResetSampleNotes={handleResetSampleNotes}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isExpanded={isSidebarExpanded}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          labels={labels}
          onOpenEditLabels={() => setIsEditLabelsOpen(true)}
          counts={counts}
        />

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 pb-24">
          <div className="max-w-6xl mx-auto">
            {/* Trash View Warning Banner */}
            {currentTab === 'trash' && (
              <TrashBanner
                onEmptyTrash={handleEmptyTrash}
                count={counts.trash}
              />
            )}

            {/* Note Creation Bar (only visible on active tabs, not on Trash or Archive) */}
            {currentTab !== 'trash' && currentTab !== 'archive' && !searchQuery.trim() && (
              <CreateNote
                onAddNote={handleAddNote}
                availableLabels={labels}
                onCreateLabel={handleCreateLabel}
                onOpenDrawingModal={() => setIsDrawingModalOpen(true)}
                drawingImageAttachment={drawingAttachment}
                onClearDrawingAttachment={() => setDrawingAttachment(null)}
              />
            )}

            {/* Empty State */}
            {displayedNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none px-4 animate-in fade-in">
                <div className="w-24 h-24 rounded-full bg-amber-50 dark:bg-[#2d2e30] flex items-center justify-center mb-5 text-amber-500 shadow-xs">
                  <EmptyIcon className="w-12 h-12 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">
                  {emptyState.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                  {emptyState.description}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* PINNED NOTES SECTION */}
                {pinnedNotes.length > 0 && (
                  <section>
                    <div className="px-1 mb-2.5 text-[11px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase select-none">
                      Pinned
                    </div>

                    <div
                      className={
                        isGridView
                          ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4'
                          : 'max-w-2xl mx-auto space-y-3'
                      }
                    >
                      {pinnedNotes.map((note) => (
                        <div key={note.id} className="break-inside-avoid">
                          <NoteCard
                            note={note}
                            onUpdateNote={handleUpdateNote}
                            onDeleteNote={handleDeleteNote}
                            onRestoreNote={handleRestoreNote}
                            onDeleteForever={handleDeleteForever}
                            onDuplicateNote={handleDuplicateNote}
                            onOpenModal={setActiveModalNote}
                            availableLabels={labels}
                            onCreateLabel={handleCreateLabel}
                            onSelectLabelFilter={(lbl) => setCurrentTab(`label:${lbl}`)}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            isDragging={draggedNoteId === note.id}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* OTHER NOTES SECTION */}
                {otherNotes.length > 0 && (
                  <section>
                    {pinnedNotes.length > 0 && (
                      <div className="px-1 mb-2.5 text-[11px] font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase select-none">
                        Others
                      </div>
                    )}

                    <div
                      className={
                        isGridView
                          ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4'
                          : 'max-w-2xl mx-auto space-y-3'
                      }
                    >
                      {otherNotes.map((note) => (
                        <div key={note.id} className="break-inside-avoid">
                          <NoteCard
                            note={note}
                            onUpdateNote={handleUpdateNote}
                            onDeleteNote={handleDeleteNote}
                            onRestoreNote={handleRestoreNote}
                            onDeleteForever={handleDeleteForever}
                            onDuplicateNote={handleDuplicateNote}
                            onOpenModal={setActiveModalNote}
                            availableLabels={labels}
                            onCreateLabel={handleCreateLabel}
                            onSelectLabelFilter={(lbl) => setCurrentTab(`label:${lbl}`)}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            isDragging={draggedNoteId === note.id}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Note Edit Modal Dialog */}
      <NoteModal
        note={activeModalNote}
        isOpen={!!activeModalNote}
        onClose={() => setActiveModalNote(null)}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        availableLabels={labels}
        onCreateLabel={handleCreateLabel}
        onSelectLabelFilter={(lbl) => {
          setActiveModalNote(null);
          setCurrentTab(`label:${lbl}`);
        }}
      />

      {/* Edit Labels Modal Dialog */}
      <EditLabelsModal
        isOpen={isEditLabelsOpen}
        onClose={() => setIsEditLabelsOpen(false)}
        labels={labels}
        onCreateLabel={handleCreateLabel}
        onRenameLabel={handleRenameLabel}
        onDeleteLabel={handleDeleteLabel}
      />

      {/* Drawing Modal Dialog */}
      <DrawingModal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        onSaveDrawing={(dataUrl) => {
          setDrawingAttachment(dataUrl);
        }}
      />

      {/* Toast Notification Snackbar with Undo */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
