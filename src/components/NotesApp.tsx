import { useState } from 'react';
import { useSupabaseNotesStore } from '@/hooks/useSupabaseNotesStore';
import { Sidebar } from './Sidebar';
import { NoteEditor } from './NoteEditor';
import { EmptyState } from './EmptyState';
import { Header } from './Header';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const NotesApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const notesStore = useSupabaseNotesStore();

  const { selectedNote } = notesStore;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-sidebar-border`}>
        <Sidebar 
          {...notesStore}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {selectedNote ? (
            <NoteEditor 
              note={selectedNote}
              onUpdateNote={notesStore.updateNote}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};