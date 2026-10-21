const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

/**
 * Transposes a single note name (e.g. 'C#', 'Bb') by delta semitones.
 */
export function transposeNote(note: string, delta: number, preferFlats = false): string {
  const semitone = NOTE_TO_SEMITONE[note];
  if (semitone === undefined) return note;

  const newSemitone = ((semitone + delta) % 12 + 12) % 12;
  return preferFlats ? FLAT_SCALE[newSemitone] : SHARP_SCALE[newSemitone];
}

/**
 * Transposes a complete chord symbol, including extensions and slash bass (e.g. 'Am7', 'F#m7b5', 'D/F#').
 */
export function transposeChord(chord: string, delta: number, preferFlats = false): string {
  if (delta === 0) return chord;

  // Check for slash chord (e.g. D/F#)
  const slashParts = chord.split('/');
  const mainChord = slashParts[0];
  const bassNote = slashParts[1];

  // Regex to extract root note [A-G][#b]? from main chord
  const rootMatch = mainChord.match(/^([A-G][#b]?)(.*)$/);
  if (!rootMatch) return chord;

  const root = rootMatch[1];
  const suffix = rootMatch[2];
  const transposedRoot = transposeNote(root, delta, preferFlats);

  let result = transposedRoot + suffix;

  if (bassNote) {
    const bassMatch = bassNote.match(/^([A-G][#b]?)(.*)$/);
    if (bassMatch) {
      const transposedBass = transposeNote(bassMatch[1], delta, preferFlats);
      result += '/' + transposedBass + bassMatch[2];
    } else {
      result += '/' + bassNote;
    }
  }

  return result;
}

/**
 * Checks if a string looks like a standard musical chord.
 */
export function isChordToken(token: string): boolean {
  if (!token) return false;
  const clean = token.replace(/[()]/g, '');
  return /^([A-G][#b]?)((m|maj|min|dim|aug|sus|add|\d|b\d|#\d)*)(\/[A-G][#b]?)?$/.test(clean);
}

/**
 * Detects if an entire line is made up of chords and whitespace.
 */
export function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/);
  if (tokens.length === 0 || tokens[0] === '') return false;
  return tokens.every((token) => isChordToken(token));
}

/**
 * Transposes all chords inside bracket notation [Chord] and on dedicated chord lines.
 */
export function transposeText(text: string, semitones: number, preferFlats = false): string {
  if (semitones === 0) return text;

  const lines = text.split('\n');
  const transposedLines = lines.map((line) => {
    // 1. Process bracketed chords: [C#m7] -> [Dm7]
    let modified = line.replace(/\[([A-G][#b]?[^\]]*)\]/g, (_, chordInside) => {
      return `[${transposeChord(chordInside, semitones, preferFlats)}]`;
    });

    // 2. If line is a dedicated chord line, transpose token by token preserving space alignment
    if (isChordLine(modified)) {
      // Regex that matches chord tokens
      modified = modified.replace(/\b([A-G][#b]?[a-zA-Z0-9#b\/]*)\b/g, (match) => {
        if (isChordToken(match)) {
          return transposeChord(match, semitones, preferFlats);
        }
        return match;
      });
    }

    return modified;
  });

  return transposedLines.join('\n');
}
