// js/reports.js
// Reports tab UI + logic

function loadReportsUI() {
  const el = document.getElementById('reportsArea');
  if (!el) return;

  el.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-slate-200">
      <div class="space-y-3">
        <h4 class="font-semibold text-slate-100 mb-2">Create Report</h4>

        <div>
          <label class="block mb-1 text-slate-400 text-xs">Search item</label>
          <input id="repSearch" class="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100" placeholder="Search name or item number">
        </div>

        <div>
          <label class="block mb-1 text-slate-400 text-xs">Report type</label>
          <select id="repType" class="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100">
            <option value="Damage">Damage</option>
            <option value="Shortage">Shortage</option>
          </select>
        </div>

        <div>
          <label class="block mb-1 text-slate-400 text-xs">Reported quantity</label>
          <input id="repQty" type="number" min="1" class="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100">
        </div>

        <div>
          <label class="block mb-1 text-slate-400 text-xs">Note (optional)</label>
          <input id="repNote" class="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100" placeholder="Any comments">
        </div>

        <button id="repCreate" class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition">
          <i class="fa-solid fa-flag"></i> Submit Report
        </button>

        <div id="repMsg" class="text-xs mt-1"></div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold text-slate-100">Recent Reports</h4>
        </div>
        <div id="reportsList" class="space-y-2 max-h-80 overflow-auto border border-slate-700 rounded-2xl bg-slate-900/70 p-2"></div>
      </div>
    </div>
  `;

  document.getElementById('repCreate').addEventListener('click', async () => {
    const q = document.getElementById('repSearch').value.trim();
    const type = document.getElementById('repType').value;
    const qty = Number(document.getElementById('repQty').value || 0);
    const note = document.getElementById('repNote').value.trim() || null;
    const msg = document.getElementById('repMsg');
    msg.textContent = '';
    msg.className = 'text-xs mt-1';

    if (!q) {
      msg.textContent = 'Search an item first';
      msg.classList.add('text-rose-400');
      return;
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      msg.textContent = 'Quantity must be positive';
      msg.classList.add('text-rose-400');
      return;
    }

    try {
      const items = await apiGet(`/api/items?q=${encodeURIComponent(q)}`);
      const list = Array.isArray(items) ? items : (items.items || items.data || []);
      if (!list || list.length === 0) {
        msg.textContent = 'No matching item found';
        msg.classList.add('text-rose-400');
        return;
      }
      const item = list[0]; // first match
      const body = {
        itemId: item.id || item.item_id,
        variantId: null,
        reportType: type,
        reportedQty: qty,
        expectedQty: null,
        note
      };
      // backend: use POST /api/reports/damage (name but supports both types)
      await apiPost('/api/reports/damage', body);

      msg.textContent = 'Report created and sent to admins';
      msg.classList.add('text-emerald-400');
      document.getElementById('repSearch').value = '';
      document.getElementById('repQty').value = '';
      document.getElementById('repNote').value = '';
      loadReportsList();
    } catch (e) {
      console.error(e);
      msg.textContent = e.message || e.body?.error || 'Failed to create report';
      msg.classList.add('text-rose-400');
    }
  });

  async function loadReportsList() {
    const listEl = document.getElementById('reportsList');
    listEl.innerHTML = '<div class="text-xs text-slate-400">Loading…</div>';
    try {
      const res = await apiGet('/api/reports?limit=50');
      const list = Array.isArray(res) ? res : (res.data || []);
      if (!list || list.length === 0) {
        listEl.innerHTML = '<div class="text-xs text-slate-500">No reports</div>';
        return;
      }
      listEl.innerHTML = list.map(r => {
        const t = r.createdAt || r.created_at || '';
        const rt = r.reportType || r.report_type || '';
        const rq = r.reportedQty ?? r.reported_qty ?? '';
        const st = r.status || 'Open';
        return `<div class="p-2 rounded-xl border border-slate-700 bg-slate-900/90 text-xs text-slate-200">
          <div class="flex justify-between items-center mb-1">
            <span class="font-semibold">${escapeHtml(rt)} — ${escapeHtml(String(rq))}</span>
            <span class="text-[10px] px-2 py-0.5 rounded-full ${
              st === 'Open' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            }">${escapeHtml(st)}</span>
          </div>
          <div class="text-[10px] text-slate-500">${escapeHtml(String(t))}</div>
        </div>`;
      }).join('');
    } catch (e) {
      console.error(e);
      listEl.innerHTML = '<div class="text-xs text-rose-400">Failed to load reports</div>';
    }
  }

  loadReportsList();
}
