/* DCET rank predictor — same formula and score-to-rank cutoffs as T.T.T Academy's published predictor.
   Diploma % = (CGPA − 0.75) × 10; calculated score = 50% diploma % + 50% DCET marks. */
(() => {
  'use strict';
  const root = document.getElementById('predictor');
  if (!root) return;

  // [lower cutoff of calculated score, rank range] — descending; a score falls in the first band whose cutoff it meets.
  const CUTOFFS = [
    [91.8, '1–10'], [90.6, '11–20'], [89.98, '21–30'], [89.5, '31–40'], [89.1, '41–50'], [89.0, '51–60'], [88.3, '61–70'], [88.0, '71–80'], [87.8, '81–90'], [87.6, '91–100'],
    [86.9, '101–125'], [86.5, '126–150'], [86.2, '151–175'], [85.5, '176–200'], [84.6, '201–250'], [84.0, '251–300'], [83.65, '301–350'], [82.7, '351–400'], [82.2, '401–450'], [81.5, '451–500'],
    [79.96, '501–600'], [79.37, '601–700'], [78.77, '701–800'], [78.18, '801–900'], [77.6, '901–1,000'],
    [75.58, '1,001–1,200'], [74.56, '1,201–1,400'], [73.54, '1,401–1,600'], [72.52, '1,601–1,800'], [71.5, '1,801–2,000'],
    [69.25, '2,001–2,250'], [68.8, '2,251–2,500'], [68.35, '2,501–2,750'], [67.9, '2,751–3,000'],
    [65.5, '3,001–3,500'], [64.57, '3,501–4,000'], [63.65, '4,001–4,500'], [62.72, '4,501–5,000'], [61.8, '5,001–5,500'], [60.87, '5,501–6,000'], [59.95, '6,001–6,500'], [59.02, '6,501–7,000'], [58.1, '7,001–7,500'], [57.18, '7,501–8,000'], [56.25, '8,001–8,500'], [55.33, '8,501–9,000'], [54.41, '9,001–9,500'], [53.5, '9,501–10,000'],
    [52.0, '10,001–11,000'], [50.46, '11,001–12,000'], [48.93, '12,001–13,000'], [47.39, '13,001–14,000'], [45.63, '14,001–15,000'], [43.87, '15,001–16,000'], [42.11, '16,001–17,000'], [40.35, '17,001–18,000'], [38.59, '18,001–19,000'], [36.83, '19,001–20,000'], [35.07, '20,001–21,000'], [33.31, '21,001–22,000'], [31.55, '22,001–23,000'], [30.0, '23,001+'],
  ];

  const $ = (id) => document.getElementById(id);
  const cgpa = $('cgpa'), score = $('score');
  const arc = $('gaugeArc');
  const CIRC = 2 * Math.PI * 52;

  const lookup = (s) => {
    const v = Math.round(s * 10) / 10;
    for (const [min, range] of CUTOFFS) if (v >= min) return range;
    return 'Above 23,000';
  };
  const message = (s) => {
    if (s >= 87.6) return 'Top-100 territory. Keep your accuracy sharp with weekly OMR mocks.';
    if (s >= 81.5) return 'Within the top 500 — top-tier college options open up here.';
    if (s >= 71.5) return 'Within the top 2,000. A few more marks can move you hundreds of ranks.';
    return 'Every extra mark counts. A structured plan can change this rank dramatically.';
  };

  const update = () => {
    const c = Math.min(10, Math.max(0, parseFloat(cgpa.value)));
    const m = Math.min(100, Math.max(0, parseFloat(score.value)));
    if (isNaN(c) || isNaN(m)) { $('rankRange').textContent = 'Enter valid values'; return; }
    const dip = Math.max(0, Math.min(100, (c - 0.75) * 10));
    const calc = dip * 0.5 + m * 0.5;
    $('dipPct').textContent = dip.toFixed(2) + '%';
    $('dcetPart').textContent = m.toFixed(0) + '/100';
    $('calcScore').textContent = calc.toFixed(2);
    $('rankRange').textContent = lookup(calc);
    $('rankMsg').textContent = message(calc);
    arc.style.transition = 'stroke-dashoffset .6s cubic-bezier(.2,.7,.1,1)';
    arc.setAttribute('stroke-dashoffset', String(CIRC * (1 - calc / 100)));
  };

  root.querySelectorAll('[data-sync]').forEach((range) => {
    const input = $(range.dataset.sync);
    range.addEventListener('input', () => { input.value = range.value; update(); });
    input.addEventListener('input', () => { range.value = input.value; update(); });
  });
  update();
})();
