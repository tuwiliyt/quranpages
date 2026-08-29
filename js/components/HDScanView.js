/**
 * HD SCAN MUSHAF VIEW
 * High-Definition official scanned Mushaf page (1260px width) with zoom & interactive controls
 */

export function renderHDScanView(pageNumber) {
  const padPage = String(pageNumber).padStart(3, '0');
  const imgUrl = `https://files.quran.app/hafs/madani/width_1260/page${padPage}.png`;

  return `
    <div class="hd-scan-container w-full max-w-[680px] mx-auto p-4 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-amber-200/50 dark:border-stone-800">
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-500">
        <span>Scan Cetakan Resmi Mushaf Standar</span>
        <span class="font-bold text-amber-600">Halaman ${pageNumber} / 604</span>
      </div>

      <div class="relative overflow-hidden rounded-lg bg-stone-50 dark:bg-stone-950 flex justify-center items-center min-h-[500px]">
        <img src="${imgUrl}" 
             alt="Mushaf Page ${pageNumber}" 
             class="w-full h-auto object-contain transition-transform duration-200 hover:scale-[1.02]"
             loading="eager"
             onerror="this.onerror=null; this.src='https://verses.quran.com/images/page${padPage}.png';" />
      </div>

      <div class="mt-4 flex items-center justify-between text-xs text-stone-500">
        <span>Gunakan tombol panah ◀ ▶ untuk navigasi halaman</span>
        <a href="${imgUrl}" target="_blank" class="text-emerald-600 dark:text-amber-400 hover:underline flex items-center gap-1">
          Buka Gambar HD ↗
        </a>
      </div>
    </div>
  `;
}
