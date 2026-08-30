/**
 * AUDIO MANAGER SERVICE (WORD-BY-WORD SYNCHRONIZATION ENGINE)
 * High-Precision 60 FPS Word-by-Word Synchronized Highlighting
 * Supports Continuous Multi-Page Auto-Play and Seamless Transitions
 */

export const RECITERS = [
  { id: 7, name: 'Mishary Rashid Alafasy', subtext: 'Murattal (Sinkronisasi Kata Per-Kata)', folder: 'Alafasy/mp3' },
  { id: 3, name: 'Abdur-Rahman As-Sudais', subtext: 'Imam Masjidil Haram (Sorotan Per-Ayat)', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
  { id: 11, name: 'Maher Al-Muaiqly', subtext: 'Imam Masjidil Haram (Sorotan Per-Ayat)', folder: 'Maher_AlMuaiqly_64kbps' },
  { id: 6, name: 'Mahmoud Khalil Al-Husary', subtext: 'Tartil Standar Tajwid (Sorotan Per-Ayat)', folder: 'Husary_128kbps' },
  { id: 2, name: 'Abdul Basit Murattal', subtext: 'Qari Mesir Legendaris (Sorotan Per-Ayat)', folder: 'Abdul_Basit_Murattal_192kbps' },
  { id: 4, name: 'Abu Bakr Al-Shatri', subtext: 'Murattal Khas (Sorotan Per-Ayat)', folder: 'Abu_Bakr_Ash-Shaatree_128kbps' }
];

class AudioService {
  constructor() {
    this.audio = new Audio();
    this.wordAudio = new Audio();
    this.selectedReciter = RECITERS[0];
    this.isPlaying = false;
    this.currentVerseKey = null;
    this.currentWordPosition = null;
    this.currentSegments = [];
    this.repeatMode = 'none'; // 'none' | 'verse' | 'page'
    this.playbackRate = 1.0;
    
    // Playback queue & context
    this.queue = [];
    this.queueVersesData = [];
    this.onPageEndCallback = null;
    this.animationFrameId = null;

    // Listeners
    this.listeners = {
      playState: [],
      verseChange: [],
      wordHighlight: [],
      timeUpdate: []
    };

    this.initAudioEvents();
  }

  initAudioEvents() {
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.startSyncLoop();
      this.emit('playState', true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.stopSyncLoop();
      this.emit('playState', false);
    });

    this.audio.addEventListener('ended', () => {
      this.handleVerseEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.stopSyncLoop();
      this.handleVerseEnded();
    });
  }

  startSyncLoop() {
    this.stopSyncLoop();
    const update = () => {
      if (!this.isPlaying) return;
      this.processWordSync();
      this.animationFrameId = requestAnimationFrame(update);
    };
    this.animationFrameId = requestAnimationFrame(update);
  }

  stopSyncLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  setReciter(reciterId) {
    const found = RECITERS.find(r => r.id === Number(reciterId));
    if (found) {
      this.selectedReciter = found;
      if (this.isPlaying && this.currentVerseKey) {
        this.playVerse(this.currentVerseKey);
      }
    }
  }

  setPlaybackRate(rate) {
    this.playbackRate = rate;
    this.audio.playbackRate = rate;
  }

  setRepeatMode(mode) {
    this.repeatMode = mode;
  }

  setPageQueue(verses, onPageEnd) {
    this.queueVersesData = verses || [];
    this.queue = (verses || []).map(v => v.verse_key);
    this.onPageEndCallback = onPageEnd;
  }

  /**
   * Sanitize and filter segment data to remove invalid entries.
   * Segment format: [word_index_0based, word_position_1based, start_ms, end_ms]
   * Removes segments with: missing fields, start >= end (will never match), or negative timing.
   * Sorts remaining segments chronologically by start time.
   * @param {Array} segments - Raw segment array from API data
   * @returns {Array} Cleaned and sorted segments
   */
  _sanitizeSegments(segments) {
    if (!segments || !Array.isArray(segments)) return [];

    return segments.filter(seg => {
      // Must have at least 4 elements
      if (!Array.isArray(seg) || seg.length < 4) return false;
      const start = seg[2];
      const end = seg[3];
      // Filter out segments with invalid timing (start >= end would never match in processWordSync)
      if (typeof start !== 'number' || typeof end !== 'number') return false;
      if (start < 0 || end < 0) return false;
      if (start >= end) return false;
      return true;
    }).sort((a, b) => a[2] - b[2]); // Ensure chronological order
  }

  /**
   * Play single verse by verseKey (e.g. "1:1")
   */
  async playVerse(verseKey, explicitSegments = null) {
    if (!verseKey) return;
    this.currentVerseKey = verseKey;
    this.currentWordPosition = null;

    // Determine whether word-by-word sync is available.
    // Segment timing data in the local JSON is generated exclusively for the Alafasy reciter.
    // Using Alafasy segments with a different reciter's audio produces wrong word highlighting
    // because each reciter reads at a different pace.
    const isAlafasy = this.selectedReciter.id === 7;

    // Find and sanitize segments from queue data
    if (explicitSegments && isAlafasy) {
      this.currentSegments = this._sanitizeSegments(explicitSegments);
    } else if (this.queueVersesData && isAlafasy) {
      const verseObj = this.queueVersesData.find(v => v.verse_key === verseKey);
      if (verseObj && verseObj.audio?.segments) {
        this.currentSegments = this._sanitizeSegments(verseObj.audio.segments);
      } else {
        this.currentSegments = [];
      }
    } else {
      // Non-Alafasy reciters: no word-by-word sync (verse-level highlight still works)
      this.currentSegments = [];
    }

    const [surahStr, ayahStr] = verseKey.split(':');
    const surahPad = surahStr.padStart(3, '0');
    const ayahPad = ayahStr.padStart(3, '0');

    let audioUrl = '';
    if (this.selectedReciter.id === 7) {
      audioUrl = `https://verses.quran.com/Alafasy/mp3/${surahPad}${ayahPad}.mp3`;
    } else {
      audioUrl = `https://everyayah.com/data/${this.selectedReciter.folder}/${surahPad}${ayahPad}.mp3`;
    }

    try {
      this.audio.src = audioUrl;
      this.audio.playbackRate = this.playbackRate;
      await this.audio.play();
      this.isPlaying = true;
      this.startSyncLoop();
      this.emit('verseChange', verseKey);
      this.emit('playState', true);
    } catch (err) {
      console.warn('Play verse failed:', err);
    }
  }

  playWord(audioUrl) {
    if (!audioUrl) return;
    const url = audioUrl.startsWith('http') ? audioUrl : `https://audio.qurancdn.com/${audioUrl}`;
    this.wordAudio.src = url;
    this.wordAudio.play().catch(() => {});
  }

  togglePlay() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      if (this.audio.src && this.currentVerseKey) {
        this.audio.play().catch(() => {});
      } else if (this.queue.length > 0) {
        this.playVerse(this.queue[0]);
      }
    }
  }

  /**
   * 60 FPS Real-Time Word Sync Calculation
   * Matches the current audio timestamp against segment timing data to determine
   * which word should be highlighted. Handles gaps between segments gracefully
   * by keeping the previous word highlighted until the next segment starts.
   */
  processWordSync() {
    const currentMs = this.audio.currentTime * 1000;
    const duration = this.audio.duration || 0;

    this.emit('timeUpdate', {
      currentTime: this.audio.currentTime,
      duration: duration,
      percent: duration ? (this.audio.currentTime / duration) * 100 : 0
    });

    if (this.currentSegments && this.currentSegments.length > 0) {
      // Find the segment whose time range contains the current playback position
      let activeSegment = null;
      let isInGap = false;

      for (let i = 0; i < this.currentSegments.length; i++) {
        const seg = this.currentSegments[i];
        const start = seg[2];
        const end = seg[3];

        if (currentMs >= start && currentMs <= end) {
          // Exact match — current time is within this segment's range
          activeSegment = seg;
          break;
        }

        if (currentMs < start) {
          // We've passed all segments that could contain currentMs.
          // currentMs is in a gap before this segment.
          // Keep the previous segment's word highlighted during the brief gap,
          // rather than flickering the highlight off and on.
          if (i > 0) {
            const prevEnd = this.currentSegments[i - 1][3];
            const gapDuration = start - prevEnd;
            // Only keep prev highlight for short gaps (< 200ms).
            // Longer gaps likely indicate a real pause in recitation.
            if (currentMs > prevEnd && gapDuration < 200) {
              activeSegment = this.currentSegments[i - 1];
            }
          }
          isInGap = true;
          break;
        }
      }

      // If currentMs is past the last segment, keep last word highlighted briefly
      if (!activeSegment && !isInGap && this.currentSegments.length > 0) {
        const lastSeg = this.currentSegments[this.currentSegments.length - 1];
        if (currentMs > lastSeg[3] && currentMs - lastSeg[3] < 200) {
          activeSegment = lastSeg;
        }
      }

      if (activeSegment) {
        const position = activeSegment[1]; // 1-indexed word position
        if (this.currentWordPosition !== position) {
          this.currentWordPosition = position;
          this.emit('wordHighlight', {
            verseKey: this.currentVerseKey,
            wordPosition: position
          });
        }
      } else {
        if (this.currentWordPosition !== null) {
          this.currentWordPosition = null;
          this.emit('wordHighlight', {
            verseKey: this.currentVerseKey,
            wordPosition: null
          });
        }
      }
    }
  }

  handleVerseEnded() {
    this.currentWordPosition = null;
    this.emit('wordHighlight', { verseKey: null, wordPosition: null });

    if (this.repeatMode === 'verse') {
      this.playVerse(this.currentVerseKey, this.currentSegments);
      return;
    }

    const currentIndex = this.queue.indexOf(this.currentVerseKey);
    if (currentIndex !== -1 && currentIndex < this.queue.length - 1) {
      const nextKey = this.queue[currentIndex + 1];
      this.playVerse(nextKey);
    } else {
      if (this.repeatMode === 'page') {
        if (this.queue.length > 0) {
          this.playVerse(this.queue[0]);
        }
      } else if (this.onPageEndCallback) {
        this.onPageEndCallback();
      } else {
        this.isPlaying = false;
        this.emit('playState', false);
      }
    }
  }

  seek(percent) {
    if (this.audio.duration) {
      this.audio.currentTime = (percent / 100) * this.audio.duration;
    }
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    this.currentVerseKey = null;
    this.currentWordPosition = null;
    this.stopSyncLoop();
    this.emit('playState', false);
    this.emit('verseChange', null);
    this.emit('wordHighlight', { verseKey: null, wordPosition: null });
  }
}

export const audioService = new AudioService();
