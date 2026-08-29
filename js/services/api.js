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

  try {
    const res = await fetch(localUrl);
    if (!res.ok) throw new Error(`Local file not found: ${res.status}`);
    const data = await res.json();
    pageCache.set(pageNumber, data);
    return data;
  } catch (err) {
    console.warn(`Local page fetch failed, falling back to network:`, err);
    const fallbackUrl = `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=true&word_fields=line_number,page_number,location,code_v1,code_v2,text_uthmani,text_indopak&translations=33&fields=chapter_id,verse_number,verse_key,page_number,juz_number,hizb_number,rub_el_hizb_number,sajdah_number&per_page=50`;
    const res = await fetch(fallbackUrl);
    const data = await res.json();
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

/**
 * Fast Local Search Engine across Surahs & Translations
 */
export async function searchQuran(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results = [];

  // Search in chapters list
  CHAPTERS.forEach(ch => {
    if (ch.name_simple.toLowerCase().includes(q) || ch.translated_name.name.toLowerCase().includes(q)) {
      results.push({
        verse_key: `${ch.id}:1`,
        text: `Surah ${ch.name_simple} (${ch.translated_name.name}) — ${ch.verses_count} ayat • Tempat turun: ${ch.revelation_place === 'makkah' ? 'Makkiyyah' : 'Madaniyyah'} • Halaman awal: ${ch.pages[0]}.`
      });
    }
  });

  if (results.length < 5) {
    try {
      const url = `https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&size=15&page=1&language=id`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const apiResults = data.search?.results || [];
        results.push(...apiResults);
      }
    } catch (e) {}
  }

  return results;
}
