/**
 * HEADER NAVIGATION COMPONENT (RESPONSIVE & FULLY INTERACTIVE)
 */

import { CHAPTER_MAP } from '../data/chapters.js';
import { JUZ_MAP } from '../data/juzs.js';

export function renderHeaderNav(state) {
  const { currentPage, currentSurahId, currentJuz, viewMode } = state;
  const currentSurah = CHAPTER_MAP[currentSurahId] || { name_simple: 'Al-Fatihah', name_arabic: 'الفاتحة' };

  return `
    <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 transition-colors shadow-sm select-none">
      <div class="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        
        <!-- Left: Logo & Quick Surah/Juz Selector Button -->
        <div class="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <button id="btn-open-surah-picker" class="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 active:scale-95 transition-all text-left group border border-transparent hover:border-emerald-500/30">
            <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:bg-emerald-600 transition-colors">
              ${currentSurahId}
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-1">
                <span class="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-amber-400 truncate max-w-[100px] sm:max-w-[140px]">
                  ${currentSurah.name_simple}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 transition-transform group-hover:translate-y-0.5"><path d="M19 9l-7 7-7-7"/></svg>
              </div>
              <span class="text-[10px] text-stone-500 font-medium">Juz ${currentJuz} • Hal. ${currentPage}</span>
            </div>
          </button>
        </div>

        <!-- Center: 4 Reading Mode Switchers -->
        <div class="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold">
          <button class="btn-mode px-2 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 ${viewMode === 'page' ? 'bg-white dark:bg-stone-900 shadow-sm text-emerald-800 dark:text-amber-400 font-bold' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}" data-mode="page" title="Mode 1 Halaman Mushaf (15 Baris)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span class="hidden md:inline">1 Halaman</span>
          </button>
          
          <button class="btn-mode px-2 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 ${viewMode === 'twopage' ? 'bg-white dark:bg-stone-900 shadow-sm text-emerald-800 dark:text-amber-400 font-bold' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}" data-mode="twopage" title="Mode 2 Halaman Kitab Berdampingan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span class="hidden md:inline">2 Halaman</span>
          </button>

          <button class="btn-mode px-2 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 ${viewMode === 'ayah' ? 'bg-white dark:bg-stone-900 shadow-sm text-emerald-800 dark:text-amber-400 font-bold' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}" data-mode="ayah" title="Mode Ayat & Terjemahan Kemenag RI">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
            <span class="hidden md:inline">Per-Ayat</span>
          </button>

          <button class="btn-mode px-2 sm:px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 active:scale-95 ${viewMode === 'hdscan' ? 'bg-white dark:bg-stone-900 shadow-sm text-emerald-800 dark:text-amber-400 font-bold' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}" data-mode="hdscan" title="Mode Pindaian Scan Cetakan HD">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            <span class="hidden md:inline">Scan HD</span>
          </button>
        </div>

        <!-- Right: Actions Menu (Search, Bookmark, Doa, Settings) -->
        <div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <!-- Page Jump Input (Tablet & Desktop) -->
          <div class="hidden lg:flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-xl text-xs border border-stone-200 dark:border-stone-700">
            <span class="text-stone-400 font-medium">Hal:</span>
            <input id="page-jump-input" type="number" min="1" max="604" value="${currentPage}"
                   class="w-12 bg-transparent text-center font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:text-emerald-700" title="Ketik nomor halaman lalu tekan Enter" />
          </div>

          <!-- Search Button -->
          <button id="btn-open-search" class="p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-90 transition-all" title="Pencarian Surah & Terjemahan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>

          <!-- Bookmarks Button -->
          <button id="btn-open-bookmarks" class="p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-90 transition-all relative" title="Penanda Terakhir Baca & Bookmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-amber-600 dark:text-amber-400"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>

          <!-- Doas Button -->
          <button id="btn-open-doas" class="hidden sm:inline-flex p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-90 transition-all" title="Doa Khatam & Doa Pilihan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-emerald-700 dark:text-emerald-400"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </button>

          <!-- Settings Button -->
          <button id="btn-open-settings" class="p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-90 transition-all" title="Pengaturan Font, Qari & Tema">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>

      </div>
    </header>
  `;
}
