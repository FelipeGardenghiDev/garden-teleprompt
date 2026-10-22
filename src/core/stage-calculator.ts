import { Setlist, Song } from '../types';

export interface DurationEstimate {
  estimatedSeconds: number;
  formattedDuration: string;
  totalBars: number;
}

/**
 * Calculates estimated song duration based on lyrics/chords line count, structure tags and BPM.
 * Assumes average 4/4 meter with 2 bars per line of lyrics/chords.
 */
export function calculateEstimatedDuration(
  content: string,
  bpm: number = 120,
  beatsPerBar: number = 4
): DurationEstimate {
  const safeBpm = Math.max(30, Math.min(300, bpm || 120));
  const secondsPerBeat = 60 / safeBpm;
  const secondsPerBar = secondsPerBeat * beatsPerBar;

  if (!content || !content.trim()) {
    return {
      estimatedSeconds: 180,
      formattedDuration: '03:00',
      totalBars: Math.round(180 / secondsPerBar),
    };
  }

  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let totalBars = 0;

  for (const line of lines) {
    const isSectionHeader = /^\[(intro|verse|verso|refr[aã]o|chorus|bridge|ponte|solo|outro|final).*\]$/i.test(line);
    if (isSectionHeader) {
      totalBars += 4; // section transition / head space
    } else {
      totalBars += 2; // standard lyric or chord line
    }
  }

  // Minimum 16 bars (intro + 1 verse)
  totalBars = Math.max(16, totalBars);

  const rawSeconds = Math.round(totalBars * secondsPerBar);
  const estimatedSeconds = Math.max(45, Math.min(900, rawSeconds));

  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = estimatedSeconds % 60;
  const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    estimatedSeconds,
    formattedDuration,
    totalBars,
  };
}

/**
 * Calculates optimal teleprompter scroll speed in pixels per second
 * so the teleprompter reaches the bottom exactly at song completion.
 */
export function calculateOptimalScrollSpeed(
  viewportHeight: number,
  totalHeight: number,
  durationSeconds: number
): number {
  const scrollDistance = Math.max(0, totalHeight - viewportHeight);
  if (scrollDistance <= 0 || durationSeconds <= 0) return 25;

  const rawSpeed = scrollDistance / durationSeconds;
  return Math.round(Math.max(8, Math.min(100, rawSpeed)));
}

/**
 * Generates high-contrast printable stage setlist HTML
 * suitable for printing or stage clipboards.
 */
export function generatePrintableSetlistHtml(setlist: Setlist): string {
  let totalSetlistSeconds = 0;

  const songsRows = setlist.songs
    .map((song: Song, idx: number) => {
      const { estimatedSeconds, formattedDuration } = calculateEstimatedDuration(song.content, song.bpm);
      totalSetlistSeconds += estimatedSeconds;

      return `
        <tr style="border-bottom: 1px solid #ddd; height: 48px;">
          <td style="font-family: monospace; font-size: 16px; font-weight: bold; text-align: center; width: 45px;">
            ${(idx + 1).toString().padStart(2, '0')}
          </td>
          <td style="font-size: 16px; font-weight: bold; color: #111;">
            ${escapeHtml(song.title)}
            <div style="font-size: 12px; color: #666; font-weight: normal;">${escapeHtml(song.artist)}</div>
          </td>
          <td style="font-family: monospace; font-weight: bold; font-size: 16px; text-align: center; color: #047857; width: 70px;">
            ${escapeHtml(song.originalKey)}
          </td>
          <td style="font-family: monospace; font-size: 14px; text-align: center; width: 80px;">
            ${song.bpm} <span style="font-size: 10px; color: #666;">BPM</span>
          </td>
          <td style="font-family: monospace; font-size: 14px; text-align: center; width: 70px;">
            ${formattedDuration}
          </td>
          <td style="font-family: monospace; font-weight: bold; font-size: 14px; text-align: center; color: #6b21a8; width: 80px;">
            ${song.midiPatch ? `PC #${song.midiPatch}` : '-'}
          </td>
          <td style="font-size: 12px; color: #444;">
            ${song.notes ? escapeHtml(song.notes) : ''}
          </td>
        </tr>
      `;
    })
    .join('');

  const totalMin = Math.floor(totalSetlistSeconds / 60);
  const totalSec = totalSetlistSeconds % 60;
  const formattedTotal = `${totalMin}m ${totalSec.toString().padStart(2, '0')}s`;

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Setlist de Palco - ${escapeHtml(setlist.name)}</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #000; margin: 0; padding: 20px; }
        h1 { font-size: 24px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: -0.5px; }
        .meta { font-size: 13px; color: #555; margin-bottom: 20px; display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background: #f4f4f5; border-bottom: 2px solid #000; padding: 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        td { padding: 8px; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1>${escapeHtml(setlist.name)}</h1>
          <div style="font-size: 12px; color: #555;">Garden Teleprompt • Folha de Palco Oficial</div>
        </div>
        <button onclick="window.print()" style="padding: 8px 16px; background: #047857; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
          🖨️ Imprimir Folha
        </button>
      </div>

      <div class="meta" style="margin-top: 12px;">
        <span><strong>${setlist.songs.length}</strong> Músicas</span>
        <span>Tempo Estimado de Show: <strong>${formattedTotal}</strong></span>
        <span>Data: <strong>${new Date().toLocaleDateString('pt-BR')}</strong></span>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: center;">#</th>
            <th>Música / Artista</th>
            <th style="text-align: center;">Tom</th>
            <th style="text-align: center;">Tempo</th>
            <th style="text-align: center;">Duração</th>
            <th style="text-align: center;">MIDI Patch</th>
            <th>Dicas / Notas de Palco</th>
          </tr>
        </thead>
        <tbody>
          ${songsRows}
        </tbody>
      </table>
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Triggers browser print preview dialog for the setlist sheet.
 */
export function triggerPrintSetlist(setlist: Setlist): void {
  const html = generatePrintableSetlistHtml(setlist);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}
