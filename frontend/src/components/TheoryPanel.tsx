import { Music2, Lightbulb, BookOpen, Guitar } from 'lucide-react';
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
import {
  generateChordProgressions,
  generateScaleString,
  generateImprovisationTips,
  generateCompositionSuggestions,
  generateScaleDegreeChords,
} from '@/lib/musicTheory';

interface TheoryPanelProps {
  activeKey: MusicKey | null;
  type: 'chords' | 'scales' | 'tips';
}

export default function TheoryPanel({ activeKey, type }: TheoryPanelProps) {
  const keyString = activeKey?.displayName || '';

  const { data: chordProgressionsBackend, isLoading: loadingChords } = useGetChordProgressions(keyString);
  const { data: scaleInfoBackend, isLoading: loadingScales } = useGetScaleInformation(keyString);
  const { data: improvTipsBackend, isLoading: loadingImprov } = useGetImprovisationTips(keyString);
  const { data: compSuggestionsBackend, isLoading: loadingComp } = useGetCompositionSuggestions(keyString);

  // Use backend data if available, otherwise generate locally
  const chordProgressions: string[] = (chordProgressionsBackend && chordProgressionsBackend.length > 0)
    ? chordProgressionsBackend
    : activeKey ? generateChordProgressions(activeKey) : [];

  const scaleInfo: string = scaleInfoBackend
    ? scaleInfoBackend
    : activeKey ? generateScaleString(activeKey) : '';

  const improvTips: string = improvTipsBackend
    ? improvTipsBackend
    : activeKey ? generateImprovisationTips(activeKey) : '';

  const compSuggestions: string = compSuggestionsBackend
    ? compSuggestionsBackend
    : activeKey ? generateCompositionSuggestions(activeKey) : '';

  const scaleDegreeChords = activeKey ? generateScaleDegreeChords(activeKey) : [];

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
          {/* Chord Progressions */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Music2 className="w-5 h-5 text-primary" />
              Chord Progressions in {activeKey.displayName}
            </h3>
            {chordProgressions.length > 0 ? (
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

          {/* Scale Degree Chords */}
          {scaleDegreeChords.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                <Guitar className="w-4 h-4 text-primary" />
                Diatonic Chords
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {scaleDegreeChords.map(({ roman, note, quality }) => (
                  <div
                    key={roman}
                    className="flex flex-col items-center p-2 rounded-md bg-muted/40 border border-border/40 text-center"
                  >
                    <span className="text-xs text-muted-foreground font-mono">{roman}</span>
                    <span className="font-semibold text-sm">{note}</span>
                    <span className="text-xs text-muted-foreground">{quality}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Composition Tips */}
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
          {/* Scale Notes */}
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

          {/* Scale Degree Chords in scale view */}
          {scaleDegreeChords.length > 0 && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-md font-semibold mb-3">Scale Degrees &amp; Chords</h4>
              <div className="grid grid-cols-4 gap-2">
                {scaleDegreeChords.map(({ roman, note, quality }) => (
                  <div
                    key={roman}
                    className="flex flex-col items-center p-2 rounded-md bg-muted/40 border border-border/40 text-center"
                  >
                    <span className="text-xs text-muted-foreground font-mono">{roman}</span>
                    <span className="font-semibold text-sm">{note}</span>
                    <span className="text-xs text-muted-foreground">{quality}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode Characteristics */}
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
