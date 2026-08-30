/**
 * LOCAL-FIRST QURAN API CLIENT & FONT LOADER
 * 100% Offline & Local Assets (Instant 0ms Latency)
 */

import { CHAPTERS, CHAPTER_MAP } from '../data/chapters.js';

// In-Memory Caches
const pageCache = new Map();
const chapterCache = new Map();
const loadedFonts = new Set();

/**
 * Dynamically loads and registers the QCF (King Fahd Complex Font) for a specific page from LOCAL assets.
 * @param {number} pageNumber (1 - 604)
 * @param {'v1' | 'v2'} fontVersion 
 */
export function loadPageFont(pageNumber, fontVersion = 'v2') {
  const fontKey = `p${pageNumber}-${fontVersion}`;
  if (loadedFonts.has(fontKey)) return fontKey;

  const fontName = `p${pageNumber}-${fontVersion}`;
  const fontUrl = `./assets/fonts/qcf_${fontVersion}/p${pageNumber}.woff2`;

  try {
    const fontFace = new FontFace(fontName, `url('${fontUrl}') format('woff2')`, {
      style: 'normal',
      weight: 'normal',
      display: 'swap'
    });

    fontFace.load().then(loadedFace => {
      document.fonts.add(loadedFace);
      loadedFonts.add(fontKey);
    }).catch(err => {
      console.warn(`Font load fallback for p${pageNumber}:`, err);
    });
    
    return fontName;
  } catch (error) {
    return 'LPMQ Isep Misbah';
  }
}

export function preloadAdjacentFonts(pageNumber, fontVersion = 'v2') {
  if (pageNumber > 1) loadPageFont(pageNumber - 1, fontVersion);
  if (pageNumber < 604) loadPageFont(pageNumber + 1, fontVersion);
}

/**
 * Fetches all verses and word-level data for a specific Mushaf page from LOCAL assets
 * @param {number} pageNumber (1 - 604)
 */
export async function fetchPageVerses(pageNumber) {
  if (pageCache.has(pageNumber)) {
    return pageCache.get(pageNumber);
  }

  const localUrl = `./assets/pages/p${pageNumber}.json`;

  const sanitizeData = (data) => {
    if (data && data.verses) {
      data.verses = data.verses.map(verse => {
        if (!verse.words) return verse;
        // Filter out words that bleed from other pages
        const validWords = verse.words.filter(w => !w.page_number || w.page_number === pageNumber);
        return { ...verse, words: validWords };
      }).filter(verse => verse.words.length > 0); // Drop the verse if all its words were from another page
    }
    return data;
  };

  try {
    const res = await fetch(localUrl);
    if (!res.ok) throw new Error(`Local file not found: ${res.status}`);
    const rawData = await res.json();
    const data = sanitizeData(rawData);
    pageCache.set(pageNumber, data);
    return data;
  } catch (err) {
    console.warn(`Local page fetch failed, falling back to network:`, err);
    const fallbackUrl = `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=true&word_fields=line_number,page_number,location,code_v1,code_v2,text_uthmani,text_indopak&translations=33&fields=chapter_id,verse_number,verse_key,page_number,juz_number,hizb_number,rub_el_hizb_number,sajdah_number&per_page=50`;
    const res = await fetch(fallbackUrl);
    const rawData = await res.json();
    const data = sanitizeData(rawData);
    pageCache.set(pageNumber, data);
    return data;
  }
}

/**
 * Fetches all verses of a Surah from LOCAL assets
 * @param {number} chapterId (1 - 114)
 */
export async function fetchChapterVerses(chapterId) {
  if (chapterCache.has(chapterId)) {
    return chapterCache.get(chapterId);
  }

  const localUrl = `./assets/chapters/ch${chapterId}.json`;

  try {
    const res = await fetch(localUrl);
    if (!res.ok) throw new Error(`Local chapter file not found: ${res.status}`);
    const data = await res.json();
    chapterCache.set(chapterId, data);
    return data;
  } catch (err) {
    const fallbackUrl = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?words=true&word_fields=line_number,page_number,location,code_v1,code_v2,text_uthmani,text_indopak&translations=33&fields=chapter_id,verse_number,verse_key,page_number,juz_number,hizb_number,rub_el_hizb_number,sajdah_number&per_page=300`;
    const res = await fetch(fallbackUrl);
    const data = await res.json();
    chapterCache.set(chapterId, data);
    return data;
  }
}

import { JUZS } from '../data/juzs.js';
import { PAGES_INDEX } from '../data/pages_index.js';

/**
 * Smart Local Search Engine (Regex Parser + Full Text)
 */
export async function searchQuran(query) {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();
  const results = [];

  // 1. SMART PARSER: Page / Halaman
  const pageMatch = q.match(/^(?:hal|halaman|page|p)\s*(\d+)$/i);
  if (pageMatch) {
    const pageNum = parseInt(pageMatch[1], 10);
    if (pageNum >= 1 && pageNum <= 604) {
      results.push({
        is_jump: true,
        target_page: pageNum,
        verse_key: PAGES_INDEX[pageNum - 1].start_verse_key,
        title: `Lompat ke Halaman ${pageNum}`,
        text: `Juz ${PAGES_INDEX[pageNum - 1].juz} • Menampilkan awal halaman ${pageNum}`
      });
      return results; // Return immediate jump
    }
  }

  // 2. SMART PARSER: Juz
  const juzMatch = q.match(/^juz\s*(\d+)$/i);
  if (juzMatch) {
    const juzNum = parseInt(juzMatch[1], 10);
    if (juzNum >= 1 && juzNum <= 30) {
      const juzData = JUZS[juzNum - 1];
      results.push({
        is_jump: true,
        target_page: juzData.start_page,
        verse_key: juzData.start_verse_key,
        title: `Lompat ke Juz ${juzNum}`,
        text: `Dimulai dari Surah ${juzData.first_surah_name_simple} • Halaman ${juzData.start_page}`
      });
      return results;
    }
  }

  // 3. SMART PARSER: Surah and Ayah (e.g., "baqarah 255" or "2 255" or "2:255")
  // First, check explicit format Number:Number or Number Number
  let surahId = null;
  let ayahNum = null;
  
  const numericMatch = q.match(/^(\d+)[^\w\d](\d+)$/);
  if (numericMatch) {
    surahId = parseInt(numericMatch[1], 10);
    ayahNum = parseInt(numericMatch[2], 10);
  } else {
    // Check text format like "yasin 9" or "al kahfi 10"
    const textMatch = q.match(/^([a-z\s-]+)\s+(\d+)$/i);
    if (textMatch) {
      const surahStr = textMatch[1].trim();
      ayahNum = parseInt(textMatch[2], 10);
      // Find matching surah
      const foundSurah = CHAPTERS.find(ch => 
        ch.name_simple.toLowerCase().includes(surahStr) || 
        ch.translated_name.name.toLowerCase().includes(surahStr)
      );
      if (foundSurah) surahId = foundSurah.id;
    }
  }

  if (surahId && ayahNum && CHAPTER_MAP[surahId]) {
    const ch = CHAPTER_MAP[surahId];
    if (ayahNum >= 1 && ayahNum <= ch.verses_count) {
      // Find which page this verse belongs to
      const verseKey = `${surahId}:${ayahNum}`;
      results.push({
        is_jump: true,
        verse_key: verseKey,
        target_page: null, // We will calculate this dynamically in app.js
        title: `Surah ${ch.name_simple} : Ayat ${ayahNum}`,
        text: `Lompat langsung ke ayat ${ayahNum} di Surah ${ch.name_simple} (${ch.translated_name.name})`
      });
    }
  }

  // 4. Fallback: Search in chapters list (Metadata)
  CHAPTERS.forEach(ch => {
    if (ch.name_simple.toLowerCase().includes(q) || ch.translated_name.name.toLowerCase().includes(q)) {
      results.push({
        is_jump: true,
        target_page: ch.pages[0],
        verse_key: `${ch.id}:1`,
        title: `Surah ${ch.name_simple} (${ch.translated_name.name})`,
        text: `${ch.verses_count} ayat • Tempat turun: ${ch.revelation_place === 'makkah' ? 'Makkiyyah' : 'Madaniyyah'} • Halaman awal: ${ch.pages[0]}.`
      });
    }
  });

  // 5. Fallback: Full text search via API
  if (results.length < 5) {
    try {
      const url = `https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=15&page=1&language=id`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const apiResults = data.search?.results || [];
        apiResults.forEach(r => {
          results.push({
            is_jump: false,
            verse_key: r.verse_key,
            title: `Ayat ${r.verse_key}`,
            text: r.text
          });
        });
      }
    } catch (e) {}
  }

  return results;
}
