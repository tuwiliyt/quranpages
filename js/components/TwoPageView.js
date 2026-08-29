/**
 * TWO-PAGE SPREAD COMPONENT (RESPONSIVE BOOK SPREAD)
 */

import { renderMushafPage } from './MushafPage.js';

export function renderTwoPageSpread(rightPageNum, rightVerses, leftPageNum, leftVerses, options = {}) {
  const rightPageHtml = renderMushafPage(rightPageNum, rightVerses, options);
  const leftPageHtml = (leftPageNum <= 604) ? renderMushafPage(leftPageNum, leftVerses, options) : '';

  return `
    <div class="two-page-spread-wrapper w-full max-w-6xl mx-auto">
      <!-- Desktop & Tablet Two Page View -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-start">
        
        <!-- Left Page (Odd Page in Arabic reading) -->
        <div class="order-2 md:order-1 transform transition-transform">
          ${leftPageHtml ? leftPageHtml : '<div class="p-8 text-center text-stone-400">Akhir Al-Qur\'an</div>'}
        </div>

        <!-- Right Page (Even Page in Arabic reading) -->
        <div class="order-1 md:order-2 transform transition-transform">
          ${rightPageHtml}
        </div>

      </div>
    </div>
  `;
}
