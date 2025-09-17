export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  folderId: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
  workspaceId: string;
  notes: Note[];
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  folders: Folder[];
}