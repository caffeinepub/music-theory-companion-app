import { Music } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Music Theory Companion
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time audio analysis & music theory education
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
