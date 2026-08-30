/**
 * MAIN QURAN MUSHAF APPLICATION CONTROLLER
 * Mushaf Standar Indonesia & Quran.com Frontend Engine
 * Default: Standar Madinah (QCF V2) & 60 FPS Real-Time Word Sync & Continuous Auto-Play
 * Copyright © 2026 @richieoct
 */

import { CHAPTERS, CHAPTER_MAP } from './data/chapters.js';
import { JUZS, JUZ_MAP } from './data/juzs.js';
import { PAGES_INDEX, PAGE_MAP } from './data/pages_index.js';
import { fetchPageVerses, fetchChapterVerses, loadPageFont, preloadAdjacentFonts, searchQuran } from './services/api.js';
import { audioService, RECITERS } from './services/audio.js';

import { renderHeaderNav } from './components/HeaderNav.js';
import { renderMushafPage } from './components/MushafPage.js';
import { renderTwoPageSpread } from './components/TwoPageView.js';
import { renderHDScanView } from './components/HDScanView.js';
import { renderAyahListView } from './components/AyahListView.js';
import { renderFooter } from './components/Footer.js';
import { renderAudioBar } from './components/AudioBar.js';
import {
  renderSurahPickerModal,
  renderSearchModal,
  renderBookmarksDrawer,
  renderDoasModal,
  renderTajwidModal,
  renderSettingsModal
} from './components/Modals.js';

class QuranApp {
  constructor() {
    window.quranApp = this;

    this.state = {
      currentPage: 1,
      currentSurahId: 1,
      currentJuz: 1,
      viewMode: 'page', // 'page' | 'twopage' | 'ayah' | 'hdscan'
      currentTheme: localStorage.getItem('quran_theme') || 'paper',
      fontType: localStorage.getItem('quran_font') || 'v2', // Default: Standar Madinah (QCF V2)
      fontScale: 1.0,
      showWBW: true,
      showTranslation: true,
      showLatin: true,
      selectedReciterId: 7,
      isAudioPlaying: false,
      currentAudioVerse: null,
      currentActiveWordPos: null,
      audioProgress: { currentTime: 0, duration: 0, percent: 0 },
      repeatMode: 'none',
      playbackRate: 1.0,
      activeModal: null,
      isLoading: false,
      bookmarks: JSON.parse(localStorage.getItem('quran_bookmarks') || '[]'),
      lastRead: JSON.parse(localStorage.getItem('quran_last_read') || 'null'),
      pageData: null,
      chapterData: null
    };

    if (this.state.lastRead?.page) {
      this.state.currentPage = this.state.lastRead.page;
    }

    this.init();
  }

  async init() {
    this.applyTheme(this.state.currentTheme);
    this.setupAudioListeners();
    this.setupGlobalShortcuts();
    this.setupTouchGestures();
    this.setupBackButtonHandler();
    this.setupGlobalDelegation();
    
    window.playWordAudio = (url) => audioService.playWord(url);

    await this.loadCurrentView();

    // Remove Splash Screen smoothly after initial load
    const splash = document.getElementById('splash-screen');
    if (splash) {
      setTimeout(() => {
        splash.style.opacity = '0';
        splash.style.pointerEvents = 'none'; // allow clicks through immediately
        setTimeout(() => splash.remove(), 1000); // wait for 1s transition
      }, 1500); // Show splash for at least 1.5s
    }
  }

  applyTheme(theme) {
    this.state.currentTheme = theme;
    localStorage.setItem('quran_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark-emerald' || theme === 'midnight') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setupAudioListeners() {
    audioService.on('playState', (isPlaying) => {
      this.state.isAudioPlaying = isPlaying;
      if (!isPlaying) {
        this.clearAllWordHighlights();
      }
      this.renderAudioBar();
    });

    audioService.on('verseChange', (verseKey) => {
      this.state.currentAudioVerse = verseKey;
      this.clearAllWordHighlights();
      this.updateActiveVerseHighlight();
      this.renderAudioBar();
    });

    audioService.on('wordHighlight', ({ verseKey, wordPosition }) => {
      this.state.currentActiveWordPos = wordPosition;
      this.updateWordHighlight(verseKey, wordPosition);
    });

    audioService.on('timeUpdate', (progress) => {
      this.state.audioProgress = progress;
      const scrubber = document.querySelector('#audio-scrubber > div');
      if (scrubber) scrubber.style.width = `${progress.percent}%`;
    });
  }

  setupGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // RTL Mushaf navigation: ← = halaman berikutnya, → = halaman sebelumnya
      if (e.key === 'ArrowLeft') {
        this.nextPage({ autoPlay: this.state.isAudioPlaying });
      } else if (e.key === 'ArrowRight') {
        this.prevPage({ autoPlay: this.state.isAudioPlaying });
      } else if (e.code === 'Space') {
        e.preventDefault();
        audioService.togglePlay();
      } else if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  setupTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;

    window.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      // Disable swipe-to-turn-page if a modal or popover is open
      const popoverRoot = document.getElementById('popover-root');
      if (this.state.activeModal || (popoverRoot && popoverRoot.innerHTML.trim() !== '')) {
        return;
      }

      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 70) {
        // RTL Mushaf: geser kiri = halaman berikutnya, geser kanan = halaman sebelumnya
        if (diff > 0) {
          // diff > 0 means Swipe Right (geser ke kanan).
          // Dalam RTL/Mushaf, halaman berikutnya ada di sebelah KIRI.
          // Jadi kita menarik dari kiri ke kanan (Swipe Right) untuk memunculkan halaman berikutnya.
          this.nextPage({ autoPlay: this.state.isAudioPlaying });
        } else {
          // diff < 0 means Swipe Left (geser ke kiri).
          this.prevPage({ autoPlay: this.state.isAudioPlaying });
        }
      }
    }, { passive: true });
  }

  setupBackButtonHandler() {
    this.lastBackPressTime = 0;
    
    // Add a shield state so the back button has something to pop
    window.history.replaceState({ root: true }, '', window.location.pathname);
    window.history.pushState({ shield: true }, '', window.location.pathname);

    window.addEventListener('popstate', (e) => {
      // Check if a modal or popover is open
      const popoverRoot = document.getElementById('popover-root');
      const hasPopover = popoverRoot && popoverRoot.innerHTML.trim() !== '';
      
      if (this.state.activeModal || hasPopover) {
        if (this.state.activeModal) this.closeModal();
        if (hasPopover) popoverRoot.innerHTML = '';
        
        // Restore shield to prevent exit on next press
        window.history.pushState({ shield: true }, '', window.location.pathname);
        return;
      }
      
      // If no modal/popover, handle double-back to exit
      const now = Date.now();
      if (now - this.lastBackPressTime > 2000) {
        this.lastBackPressTime = now;
        this.showToast('Tekan sekali lagi untuk keluar dari aplikasi');
        // Restore shield to wait for confirmation
        window.history.pushState({ shield: true }, '', window.location.pathname);
      } else {
        // Confirmed double press. Exit gracefully.
        window.history.back();
      }
    });
  }

  setupGlobalDelegation() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-footer-surah, #btn-footer-doas, #btn-footer-tajwid');
      if (!btn) return;
      if (btn.id === 'btn-footer-surah') this.openModal('surahPicker');
      else if (btn.id === 'btn-footer-doas') this.openModal('doas');
      else if (btn.id === 'btn-footer-tajwid') this.openModal('tajwid');
    });
  }

  async loadCurrentView() {
    const { currentPage, viewMode, fontType } = this.state;
    
    if (fontType === 'v2' || fontType === 'v1') {
      loadPageFont(currentPage, fontType);
      preloadAdjacentFonts(currentPage, fontType);
    }

    const pageMeta = PAGE_MAP[currentPage] || { surah_ids: [1], juz: 1 };
    this.state.currentSurahId = pageMeta.surah_ids[0] || 1;
    this.state.currentJuz = pageMeta.juz;

    const ch = CHAPTER_MAP[this.state.currentSurahId];
    this.state.lastRead = {
      page: currentPage,
      juz: this.state.currentJuz,
      surahId: this.state.currentSurahId,
      surahName: ch ? `Surah ${ch.name_simple}` : `Halaman ${currentPage}`,
      timestamp: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('quran_last_read', JSON.stringify(this.state.lastRead));

    try {
      if (viewMode === 'ayah') {
        const data = await fetchChapterVerses(this.state.currentSurahId);
        this.state.chapterData = data.verses || [];
        audioService.setPageQueue(this.state.chapterData, () => {
          this.nextPage({ autoPlay: true });
        });
      } else if (viewMode === 'twopage') {
        const rightPage = currentPage % 2 === 0 ? currentPage : Math.max(1, currentPage - 1);
        const leftPage = rightPage + 1;
        
        loadPageFont(rightPage, fontType);
        loadPageFont(leftPage, fontType);

        const [rightData, leftData] = await Promise.all([
          fetchPageVerses(rightPage),
          fetchPageVerses(leftPage)
        ]);

        this.state.pageData = rightData.verses || [];
        this.state.leftPageData = leftData.verses || [];

        const combinedVerses = [...(rightData.verses || []), ...(leftData.verses || [])];
        audioService.setPageQueue(combinedVerses, () => {
          this.nextPage({ autoPlay: true });
        });
      } else {
        const data = await fetchPageVerses(currentPage);
        this.state.pageData = data.verses || [];
        
        audioService.setPageQueue(this.state.pageData, () => {
          this.nextPage({ autoPlay: true });
        });
      }
    } catch (error) {
      console.error('Error loading local view:', error);
    } finally {
      this.render();
      if (this.state.currentAudioVerse) {
        this.updateActiveVerseHighlight();
      }
    }
  }

  async setPage(pageNum, autoPlay = false) {
    const shouldAutoPlay = autoPlay || this.state.isAudioPlaying;
    const num = Math.min(604, Math.max(1, parseInt(pageNum) || 1));
    this.state.currentPage = num;
    await this.loadCurrentView();
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (shouldAutoPlay && this.state.pageData && this.state.pageData.length > 0) {
      const firstVerse = this.state.pageData[0].verse_key;
      audioService.playVerse(firstVerse);
    }
  }

  nextPage(options = {}) {
    if (this.state.currentPage < 604) {
      const increment = this.state.viewMode === 'twopage' ? 2 : 1;
      this.setPage(Math.min(604, this.state.currentPage + increment), options.autoPlay);
    }
  }

  prevPage(options = {}) {
    if (this.state.currentPage > 1) {
      const decrement = this.state.viewMode === 'twopage' ? 2 : 1;
      this.setPage(Math.max(1, this.state.currentPage - decrement), options.autoPlay);
    }
  }

  render() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    const { currentPage, viewMode, fontType, fontScale, showWBW, showTranslation, showLatin, pageData, leftPageData, chapterData } = this.state;

    const headerHtml = renderHeaderNav(this.state);

    let contentHtml = '';
    const viewOptions = {
      fontType,
      fontScale,
      showWBW,
      showTranslation,
      showLatin,
      activeVerseKey: this.state.currentAudioVerse,
      activeWordPos: this.state.currentActiveWordPos
    };

    if (viewMode === 'twopage') {
      const rightPage = currentPage % 2 === 0 ? currentPage : Math.max(1, currentPage - 1);
      const leftPage = rightPage + 1;
      contentHtml = renderTwoPageSpread(rightPage, pageData || [], leftPage, leftPageData || [], viewOptions);
    } else if (viewMode === 'ayah') {
      contentHtml = renderAyahListView(chapterData || [], viewOptions);
    } else if (viewMode === 'hdscan') {
      contentHtml = renderHDScanView(currentPage);
    } else {
      contentHtml = renderMushafPage(currentPage, pageData || [], viewOptions);
    }

    const navFloatHtml = `
      <div class="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-800 transition-transform">
        <!-- RTL Mushaf: Halaman berikutnya di KIRI (◄) -->
        <button id="btn-next-page" class="p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold ${currentPage >= 604 ? 'opacity-40 pointer-events-none' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M15 18l-6-6 6-6"/></svg>
          <span class="hidden sm:inline">Berikutnya</span>
        </button>

        <span class="text-xs font-bold text-emerald-800 dark:text-amber-400 px-2">
          ${currentPage} / 604
        </span>

        <!-- RTL Mushaf: Halaman sebelumnya di KANAN (►) -->
        <button id="btn-prev-page" class="p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold ${currentPage <= 1 ? 'opacity-40 pointer-events-none' : ''}">
          <span class="hidden sm:inline">Sebelumnya</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    `;

    const footerHtml = renderFooter();
    const audioBarHtml = renderAudioBar(this.state);

    appEl.innerHTML = `
      ${headerHtml}
      <main class="max-w-7xl mx-auto px-2 sm:px-4 py-6 md:py-8">
        ${contentHtml}
      </main>
      ${footerHtml}
      ${navFloatHtml}
      <div id="audio-container">${audioBarHtml}</div>
      <div id="modal-root"></div>
      <div id="popover-root"></div>
    `;

    this.attachDomEvents();
  }

  attachDomEvents() {
    const jumpInput = document.getElementById('page-jump-input');
    if (jumpInput) {
      jumpInput.addEventListener('change', (e) => this.setPage(e.target.value, this.state.isAudioPlaying));
      jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.setPage(e.target.value, this.state.isAudioPlaying);
      });
    }

    document.querySelectorAll('.btn-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.viewMode = btn.dataset.mode;
        this.loadCurrentView();
      });
    });

    document.getElementById('btn-prev-page')?.addEventListener('click', () => this.prevPage({ autoPlay: this.state.isAudioPlaying }));
    document.getElementById('btn-next-page')?.addEventListener('click', () => this.nextPage({ autoPlay: this.state.isAudioPlaying }));

    document.getElementById('btn-open-surah-picker')?.addEventListener('click', () => this.openModal('surahPicker'));
    document.getElementById('btn-open-search')?.addEventListener('click', () => this.openModal('search'));
    document.getElementById('btn-open-bookmarks')?.addEventListener('click', () => this.openModal('bookmarks'));
    document.getElementById('btn-open-doas')?.addEventListener('click', () => this.openModal('doas'));
    document.getElementById('btn-open-settings')?.addEventListener('click', () => this.openModal('settings'));

    // Footer Direct Event Handlers
    document.getElementById('btn-footer-surah')?.addEventListener('click', () => this.openModal('surahPicker'));
    document.getElementById('btn-footer-doas')?.addEventListener('click', () => this.openModal('doas'));
    document.getElementById('btn-footer-tajwid')?.addEventListener('click', () => this.openModal('tajwid'));

    this.attachAudioBarEvents();
    this.attachInteractiveTextEvents();
  }

  attachAudioBarEvents() {
    document.getElementById('btn-audio-toggle')?.addEventListener('click', () => {
      audioService.togglePlay();
    });

    document.getElementById('btn-audio-prev')?.addEventListener('click', () => {
      const curr = this.state.currentAudioVerse;
      if (curr && this.state.pageData) {
        const idx = this.state.pageData.findIndex(v => v.verse_key === curr);
        if (idx > 0) {
          audioService.playVerse(this.state.pageData[idx - 1].verse_key);
        } else if (this.state.currentPage > 1) {
          this.prevPage({ autoPlay: true });
        }
      }
    });

    document.getElementById('btn-audio-next')?.addEventListener('click', () => {
      const curr = this.state.currentAudioVerse;
      if (curr && this.state.pageData) {
        const idx = this.state.pageData.findIndex(v => v.verse_key === curr);
        if (idx < this.state.pageData.length - 1) {
          audioService.playVerse(this.state.pageData[idx + 1].verse_key);
        } else if (this.state.currentPage < 604) {
          this.nextPage({ autoPlay: true });
        }
      }
    });

    document.getElementById('btn-audio-speed')?.addEventListener('click', () => {
      const rates = [0.75, 1.0, 1.25, 1.5];
      const nextIdx = (rates.indexOf(this.state.playbackRate) + 1) % rates.length;
      this.state.playbackRate = rates[nextIdx];
      audioService.setPlaybackRate(this.state.playbackRate);
      this.renderAudioBar();
    });

    document.getElementById('btn-audio-repeat')?.addEventListener('click', () => {
      const modes = ['none', 'verse', 'page'];
      const nextIdx = (modes.indexOf(this.state.repeatMode) + 1) % modes.length;
      this.state.repeatMode = modes[nextIdx];
      audioService.setRepeatMode(this.state.repeatMode);
      this.renderAudioBar();
    });

    document.getElementById('btn-audio-close')?.addEventListener('click', () => {
      audioService.stop();
      this.state.isAudioPlaying = false;
      this.state.currentAudioVerse = null;
      this.renderAudioBar();
    });

    document.getElementById('btn-audio-view-translation')?.addEventListener('click', async () => {
      const activeVerseKey = this.state.currentAudioVerse;
      if (activeVerseKey) {
        if (this.state.viewMode !== 'ayah') {
          this.state.viewMode = 'ayah';
          await this.loadCurrentView();
        }
        setTimeout(() => {
          const verseEl = document.querySelector(`[data-verse-key="${activeVerseKey}"]`);
          if (verseEl) {
            verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseEl.classList.add('bg-amber-50', 'dark:bg-amber-900/20');
            setTimeout(() => verseEl.classList.remove('bg-amber-50', 'dark:bg-amber-900/20'), 2000);
          }
        }, 300);
      }
    });

    document.getElementById('audio-scrubber')?.addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = ((e.clientX - rect.left) / rect.width) * 100;
      audioService.seek(percent);
    });
  }

  renderAudioBar() {
    const audioContainer = document.getElementById('audio-container');
    if (audioContainer) {
      audioContainer.innerHTML = renderAudioBar(this.state);
      this.attachAudioBarEvents();
    }
  }

  attachInteractiveTextEvents() {
    document.querySelectorAll('.quran-word').forEach(wordEl => {
      wordEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const vk = wordEl.dataset.verseKey;
        const pos = wordEl.dataset.pos;
        
        // BUGFIX: Do NOT trust wordEl.dataset.audio from Quran.com API!
        // The API's audio_url is offset by waqf/punctuation marks in their database,
        // but the CDN mp3 files are named strictly sequentially for spoken words.
        // We construct the correct URL manually using our cleaned sequential position.
        let correctAudioUrl = '';
        if (vk && pos) {
          const [surah, ayah] = vk.split(':');
          const surahPad = surah.padStart(3, '0');
          const ayahPad = ayah.padStart(3, '0');
          const posPad = pos.padStart(3, '0');
          correctAudioUrl = `wbw/${surahPad}_${ayahPad}_${posPad}.mp3`;
        }

        const wordData = {
          location: wordEl.dataset.location,
          verseKey: vk,
          pos: pos,
          audioUrl: correctAudioUrl,
          translation: decodeURIComponent(wordEl.dataset.translation || ''),
          transliteration: decodeURIComponent(wordEl.dataset.transliteration || ''),
          uthmani: decodeURIComponent(wordEl.dataset.uthmani || '')
        };

        this.showWordPopover(wordEl, wordData);
      });
    });

    document.querySelectorAll('.ayah-end-glyph').forEach(glyph => {
      glyph.addEventListener('click', (e) => {
        e.stopPropagation();
        const vk = glyph.dataset.verseKey;
        if (vk) audioService.playVerse(vk);
      });
    });

    document.querySelectorAll('.btn-play-ayah').forEach(btn => {
      btn.addEventListener('click', () => {
        const vk = btn.dataset.verseKey;
        if (vk) audioService.playVerse(vk);
      });
    });

    document.querySelectorAll('.btn-bookmark-ayah').forEach(btn => {
      btn.addEventListener('click', () => {
        const vk = btn.dataset.verseKey;
        const surah = btn.dataset.surah;
        const ayah = btn.dataset.ayah;
        this.addBookmark(vk, surah, ayah);
      });
    });

    document.querySelectorAll('.btn-copy-ayah').forEach(btn => {
      btn.addEventListener('click', () => {
        const arabic = decodeURIComponent(btn.dataset.arabic);
        const trans = decodeURIComponent(btn.dataset.trans);
        navigator.clipboard.writeText(`${arabic}\n\n"${trans}"`).then(() => {
          this.showToast('Ayat dan terjemahan berhasil disalin!');
        });
      });
    });
  }

  showWordPopover(targetEl, wordData) {
    const popoverRoot = document.getElementById('popover-root');
    if (!popoverRoot) return;

    if (wordData.audioUrl) {
      audioService.playWord(wordData.audioUrl);
    }

    const rect = targetEl.getBoundingClientRect();

    popoverRoot.innerHTML = `
      <div id="active-word-popover" class="fixed z-50 p-3 rounded-2xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 shadow-2xl animate-fade-in text-center min-w-[200px]"
           style="top: ${rect.top - 85}px; left: ${Math.max(10, rect.left + (rect.width/2) - 100)}px;">
        <span class="font-arabic text-xl text-stone-900 dark:text-stone-100 block font-bold">${wordData.uthmani}</span>
        <span class="text-xs font-semibold text-emerald-700 dark:text-amber-400 block mt-0.5">${wordData.transliteration}</span>
        <span class="text-xs text-stone-600 dark:text-stone-300 block mt-0.5">${wordData.translation}</span>
        
        <div class="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <button id="popover-play-verse" class="flex-1 text-[11px] px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 font-medium transition-colors">
            ▶ Ayat
          </button>
          <button id="popover-view-translation" class="flex-1 text-[11px] px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 font-medium transition-colors">
            📖 Arti
          </button>
        </div>
      </div>
    `;

    document.getElementById('popover-play-verse')?.addEventListener('click', () => {
      audioService.playVerse(wordData.verseKey);
      popoverRoot.innerHTML = '';
    });

    document.getElementById('popover-view-translation')?.addEventListener('click', async () => {
      popoverRoot.innerHTML = '';
      if (this.state.viewMode !== 'ayah') {
        this.state.viewMode = 'ayah';
        await this.loadCurrentView();
      }
      setTimeout(() => {
        const verseEl = document.querySelector(`[data-verse-key="${wordData.verseKey}"]`);
        if (verseEl) {
          verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          verseEl.classList.add('bg-amber-50', 'dark:bg-amber-900/20');
          setTimeout(() => verseEl.classList.remove('bg-amber-50', 'dark:bg-amber-900/20'), 2000);
        }
      }, 300);
    });

    const closeHandler = (e) => {
      if (!e.target.closest('#active-word-popover') && !e.target.closest('.quran-word')) {
        popoverRoot.innerHTML = '';
        window.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => window.addEventListener('click', closeHandler), 50);
  }

  updateActiveVerseHighlight() {
    const vk = this.state.currentAudioVerse;
    document.querySelectorAll('.verse-highlighted').forEach(el => el.classList.remove('verse-highlighted'));
    if (vk) {
      document.querySelectorAll(`[data-verse-key="${vk}"]`).forEach(el => {
        el.classList.add('verse-highlighted');
      });
    }
  }

  updateWordHighlight(verseKey, wordPosition) {
    if (!verseKey) {
      this.clearAllWordHighlights();
      return;
    }

    const verseWords = document.querySelectorAll(`.quran-word[data-verse-key="${verseKey}"]`);
    
    verseWords.forEach(wordEl => {
      const pos = parseInt(wordEl.dataset.pos);
      if (wordPosition && pos === wordPosition) {
        wordEl.classList.add('word-active');
        wordEl.classList.remove('word-passed');
      } else if (wordPosition && pos < wordPosition) {
        wordEl.classList.add('word-passed');
        wordEl.classList.remove('word-active');
      } else {
        wordEl.classList.remove('word-active');
        wordEl.classList.remove('word-passed');
      }
    });
  }

  clearAllWordHighlights() {
    document.querySelectorAll('.word-active').forEach(el => el.classList.remove('word-active'));
    document.querySelectorAll('.word-passed').forEach(el => el.classList.remove('word-passed'));
  }

  openModal(type, fromSettings = false) {
    this.state.activeModal = type;
    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return;

    // Lock body scroll to allow modal scrolling on mobile
    document.body.style.overflow = 'hidden';

    if (type === 'surahPicker') {
      modalRoot.innerHTML = renderSurahPickerModal(this.state.currentSurahId);
      this.attachSurahPickerEvents();
    } else if (type === 'search') {
      modalRoot.innerHTML = renderSearchModal();
      this.attachSearchEvents();
    } else if (type === 'bookmarks') {
      modalRoot.innerHTML = renderBookmarksDrawer(this.state.bookmarks, this.state.lastRead);
      this.attachBookmarksEvents();
    } else if (type === 'doas') {
      modalRoot.innerHTML = renderDoasModal(fromSettings);
      this.attachDoasEvents(fromSettings);
    } else if (type === 'tajwid') {
      modalRoot.innerHTML = renderTajwidModal(fromSettings);
    } else if (type === 'settings') {
      modalRoot.innerHTML = renderSettingsModal(this.state);
      this.attachSettingsEvents();
    }

    modalRoot.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    modalRoot.querySelector('#btn-back-to-settings')?.addEventListener('click', () => {
      this.openModal('settings');
    });

    modalRoot.firstElementChild?.addEventListener('click', (e) => {
      if (e.target === modalRoot.firstElementChild) this.closeModal();
    });
  }

  closeModal() {
    this.state.activeModal = null;
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) modalRoot.innerHTML = '';
    
    // Unlock body scroll
    document.body.style.overflow = '';
  }

  attachSurahPickerEvents() {
    const tabSurah = document.getElementById('tab-surah');
    const tabJuz = document.getElementById('tab-juz');
    const contentSurah = document.getElementById('tab-content-surah');
    const contentJuz = document.getElementById('tab-content-juz');
    const filterInput = document.getElementById('surah-search-filter');
    const filterContainer = document.getElementById('surah-filter-container');

    tabSurah?.addEventListener('click', () => {
      tabSurah.classList.add('bg-emerald-700', 'dark:bg-amber-600', 'text-white');
      tabSurah.classList.remove('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-400');
      tabJuz.classList.remove('bg-emerald-700', 'dark:bg-amber-600', 'text-white');
      tabJuz.classList.add('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-400');
      contentSurah.classList.remove('hidden');
      contentJuz.classList.add('hidden');
      if (filterContainer) filterContainer.style.display = 'block';
    });

    tabJuz?.addEventListener('click', () => {
      tabJuz.classList.add('bg-emerald-700', 'dark:bg-amber-600', 'text-white');
      tabJuz.classList.remove('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-400');
      tabSurah.classList.remove('bg-emerald-700', 'dark:bg-amber-600', 'text-white');
      tabSurah.classList.add('bg-stone-100', 'dark:bg-stone-800', 'text-stone-600', 'dark:text-stone-400');
      contentJuz.classList.remove('hidden');
      contentSurah.classList.add('hidden');
      if (filterContainer) filterContainer.style.display = 'none';
    });

    filterInput?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.surah-item').forEach(item => {
        const name = item.dataset.name;
        const meaning = item.dataset.meaning;
        if (name.includes(q) || meaning.includes(q)) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });

    document.querySelectorAll('.surah-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.startPage;
        this.closeModal();
        this.setPage(page, this.state.isAudioPlaying);
      });
    });

    document.querySelectorAll('.juz-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.startPage;
        this.closeModal();
        this.setPage(page, this.state.isAudioPlaying);
      });
    });
  }

  attachSearchEvents() {
    const input = document.getElementById('search-input-field');
    const container = document.getElementById('search-results-container');
    let debounceTimer;

    input?.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim();
      if (query.length < 2) return;

      debounceTimer = setTimeout(async () => {
        container.innerHTML = '<div class="text-center py-8 text-stone-400">Mencari...</div>';
        const results = await searchQuran(query);
        
        if (results.length === 0) {
          container.innerHTML = '<div class="text-center py-8 text-stone-400">Tidak ada hasil ditemukan.</div>';
          return;
        }

        container.innerHTML = results.map((res, index) => {
          const [sId, aNum] = res.verse_key.split(':');
          const ch = CHAPTER_MAP[sId] || { name_simple: 'Surah' };
          const title = res.title || `${ch.name_simple} : Ayat ${aNum}`;
          const isJump = res.is_jump;
          
          return `
            <div class="search-result-card p-4 rounded-2xl border ${isJump ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'border-stone-200 dark:border-stone-800'} hover:border-emerald-500 cursor-pointer transition-all"
                 data-verse-key="${res.verse_key}" data-target-page="${res.target_page || ''}" data-index="${index}">
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-sm ${isJump ? 'text-emerald-700 dark:text-emerald-400' : 'text-emerald-800 dark:text-amber-400'}">${title}</span>
                <span class="text-xs bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">${res.verse_key}</span>
              </div>
              <p class="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed" ${isJump ? '' : 'dir="rtl" style="text-align: left;"'}>${res.text}</p>
            </div>
          `;
        }).join('');

        container.querySelectorAll('.search-result-card').forEach(card => {
          card.addEventListener('click', async () => {
            const vk = card.dataset.verseKey;
            const explicitPage = card.dataset.targetPage;
            let targetPage = parseInt(explicitPage, 10);

            // If we don't have an explicit target page, calculate it from verseKey
            if (!targetPage && vk) {
              const [sId, aNum] = vk.split(':').map(Number);
              // Simple calculation: fetch chapter data and find the page
              // Since we don't want to load all data synchronously, we can estimate
              // or use the PAGES_INDEX from api.js if exported. For now, fallback to chapter start
              // if we can't easily find it. Let's dynamically import PAGES_INDEX to find exact page:
              try {
                const { PAGES_INDEX } = await import('./data/pages_index.js');
                const pIndex = PAGES_INDEX.findIndex(p => {
                  const [startSId, startANum] = p.start_verse_key.split(':').map(Number);
                  const [endSId, endANum] = p.end_verse_key.split(':').map(Number);
                  
                  if (sId > startSId && sId < endSId) return true;
                  if (sId === startSId && sId === endSId) return aNum >= startANum && aNum <= endANum;
                  if (sId === startSId) return aNum >= startANum;
                  if (sId === endSId) return aNum <= endANum;
                  return false;
                });
                if (pIndex !== -1) targetPage = PAGES_INDEX[pIndex].page;
              } catch (e) {
                const ch = CHAPTER_MAP[sId];
                if (ch) targetPage = ch.pages[0];
              }
            }

            if (targetPage) {
              this.closeModal();
              this.setPage(targetPage, this.state.isAudioPlaying);
            }
          });
        });
      }, 300);
    });
  }

  attachBookmarksEvents() {
    document.querySelectorAll('.last-read-card').forEach(card => {
      card.addEventListener('click', () => {
        this.closeModal();
        this.setPage(card.dataset.page, this.state.isAudioPlaying);
      });
    });

    document.querySelectorAll('.bookmark-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.btn-delete-bookmark')) return;
        this.closeModal();
        this.setPage(item.dataset.page, this.state.isAudioPlaying);
      });
    });

    document.querySelectorAll('.btn-delete-bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const vk = btn.dataset.verseKey;
        this.state.bookmarks = this.state.bookmarks.filter(b => b.verseKey !== vk);
        localStorage.setItem('quran_bookmarks', JSON.stringify(this.state.bookmarks));
        this.openModal('bookmarks');
      });
    });
  }

  addBookmark(verseKey, surahId, ayahNumber) {
    const ch = CHAPTER_MAP[surahId] || { name_simple: 'Surah' };
    const page = this.state.currentPage;
    const exists = this.state.bookmarks.some(b => b.verseKey === verseKey);

    if (!exists) {
      this.state.bookmarks.unshift({
        verseKey,
        surahId,
        surahName: ch.name_simple,
        verseNumber: ayahNumber,
        page,
        time: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      });
      localStorage.setItem('quran_bookmarks', JSON.stringify(this.state.bookmarks));
      this.showToast(`Bookmark Ayat ${verseKey} berhasil disimpan!`);
    } else {
      this.showToast(`Ayat ${verseKey} sudah ada di bookmark.`);
    }
  }

  attachSettingsEvents() {
    document.querySelectorAll('.btn-theme-select').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyTheme(btn.dataset.theme);
        this.openModal('settings');
        this.render();
      });
    });

    const fontSelect = document.getElementById('select-font-type');
    fontSelect?.addEventListener('change', (e) => {
      this.state.fontType = e.target.value;
      localStorage.setItem('quran_font', this.state.fontType);
      this.loadCurrentView();
    });

    const qariSelect = document.getElementById('select-qari');
    qariSelect?.addEventListener('change', (e) => {
      this.state.selectedReciterId = Number(e.target.value);
      audioService.setReciter(this.state.selectedReciterId);
      this.renderAudioBar();
    });

    document.getElementById('toggle-wbw')?.addEventListener('change', (e) => {
      this.state.showWBW = e.target.checked;
      this.render();
    });

    document.getElementById('toggle-translation')?.addEventListener('change', (e) => {
      this.state.showTranslation = e.target.checked;
      this.render();
    });

    document.getElementById('btn-open-tajwid-from-settings')?.addEventListener('click', () => {
      this.openModal('tajwid', true);
    });

    document.getElementById('btn-open-doas-from-settings')?.addEventListener('click', () => {
      this.openModal('doas', true);
    });
  }

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-stone-900/90 dark:bg-amber-400 text-white dark:text-stone-950 text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md transition-all animate-fade-in';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.quranApp = new QuranApp();
});
