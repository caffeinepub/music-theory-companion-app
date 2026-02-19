import type { MusicKey, Mode } from '@/pages/MusicTheoryApp';

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Major scale intervals (Ionian mode)
const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];

// Mode intervals relative to major scale
const modeIntervals: Record<Mode, number[]> = {
  Ionian: [0, 2, 4, 5, 7, 9, 11], // Major
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10], // Natural minor
  Locrian: [0, 1, 3, 5, 6, 8, 10],
};

export function frequencyToNoteIndex(frequency: number): number {
  const a4 = 440;
  const c0 = a4 * Math.pow(2, -4.75);
  const halfSteps = Math.round(12 * Math.log2(frequency / c0));
  return halfSteps % 12;
}

export function detectKeyFromPitches(pitches: number[]): MusicKey | null {
  if (pitches.length < 10) return null;

  // Convert frequencies to note indices
  const noteIndices = pitches.map(frequencyToNoteIndex);

  // Count occurrences of each note
  const noteCounts = new Array(12).fill(0);
  noteIndices.forEach((index) => {
    if (index >= 0 && index < 12) {
      noteCounts[index]++;
    }
  });

  // Find the most common note (likely the tonic)
  let maxCount = 0;
  let tonicIndex = 0;
  noteCounts.forEach((count, index) => {
    if (count > maxCount) {
      maxCount = count;
      tonicIndex = index;
    }
  });

  // Determine if it's major or minor based on the third
  const majorThirdIndex = (tonicIndex + 4) % 12;
  const minorThirdIndex = (tonicIndex + 3) % 12;

  const isMajor = noteCounts[majorThirdIndex] > noteCounts[minorThirdIndex];
  const mode: Mode = isMajor ? 'Ionian' : 'Aeolian';
  const note = noteNames[tonicIndex];
  const displayName = isMajor ? `${note} Major` : `${note} Minor`;

  return { note, mode, displayName };
}

export function isNoteInKey(noteString: string, key: MusicKey): boolean {
  // Extract note name without octave
  const noteName = noteString.replace(/[0-9]/g, '');
  const noteIndex = noteNames.indexOf(noteName);
  if (noteIndex === -1) return false;

  const tonicIndex = noteNames.indexOf(key.note);
  if (tonicIndex === -1) return false;

  const intervals = modeIntervals[key.mode];
  const keyNotes = intervals.map((interval) => (tonicIndex + interval) % 12);

  return keyNotes.includes(noteIndex);
}

export function getScaleNotes(key: MusicKey): string[] {
  const tonicIndex = noteNames.indexOf(key.note);
  if (tonicIndex === -1) return [];

  const intervals = modeIntervals[key.mode];
  return intervals.map((interval) => noteNames[(tonicIndex + interval) % 12]);
}
