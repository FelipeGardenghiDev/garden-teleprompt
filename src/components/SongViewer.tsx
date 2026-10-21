import React, { useEffect, useRef } from 'react';
import { Song } from '../types';
import { transposeText } from '../core/chord-transposer';

interface SongViewerProps {
  song: Song;
  fontSize: number; // in px, e.g. 24
  mirrorMode: boolean;
  showChords: boolean;
  isScrolling: boolean;
  onScrollToggle: () => void;
}

export const SongViewer: React.FC<SongViewerProps> = ({
  song,
  fontSize,
  mirrorMode,
  showChords,
  isScrolling,
  onScrollToggle,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Transpose song content based on semitones
  const transposedContent = transposeText(
    song.content,
    song.transposeSemitones,
    song.transposeSemitones < 0
  );

  // Smooth 60fps auto-scroll loop
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (!isScrolling) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const step = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Scroll speed is px per second
      const pxToScroll = song.scrollSpeed * deltaSec;
      container.scrollTop += pxToScroll;

      // Stop if reached the very bottom
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
        onScrollToggle();
        return;
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isScrolling, song.scrollSpeed, onScrollToggle]);

  // Reset scroll to top when song changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [song.id]);

  // Format line: detect bracketed chords [G] and style them
  const renderLine = (line: string, lineIndex: number) => {
    if (!line.trim()) {
      return <div key={lineIndex} className="h-6"></div>;
    }

    // Split by brackets
    const parts = line.split(/(\[[^\]]+\])/g);

    return (
      <div key={lineIndex} className="leading-relaxed whitespace-pre font-mono tracking-wide">
        {parts.map((part, pIdx) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const chord = part.slice(1, -1);
            if (!showChords) return null;
            return (
              <span
                key={pIdx}
                className="font-bold text-emerald-400 font-sans px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-[0.85em] inline-block -translate-y-1 mx-0.5 shadow-sm"
              >
                {chord}
              </span>
            );
          }
          return (
            <span key={pIdx} className="text-zinc-100 font-medium">
              {part}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={scrollContainerRef}
      className={`flex-1 overflow-y-auto p-6 md:p-12 transition-transform duration-200 select-none ${
        mirrorMode ? 'mirror-mode' : ''
      }`}
    >
      {/* Song Header Info */}
      <div className="border-b border-zinc-800 pb-6 mb-8 max-w-4xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
            {song.title}
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-400">{song.artist}</h2>
        </div>

        {/* Live Badges: Key, Transpose, BPM, POD Patch */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="text-zinc-500">TOM:</span>
            <span className="font-bold text-emerald-400">{song.originalKey}</span>
            {song.transposeSemitones !== 0 && (
              <span className="text-amber-400 font-bold ml-1">
                ({song.transposeSemitones > 0 ? `+${song.transposeSemitones}` : song.transposeSemitones})
              </span>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="text-zinc-500">BPM:</span>
            <span className="font-bold text-zinc-200">{song.bpm}</span>
          </div>

          {song.midiPatch && (
            <div className="bg-purple-950/40 border border-purple-800/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-purple-300">
              <span className="text-purple-400 font-semibold">LINE 6 PATCH:</span>
              <span className="font-bold font-mono">#{song.midiPatch}</span>
            </div>
          )}
        </div>
      </div>

      {/* Song Notes if present */}
      {song.notes && (
        <div className="max-w-4xl mx-auto mb-8 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-400">
          💡 <span className="text-zinc-300 font-semibold">Notas de Palco:</span> {song.notes}
        </div>
      )}

      {/* Song Lyrics & Chords Body */}
      <div
        className="max-w-4xl mx-auto space-y-1 pb-96"
        style={{ fontSize: `${fontSize}px` }}
      >
        {transposedContent.split('\n').map((line, idx) => renderLine(line, idx))}
      </div>
    </div>
  );
};
