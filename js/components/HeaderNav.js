/**
 * HEADER NAVIGATION COMPONENT
 * Top navigation bar with official Indonesian Mushaf styling, quick jump, and mode controls
 */

import { CHAPTERS, CHAPTER_MAP } from '../data/chapters.js';
import { JUZS } from '../data/juzs.js';
import { PAGE_MAP } from '../data/pages_index.js';

export function renderHeaderNav(state) {
  const { currentPage, currentSurahId, viewMode, currentTheme } = state;
  const currentSurah = CHAPTER_MAP[currentSurahId] || CHAPTERS[0];
  const pageMeta = PAGE_MAP[currentPage] || { juz: 1 };

  return `
    <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-stone-900/90 border-b border-stone-200/80 dark:border-stone-800 transition-colors shadow-sm">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        <!-- Left: Logo & Brand -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 dark:from-amber-600 dark:to-amber-800 flex items-center justify-center text-amber-300 shadow-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div class="hidden sm:block">
            <h1 class="font-bold text-base md:text-lg leading-tight text-emerald-900 dark:text-amber-400">
              Mushaf Al-Qur'an Indonesia
            </h1>
            <p class="text-[11px] text-stone-500 dark:text-stone-400">
              Standar Kemenag RI • Cetakan 15 Baris
            </p>
          </div>
        </div>

        <!-- Center: Quick Nav (Surah, Juz, Page) -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Surah / Index Picker Button -->
          <button id="btn-open-surah-picker" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm font-medium transition-all">
            <span class="text-emerald-700 dark:text-amber-400 font-bold">${currentSurah.id}.</span>
            <span class="truncate max-w-[90px] sm:max-w-[120px]">${currentSurah.name_simple}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 opacity-60"><path d="M6 9l6 6 6-6"/></svg>
          </button>

          <!-- Page Jump Input -->
          <div class="flex items-center bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2 py-1 text-xs sm:text-sm">
            <span class="text-stone-400 mr-1 hidden xs:inline">Hal.</span>
            <input type="number" 
                   id="page-jump-input" 
                   value="${currentPage}" 
                   min="1" 
                   max="604" 
                   class="w-11 sm:w-14 bg-transparent text-center font-bold text-emerald-900 dark:text-amber-300 focus:outline-none" />
            <span class="text-stone-400 text-[11px]">/ 604</span>
          </div>

          <!-- View Mode Switcher -->
          <div class="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
            <button class="btn-mode px-2.5 py-1 rounded-lg font-medium transition-all ${viewMode === 'page' ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-amber-300 shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'}" 
                    data-mode="page" 
                    title="Mode 1 Halaman Mushaf">
              1 Hal
            </button>
            <button class="btn-mode px-2.5 py-1 rounded-lg font-medium transition-all hidden md:inline-block ${viewMode === 'twopage' ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-amber-300 shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'}" 
                    data-mode="twopage" 
                    title="Mode Kitab 2 Halaman Berdampingan">
              2 Hal
            </button>
            <button class="btn-mode px-2.5 py-1 rounded-lg font-medium transition-all ${viewMode === 'ayah' ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-amber-300 shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'}" 
                    data-mode="ayah" 
                    title="Mode Ayat & Terjemah Kemenag">
              Ayat
            </button>
            <button class="btn-mode px-2.5 py-1 rounded-lg font-medium transition-all ${viewMode === 'hdscan' ? 'bg-white dark:bg-stone-700 text-emerald-800 dark:text-amber-300 shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'}" 
                    data-mode="hdscan" 
                    title="Mode Scan Cetakan HD">
              Scan
            </button>
          </div>
        </div>

        <!-- Right: Utility Actions (Search, Bookmarks, Tajwid, Doa, Settings) -->
        <div class="flex items-center gap-1 sm:gap-1.5">
          <!-- Search -->
          <button id="btn-open-search" class="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Pencarian Cerdas">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 sm:w-5 sm:h-5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>

          <!-- Bookmarks -->
          <button id="btn-open-bookmarks" class="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Penanda & Terakhir Baca">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 sm:w-5 sm:h-5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>

          <!-- Doa & Tajwid Dropdown Menu -->
          <button id="btn-open-doas" class="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors hidden sm:inline-flex" title="Doa Khatam & Doa Quran">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 sm:w-5 sm:h-5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </button>

          <!-- Settings -->
          <button id="btn-open-settings" class="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Pengaturan Tampilan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 sm:w-5 sm:h-5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </button>
        </div>

      </div>
    </header>
  `;
}
