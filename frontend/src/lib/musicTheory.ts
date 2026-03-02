import type { MusicKey, Mode } from '@/pages/MusicTheoryApp';

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Mode intervals relative to root
const modeIntervals: Record<Mode, number[]> = {
  Ionian: [0, 2, 4, 5, 7, 9, 11], // Major
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Aeolian: [0, 2, 3, 5, 7, 8, 10], // Natural minor
  Locrian: [0, 1, 3, 5, 6, 8, 10],
};

// Chord quality for each scale degree per mode
const modeChordQualities: Record<Mode, string[]> = {
  Ionian:     ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'],
  Dorian:     ['min', 'min', 'maj', 'maj', 'min', 'dim', 'maj'],
  Phrygian:   ['min', 'maj', 'maj', 'min', 'dim', 'maj', 'min'],
  Lydian:     ['maj', 'maj', 'min', 'dim', 'maj', 'min', 'min'],
  Mixolydian: ['maj', 'min', 'dim', 'maj', 'min', 'min', 'maj'],
  Aeolian:    ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'],
  Locrian:    ['dim', 'maj', 'min', 'min', 'maj', 'maj', 'min'],
};

// Roman numeral labels per mode
const modeRomanNumerals: Record<Mode, string[]> = {
  Ionian:     ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  Dorian:     ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
  Phrygian:   ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
  Lydian:     ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'],
  Mixolydian: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
  Aeolian:    ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
  Locrian:    ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
};

// Common chord progressions per mode (as degree indices 0-based)
const modeProgressions: Record<Mode, number[][]> = {
  Ionian:     [[0,3,4], [1,4,0], [0,5,1,4], [0,4,5,3]],
  Dorian:     [[0,3,4], [0,1,2], [0,6,3,4], [0,3,0,4]],
  Phrygian:   [[0,1,0], [0,6,5,0], [0,5,3,0], [0,1,6,0]],
  Lydian:     [[0,1,4,0], [0,4,1,0], [0,1,0,4], [0,2,1,0]],
  Mixolydian: [[0,6,3,0], [0,3,6,0], [0,4,6,0], [0,3,4,0]],
  Aeolian:    [[0,3,4], [0,5,2,6], [0,6,2,3], [0,3,6,4]],
  Locrian:    [[0,1,0], [0,5,4,0], [0,1,5,0], [0,4,5,0]],
};

export function frequencyToNoteIndex(frequency: number): number {
  const a4 = 440;
  const c0 = a4 * Math.pow(2, -4.75);
  const halfSteps = Math.round(12 * Math.log2(frequency / c0));
  return ((halfSteps % 12) + 12) % 12;
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

/** Generate a scale string like "C D E F G A B" for any key */
export function generateScaleString(key: MusicKey): string {
  return getScaleNotes(key).join(' ');
}

/** Generate chord progression strings for any key */
export function generateChordProgressions(key: MusicKey): string[] {
  const tonicIndex = noteNames.indexOf(key.note);
  if (tonicIndex === -1) return [];

  const intervals = modeIntervals[key.mode];
  const scaleNotes = intervals.map((interval) => noteNames[(tonicIndex + interval) % 12]);
  const qualities = modeChordQualities[key.mode];
  const romans = modeRomanNumerals[key.mode];
  const progressions = modeProgressions[key.mode];

  return progressions.map((degreeList) => {
    return degreeList.map((deg) => romans[deg]).join('-');
  });
}

/** Generate chord names for each scale degree */
export function generateScaleDegreeChords(key: MusicKey): Array<{ roman: string; note: string; quality: string }> {
  const tonicIndex = noteNames.indexOf(key.note);
  if (tonicIndex === -1) return [];

  const intervals = modeIntervals[key.mode];
  const scaleNotes = intervals.map((interval) => noteNames[(tonicIndex + interval) % 12]);
  const qualities = modeChordQualities[key.mode];
  const romans = modeRomanNumerals[key.mode];

  return scaleNotes.map((note, i) => ({
    roman: romans[i],
    note,
    quality: qualities[i],
  }));
}

/** Generate improvisation tips for any key */
export function generateImprovisationTips(key: MusicKey): string {
  const scaleNotes = getScaleNotes(key);
  const tips: Record<Mode, string> = {
    Ionian: `Focus on the ${key.note} major scale (${scaleNotes.join(' ')}). Emphasize chord tones on strong beats and use passing tones for smooth melodic lines.`,
    Dorian: `Use the ${key.note} Dorian scale (${scaleNotes.join(' ')}). Highlight the characteristic major 6th for that jazzy, sophisticated sound. Works great over minor jazz progressions.`,
    Phrygian: `Explore the ${key.note} Phrygian scale (${scaleNotes.join(' ')}). The flat 2nd gives a dark, Spanish/flamenco flavor. Lean into the tension between the root and the b2.`,
    Lydian: `Play the ${key.note} Lydian scale (${scaleNotes.join(' ')}). The raised 4th creates a dreamy, floating quality. Great for film-style melodies and ethereal soundscapes.`,
    Mixolydian: `Use the ${key.note} Mixolydian scale (${scaleNotes.join(' ')}). The flat 7th gives a bluesy, rock feel. Common in blues, rock, and funk — bend notes for extra expression.`,
    Aeolian: `Explore the ${key.note} natural minor scale (${scaleNotes.join(' ')}). Try mixing natural and harmonic minor (raise the 7th) for added tension and resolution.`,
    Locrian: `The ${key.note} Locrian scale (${scaleNotes.join(' ')}) is unstable and dissonant. Use it sparingly for tension, resolving to a more stable key for contrast.`,
  };
  return tips[key.mode] || `Use the ${key.displayName} scale: ${scaleNotes.join(' ')}.`;
}

/** Generate composition suggestions for any key */
export function generateCompositionSuggestions(key: MusicKey): string {
  const suggestions: Record<Mode, string> = {
    Ionian: `Try the classic I-IV-V-I progression for a bright, resolved feel. Add a vi chord for emotional depth, or use a ii-V-I for a jazz-influenced sound.`,
    Dorian: `Mix minor and major chords for modal flavor. The i-IV progression is characteristic of Dorian. Try i-IV-i-VII for a soulful groove.`,
    Phrygian: `Use the i-II-i movement to highlight the Phrygian sound. Pedal tones on the root work well. Try i-VII-VI-VII for a dramatic effect.`,
    Lydian: `The I-II progression is quintessentially Lydian. Try I-II-vii-I for a floating, unresolved quality. Avoid the IV chord to keep the Lydian character.`,
    Mixolydian: `The I-VII-IV-I progression captures the Mixolydian sound perfectly. Use power chords for a rock feel, or add 7ths for a bluesy flavor.`,
    Aeolian: `Use i-VI-III-VII for a natural minor feel. The i-iv-V progression adds tension with the raised 5th chord. Try i-VII-VI-VII for a cinematic sound.`,
    Locrian: `Build tension with the i°-II progression. Use sparingly as a transitional section. Resolve to a relative major or parallel Ionian for contrast.`,
  };
  return suggestions[key.mode] || `Experiment with the diatonic chords of ${key.displayName} to create interesting progressions.`;
}
