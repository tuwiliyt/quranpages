/**
 * FOOTER COMPONENT
 * Minimalist, Responsive & Fully Interactive Footer
 * Copyright © 2026 @richieoct
 */

export function renderFooter() {
  return `
    <footer class="w-full border-t border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/60 py-8 px-4 mt-12 mb-28 transition-colors select-none">
      <div class="max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 text-center">
        
        <!-- App Brand -->
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span class="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
            Mushaf Al-Qur'an Standar Indonesia
          </span>
        </div>

        <p class="text-xs text-stone-500 dark:text-stone-400 max-w-md leading-relaxed">
          Mushaf 15 Baris & Ayat Pojok resmi LPMQ Kementerian Agama RI & Standar Madinah 604 Halaman. 100% Aset Lokal & Sinkronisasi Kata Demi Kata.
        </p>

        <!-- Quick Interactive Navigation Links -->
        <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold text-stone-700 dark:text-stone-300">
          <button type="button" id="btn-footer-surah" class="cursor-pointer hover:text-emerald-700 dark:hover:text-amber-400 transition-colors py-1.5 px-3 rounded-xl hover:bg-stone-200/70 dark:hover:bg-stone-800 active:scale-95">
            114 Surah
          </button>
          <span>•</span>
          <button type="button" id="btn-footer-doas" class="cursor-pointer hover:text-emerald-700 dark:hover:text-amber-400 transition-colors py-1.5 px-3 rounded-xl hover:bg-stone-200/70 dark:hover:bg-stone-800 active:scale-95">
            Doa Khotmil Qur'an
          </button>
          <span>•</span>
          <button type="button" id="btn-footer-tajwid" class="cursor-pointer hover:text-emerald-700 dark:hover:text-amber-400 transition-colors py-1.5 px-3 rounded-xl hover:bg-stone-200/70 dark:hover:bg-stone-800 active:scale-95">
            Panduan Tajwid
          </button>
          <span>•</span>
          <a href="https://github.com/tuwiliyt/quranpages" target="_blank" rel="noopener noreferrer" class="hover:text-emerald-700 dark:hover:text-amber-400 transition-colors flex items-center gap-1 py-1.5 px-3 rounded-xl hover:bg-stone-200/70 dark:hover:bg-stone-800 active:scale-95">
            <span>GitHub</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
          </a>
        </div>

        <!-- Copyright Line -->
        <div class="pt-3 border-t border-stone-200 dark:border-stone-800 w-full max-w-xs text-xs text-stone-500 dark:text-stone-400 font-medium">
          <p>© 2026 <span class="font-bold text-emerald-800 dark:text-amber-400">@richieoct</span></p>
        </div>

      </div>
    </footer>
  `;
}
