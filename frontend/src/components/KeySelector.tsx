import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw, CheckCircle2, Loader2 } from 'lucide-react';
import type { MusicKey, Mode } from '@/pages/MusicTheoryApp';

interface KeySelectorProps {
  selectedKey: MusicKey | null;
  onKeyChange: (key: MusicKey | null) => void;
  detectedKey: MusicKey | null;
  autoDetectedKey?: MusicKey | null;
}

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modes: Mode[] = ['Ionian', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian', 'Locrian'];

export default function KeySelector({ selectedKey, onKeyChange, detectedKey, autoDetectedKey }: KeySelectorProps) {
  const handleNoteChange = (note: string) => {
    const mode = selectedKey?.mode || 'Ionian';
    const displayName = mode === 'Ionian' ? `${note} Major` : mode === 'Aeolian' ? `${note} Minor` : `${note} ${mode}`;
    onKeyChange({ note, mode, displayName });
  };

  const handleModeChange = (mode: Mode) => {
    const note = selectedKey?.note || 'C';
    const displayName = mode === 'Ionian' ? `${note} Major` : mode === 'Aeolian' ? `${note} Minor` : `${note} ${mode}`;
    onKeyChange({ note, mode, displayName });
  };

  const handleReset = () => {
    onKeyChange(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Manual Key Selection</h3>
        {selectedKey && (
          <Button onClick={handleReset} variant="ghost" size="sm" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="note-select">Root Note</Label>
          <Select value={selectedKey?.note || ''} onValueChange={handleNoteChange}>
            <SelectTrigger id="note-select">
              <SelectValue placeholder="Select note" />
            </SelectTrigger>
            <SelectContent>
              {notes.map((note) => (
                <SelectItem key={note} value={note}>
                  {note}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mode-select">Mode</Label>
          <Select value={selectedKey?.mode || ''} onValueChange={handleModeChange}>
            <SelectTrigger id="mode-select">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {modes.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {autoDetectedKey && !selectedKey && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
            <p className="text-sm font-medium text-success">
              Key Locked: {autoDetectedKey.displayName}
            </p>
          </div>
        </div>
      )}

      {detectedKey && !selectedKey && !autoDetectedKey && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 animate-pulse">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-primary flex-shrink-0 animate-spin" />
            <p className="text-sm text-primary">
              Analyzing: {detectedKey.displayName}
            </p>
          </div>
        </div>
      )}

      {selectedKey && (
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-sm font-medium text-accent-foreground">
            Selected: {selectedKey.displayName}
          </p>
        </div>
      )}
    </div>
  );
}
