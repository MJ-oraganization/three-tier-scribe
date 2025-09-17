import { FileText, FolderPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyState = () => {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-hero">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Select a note to get started
          </h2>
          <p className="text-muted-foreground">
            Choose a note from the sidebar or create a new one to begin writing.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h3 className="font-semibold text-foreground mb-2">Quick Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                Organize with workspaces, folders, and notes
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                Use Ctrl+S to save your changes
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                Search across all your notes instantly
              </li>
            </ul>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              New Folder
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};