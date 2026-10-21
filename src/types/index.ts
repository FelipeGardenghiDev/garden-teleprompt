export interface Song {
  id: string;
  title: string;
  artist: string;
  originalKey: string;
  transposeSemitones: number;
  bpm: number;
  scrollSpeed: number; // px per second
  content: string; // chords & lyrics
  midiPatch?: number; // Line 6 POD HD 500 Program Change (e.g. 1 - 64)
  notes?: string;
}

export interface Setlist {
  id: string;
  name: string;
  updatedAt: string;
  songs: Song[];
}

export interface MidiEventPayload {
  command: number; // 0xC0 for Program Change, 0xB0 for CC, 0x90 for Note On
  channel: number;
  data1: number;
  data2?: number;
  device: string;
}
