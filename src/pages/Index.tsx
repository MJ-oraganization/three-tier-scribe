import { NotesApp } from '@/components/NotesApp';
import { AuthWrapper } from '@/components/AuthWrapper';

const Index = () => {
  return (
    <AuthWrapper>
      <NotesApp />
    </AuthWrapper>
  );
};

export default Index;
