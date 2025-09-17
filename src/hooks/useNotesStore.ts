import { useState } from 'react';
import { Workspace, Folder, Note } from '@/types/notes';

// Sample data to start with
const initialWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Personal',
    description: 'Personal notes and thoughts',
    createdAt: new Date('2024-01-01'),
    folders: [
      {
        id: '1',
        name: 'Daily Journal',
        createdAt: new Date('2024-01-01'),
        workspaceId: '1',
        notes: [
          {
            id: '1',
            title: 'Welcome to Notes',
            content: 'This is your first note! Start organizing your thoughts with workspaces, folders, and notes.',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            folderId: '1'
          }
        ]
      },
      {
        id: '2',
        name: 'Ideas',
        createdAt: new Date('2024-01-02'),
        workspaceId: '1',
        notes: []
      }
    ]
  },
  {
    id: '2',
    name: 'Work',
    description: 'Professional notes and projects',
    createdAt: new Date('2024-01-01'),
    folders: [
      {
        id: '3',
        name: 'Meeting Notes',
        createdAt: new Date('2024-01-01'),
        workspaceId: '2',
        notes: []
      }
    ]
  }
];

export const useNotesStore = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('1');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('1');
  const [selectedNoteId, setSelectedNoteId] = useState<string>('1');

  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);
  const selectedFolder = selectedWorkspace?.folders.find(f => f.id === selectedFolderId);
  const selectedNote = selectedFolder?.notes.find(n => n.id === selectedNoteId);

  const createWorkspace = (name: string, description?: string) => {
    const newWorkspace: Workspace = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date(),
      folders: []
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    return newWorkspace;
  };

  const createFolder = (workspaceId: string, name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      createdAt: new Date(),
      workspaceId,
      notes: []
    };
    setWorkspaces(prev => prev.map(workspace => 
      workspace.id === workspaceId 
        ? { ...workspace, folders: [...workspace.folders, newFolder] }
        : workspace
    ));
    return newFolder;
  };

  const createNote = (folderId: string, title: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      folderId
    };
    setWorkspaces(prev => prev.map(workspace => ({
      ...workspace,
      folders: workspace.folders.map(folder =>
        folder.id === folderId
          ? { ...folder, notes: [...folder.notes, newNote] }
          : folder
      )
    })));
    return newNote;
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    setWorkspaces(prev => prev.map(workspace => ({
      ...workspace,
      folders: workspace.folders.map(folder => ({
        ...folder,
        notes: folder.notes.map(note =>
          note.id === noteId
            ? { ...note, ...updates, updatedAt: new Date() }
            : note
        )
      }))
    })));
  };

  const deleteNote = (noteId: string) => {
    setWorkspaces(prev => prev.map(workspace => ({
      ...workspace,
      folders: workspace.folders.map(folder => ({
        ...folder,
        notes: folder.notes.filter(note => note.id !== noteId)
      }))
    })));
  };

  const deleteFolder = (folderId: string) => {
    setWorkspaces(prev => prev.map(workspace => ({
      ...workspace,
      folders: workspace.folders.filter(folder => folder.id !== folderId)
    })));
  };

  const deleteWorkspace = (workspaceId: string) => {
    setWorkspaces(prev => prev.filter(workspace => workspace.id !== workspaceId));
  };

  return {
    workspaces,
    selectedWorkspace,
    selectedFolder,
    selectedNote,
    selectedWorkspaceId,
    selectedFolderId,
    selectedNoteId,
    setSelectedWorkspaceId,
    setSelectedFolderId,
    setSelectedNoteId,
    createWorkspace,
    createFolder,
    createNote,
    updateNote,
    deleteNote,
    deleteFolder,
    deleteWorkspace
  };
};