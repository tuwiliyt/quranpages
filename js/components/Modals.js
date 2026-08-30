/**
 * MODAL DIALOGS COMPONENT (ACCESSIBLE, INTUITIVE & SMOOTH SCROLLING)
 */

import { CHAPTERS } from '../data/chapters.js';
import { JUZS } from '../data/juzs.js';
import { DOAS } from '../data/doas.js';
import { TAJWID_RULES } from '../data/tajwid_rules.js';
import { RECITERS } from '../services/audio.js';

export function renderSurahPickerModal(currentSurahId) {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-2xl  flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-scale-in" style="max-height: 88vh; height: 85vh;">
        
        <!-- Header & Tabs (Fixed Top) -->
        <div class="p-4 border-b border-stone-200 dark:border-stone-800 flex flex-col gap-3 flex-shrink-0 bg-white dark:bg-stone-900">
          <div class="flex items-center justify-between">
            <h2 class="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-emerald-700 dark:text-amber-400"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <span>Daftar Surah & Juz</span>
            </h2>
            <button class="modal-close p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl text-xs font-semibold">
            <button id="tab-surah" class="flex-1 py-2 rounded-xl bg-emerald-700 dark:bg-amber-600 text-white transition-all text-center">
              114 Surah
            </button>
            <button id="tab-juz" class="flex-1 py-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-all text-center">
              30 Juz
            </button>
          </div>

          <!-- Search filter for surahs -->
          <div id="surah-filter-container" class="relative">
            <input id="surah-search-filter" type="text" placeholder="Cari nama surah atau arti..."
                   class="w-full bg-stone-100 dark:bg-stone-800 px-3.5 py-2 pl-9 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-stone-400 absolute left-3 top-2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
        </div>

        <!-- Scrollable Content Lists -->
        <div class="overflow-y-auto modal-scrollable p-3 sm:p-4 flex-1 min-h-0" style="overflow-y: auto;  min-height: 0;">
          <!-- 114 Surahs Grid -->
          <div id="tab-content-surah" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${CHAPTERS.map(ch => `
              <div class="surah-item p-2.5 sm:p-3 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-amber-500 cursor-pointer flex items-center justify-between transition-all group active:scale-[0.98] ${ch.id === currentSurahId ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm' : 'hover:bg-stone-50 dark:hover:bg-stone-800/50'}"
                   data-id="${ch.id}" data-start-page="${ch.pages[0]}" data-name="${ch.name_simple.toLowerCase()}" data-meaning="${ch.translated_name.name.toLowerCase()}">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg ${ch.id === currentSurahId ? 'bg-emerald-700 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'} group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors">
                    ${ch.id}
                  </div>
                  <div>
                    <h4 class="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">${ch.name_simple}</h4>
                    <p class="text-[10px] sm:text-xs text-stone-500">${ch.translated_name.name} • ${ch.verses_count} Ayat</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="font-arabic text-sm sm:text-base font-bold text-emerald-800 dark:text-amber-400">${ch.name_arabic}</span>
                  <span class="block text-[10px] text-stone-400">Hal. ${ch.pages[0]}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- 30 Juzs Grid -->
          <div id="tab-content-juz" class="hidden grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${JUZS.map(j => `
              <div class="juz-item p-3 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-amber-500 cursor-pointer flex items-center justify-between transition-all group active:scale-[0.98] hover:bg-stone-50 dark:hover:bg-stone-800/50"
                   data-juz="${j.juz_number}" data-start-page="${j.start_page}">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center font-bold text-xs transition-colors">
                    ${j.juz_number}
                  </div>
                  <div>
                    <h4 class="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">Juz ${j.juz_number} — ${j.first_surah_name_simple}</h4>
                    <p class="text-[10px] text-stone-500">Ayat ${j.start_verse_key} • Hal. ${j.start_page} - ${j.end_page}</p>
                  </div>
                </div>
                <div class="text-right flex flex-col items-end gap-0.5">
                  <span class="font-arabic text-sm text-emerald-800 dark:text-amber-400">${j.first_surah_name_arabic}</span>
                  <span class="text-[10px] font-semibold text-emerald-700 dark:text-amber-400">Buka Juz</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;
}

export function renderSearchModal() {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-xl  flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-scale-in" style="max-height: 88vh; height: 85vh;">
        
        <div class="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-stone-900">
          <div class="flex items-center gap-2 flex-1 mr-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-emerald-700 dark:text-amber-400"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input id="search-input-field" type="text" placeholder="Ketik kata kunci terjemahan, nama surah, atau ayat..."
                   class="w-full bg-transparent text-sm sm:text-base font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none" autofocus />
          </div>
          <button class="modal-close p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div id="search-results-container" class="overflow-y-auto modal-scrollable p-4 flex-1 min-h-0 flex flex-col gap-2.5" style="overflow-y: auto;  min-height: 0;">
          <div class="text-center py-10 text-stone-400 text-xs sm:text-sm">
            Ketik minimal 2 huruf untuk memulai pencarian cerdas Al-Qur'an.
          </div>
        </div>

      </div>
    </div>
  `;
}

export function renderBookmarksDrawer(bookmarks, lastRead) {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-stone-900 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-stone-200 dark:border-stone-800 animate-slide-left overflow-hidden">
        
        <div class="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-stone-900">
          <h2 class="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-amber-500"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span>Penanda & Terakhir Baca</span>
          </h2>
          <button class="modal-close p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="overflow-y-auto modal-scrollable p-4 flex-1 min-h-0 flex flex-col gap-4" style="overflow-y: auto;  min-height: 0;">
          
          <!-- Last Read Card -->
          <div>
            <h3 class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Terakhir Dibaca</h3>
            ${lastRead ? `
              <div class="last-read-card p-4 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-between"
                   data-page="${lastRead.page}">
                <div>
                  <span class="text-[10px] uppercase font-bold text-emerald-300">Juz ${lastRead.juz}</span>
                  <h4 class="text-base font-bold">${lastRead.surahName}</h4>
                  <p class="text-xs text-emerald-200">Halaman ${lastRead.page} • ${lastRead.timestamp}</p>
                </div>
                <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            ` : `
              <div class="p-4 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-center text-xs text-stone-400">
                Belum ada riwayat baca.
              </div>
            `}
          </div>

          <!-- Bookmarks List -->
          <div class="flex-1">
            <h3 class="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Daftar Bookmark Ayat (${bookmarks.length})</h3>
            ${bookmarks.length > 0 ? `
              <div class="flex flex-col gap-2">
                ${bookmarks.map(b => `
                  <div class="bookmark-item p-3 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-500 cursor-pointer flex items-center justify-between transition-all group hover:bg-stone-50 dark:hover:bg-stone-800/50"
                       data-page="${b.page}">
                    <div>
                      <h4 class="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">${b.surahName} : Ayat ${b.verseNumber}</h4>
                      <p class="text-[10px] text-stone-500">Hal. ${b.page} • Disimpan ${b.time}</p>
                    </div>
                    <button class="btn-delete-bookmark p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" data-verse-key="${b.verseKey}" title="Hapus Bookmark">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="p-6 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 text-center text-xs text-stone-400">
                Klik nomor ayat pada halaman untuk menyimpannya ke bookmark.
              </div>
            `}
          </div>

        </div>

      </div>
    </div>
  `;
}

export function renderDoasModal(fromSettings = false) {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in" id="modal-doas-container">
      <div class="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-2xl  flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-scale-in" style="max-height: 88vh; height: 85vh;">
        
        <!-- Header (Fixed Top) -->
        <div class="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-stone-900 z-10">
          <div class="flex items-center gap-2">
            ${fromSettings ? `
              <button id="btn-back-to-settings" class="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors mr-1" title="Kembali ke Pengaturan">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            ` : ''}
            <h2 class="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-emerald-700 dark:text-amber-400"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <span>Doa Khotmil Qur'an & Doa Pilihan</span>
            </h2>
          </div>
          <button class="modal-close p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Scrollable Content Body (Full Touch & Mouse Wheel Scroll) -->
        <div class="modal-scrollable p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-4" style="overflow-y: scroll !important;  min-height: 0;">
          ${DOAS.map(doa => `
            <div class="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 flex flex-col gap-2.5 shadow-sm flex-shrink-0">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-sm sm:text-base text-emerald-800 dark:text-amber-400">${doa.title}</h3>
                <span class="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">${doa.category}</span>
              </div>
              <p class="font-arabic text-xl sm:text-2xl text-stone-900 dark:text-stone-100 text-right leading-loose py-2">${doa.arabic}</p>
              <p class="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300 italic leading-relaxed">${doa.latin}</p>
              <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">${doa.translation}</p>
            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;
}

export function renderTajwidModal(fromSettings = false) {
  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in" id="modal-tajwid-container">
      <div class="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-2xl  flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-scale-in" style="max-height: 88vh; height: 85vh;">
        
        <!-- Header (Fixed Top) -->
        <div class="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-stone-900 z-10">
          <div class="flex items-center gap-2">
            ${fromSettings ? `
              <button id="btn-back-to-settings" class="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors mr-1" title="Kembali ke Pengaturan">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            ` : ''}
            <h2 class="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-amber-500"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span>Panduan Hukum Tajwid</span>
            </h2>
          </div>
          <button class="modal-close p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Scrollable Content Body (Full Touch & Mouse Wheel Scroll) -->
        <div class="modal-scrollable p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-3" style="overflow-y: scroll !important;  min-height: 0;">
          ${TAJWID_RULES.map(rule => `
            <div class="p-3.5 sm:p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col gap-2 bg-stone-50/50 dark:bg-stone-800/40 shadow-sm flex-shrink-0">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">${rule.name}</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold" style="background-color: ${rule.color}25; color: ${rule.color};">
                  ${rule.name}
                </span>
              </div>
              <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">${rule.description}</p>
              <div class="bg-white dark:bg-stone-900 p-2.5 rounded-xl font-arabic text-lg sm:text-xl text-stone-900 dark:text-stone-100 text-right border border-stone-150 dark:border-stone-800 tracking-wide">
                ${rule.example}
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;
}

export function renderSettingsModal(state) {
  const { currentTheme, fontType, selectedReciterId, showWBW, showTranslation } = state;

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div class="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-md  flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-scale-in" style="max-height: 88vh; height: 85vh;">
        
        <div class="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-stone-900">
          <h2 class="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-emerald-700 dark:text-amber-400"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Pengaturan Tampilan & Audio</span>
          </h2>
          <button class="modal-close p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="overflow-y-auto modal-scrollable p-4 flex-1 min-h-0 flex flex-col gap-4 text-xs sm:text-sm" style="overflow-y: auto;  min-height: 0;">
          
          <!-- Theme Selection -->
          <div>
            <label class="block font-bold text-stone-700 dark:text-stone-300 mb-2">Pilihan Tema</label>
            <div class="grid grid-cols-2 gap-2">
              <button class="btn-theme-select p-2.5 rounded-xl border ${currentTheme === 'paper' ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold' : 'border-stone-200 dark:border-stone-800'} text-left font-medium active:scale-95 transition-all" data-theme="paper">
                📜 Kertas Mushaf (Default)
              </button>
              <button class="btn-theme-select p-2.5 rounded-xl border ${currentTheme === 'light' ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-bold' : 'border-stone-200 dark:border-stone-800'} text-left font-medium active:scale-95 transition-all" data-theme="light">
                ⚪ Clean White
              </button>
              <button class="btn-theme-select p-2.5 rounded-xl border ${currentTheme === 'dark-emerald' ? 'border-amber-600 bg-emerald-950/40 text-amber-300 font-bold' : 'border-stone-200 dark:border-stone-800'} text-left font-medium active:scale-95 transition-all" data-theme="dark-emerald">
                🌲 Dark Emerald
              </button>
              <button class="btn-theme-select p-2.5 rounded-xl border ${currentTheme === 'midnight' ? 'border-amber-600 bg-stone-950 text-amber-300 font-bold' : 'border-stone-200 dark:border-stone-800'} text-left font-medium active:scale-95 transition-all" data-theme="midnight">
                🌑 OLED Midnight
              </button>
            </div>
          </div>

          <!-- Font Type -->
          <div>
            <label class="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">Standar Kaligrafi / Font</label>
            <select id="select-font-type" class="w-full bg-stone-100 dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="v2" ${fontType === 'v2' ? 'selected' : ''}>Standar Madinah (King Fahd QCF V2 - Rekomendasi)</option>
              <option value="v1" ${fontType === 'v1' ? 'selected' : ''}>Standar Madinah (King Fahd QCF V1)</option>
              <option value="lpmq" ${fontType === 'lpmq' ? 'selected' : ''}>Standar Indonesia (LPMQ Kemenag RI)</option>
              <option value="uthmanic" ${fontType === 'uthmanic' ? 'selected' : ''}>Utsmani Naskh (KFGQPC)</option>
            </select>
          </div>

          <!-- Qari Selection -->
          <div>
            <label class="block font-bold text-stone-700 dark:text-stone-300 mb-1.5">Pilihan Qari Audio Murottal</label>
            <select id="select-qari" class="w-full bg-stone-100 dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              ${RECITERS.map(r => `
                <option value="${r.id}" ${r.id === selectedReciterId ? 'selected' : ''}>${r.name} (${r.subtext})</option>
              `).join('')}
            </select>
          </div>

          <!-- Toggles -->
          <div class="flex flex-col gap-2.5 pt-2 border-t border-stone-200 dark:border-stone-800">
            <label class="flex items-center justify-between cursor-pointer">
              <span class="font-medium text-stone-700 dark:text-stone-300">Tampilkan Arti Perkata (WBW)</span>
              <input type="checkbox" id="toggle-wbw" class="w-4 h-4 text-emerald-600 rounded" ${showWBW ? 'checked' : ''} />
            </label>

            <label class="flex items-center justify-between cursor-pointer">
              <span class="font-medium text-stone-700 dark:text-stone-300">Tampilkan Terjemahan Kemenag</span>
              <input type="checkbox" id="toggle-translation" class="w-4 h-4 text-emerald-600 rounded" ${showTranslation ? 'checked' : ''} />
            </label>
          </div>

          <!-- Extra Shortcuts in Settings -->
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <button id="btn-open-tajwid-from-settings" class="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-transparent hover:border-amber-500/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-amber-500"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span>Panduan Tajwid</span>
            </button>

            <button id="btn-open-doas-from-settings" class="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-stone-800 dark:text-stone-200 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-transparent hover:border-emerald-500/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-emerald-600"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <span>Doa Khatam</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  `;
}
