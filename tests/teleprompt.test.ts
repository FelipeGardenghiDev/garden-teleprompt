import { describe, it, expect } from 'vitest';
import {
  transposeNote,
  transposeChord,
  isChordToken,
  isChordLine,
  transposeText,
} from '../src/core/chord-transposer';
import { StageMidiController } from '../src/core/midi-controller';
import {
  calculateEstimatedDuration,
  calculateOptimalScrollSpeed,
  generatePrintableSetlistHtml,
} from '../src/core/stage-calculator';

describe('Garden Teleprompt - Chords, Transposer & Stage MIDI Engine', () => {
  it('transposes single notes accurately', () => {
    expect(transposeNote('C', 2)).toBe('D');
    expect(transposeNote('G', 5)).toBe('C');
    expect(transposeNote('E', -1)).toBe('D#');
    expect(transposeNote('E', -1, true)).toBe('Eb');
  });

  it('transposes complex chords with extensions', () => {
    expect(transposeChord('Am7', 2)).toBe('Bm7');
    expect(transposeChord('Cmaj7', 3)).toBe('D#maj7');
    expect(transposeChord('Cmaj7', 3, true)).toBe('Ebmaj7');
    expect(transposeChord('F#m7b5', 1)).toBe('Gm7b5');
  });

  it('transposes slash bass chords correctly (e.g. D/F#)', () => {
    // D/F# transposed up 2 semitones is E/G#
    expect(transposeChord('D/F#', 2)).toBe('E/G#');
    // G/B transposed up 1 semitone is G#/C
    expect(transposeChord('G/B', 1)).toBe('G#/C');
  });

  it('identifies chord tokens and chord lines', () => {
    expect(isChordToken('C')).toBe(true);
    expect(isChordToken('Am7')).toBe(true);
    expect(isChordToken('D/F#')).toBe(true);
    expect(isChordToken('Elephant')).toBe(false);

    expect(isChordLine('C    G/B    Am    F')).toBe(true);
    expect(isChordLine('I heard there was a secret chord')).toBe(false);
  });

  it('transposes chords embedded in bracket notation [Chord]', () => {
    const text = '[C] When I find myself in [G] times of trouble';
    const transposed = transposeText(text, 2);
    expect(transposed).toBe('[D] When I find myself in [A] times of trouble');
  });

  it('receives simulated MIDI messages correctly', () => {
    const midi = new StageMidiController();
    let receivedPayload: any = null;

    midi.addListener((payload) => {
      receivedPayload = payload;
    });

    // Simulate Program Change (0xC0) for Patch 4
    midi.simulateMidiMessage(0xc0, 4);

    expect(receivedPayload).not.toBeNull();
    expect(receivedPayload.command).toBe(0xc0);
    expect(receivedPayload.data1).toBe(4);
    expect(receivedPayload.device).toContain('Virtual');
  });

  it('estimates song duration accurately based on content lines and BPM', () => {
    const content = `
      [Intro]
      [C] [G] [Am] [F]
      [Verse 1]
      When I find myself in times of trouble
      Mother Mary comes to me
      [Chorus]
      Let it be, let it be
    `;
    const estimate = calculateEstimatedDuration(content, 120);
    expect(estimate.estimatedSeconds).toBeGreaterThan(30);
    expect(estimate.formattedDuration).toMatch(/^\d{2}:\d{2}$/);
  });

  it('calculates optimal teleprompter scroll speed in px/s', () => {
    // Viewport: 800px, Total content: 2400px (scroll distance 1600px), 160 seconds
    const speed = calculateOptimalScrollSpeed(800, 2400, 160);
    expect(speed).toBe(10);
  });

  it('generates high contrast printable setlist HTML', () => {
    const mockSetlist = {
      id: 'setlist-test',
      name: 'Show de Sábado',
      updatedAt: '2026-10-22',
      songs: [
        {
          id: 's1',
          title: 'Helena',
          artist: 'My Chemical Romance',
          originalKey: 'E',
          transposeSemitones: 0,
          bpm: 148,
          scrollSpeed: 35,
          content: 'Long ago...\nJust like the hearse...',
          midiPatch: 12,
          notes: 'Distorção + Chorus',
        },
      ],
    };

    const html = generatePrintableSetlistHtml(mockSetlist);
    expect(html).toContain('Show de Sábado');
    expect(html).toContain('Helena');
    expect(html).toContain('148');
    expect(html).toContain('PC #12');
  });
});
