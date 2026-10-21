import { MidiEventPayload } from '../types';

export type MidiListener = (event: MidiEventPayload) => void;

interface MIDIMessageEventLike {
  data: Uint8Array;
}

interface MIDIInputLike {
  name?: string;
  onmidimessage: ((event: MIDIMessageEventLike) => void) | null;
}

interface MIDIAccessLike {
  inputs: {
    values: () => IterableIterator<MIDIInputLike>;
  };
  onstatechange: (() => void) | null;
}

/**
 * Stage Web MIDI controller.
 * Listens for hardware footswitches (Line 6 POD HD 500, AirTurn, Behringer FCB1010).
 */
export class StageMidiController {
  private midiAccess: MIDIAccessLike | null = null;
  private listeners: Set<MidiListener> = new Set();
  private connectedDevices: string[] = [];
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  public async init(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Web MIDI API is not supported in this browser environment.');
      return false;
    }

    try {
      this.midiAccess = (await (navigator as any).requestMIDIAccess({ sysex: false })) as MIDIAccessLike;
      this.refreshInputs();

      this.midiAccess.onstatechange = () => {
        this.refreshInputs();
      };

      return true;
    } catch (err) {
      console.warn('Failed to get MIDI access or user denied permission:', err);
      return false;
    }
  }

  private refreshInputs() {
    if (!this.midiAccess) return;

    this.connectedDevices = [];
    const inputs = this.midiAccess.inputs.values();

    for (const input of inputs) {
      if (input.name) {
        this.connectedDevices.push(input.name);
      }
      input.onmidimessage = this.handleMidiMessage.bind(this, input.name || 'MIDI Device');
    }
  }

  private handleMidiMessage(deviceName: string, event: MIDIMessageEventLike) {
    if (!event.data || event.data.length === 0) return;

    const statusByte = event.data[0];
    const command = statusByte & 0xf0;
    const channel = (statusByte & 0x0f) + 1;
    const data1 = event.data[1];
    const data2 = event.data.length > 2 ? event.data[2] : undefined;

    const payload: MidiEventPayload = {
      command,
      channel,
      data1,
      data2,
      device: deviceName,
    };

    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error in MIDI listener:', err);
      }
    });
  }

  public addListener(listener: MidiListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getConnectedDevices(): string[] {
    return this.connectedDevices;
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public simulateMidiMessage(command: number, data1: number, data2 = 127) {
    const payload: MidiEventPayload = {
      command,
      channel: 1,
      data1,
      data2,
      device: 'Line 6 POD HD 500 (Virtual)',
    };
    this.listeners.forEach((l) => l(payload));
  }
}
