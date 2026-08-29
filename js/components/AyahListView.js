/**
 * AYAH BY AYAH VIEW (Mode Terjemah & Tafsir Lengkap)
 * Displays verses with Indonesian Kemenag Translation, Word-by-Word interactive cards, and audio
 */

import { audioService } from '../services/audio.js';

export function renderAyahListView(versesData, options = {}) {
  const {
    activeVerseKey = null,
    showWBW = true,
    showLatin = true,
    showTranslation = true,
    fontScale = 1.0
  } = options;

  let html = `
    <div class="ayah-list-container space-y-6 w-full max-w-4xl mx-auto px-2 md:px-4">
  `;

  versesData.forEach((verse) => {
    const isVerseActive = (activeVerseKey === verse.verse_key);
    const translationText = verse.translations?.[0]?.text || '';
    const words = verse.words || [];

    html += `
      <div class="ayah-card bg-white dark:bg-stone-900 rounded-2xl p-5 md:p-7 shadow-sm hover:shadow-md transition-all border ${isVerseActive ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-stone-200/80 dark:border-stone-800'}" 
           id="ayah-card-${verse.verse_key}">
        
        <!-- Ayah Card Header -->
        <div class="flex items-center justify-between pb-4 mb-5 border-b border-stone-100 dark:border-stone-800 text-sm">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
              ${verse.verse_key}
            </span>
            <span class="text-xs text-stone-500">Hal. ${verse.page_number} • Juz ${verse.juz_number}</span>
          </div>

          <!-- Quick Action Buttons -->
          <div class="flex items-center gap-1.5">
            <button class="btn-play-ayah p-2 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                    data-verse-key="${verse.verse_key}" 
                    title="Putar Audio Ayat">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <button class="btn-bookmark-ayah p-2 rounded-lg text-stone-500 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    data-verse-key="${verse.verse_key}" 
                    data-surah="${verse.chapter_id}" 
                    data-ayah="${verse.verse_number}"
                    title="Simpan Bookmark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
            <button class="btn-copy-ayah p-2 rounded-lg text-stone-500 hover:text-emerald-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    data-arabic="${encodeURIComponent(verse.text_uthmani || '')}"
                    data-trans="${encodeURIComponent(translationText)}"
                    title="Salin Ayat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
        </div>

        <!-- Arabic Text (Full Verse) -->
        <div class="ayah-arabic-text text-right font-arabic leading-loose text-2xl md:text-3xl text-stone-900 dark:text-stone-50 my-3" 
             dir="rtl">
          ${verse.text_uthmani || verse.words.map(w => w.text_uthmani || w.text).join(' ')}
          <span class="ayah-end-glyph inline-block align-middle mr-2 text-amber-600">
            <span class="inline-flex items-center justify-center w-7 h-7 border border-amber-600/70 rounded-full text-xs font-sans text-emerald-800 dark:text-amber-300">
              ${verse.verse_number}
            </span>
          </span>
        </div>

        <!-- Word By Word Interactive Pills -->
        ${showWBW ? `
          <div class="wbw-container flex flex-wrap flex-row-reverse gap-2 my-5 p-3 rounded-xl bg-stone-50/80 dark:bg-stone-950/40 border border-stone-100 dark:border-stone-800" dir="rtl">
            ${words.filter(w => w.char_type_name === 'word').map(word => `
              <div class="wbw-card flex flex-col items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 hover:border-amber-400 hover:shadow-sm cursor-pointer transition-all"
                   data-audio="${word.audio_url || ''}"
                   onclick="window.playWordAudio('${word.audio_url || ''}')"
                   title="Klik untuk dengar audio kata">
                <span class="font-arabic text-lg md:text-xl text-stone-800 dark:text-stone-100 mb-1">${word.text_uthmani || word.text}</span>
                <span class="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium dir-ltr">${word.transliteration?.text || ''}</span>
                <span class="text-[11px] text-stone-500 dark:text-stone-400 text-center max-w-[90px] dir-ltr mt-0.5">${word.translation?.text || ''}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Indonesian Translation (Kemenag RI) -->
        ${showTranslation ? `
          <div class="translation-box mt-4 pt-4 border-t border-stone-100 dark:border-stone-800/80">
            <p class="text-stone-700 dark:text-stone-300 text-sm md:text-base leading-relaxed">
              ${translationText}
            </p>
            <span class="inline-block mt-1 text-[11px] text-stone-400">
              — Terjemahan Kementerian Agama RI
            </span>
          </div>
        ` : ''}

      </div>
    `;
  });

  html += `</div>`;
  return html;
}
