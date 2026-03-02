import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import MusicTheoryApp from './pages/MusicTheoryApp';

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <MusicTheoryApp />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
