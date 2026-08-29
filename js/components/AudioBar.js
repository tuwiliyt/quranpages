/**
 * AUDIO PLAYER BAR COMPONENT
 * Floating bottom bar for Murottal playback with real-time sync
 */

import { RECITERS, audioService } from '../services/audio.js';
import { CHAPTER_MAP } from '../data/chapters.js';

export function renderAudioBar(state) {
  const { currentAudioVerse, isAudioPlaying, selectedReciterId, repeatMode, playbackRate, audioProgress } = state;
  if (!currentAudioVerse && !isAudioPlaying) return '';

  let surahTitle = 'Al-Qur\'an';
  let verseNum = '';
  if (currentAudioVerse) {
    const [sId, aNum] = currentAudioVerse.split(':');
    const ch = CHAPTER_MAP[sId];
    if (ch) surahTitle = `Surah ${ch.name_simple}`;
    verseNum = `Ayat ${aNum}`;
  }

  const selectedReciter = RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];

  return `
    <div id="audio-player-bar" class="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 md:left-auto md:right-6 md:w-[460px] z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 p-3 sm:p-4 transition-all animate-bounce-short">
      
      <!-- Progress Bar (Scrubber) -->
      <div class="relative w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full mb-3 cursor-pointer overflow-hidden group" id="audio-scrubber">
        <div class="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all" style="width: ${audioProgress?.percent || 0}%;"></div>
      </div>

      <div class="flex items-center justify-between gap-2">
        
        <!-- Left: Surah & Qari info -->
        <div class="flex flex-col min-w-0 pr-2">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">${surahTitle}</span>
            <span class="text-xs text-amber-600 dark:text-amber-400 font-semibold">${verseNum}</span>
          </div>
          <span class="text-[11px] text-stone-500 dark:text-stone-400 truncate">${selectedReciter.name}</span>
        </div>

        <!-- Center: Playback Controls -->
        <div class="flex items-center gap-1.5">
          <!-- Prev Verse -->
          <button id="btn-audio-prev" class="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Ayat Sebelumnya">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
          </button>

          <!-- Play / Pause -->
          <button id="btn-audio-toggle" class="p-2.5 rounded-xl bg-emerald-700 dark:bg-amber-600 text-white hover:opacity-90 shadow-md transition-transform active:scale-95" title="${isAudioPlaying ? 'Jeda' : 'Putar'}">
            ${isAudioPlaying ? `
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ` : `
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M8 5v14l11-7z"/></svg>
            `}
          </button>

          <!-- Next Verse -->
          <button id="btn-audio-next" class="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Ayat Berikutnya">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
          </button>
        </div>

        <!-- Right: Settings (Speed, Repeat, Close) -->
        <div class="flex items-center gap-1">
          <!-- Speed -->
          <button id="btn-audio-speed" class="px-1.5 py-1 text-[11px] font-bold rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300" title="Kecepatan">
            ${playbackRate}x
          </button>

          <!-- Repeat Mode -->
          <button id="btn-audio-repeat" class="p-1.5 rounded-lg ${repeatMode !== 'none' ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/50' : 'text-stone-400 hover:text-stone-600'}" title="Ulangi: ${repeatMode}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
          </button>

          <!-- Close Player -->
          <button id="btn-audio-close" class="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200" title="Tutup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

      </div>
    </div>
  `;
}
