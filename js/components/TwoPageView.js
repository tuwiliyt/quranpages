/**
 * TWO-PAGE SPREAD (Buku / Kitab Mode)
 * Renders even page on Right and odd page on Left, mirroring physical Arabic Mushaf books!
 */

import { renderMushafPage } from './MushafPage.js';

export function renderTwoPageSpread(rightPageNum, rightVerses, leftPageNum, leftVerses, options = {}) {
  const rightHtml = renderMushafPage(rightPageNum, rightVerses, options);
  const leftHtml = leftPageNum <= 604 ? renderMushafPage(leftPageNum, leftVerses, options) : '<div class="p-12 text-center text-stone-400">Akhir Mushaf</div>';

  return `
    <div class="two-page-spread w-full max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-0 p-2 md:p-6 rounded-2xl">
      <!-- Right Page (Even or Earlier Page in RTL) -->
      <div class="two-page-right p-1 md:p-3">
        ${rightHtml}
      </div>

      <!-- Left Page (Odd or Later Page in RTL) -->
      <div class="two-page-left p-1 md:p-3">
        ${leftHtml}
      </div>
    </div>
  `;
}
