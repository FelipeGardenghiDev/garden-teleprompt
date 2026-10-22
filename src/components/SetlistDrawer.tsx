import React, { useState } from 'react';
import { Song, Setlist } from '../types';
import {
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit2,
  Download,
  Upload,
  Music,
  Printer,
} from 'lucide-react';
import { triggerPrintSetlist } from '../core/stage-calculator';

interface SetlistDrawerProps {
  setlist: Setlist;
  currentSongIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectSong: (index: number) => void;
  onUpdateSetlist: (updated: Setlist) => void;
  onEditSong: (song: Song) => void;
}

export const SetlistDrawer: React.FC<SetlistDrawerProps> = ({
  setlist,
  currentSongIndex,
  isOpen,
  onClose,
  onSelectSong,
  onUpdateSetlist,
  onEditSong,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');

  if (!isOpen) return null;

  const handleAddSong = () => {
    if (!newTitle.trim()) return;
    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Artista',
      originalKey: 'G',
      transposeSemitones: 0,
      bpm: 120,
      scrollSpeed: 30,
      content: `[G]       [C]       [D]\nNova letra e acordes aqui...`,
      midiPatch: setlist.songs.length + 1,
    };

    onUpdateSetlist({
      ...setlist,
      songs: [...setlist.songs, newSong],
    });

    setNewTitle('');
    setNewArtist('');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= setlist.songs.length) return;

    const reordered = [...setlist.songs];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    onUpdateSetlist({
      ...setlist,
      songs: reordered,
    });
  };

  const handleDelete = (index: number) => {
    if (setlist.songs.length <= 1) {
      alert('O setlist deve ter pelo menos uma música.');
      return;
    }
    const updated = setlist.songs.filter((_, i) => i !== index);
    onUpdateSetlist({
      ...setlist,
      songs: updated,
    });
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(setlist, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${setlist.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as Setlist;
        if (imported.songs && Array.isArray(imported.songs)) {
          onUpdateSetlist(imported);
        }
      } catch (err) {
        alert('Erro ao importar JSON de setlist: formato inválido.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-lg text-white">Setlist de Palco</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setlist Name & Actions */}
        <div className="py-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300">{setlist.name}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerPrintSetlist(setlist)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-400 font-semibold transition"
              title="Imprimir Folha de Palco (Print Setlist)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleExportJson}
              className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              title="Exportar Setlist JSON"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <label
              className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
              title="Importar Setlist JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1">
          {setlist.songs.map((song, idx) => (
            <div
              key={song.id}
              className={`p-3 rounded-xl border transition flex items-center justify-between gap-2 ${
                currentSongIndex === idx
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => {
                  onSelectSong(idx);
                  onClose();
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-500 font-bold">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="font-bold text-sm text-zinc-100">{song.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-1">
                  <span>{song.artist}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">{song.originalKey}</span>
                  {song.midiPatch && (
                    <>
                      <span>•</span>
                      <span className="text-purple-400">PC #{song.midiPatch}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditSong(song)}
                  className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                  title="Editar Música"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-20 text-zinc-400"
                  title="Mover para cima"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === setlist.songs.length - 1}
                  className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-20 text-zinc-400"
                  title="Mover para baixo"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 rounded-md hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400 transition"
                  title="Remover do Setlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Song Form */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
          <span className="text-xs uppercase font-semibold text-zinc-400">Adicionar Música</span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Título da Música..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Artista..."
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
              className="w-28 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAddSong}
              disabled={!newTitle.trim()}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
