// js/admin.js
// Admin tab එකේ UI render කරන function එක

function loadAdminUI() {
  const el = document.getElementById('adminArea');
  if (!el) return;

  el.innerHTML = `
    <div class="space-y-4 text-sm text-slate-200">
      <div>
        <label class="block mb-1 text-slate-400">Item name <span class="text-rose-400">*</span></label>
        <input id="admin_itemName" class="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100" placeholder="e.g., Kelzi Black">
      </div>

      <div>
        <label class="block mb-1 text-slate-400">Item number (optional)</label>
        <input id="admin_itemNumber" class="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-700 text-slate-100" placeholder="e.g., KB-001">
      </div>

      <div class="flex gap-3">
        <button id="admin_save" class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition">
          <i class="fa-solid fa-plus"></i> Create Item
        </button>
        <button id="admin_clear" class="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-900/70 transition">
          Clear
        </button>
      </div>

      <div id="admin_msg" class="text-xs mt-1"></div>
    </div>
  `;

  document.getElementById('admin_save').addEventListener('click', async () => {
    const name = document.getElementById('admin_itemName').value.trim();
    const itemNumber = document.getElementById('admin_itemNumber').value.trim() || null;
    const msg = document.getElementById('admin_msg');
    msg.textContent = '';
    msg.className = 'text-xs mt-1';

    if (!name) {
      msg.textContent = 'Item name is required';
      msg.classList.add('text-rose-400');
      return;
    }

    try {
      const body = { name };
      if (itemNumber) body.itemNumber = itemNumber;
      const res = await apiPost('/api/items', body);
      const item = res.item || res;
      msg.textContent = `"${item.name}" created successfully.`;
      msg.classList.add('text-emerald-400');

      document.getElementById('admin_itemName').value = '';
      document.getElementById('admin_itemNumber').value = '';
    } catch (e) {
      console.error(e);
      msg.textContent = e.message || e.body?.error || 'Failed to create item';
      msg.classList.add('text-rose-400');
    }
  });

  document.getElementById('admin_clear').addEventListener('click', () => {
    document.getElementById('admin_itemName').value = '';
    document.getElementById('admin_itemNumber').value = '';
    const msg = document.getElementById('admin_msg');
    msg.textContent = '';
    msg.className = 'text-xs mt-1';
  });
}
