import { describe, it, expect } from 'vitest';
import {
  transposeNote,
  transposeChord,
  isChordToken,
  isChordLine,
  transposeText,
} from '../src/core/chord-transposer';
import { StageMidiController } from '../src/core/midi-controller';

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
});
