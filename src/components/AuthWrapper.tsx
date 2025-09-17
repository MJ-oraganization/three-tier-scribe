import { useSupabaseNotesStore } from '@/hooks/useSupabaseNotesStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Github } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { user, isLoading, signIn } = useSupabaseNotesStore();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-md p-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Welcome to Notes</CardTitle>
            <CardDescription>
              Sign in to access your personal notes, organize them in workspaces and folders, and sync across devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={signIn} className="w-full" size="lg">
              <Github className="mr-2 h-5 w-5" />
              Sign in with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};