import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, FolderPlus, FileText, Folder, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Workspace, Folder as FolderType, Note } from '@/types/notes';
import { cn } from '@/lib/utils';

interface SidebarProps {
  workspaces: Workspace[];
  selectedWorkspaceId: string;
  selectedFolderId: string;
  selectedNoteId: string;
  setSelectedWorkspaceId: (id: string) => void;
  setSelectedFolderId: (id: string) => void;
  setSelectedNoteId: (id: string) => void;
  createWorkspace: (name: string, description?: string) => Workspace;
  createFolder: (workspaceId: string, name: string) => FolderType;
  createNote: (folderId: string, title: string) => Note;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Sidebar = ({
  workspaces,
  selectedWorkspaceId,
  selectedFolderId,
  selectedNoteId,
  setSelectedWorkspaceId,
  setSelectedFolderId,
  setSelectedNoteId,
  createWorkspace,
  createFolder,
  createNote,
  searchQuery,
  onSearchChange
}: SidebarProps) => {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set([selectedWorkspaceId]));
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([selectedFolderId]));
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState<string | null>(null);
  const [creatingNote, setCreatingNote] = useState<string | null>(null);

  const toggleWorkspace = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateWorkspace = (name: string) => {
    if (name.trim()) {
      createWorkspace(name.trim());
      setCreatingWorkspace(false);
    }
  };

  const handleCreateFolder = (workspaceId: string, name: string) => {
    if (name.trim()) {
      createFolder(workspaceId, name.trim());
      setCreatingFolder(null);
    }
  };

  const handleCreateNote = (folderId: string, title: string) => {
    if (title.trim()) {
      const note = createNote(folderId, title.trim());
      setSelectedNoteId(note.id);
      setCreatingNote(null);
    }
  };

  // Filter notes based on search
  const filteredWorkspaces = workspaces.map(workspace => ({
    ...workspace,
    folders: workspace.folders.map(folder => ({
      ...folder,
      notes: folder.notes.filter(note => 
        searchQuery === '' || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
  }));

  return (
    <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Workspaces</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreatingWorkspace(true)}
            className="hover:bg-sidebar-hover text-sidebar-foreground"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {creatingWorkspace && (
          <CreateForm
            placeholder="Workspace name..."
            onSubmit={handleCreateWorkspace}
            onCancel={() => setCreatingWorkspace(false)}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredWorkspaces.map((workspace) => (
          <div key={workspace.id} className="mb-2">
            <div
              className={cn(
                "flex items-center justify-between p-2 rounded-lg cursor-pointer group hover:bg-sidebar-hover transition-colors",
                selectedWorkspaceId === workspace.id && "bg-sidebar-active"
              )}
              onClick={() => {
                setSelectedWorkspaceId(workspace.id);
                toggleWorkspace(workspace.id);
              }}
            >
              <div className="flex items-center gap-2 flex-1">
                {expandedWorkspaces.has(workspace.id) ? (
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
                )}
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="text-sidebar-foreground font-medium">{workspace.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setCreatingFolder(workspace.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-sidebar-hover"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            </div>

            {expandedWorkspaces.has(workspace.id) && (
              <div className="ml-6 space-y-1">
                {creatingFolder === workspace.id && (
                  <CreateForm
                    placeholder="Folder name..."
                    onSubmit={(name) => handleCreateFolder(workspace.id, name)}
                    onCancel={() => setCreatingFolder(null)}
                  />
                )}

                {workspace.folders.map((folder) => (
                  <div key={folder.id}>
                    <div
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg cursor-pointer group hover:bg-sidebar-hover transition-colors",
                        selectedFolderId === folder.id && "bg-sidebar-active"
                      )}
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        toggleFolder(folder.id);
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {expandedFolders.has(folder.id) ? (
                          <ChevronDown className="h-3 w-3 text-sidebar-foreground" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-sidebar-foreground" />
                        )}
                        <Folder className="h-4 w-4 text-accent" />
                        <span className="text-sidebar-foreground text-sm">{folder.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCreatingNote(folder.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:bg-sidebar-hover"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {expandedFolders.has(folder.id) && (
                      <div className="ml-6 space-y-1">
                        {creatingNote === folder.id && (
                          <CreateForm
                            placeholder="Note title..."
                            onSubmit={(title) => handleCreateNote(folder.id, title)}
                            onCancel={() => setCreatingNote(null)}
                          />
                        )}

                        {folder.notes.map((note) => (
                          <div
                            key={note.id}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-sidebar-hover transition-colors",
                              selectedNoteId === note.id && "bg-sidebar-active"
                            )}
                            onClick={() => setSelectedNoteId(note.id)}
                          >
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sidebar-foreground text-sm truncate">{note.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

interface CreateFormProps {
  placeholder: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

const CreateForm = ({ placeholder, onSubmit, onCancel }: CreateFormProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!value.trim()) {
            onCancel();
          }
        }}
        placeholder={placeholder}
        className="text-sm bg-background border-border"
        autoFocus
      />
    </form>
  );
};