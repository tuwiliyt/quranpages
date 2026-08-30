/**
 * AUDIO BAR COMPONENT (COMPACT & MOBILE-OPTIMIZED)
 */

import { RECITERS } from '../services/audio.js';

export function renderAudioBar(state) {
  const { isAudioPlaying, currentAudioVerse, selectedReciterId, repeatMode, playbackRate } = state;
  const currentReciter = RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];
  const verseText = currentAudioVerse ? `Ayat ${currentAudioVerse}` : 'Pilih ayat untuk memutar';

  return `
    <div class="fixed bottom-2 left-2 right-2 md:bottom-4 md:right-4 md:left-auto md:w-[420px] z-50 transition-all duration-300">
      <div class="bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 p-2.5 sm:p-3 flex flex-col gap-2">
        
        <!-- Scrubber Progress Bar -->
        <div id="audio-scrubber" class="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden cursor-pointer group">
          <div class="bg-emerald-500 dark:bg-amber-400 h-full rounded-full transition-all duration-75 relative group-hover:bg-emerald-400 dark:group-hover:bg-amber-300" style="width: 0%;"></div>
        </div>

        <!-- Player Controls & Info -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 w-full">
          
          <!-- Reciter & Verse Info -->
          <div class="flex items-center gap-2 overflow-hidden w-full sm:flex-1">
            <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-amber-500/20 text-emerald-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">${verseText}</span>
              <span class="text-xs text-stone-600 dark:text-stone-400 truncate">${currentReciter.name}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between sm:justify-end gap-1 w-full sm:w-auto flex-shrink-0">
            <!-- Prev Verse -->
            <button id="btn-audio-prev" class="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" title="Ayat Sebelumnya">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>

            <!-- Play/Pause -->
            <button id="btn-audio-toggle" class="p-2 rounded-xl bg-emerald-600 dark:bg-amber-400 text-white dark:text-stone-950 hover:bg-emerald-500 dark:hover:bg-amber-300 hover:scale-105 transition-all shadow-md mx-1 sm:mx-0" title="${isAudioPlaying ? 'Jeda' : 'Putar'}">
              ${isAudioPlaying ? `
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ` : `
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M8 5v14l11-7z"/></svg>
              `}
            </button>

            <!-- Next Verse -->
            <button id="btn-audio-next" class="p-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" title="Ayat Berikutnya">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>

            <!-- Speed Button -->
            <button id="btn-audio-speed" class="px-2 py-1 text-[11px] font-bold text-emerald-700 dark:text-amber-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" title="Kecepatan Audio">
              ${playbackRate}x
            </button>

            <!-- Repeat Mode -->
            <button id="btn-audio-repeat" class="p-1.5 ${repeatMode !== 'none' ? 'text-emerald-600 dark:text-amber-400 font-bold' : 'text-stone-500 dark:text-stone-400'} hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" title="Ulangi (Ayat/Halaman)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            </button>

            <!-- Close / Stop Audio -->
            <button id="btn-audio-close" class="p-1.5 text-stone-500 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors" title="Hentikan & Tutup Audio">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  `;
}
