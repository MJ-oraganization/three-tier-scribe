import { useState, useEffect } from 'react';
import { Note } from '@/types/notes';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
}

export const NoteEditor = ({ note, onUpdateNote }: NoteEditorProps) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setHasUnsavedChanges(false);
  }, [note.id, note.title, note.content]);

  useEffect(() => {
    const hasChanges = title !== note.title || content !== note.content;
    setHasUnsavedChanges(hasChanges);
  }, [title, content, note.title, note.content]);

  const handleSave = () => {
    onUpdateNote(note.id, { title, content });
    setHasUnsavedChanges(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Editor Header */}
      <div className="border-b border-border p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {formatDate(note.updatedAt)}</span>
            </div>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                <span className="text-sm text-warning">Unsaved changes</span>
              </div>
            )}
          </div>
          <Button 
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={cn(
              "transition-all duration-200",
              hasUnsavedChanges 
                ? "bg-primary hover:bg-primary-hover text-primary-foreground" 
                : "bg-muted text-muted-foreground"
            )}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Note title..."
          className="text-2xl font-bold border-0 bg-transparent p-0 focus:ring-0 placeholder:text-muted-foreground"
        />
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-6">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start writing your note..."
          className="w-full h-full resize-none border-0 bg-transparent p-0 text-base leading-relaxed focus:ring-0 placeholder:text-muted-foreground"
        />
      </div>

      {/* Save hint */}
      <div className="p-4 border-t border-border bg-muted/30">
        <p className="text-sm text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-card border rounded">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-card border rounded">S</kbd> to save
        </p>
      </div>
    </div>
  );
};