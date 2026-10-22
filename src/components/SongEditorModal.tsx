import React, { useState } from 'react';
import { Song } from '../types';
import { X, Check, Clock, Wand2 } from 'lucide-react';
import { calculateEstimatedDuration } from '../core/stage-calculator';

interface SongEditorModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSong: Song) => void;
}

export const SongEditorModal: React.FC<SongEditorModalProps> = ({
  song,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Song>({ ...song });

  if (!isOpen) return null;

  const durationEstimate = calculateEstimatedDuration(formData.content, formData.bpm);

  const handleAutoScrollSpeed = () => {
    // Estimate ~28px per line of text
    const lines = formData.content.split('\n').length;
    const estimatedHeightPx = Math.max(800, lines * 28);
    const scrollDistance = Math.max(0, estimatedHeightPx - 600);
    const speed = Math.round(Math.max(10, Math.min(80, scrollDistance / durationEstimate.estimatedSeconds)));
    setFormData({ ...formData, scrollSpeed: speed });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">Editar Música: {formData.title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 overflow-y-auto gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Artista / Banda</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Tom Original</label>
              <input
                type="text"
                value={formData.originalKey}
                onChange={(e) => setFormData({ ...formData, originalKey: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">BPM</label>
              <input
                type="number"
                value={formData.bpm}
                onChange={(e) => setFormData({ ...formData, bpm: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-zinc-400">Velocidade Scroll</label>
                <button
                  type="button"
                  onClick={handleAutoScrollSpeed}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  title="Calcular velocidade ideal baseado na duração da música"
                >
                  <Wand2 className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="number"
                value={formData.scrollSpeed}
                onChange={(e) => setFormData({ ...formData, scrollSpeed: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Line 6 POD Patch</label>
              <input
                type="number"
                value={formData.midiPatch || 1}
                onChange={(e) => setFormData({ ...formData, midiPatch: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-purple-400 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Notas / Dicas de Palco</label>
            <input
              type="text"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Capotraste na 2ª casa, Solo com Wah-wah, etc."
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-400">
                Letra & Acordes (use [Acorde] para destacar ou linhas de cifra)
              </label>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Est. {durationEstimate.formattedDuration}</span>
                <span className="text-[10px] text-zinc-500">({durationEstimate.totalBars} compassos)</span>
              </div>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="flex-1 min-h-64 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <Check className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
