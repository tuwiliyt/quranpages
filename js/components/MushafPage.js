/**
 * MUSHAF PAGE COMPONENT (15 Lines Exact Printed Mushaf Layout)
 * Implements the official line-by-line grouping and King Fahd QCF glyph rendering from Quran.com
 */

import { CHAPTER_MAP } from '../data/chapters.js';
import { PAGE_MAP } from '../data/pages_index.js';
import { loadPageFont } from '../services/api.js';

export function groupLinesByVerses(verses, targetPageNumber = null) {
  const linesMap = {};
  
  verses.forEach((verse) => {
    const words = verse.words || [];
    words.forEach((word) => {
      // Prevent cross-page bleeding if API returns overlapping verses
      if (targetPageNumber && word.page_number && word.page_number !== targetPageNumber) {
        return;
      }
      
      const lineNum = word.line_number || 1;
      const key = `Line-${lineNum}`;
      if (!linesMap[key]) {
        linesMap[key] = [];
      }
      linesMap[key].push({
        ...word,
        verseKey: verse.verse_key,
        verseNumber: verse.verse_number,
        chapterId: verse.chapter_id,
        translationText: verse.translations?.[0]?.text
      });
    });
  });

  return linesMap;
}

export function renderMushafPage(pageNumber, versesData, options = {}) {
  const {
    fontType = 'v2', // 'v2' | 'v1' | 'lpmq' | 'uthmanic'
    fontScale = 1.0,
    activeVerseKey = null,
    activeWordPos = null
  } = options;

  // Ensure page font is registered
  if (fontType === 'v2' || fontType === 'v1') {
    loadPageFont(pageNumber, fontType);
  }

  const pageMeta = PAGE_MAP[pageNumber] || { juz: 1, surah_ids: [1] };
  const padPage = String(pageNumber).padStart(3, '0');
  
  // Font Family selection
  let pageFontFamily = `'LPMQ Isep Misbah', 'Amiri', serif`;
  if (fontType === 'v2') {
    pageFontFamily = `'p${pageNumber}-v2', 'LPMQ Isep Misbah', serif`;
  } else if (fontType === 'v1') {
    pageFontFamily = `'p${pageNumber}-v1', 'LPMQ Isep Misbah', serif`;
  } else if (fontType === 'uthmanic') {
    pageFontFamily = `'KFGQPC Uthman Taha Naskh', 'LPMQ Isep Misbah', serif`;
  }

  const primarySurahId = pageMeta.surah_ids[0] || 1;
  const primarySurah = CHAPTER_MAP[primarySurahId] || { name_simple: 'Al-Fatihah', name_arabic: 'الفاتحة' };
  
  // Group words into 15 lines, filtering out bleed from other pages
  const linesMap = groupLinesByVerses(versesData, pageNumber);
  const lineKeys = Object.keys(linesMap).sort((a, b) => {
    const numA = parseInt(a.replace('Line-', ''));
    const numB = parseInt(b.replace('Line-', ''));
    return numA - numB;
  });

  const renderedSurahHeaders = new Set();

  let html = `
    <div class="mushaf-page-card rounded-2xl p-3 sm:p-5 md:p-6 w-full max-w-[620px] mx-auto select-text shadow-xl" id="mushaf-page-${pageNumber}">
      <div class="mushaf-inner-border rounded-xl relative p-3 sm:p-5">
        <!-- Corner Ornaments -->
        <div class="corner-ornament corner-tl text-amber-600/70 dark:text-amber-400/70">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M2 2h8v2H4v6H2V2zm20 0v8h-2V4h-6V2h8zm0 20h-8v-2h6v-6h2v8zM2 22v-8h2v6h6v2H2z"/></svg>
        </div>
        <div class="corner-ornament corner-tr text-amber-600/70 dark:text-amber-400/70">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M14 2h8v8h-2V4h-6V2z"/></svg>
        </div>
        <div class="corner-ornament corner-bl text-amber-600/70 dark:text-amber-400/70">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M2 14h2v6h6v2H2v-8z"/></svg>
        </div>
        <div class="corner-ornament corner-br text-amber-600/70 dark:text-amber-400/70">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5"><path d="M20 14h2v8h-8v-2h6v-6z"/></svg>
        </div>

        <!-- Page Header Info (Juz & Surah Name) -->
        <div class="mushaf-page-header flex justify-between items-center pb-2 mb-3 border-b border-amber-500/50 text-xs sm:text-sm font-semibold text-emerald-900 dark:text-amber-400">
          <div class="flex items-center gap-1">
            <span class="opacity-70 text-[11px] uppercase">Juz</span>
            <span class="font-bold">${pageMeta.juz}</span>
          </div>
          <div class="flex items-center gap-1.5 font-arabic text-base sm:text-lg font-bold">
            <span>سورة ${primarySurah.name_arabic}</span>
          </div>
        </div>

        <!-- 15 Lines Mushaf Layout -->
        <div class="mushaf-lines-container flex flex-col justify-between min-h-[580px] sm:min-h-[640px] w-full" style="font-family: ${pageFontFamily};">
  `;

  // Render each line
  lineKeys.forEach((lineKey) => {
    const lineNum = parseInt(lineKey.replace('Line-', ''));
    const words = linesMap[lineKey];
    
    // Check if line is centered: Page 1, Page 2, or last line of a surah with few words
    const isCenterPage = (pageNumber === 1 || pageNumber === 2);
    const isShortEndLine = (words.length <= 3 && words.some(w => w.char_type_name === 'end'));
    const isCenterLine = isCenterPage || isShortEndLine;

    // Check if a Surah starts on this line
    const surahStartWord = words.find(w => w.verseNumber === 1 && w.position === 1 && !renderedSurahHeaders.has(w.chapterId));
    
    if (surahStartWord) {
      const chId = surahStartWord.chapterId;
      const chapter = CHAPTER_MAP[chId] || { name_simple: 'Surah', name_arabic: 'سورة', revelation_place: 'makkah', verses_count: 7 };
      renderedSurahHeaders.add(chId);

      html += `
        <div class="surah-header-banner my-1.5 sm:my-2">
          <div class="flex items-center justify-between px-3 text-[11px] sm:text-xs font-medium text-emerald-800 dark:text-amber-300">
            <span>${chapter.revelation_place === 'makkah' ? 'Makkiyyah' : 'Madaniyyah'}</span>
            <h3 class="surah-header-title text-base sm:text-xl font-bold font-arabic">سورة ${chapter.name_arabic}</h3>
            <span>${chapter.verses_count} Ayat</span>
          </div>
        </div>
      `;

      // Bismillah banner (unless Surah 9 or Surah 1)
      if (chId !== 9 && chId !== 1) {
        html += `
          <div class="bismillah-line font-arabic text-center my-0.5 sm:my-1 text-base sm:text-lg text-stone-800 dark:text-stone-100">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </div>
        `;
      }
    }

    // Render Line with exact justification
    html += `
      <div class="mushaf-line ${isCenterLine ? 'line-center' : 'line-justified'}" data-line="${lineKey}">
    `;

    words.forEach((word) => {
      const isEnd = word.char_type_name === 'end';
      const isWordActive = (activeVerseKey === word.verseKey && activeWordPos === word.position);
      const isVerseActive = (activeVerseKey === word.verseKey);

      // Choose glyph representation
      let wordGlyph = word.text_uthmani || word.text;
      if (fontType === 'v2' && word.code_v2) {
        wordGlyph = word.code_v2;
      } else if (fontType === 'v1' && word.code_v1) {
        wordGlyph = word.code_v1;
      }

      if (isEnd) {
        // End of Ayah marker
        html += `
          <span class="ayah-end-glyph inline-block mx-0.5 cursor-pointer transition-transform hover:scale-125" 
                data-verse-key="${word.verseKey}"
                title="Ayat ${word.verseNumber}">
            ${(fontType === 'v1' || fontType === 'v2') ? wordGlyph : `
              <span class="relative inline-flex items-center justify-center w-6 h-6 border border-amber-600/70 rounded-full text-xs font-sans text-emerald-800 dark:text-amber-300">
                ${word.verseNumber}
              </span>
            `}
          </span>
        `;
      } else {
        // Word Glyph
        html += `
          <span class="quran-word ${isWordActive ? 'word-active' : ''} ${isVerseActive ? 'bg-amber-100/40 dark:bg-amber-950/30' : ''}"
                data-location="${word.location}"
                data-verse-key="${word.verseKey}"
                data-pos="${word.position}"
                data-audio="${word.audio_url || ''}"
                data-translation="${encodeURIComponent(word.translation?.text || '')}"
                data-transliteration="${encodeURIComponent(word.transliteration?.text || '')}"
                data-uthmani="${encodeURIComponent(word.text_uthmani || '')}">
            ${wordGlyph}
          </span>
        `;
      }
    });

    html += `</div>`;
  });

  // Page Footer with Page Number
  html += `
        </div>

        <div class="mushaf-page-footer flex justify-between items-center pt-2 mt-3 border-t border-amber-500/50 text-xs text-stone-500 font-semibold">
          <div>Hal. ${pageNumber}</div>
          <div class="font-bold text-sm sm:text-base text-amber-700 dark:text-amber-400 font-arabic">
            ${pageNumber}
          </div>
          <div>${primarySurah.name_simple}</div>
        </div>
      </div>
    </div>
  `;

  return html;
}
