/**
 * MODALS & DRAWERS COMPONENT
 * Handles Surah Picker, Search, Bookmarks, Doa, Tajwid Guide, Settings & Word Popover
 */

import { CHAPTERS } from '../data/chapters.js';
import { JUZS } from '../data/juzs.js';
import { DOAS } from '../data/doas.js';
import { TAJWID_RULES } from '../data/tajwid_rules.js';
import { RECITERS } from '../services/audio.js';

export function renderSurahPickerModal(currentSurahId) {
  return `
    <div id="modal-surah-picker" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        
        <!-- Modal Header & Tabs -->
        <div class="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">Pilih Surah & Juz</h2>
            <button class="modal-close p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Tabs: Surah vs Juz -->
          <div class="flex gap-2">
            <button id="tab-surah" class="flex-1 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-700 dark:bg-amber-600 text-white shadow-sm">
              114 Surah
            </button>
            <button id="tab-juz" class="flex-1 py-2 rounded-xl text-sm font-semibold transition-all bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200">
              30 Juz
            </button>
          </div>

          <!-- Search filter for Surahs -->
          <div class="mt-3 relative" id="surah-filter-container">
            <input type="text" 
                   id="surah-search-filter" 
                   placeholder="Cari nama surah atau arti..." 
                   class="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-amber-500 text-stone-900 dark:text-stone-100" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-stone-400 absolute left-3 top-2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>

        <!-- Tab 1: Surah List -->
        <div id="tab-content-surah" class="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${CHAPTERS.map(ch => `
            <div class="surah-item flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${ch.id === currentSurahId ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 ring-1 ring-amber-400' : 'border-stone-200/70 dark:border-stone-800 hover:border-emerald-500 hover:bg-stone-50 dark:hover:bg-stone-800/60'}"
                 data-surah-id="${ch.id}" 
                 data-start-page="${ch.pages[0]}"
                 data-name="${ch.name_simple.toLowerCase()}" 
                 data-meaning="${ch.translated_name.name.toLowerCase()}">
              
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-xl bg-stone-100 dark:bg-stone-800 text-emerald-800 dark:text-amber-400 font-bold text-xs flex items-center justify-center">
                  ${ch.id}
                </span>
                <div>
                  <h4 class="font-bold text-sm text-stone-900 dark:text-stone-100">${ch.name_simple}</h4>
                  <p class="text-xs text-stone-500 truncate max-w-[140px]">${ch.translated_name.name}</p>
                </div>
              </div>

              <div class="text-right">
                <span class="font-arabic font-bold text-lg text-emerald-900 dark:text-amber-300 block">${ch.name_arabic}</span>
                <span class="text-[11px] text-stone-400">${ch.verses_count} Ayat • Hal. ${ch.pages[0]}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Tab 2: Juz List (Hidden by default) -->
        <div id="tab-content-juz" class="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 hidden">
          ${JUZS.map(j => `
            <div class="juz-item flex items-center justify-between p-3.5 rounded-2xl border border-stone-200/70 dark:border-stone-800 hover:border-emerald-500 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-all cursor-pointer"
                 data-start-page="${j.start_page}">
              
              <div class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-amber-400 font-bold text-sm flex items-center justify-center">
                  ${j.juz_number}
                </span>
                <div>
                  <h4 class="font-bold text-sm text-stone-900 dark:text-stone-100">Juz ${j.juz_number}</h4>
                  <p class="text-xs text-stone-500">${j.first_surah_name_simple} (${j.start_verse_key})</p>
                </div>
              </div>

              <div class="text-right">
                <span class="text-xs font-semibold text-amber-700 dark:text-amber-400">Halaman ${j.start_page}</span>
                <span class="text-[11px] text-stone-400 block">${j.end_page - j.start_page + 1} Halaman</span>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;
}

export function renderSearchModal() {
  return `
    <div id="modal-search" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        
        <div class="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-bold text-stone-900 dark:text-stone-100">Pencarian Al-Qur'an & Terjemahan</h2>
            <button class="modal-close p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="relative">
            <input type="text" 
                   id="search-input-field" 
                   placeholder="Ketik kata kunci (misal: shalat, sabar, surga, kursi)..." 
                   class="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-amber-500 text-stone-900 dark:text-stone-100 text-sm font-medium" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </div>

        <div id="search-results-container" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <div class="text-center py-10 text-stone-400 text-sm">
            Ketik kata kunci untuk mencari ayat Al-Qur'an dan terjemahan resmi Kemenag RI.
          </div>
        </div>

      </div>
    </div>
  `;
}

export function renderBookmarksDrawer(bookmarks, lastRead) {
  return `
    <div id="modal-bookmarks" class="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-stone-900 shadow-2xl border-l border-stone-200 dark:border-stone-800 w-full max-w-md h-full flex flex-col overflow-hidden animate-slide-left">
        
        <div class="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h2 class="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-amber-500"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            Penanda & Terakhir Baca
          </h2>
          <button class="modal-close p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-6">
          
          <!-- Last Read Card -->
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Terakhir Dibaca</h3>
            ${lastRead ? `
              <div class="last-read-card p-4 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-md cursor-pointer hover:opacity-95 transition-all"
                   data-page="${lastRead.page}">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-emerald-200">Halaman ${lastRead.page} • Juz ${lastRead.juz}</span>
                  <span class="text-xs bg-emerald-700/60 px-2 py-0.5 rounded-full font-medium">Lanjutkan</span>
                </div>
                <h4 class="font-bold text-base text-amber-300">${lastRead.surahName}</h4>
                <p class="text-xs text-emerald-100 mt-1">${lastRead.timestamp || 'Baru saja'}</p>
              </div>
            ` : `
              <p class="text-xs text-stone-400 italic">Belum ada riwayat bacaan.</p>
            `}
          </div>

          <!-- Bookmarked Verses -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xs font-bold uppercase tracking-wider text-stone-400">Daftar Bookmark (${bookmarks.length})</h3>
            </div>
            
            ${bookmarks.length > 0 ? `
              <div class="space-y-2">
                ${bookmarks.map(bm => `
                  <div class="bookmark-item flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 transition-all cursor-pointer"
                       data-verse-key="${bm.verseKey}"
                       data-page="${bm.page}">
                    <div>
                      <h4 class="font-bold text-sm text-stone-900 dark:text-stone-100">${bm.surahName} : Ayat ${bm.verseNumber}</h4>
                      <p class="text-xs text-stone-500">Hal. ${bm.page} • ${bm.time}</p>
                    </div>
                    <button class="btn-delete-bookmark p-1.5 rounded-lg text-stone-400 hover:text-red-500" data-verse-key="${bm.verseKey}">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p class="text-xs text-stone-400 italic">Belum ada ayat yang ditandai.</p>
            `}
          </div>

        </div>

      </div>
    </div>
  `;
}

export function renderDoasModal() {
  return `
    <div id="modal-doas" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        
        <div class="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h2 class="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            Doa Khatam Al-Qur'an & Doa Pilihan
          </h2>
          <button class="modal-close p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-6">
          ${DOAS.map(doa => `
            <div class="doa-card p-5 rounded-2xl bg-stone-50/80 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-emerald-800 dark:text-amber-400 text-sm md:text-base">${doa.title}</h3>
                <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">${doa.category}</span>
              </div>
              <p class="font-arabic text-xl md:text-2xl text-right leading-loose my-3 text-stone-900 dark:text-stone-50" dir="rtl">${doa.arabic}</p>
              <p class="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 italic my-2">${doa.latin}</p>
              <p class="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mt-2 pt-2 border-t border-stone-200 dark:border-stone-800">${doa.translation}</p>
            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;
}

export function renderTajwidModal() {
  return `
    <div id="modal-tajwid" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        
        <div class="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h2 class="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            Panduan Hukum Tajwid
          </h2>
          <button class="modal-close p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${TAJWID_RULES.map(rule => `
            <div class="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-3.5 h-3.5 rounded-full" style="background-color: ${rule.color};"></span>
                <h3 class="font-bold text-sm text-stone-900 dark:text-stone-100">${rule.name}</h3>
              </div>
              <p class="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-3">${rule.description}</p>
              <div class="bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-800 text-center font-arabic text-lg text-emerald-800 dark:text-amber-400">
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
  const { currentTheme, fontType, fontScale, showWBW, showTranslation, selectedReciterId } = state;

  return `
    <div id="modal-settings" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-scale-in">
        
        <div class="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h2 class="text-lg font-bold text-stone-900 dark:text-stone-100">Pengaturan Tampilan</h2>
          <button class="modal-close p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-6">
          
          <!-- Theme Selection -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Tema Mushaf</label>
            <div class="grid grid-cols-2 gap-2">
              <button class="btn-theme-select p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${currentTheme === 'paper' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300' : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'}" data-theme="paper">
                <span class="w-4 h-4 rounded-full bg-[#fbf9f4] border border-[#d9cbb2]"></span>
                Kertas Mushaf (Klasik)
              </button>
              <button class="btn-theme-select p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${currentTheme === 'light' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300' : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'}" data-theme="light">
                <span class="w-4 h-4 rounded-full bg-white border border-stone-300"></span>
                Clean White
              </button>
              <button class="btn-theme-select p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${currentTheme === 'dark-emerald' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300' : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'}" data-theme="dark-emerald">
                <span class="w-4 h-4 rounded-full bg-[#0a1411] border border-[#24443a]"></span>
                Emerald Dark
              </button>
              <button class="btn-theme-select p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${currentTheme === 'midnight' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300' : 'border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'}" data-theme="midnight">
                <span class="w-4 h-4 rounded-full bg-black border border-stone-800"></span>
                OLED Midnight
              </button>
            </div>
          </div>

          <!-- Font Type -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Jenis Font Al-Qur'an</label>
            <select id="select-font-type" class="w-full p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border-none text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600">
              <option value="v2" ${fontType === 'v2' ? 'selected' : ''}>QCF V2 (Standar Madinah & Quran.com)</option>
              <option value="v1" ${fontType === 'v1' ? 'selected' : ''}>QCF V1 (King Fahd Complex Font)</option>
              <option value="lpmq" ${fontType === 'lpmq' ? 'selected' : ''}>LPMQ Isep Misbah (Standar Kemenag RI)</option>
              <option value="uthmanic" ${fontType === 'uthmanic' ? 'selected' : ''}>KFGQPC Uthman Taha Naskh</option>
            </select>
          </div>

          <!-- Qari Selection -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Pilihan Qari Murottal</label>
            <select id="select-qari" class="w-full p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border-none text-xs sm:text-sm font-medium text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-600">
              ${RECITERS.map(r => `
                <option value="${r.id}" ${r.id === selectedReciterId ? 'selected' : ''}>
                  ${r.name} (${r.subtext})
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Toggle Options -->
          <div class="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm font-medium text-stone-800 dark:text-stone-200">Terjemahan Per Kata (Word-by-word)</span>
              <input type="checkbox" id="toggle-wbw" class="w-5 h-5 accent-emerald-600 rounded" ${showWBW ? 'checked' : ''} />
            </label>
            <label class="flex items-center justify-between cursor-pointer">
              <span class="text-sm font-medium text-stone-800 dark:text-stone-200">Tampilkan Terjemah Kemenag RI</span>
              <input type="checkbox" id="toggle-translation" class="w-5 h-5 accent-emerald-600 rounded" ${showTranslation ? 'checked' : ''} />
            </label>
          </div>

        </div>

      </div>
    </div>
  `;
}
