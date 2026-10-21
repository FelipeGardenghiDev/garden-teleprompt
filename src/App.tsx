import React, { useState, useEffect, useRef } from 'react';
import { Song, Setlist } from './types';
import { INITIAL_SETLIST } from './core/default-songs';
import { StageMidiController } from './core/midi-controller';
import { SongViewer } from './components/SongViewer';
import { SetlistDrawer } from './components/SetlistDrawer';
import { SongEditorModal } from './components/SongEditorModal';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ListMusic,
  FlipHorizontal,
  Type,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Radio,
} from 'lucide-react';

const STORAGE_SETLIST_KEY = 'garden_teleprompt_setlist_v1';

export const App: React.FC = () => {
  const [setlist, setSetlist] = useState<Setlist>(() => {
    const saved = localStorage.getItem(STORAGE_SETLIST_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved setlist:', e);
      }
    }
    return INITIAL_SETLIST;
  });

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [fontSize, setFontSize] = useState(26);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [showChords, setShowChords] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);

  // MIDI state
  const [midiConnected, setMidiConnected] = useState(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string>('');
  const [lastMidiMsg, setLastMidiMsg] = useState<string>('');
  const midiControllerRef = useRef<StageMidiController>(new StageMidiController());

  // Current song
  const currentSong = setlist.songs[currentSongIndex] || setlist.songs[0];

  // Save setlist changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_SETLIST_KEY, JSON.stringify(setlist));
  }, [setlist]);

  // Init Web MIDI
  useEffect(() => {
    const midi = midiControllerRef.current;
    midi.init().then((supported) => {
      if (supported) {
        const devices = midi.getConnectedDevices();
        if (devices.length > 0) {
          setMidiConnected(true);
          setMidiDeviceName(devices.join(', '));
        }
      }
    });

    const unsubscribe = midi.addListener((event) => {
      // 0xC0 = Program Change (e.g. Line 6 POD HD 500 patch select)
      if (event.command === 0xc0) {
        const patch = event.data1 + 1;
        setLastMidiMsg(`Program Change: Patch #${patch}`);

        // Search if any song in setlist matches this MIDI patch
        const matchIdx = setlist.songs.findIndex((s) => s.midiPatch === patch);
        if (matchIdx !== -1) {
          setCurrentSongIndex(matchIdx);
          setIsScrolling(false);
        }
      }
      // 0xB0 = Control Change (CC)
      else if (event.command === 0xb0) {
        setLastMidiMsg(`CC #${event.data1} Val: ${event.data2}`);
        // CC 64 (Sustain / Footswitch 1) toggles auto-scroll
        if (event.data1 === 64 && (event.data2 ?? 0) > 63) {
          setIsScrolling((prev) => !prev);
        }
        // CC 65 (Next song)
        else if (event.data1 === 65 && (event.data2 ?? 0) > 63) {
          handleNextSong();
        }
        // CC 66 (Prev song)
        else if (event.data1 === 66 && (event.data2 ?? 0) > 63) {
          handlePrevSong();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setlist.songs]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        setIsScrolling((prev) => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextSong();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevSong();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setMirrorMode((prev) => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === '+') {
        e.preventDefault();
        handleTranspose(+1);
      } else if (e.key === '-') {
        e.preventDefault();
        handleTranspose(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSongIndex, setlist.songs.length]);

  const handleNextSong = () => {
    if (currentSongIndex < setlist.songs.length - 1) {
      setCurrentSongIndex((prev) => prev + 1);
      setIsScrolling(false);
    }
  };

  const handlePrevSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex((prev) => prev - 1);
      setIsScrolling(false);
    }
  };

  const handleTranspose = (delta: number) => {
    const updatedSongs = [...setlist.songs];
    const song = { ...updatedSongs[currentSongIndex] };
    song.transposeSemitones = (song.transposeSemitones || 0) + delta;
    updatedSongs[currentSongIndex] = song;
    setSetlist({ ...setlist, songs: updatedSongs });
  };

  const handleResetTranspose = () => {
    const updatedSongs = [...setlist.songs];
    const song = { ...updatedSongs[currentSongIndex] };
    song.transposeSemitones = 0;
    updatedSongs[currentSongIndex] = song;
    setSetlist({ ...setlist, songs: updatedSongs });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSaveEditedSong = (updatedSong: Song) => {
    const updatedSongs = setlist.songs.map((s) => (s.id === updatedSong.id ? updatedSong : s));
    setSetlist({ ...setlist, songs: updatedSongs });
  };

  // Virtual MIDI simulation for quick live demo
  const triggerVirtualMidiNext = () => {
    midiControllerRef.current.simulateMidiMessage(0xc0, currentSongIndex + 1);
    handleNextSong();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Application Stage Toolbar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <span className="text-xl">📜</span>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-tight text-white">Garden Teleprompt</h1>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Stage Suite
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800 mx-2 hidden sm:block"></div>

          {/* Setlist Drawer Toggle */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
          >
            <ListMusic className="w-4 h-4 text-emerald-400" />
            <span>Setlist ({currentSongIndex + 1}/{setlist.songs.length})</span>
          </button>
        </div>

        {/* Center: Song Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevSong}
            disabled={currentSongIndex === 0}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 transition"
            title="Música Anterior (PageUp)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-zinc-300 px-2 line-clamp-1 max-w-44 text-center">
            {currentSong.title}
          </span>

          <button
            onClick={handleNextSong}
            disabled={currentSongIndex === setlist.songs.length - 1}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 transition"
            title="Próxima Música (PageDown)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools: Transpose, Font, Mirror, Fullscreen, MIDI */}
        <div className="flex items-center gap-2">
          {/* Transpose Controls */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => handleTranspose(-1)}
              className="px-2 py-1 rounded-lg hover:bg-zinc-800 text-zinc-300 font-bold"
              title="Transpor -1 semitom"
            >
              -1
            </button>
            <button
              onClick={handleResetTranspose}
              className="px-2 py-1 text-emerald-400 font-bold"
              title="Resetar transposição"
            >
              {currentSong.transposeSemitones === 0
                ? 'ORIG'
                : currentSong.transposeSemitones > 0
                ? `+${currentSong.transposeSemitones}`
                : currentSong.transposeSemitones}
            </button>
            <button
              onClick={() => handleTranspose(+1)}
              className="px-2 py-1 rounded-lg hover:bg-zinc-800 text-zinc-300 font-bold"
              title="Transpor +1 semitom"
            >
              +1
            </button>
          </div>

          {/* Toggle Chords */}
          <button
            onClick={() => setShowChords(!showChords)}
            className={`p-1.5 rounded-xl border transition ${
              showChords
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-500'
            }`}
            title={showChords ? 'Ocultar Cifras (Apenas Letra)' : 'Mostrar Cifras'}
          >
            {showChords ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Font Resizer */}
          <div className="hidden md:flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-2 py-1 gap-1 text-xs">
            <Type className="w-3.5 h-3.5 text-zinc-400" />
            <button
              onClick={() => setFontSize((f) => Math.max(16, f - 2))}
              className="px-1.5 hover:text-white"
            >
              A-
            </button>
            <span className="font-mono text-zinc-400 text-[11px]">{fontSize}px</span>
            <button
              onClick={() => setFontSize((f) => Math.min(60, f + 2))}
              className="px-1.5 hover:text-white"
            >
              A+
            </button>
          </div>

          {/* Mirror Mode (Prompter glass) */}
          <button
            onClick={() => setMirrorMode(!mirrorMode)}
            className={`p-1.5 rounded-xl border transition ${
              mirrorMode
                ? 'bg-amber-950/60 border-amber-500 text-amber-400'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
            }`}
            title="Espelhar Horizontalmente (Para vidro de teleprompter) [M]"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            title="Tela Cheia [F]"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Teleprompter Body */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-zinc-950">
        <SongViewer
          song={currentSong}
          fontSize={fontSize}
          mirrorMode={mirrorMode}
          showChords={showChords}
          isScrolling={isScrolling}
          onScrollToggle={() => setIsScrolling(!isScrolling)}
        />

        {/* Floating Teleprompter Auto-Scroll Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-800 backdrop-blur-md rounded-2xl px-5 py-2.5 flex items-center gap-4 shadow-2xl z-30">
          <button
            onClick={() => setIsScrolling(!isScrolling)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm tracking-wide transition shadow-lg ${
              isScrolling
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isScrolling ? (
              <>
                <Pause className="w-4 h-4" /> PAUSAR (Espaço)
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> ROLAGEM (Espaço)
              </>
            )}
          </button>

          <div className="h-5 w-px bg-zinc-800"></div>

          {/* Speed slider */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 font-mono">VEL:</span>
            <input
              type="range"
              min={10}
              max={90}
              value={currentSong.scrollSpeed}
              onChange={(e) => {
                const updatedSongs = [...setlist.songs];
                updatedSongs[currentSongIndex].scrollSpeed = Number(e.target.value);
                setSetlist({ ...setlist, songs: updatedSongs });
              }}
              className="w-24 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-zinc-300 w-10">
              {currentSong.scrollSpeed}px/s
            </span>
          </div>

          <div className="h-5 w-px bg-zinc-800"></div>

          {/* Web MIDI status / Virtual trigger */}
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
                midiConnected
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
              title={midiConnected ? `Dispositivo conectado: ${midiDeviceName}` : 'Nenhum controlador MIDI detectado'}
            >
              <Radio className={`w-3.5 h-3.5 ${midiConnected ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
              <span className="hidden sm:inline">
                {midiConnected ? 'MIDI OK' : 'MIDI'}
              </span>
            </span>

            {/* Test button to simulate pedal press */}
            <button
              onClick={triggerVirtualMidiNext}
              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-300 transition"
              title="Simula sinal MIDI Program Change de troca de música pelo pedal"
            >
              Testar Pedal
            </button>

            {lastMidiMsg && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded hidden lg:inline">
                {lastMidiMsg}
              </span>
            )}
          </div>
        </div>
      </main>

      {/* Setlist Drawer */}
      <SetlistDrawer
        setlist={setlist}
        currentSongIndex={currentSongIndex}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectSong={(idx) => {
          setCurrentSongIndex(idx);
          setIsScrolling(false);
        }}
        onUpdateSetlist={(updated) => setSetlist(updated)}
        onEditSong={(song) => setEditingSong(song)}
      />

      {/* Song Editor Modal */}
      {editingSong && (
        <SongEditorModal
          song={editingSong}
          isOpen={true}
          onClose={() => setEditingSong(null)}
          onSave={handleSaveEditedSong}
        />
      )}
    </div>
  );
};

export default App;
