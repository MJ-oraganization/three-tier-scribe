import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workspace, Folder, Note } from '@/types/notes';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseNotesStore = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  const selectedWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);
  const selectedFolder = selectedWorkspace?.folders.find(f => f.id === selectedFolderId);
  const selectedNote = selectedFolder?.notes.find(n => n.id === selectedNoteId);

  // Authentication
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadWorkspaces();
      } else {
        setWorkspaces([]);
        setSelectedWorkspaceId('');
        setSelectedFolderId('');
        setSelectedNoteId('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  const loadWorkspaces = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: true });

      if (workspacesError) throw workspacesError;

      const workspacesWithFolders = await Promise.all(
        (workspacesData || []).map(async (workspace) => {
          const { data: foldersData, error: foldersError } = await supabase
            .from('folders')
            .select('*')
            .eq('workspace_id', workspace.id)
            .order('created_at', { ascending: true });

          if (foldersError) throw foldersError;

          const foldersWithNotes = await Promise.all(
            (foldersData || []).map(async (folder) => {
              const { data: notesData, error: notesError } = await supabase
                .from('notes')
                .select('*')
                .eq('folder_id', folder.id)
                .order('created_at', { ascending: true });

              if (notesError) throw notesError;

              return {
                ...folder,
                notes: (notesData || []).map(note => ({
                  ...note,
                  createdAt: new Date(note.created_at),
                  updatedAt: new Date(note.updated_at),
                  folderId: note.folder_id
                }))
              };
            })
          );

          return {
            ...workspace,
            createdAt: new Date(workspace.created_at),
            folders: foldersWithNotes.map(folder => ({
              ...folder,
              createdAt: new Date(folder.created_at),
              workspaceId: folder.workspace_id
            }))
          };
        })
      );

      setWorkspaces(workspacesWithFolders);

      // Auto-select first workspace, folder, and note if none selected
      if (workspacesWithFolders.length > 0 && !selectedWorkspaceId) {
        const firstWorkspace = workspacesWithFolders[0];
        setSelectedWorkspaceId(firstWorkspace.id);
        
        if (firstWorkspace.folders.length > 0) {
          const firstFolder = firstWorkspace.folders[0];
          setSelectedFolderId(firstFolder.id);
          
          if (firstFolder.notes.length > 0) {
            setSelectedNoteId(firstFolder.notes[0].id);
          }
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error loading workspaces",
        description: "Failed to load your workspaces. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkspace = async (name: string, description?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{
          name,
          description,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newWorkspace: Workspace = {
        ...data,
        createdAt: new Date(data.created_at),
        folders: []
      };

      setWorkspaces(prev => [...prev, newWorkspace]);
      toast({
        title: "Workspace created",
        description: `"${name}" workspace has been created successfully.`
      });
      return newWorkspace;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating workspace",
        description: "Failed to create workspace. Please try again."
      });
      return null;
    }
  };

  const createFolder = async (workspaceId: string, name: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert([{
          name,
          workspace_id: workspaceId,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newFolder: Folder = {
        ...data,
        createdAt: new Date(data.created_at),
        workspaceId: data.workspace_id,
        notes: []
      };

      setWorkspaces(prev => prev.map(workspace => 
        workspace.id === workspaceId 
          ? { ...workspace, folders: [...workspace.folders, newFolder] }
          : workspace
      ));

      toast({
        title: "Folder created",
        description: `"${name}" folder has been created successfully.`
      });
      return newFolder;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating folder",
        description: "Failed to create folder. Please try again."
      });
      return null;
    }
  };

  const createNote = async (folderId: string, title: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          title,
          content: '',
          folder_id: folderId,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        ...data,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        folderId: data.folder_id
      };

      setWorkspaces(prev => prev.map(workspace => ({
        ...workspace,
        folders: workspace.folders.map(folder =>
          folder.id === folderId
            ? { ...folder, notes: [...folder.notes, newNote] }
            : folder
        )
      })));

      toast({
        title: "Note created",
        description: `"${title}" note has been created successfully.`
      });
      return newNote;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating note",
        description: "Failed to create note. Please try again."
      });
      return null;
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: updates.title,
          content: updates.content
        })
        .eq('id', noteId);

      if (error) throw error;

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
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating note",
        description: "Failed to update note. Please try again."
      });
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setWorkspaces(prev => prev.map(workspace => ({
        ...workspace,
        folders: workspace.folders.map(folder => ({
          ...folder,
          notes: folder.notes.filter(note => note.id !== noteId)
        }))
      })));

      // Clear selection if this note was selected
      if (selectedNoteId === noteId) {
        setSelectedNoteId('');
      }

      toast({
        title: "Note deleted",
        description: "Note has been deleted successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting note",
        description: "Failed to delete note. Please try again."
      });
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      setWorkspaces(prev => prev.map(workspace => ({
        ...workspace,
        folders: workspace.folders.filter(folder => folder.id !== folderId)
      })));

      // Clear selections if this folder was selected
      if (selectedFolderId === folderId) {
        setSelectedFolderId('');
        setSelectedNoteId('');
      }

      toast({
        title: "Folder deleted",
        description: "Folder and all its notes have been deleted successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting folder",
        description: "Failed to delete folder. Please try again."
      });
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      setWorkspaces(prev => prev.filter(workspace => workspace.id !== workspaceId));

      // Clear selections if this workspace was selected
      if (selectedWorkspaceId === workspaceId) {
        setSelectedWorkspaceId('');
        setSelectedFolderId('');
        setSelectedNoteId('');
      }

      toast({
        title: "Workspace deleted",
        description: "Workspace and all its content have been deleted successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting workspace",
        description: "Failed to delete workspace. Please try again."
      });
    }
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github'
    });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message
      });
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    }
  };

  return {
    workspaces,
    selectedWorkspace,
    selectedFolder,
    selectedNote,
    selectedWorkspaceId,
    selectedFolderId,
    selectedNoteId,
    isLoading,
    user,
    setSelectedWorkspaceId,
    setSelectedFolderId,
    setSelectedNoteId,
    createWorkspace,
    createFolder,
    createNote,
    updateNote,
    deleteNote,
    deleteFolder,
    deleteWorkspace,
    signIn,
    signOut
  };
};