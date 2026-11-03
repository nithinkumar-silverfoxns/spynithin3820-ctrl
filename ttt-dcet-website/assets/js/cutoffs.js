/* College cutoff finder — loads DCET 2026 Round-1 cutoffs from /api/cutoffs and filters client-side. */
(() => {
  'use strict';
  const box = document.getElementById('cutoffFinder');
  if (!box) return;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let rows = [];

  const render = () => {
    const rank = parseInt($('cfRank').value, 10);
    const cat = $('cfCat').value;
    const kw = $('cfBranch').value.trim().toLowerCase();
    if (!rank || rank < 1) { $('cfSummary').textContent = 'Enter a valid rank.'; return; }
    const hits = rows
      .map((r) => ({ ...r, cut: parseInt(r.cut[cat], 10) }))
      .filter((r) => !isNaN(r.cut) && r.cut >= rank && (!kw || r.course.toLowerCase().includes(kw) || r.college.toLowerCase().includes(kw)))
      .sort((a, b) => a.cut - b.cut);
    $('cfSummary').textContent = hits.length
      ? `${hits.length} college-branch options closed at or after rank ${rank.toLocaleString('en-IN')} (${cat}) in DCET 2026`
      : `No options found for rank ${rank.toLocaleString('en-IN')} in ${cat} among the top 50 colleges — try a different category or branch.`;
    $('cfBody').innerHTML = hits.slice(0, 300).map((h) => `<tr><td><strong>${esc(h.college)}</strong><div class="small muted">${esc(h.code)}</div></td><td>${esc(h.course)}</td><td class="num">${h.cut.toLocaleString('en-IN')}</td><td class="num">${(h.cut - rank).toLocaleString('en-IN')}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">No matches</td></tr>';
  };

  fetch(box.dataset.src, { headers: { Accept: 'application/json' } })
    .then((r) => r.json())
    .then((d) => { rows = d.rows || []; render(); })
    .catch(() => { $('cfSummary').textContent = 'Could not load cutoff data. Please refresh the page.'; });

  $('cfGo').addEventListener('click', render);
  ['cfRank', 'cfCat', 'cfBranch'].forEach((id) => $(id).addEventListener('input', () => { clearTimeout(render.t); render.t = setTimeout(render, 250); }));
})();
