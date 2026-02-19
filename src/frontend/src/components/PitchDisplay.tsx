import { TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { MusicKey } from '@/pages/MusicTheoryApp';
import { isNoteInKey } from '@/lib/musicTheory';

interface PitchDisplayProps {
  pitch: number | null;
  note: string | null;
  activeKey: MusicKey | null;
}

export default function PitchDisplay({ pitch, note, activeKey }: PitchDisplayProps) {
  const inKey = activeKey && note ? isNoteInKey(note, activeKey) : true;

  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Real-time Pitch Tracking
        </h4>
        {activeKey && (
          <span className="text-xs text-muted-foreground">
            Key: {activeKey.displayName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Detected Note</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold font-mono">
              {note || '--'}
            </p>
            {note && (
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  inKey
                    ? 'bg-primary/20 text-primary'
                    : 'bg-destructive/20 text-destructive'
                }`}
              >
                {inKey ? 'In Key' : 'Out of Key'}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Frequency</p>
          <p className="text-3xl font-bold font-mono">
            {pitch ? `${pitch.toFixed(1)} Hz` : '-- Hz'}
          </p>
        </div>
      </div>

      {pitch && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Signal Strength</p>
          <Progress value={Math.min(100, (pitch / 1000) * 100)} className="h-2" />
        </div>
      )}

      {!inKey && note && activeKey && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive">
            ⚠️ This note deviates from the expected tonal center of {activeKey.displayName}
          </p>
        </div>
      )}
    </div>
  );
}
