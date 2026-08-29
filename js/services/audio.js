/**
 * AUDIO MANAGER SERVICE (KARAOKE SYNCHRONIZATION ENGINE)
 * High-Precision 60 FPS Word-by-Word Synchronized Highlighting
 * Supports Continuous Multi-Page Auto-Play and Seamless Transitions
 */

export const RECITERS = [
  { id: 7, name: 'Mishary Rashid Alafasy', subtext: 'Murattal (Lengkap Segmen Karaoke Kata)', folder: 'Alafasy/mp3' },
  { id: 3, name: 'Abdur-Rahman As-Sudais', subtext: 'Imam Masjidil Haram', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
  { id: 11, name: 'Maher Al-Muaiqly', subtext: 'Imam Masjidil Haram', folder: 'Maher_AlMuaiqly_64kbps' },
  { id: 6, name: 'Mahmoud Khalil Al-Husary', subtext: 'Tartil Standar Tajwid', folder: 'Husary_128kbps' },
  { id: 2, name: 'Abdul Basit Murattal', subtext: 'Qari Mesir Legendaris', folder: 'Abdul_Basit_Murattal_192kbps' },
  { id: 4, name: 'Abu Bakr Al-Shatri', subtext: 'Murattal Khas', folder: 'Abu_Bakr_Ash-Shaatree_128kbps' }
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
      this.startKaraokeLoop();
      this.emit('playState', true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.stopKaraokeLoop();
      this.emit('playState', false);
    });

    this.audio.addEventListener('ended', () => {
      this.handleVerseEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      // Attempt next if available or notify
      this.stopKaraokeLoop();
      this.handleVerseEnded();
    });
  }

  startKaraokeLoop() {
    this.stopKaraokeLoop();
    const update = () => {
      if (!this.isPlaying) return;
      this.processKaraokeSync();
      this.animationFrameId = requestAnimationFrame(update);
    };
    this.animationFrameId = requestAnimationFrame(update);
  }

  stopKaraokeLoop() {
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
   * Play single verse by verseKey (e.g. "1:1")
   */
  async playVerse(verseKey, explicitSegments = null) {
    if (!verseKey) return;
    this.currentVerseKey = verseKey;
    this.currentWordPosition = null;

    // Find segments from queue data
    if (explicitSegments) {
      this.currentSegments = explicitSegments;
    } else if (this.queueVersesData) {
      const verseObj = this.queueVersesData.find(v => v.verse_key === verseKey);
      if (verseObj && verseObj.audio?.segments) {
        this.currentSegments = verseObj.audio.segments;
      } else {
        this.currentSegments = [];
      }
    } else {
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
      this.startKaraokeLoop();
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
   * 60 FPS Real-Time Karaoke Sync Calculation
   */
  processKaraokeSync() {
    const currentMs = this.audio.currentTime * 1000;
    const duration = this.audio.duration || 0;

    this.emit('timeUpdate', {
      currentTime: this.audio.currentTime,
      duration: duration,
      percent: duration ? (this.audio.currentTime / duration) * 100 : 0
    });

    if (this.currentSegments && this.currentSegments.length > 0) {
      const activeSegment = this.currentSegments.find(seg => {
        const start = seg[2];
        const end = seg[3];
        return currentMs >= start && currentMs <= end;
      });

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
      // Next verse on the SAME page
      const nextKey = this.queue[currentIndex + 1];
      this.playVerse(nextKey);
    } else {
      // End of current page
      if (this.repeatMode === 'page') {
        if (this.queue.length > 0) {
          this.playVerse(this.queue[0]);
        }
      } else if (this.onPageEndCallback) {
        // Continuous Multi-Page Auto-Play!
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
    this.stopKaraokeLoop();
    this.emit('playState', false);
    this.emit('verseChange', null);
    this.emit('wordHighlight', { verseKey: null, wordPosition: null });
  }
}

export const audioService = new AudioService();
