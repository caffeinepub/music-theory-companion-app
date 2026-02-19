import { Music2, Lightbulb, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { MusicKey } from '@/pages/MusicTheoryApp';
import {
  useGetChordProgressions,
  useGetScaleInformation,
  useGetImprovisationTips,
  useGetCompositionSuggestions,
} from '@/hooks/useQueries';

interface TheoryPanelProps {
  activeKey: MusicKey | null;
  type: 'chords' | 'scales' | 'tips';
}

export default function TheoryPanel({ activeKey, type }: TheoryPanelProps) {
  const keyString = activeKey?.displayName || '';

  const { data: chordProgressions, isLoading: loadingChords } = useGetChordProgressions(keyString);
  const { data: scaleInfo, isLoading: loadingScales } = useGetScaleInformation(keyString);
  const { data: improvTips, isLoading: loadingImprov } = useGetImprovisationTips(keyString);
  const { data: compSuggestions, isLoading: loadingComp } = useGetCompositionSuggestions(keyString);

  if (!activeKey) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Music2 className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Select or detect a key to view music theory information
        </p>
      </div>
    );
  }

  if (type === 'chords') {
    if (loadingChords) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Music2 className="w-5 h-5 text-primary" />
              Chord Progressions in {activeKey.displayName}
            </h3>
            {chordProgressions && chordProgressions.length > 0 ? (
              <div className="space-y-3">
                {chordProgressions.map((progression, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                    <Badge variant="outline" className="mb-2">
                      Progression {index + 1}
                    </Badge>
                    <p className="font-mono text-lg">{progression}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No chord progressions available for this key.</p>
            )}
          </div>

          {compSuggestions && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-md font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-accent" />
                Composition Tips
              </h4>
              <p className="text-sm text-muted-foreground">{compSuggestions}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    );
  }

  if (type === 'scales') {
    if (loadingScales) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Scale Information
            </h3>
            {scaleInfo ? (
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="font-mono text-xl tracking-wider">{scaleInfo}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No scale information available for this key.</p>
            )}
          </div>

          <div className="pt-4 border-t border-border/50">
            <h4 className="text-md font-semibold mb-3">Mode Characteristics</h4>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{activeKey.mode}</span> mode creates a{' '}
                {getModeCharacteristic(activeKey.mode)} sound.
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (type === 'tips') {
    if (loadingImprov || loadingComp) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    return (
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {improvTips && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Improvisation Tips
              </h3>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm">{improvTips}</p>
              </div>
            </div>
          )}

          {compSuggestions && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Music2 className="w-5 h-5 text-accent" />
                Composition Suggestions
              </h3>
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-sm">{compSuggestions}</p>
              </div>
            </div>
          )}

          {!improvTips && !compSuggestions && (
            <p className="text-muted-foreground text-center py-8">
              No tips available for this key.
            </p>
          )}
        </div>
      </ScrollArea>
    );
  }

  return null;
}

function getModeCharacteristic(mode: string): string {
  const characteristics: Record<string, string> = {
    Ionian: 'bright and happy',
    Dorian: 'minor with a jazzy, sophisticated',
    Phrygian: 'dark and exotic',
    Lydian: 'dreamy and ethereal',
    Mixolydian: 'bluesy and rock-oriented',
    Aeolian: 'natural minor, melancholic',
    Locrian: 'unstable and dissonant',
  };
  return characteristics[mode] || 'unique';
}
