// ═══ ui.js V1.27 — Visual Design + UX Upgrade ═══
import { DEFAULT_MALE, DEFAULT_FEMALE, MAX_MS } from './constants.js';
import { compute, fmt } from './engine.js';

export function getAvatar(S) {
  return S.clientPhoto || (S.gender === "M" ? DEFAULT_MALE : DEFAULT_FEMALE);
}

export function scaleWrap(id, designWidth) {
  const el = document.getElementById(id);
  if (!el) return;
  const vw = Math.min(window.innerWidth, document.documentElement.clientWidth);
  const scale = Math.min(1, (vw - 16) / designWidth);
  const offset = (vw - designWidth * scale) / 2;
  el.style.transform = `translateX(${offset}px) scale(${scale})`;
  el.style.marginBottom = `${(scale - 1) * el.offsetHeight}px`;
}

const icon = name => {
  const base = 'w-5 h-5 text-indigo-500';
  const paths = {
    user: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"/>',
    calendar: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M5 11h14M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"/>',
    cash: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-2.2 0-4 .9-4 2s1.8 2 4 2 4 .9 4 2-1.8 2-4 2m0-8V6m0 12v-2M4 7h16v10H4z"/>',
    chart: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 19V5m0 14h16M8 15l3-3 3 2 5-7"/>',
    shield: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7l7-4z"/>',
    spark: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/>'
  };
  return `<svg class="${base}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${paths[name] || paths.spark}</svg>`;
};

function field({ id, label, value, type = 'number', min = '', max = '', step = '', placeholder = '', iconName = 'cash', readonly = false }) {
  const inputCls = readonly
    ? 'ux-input bg-gray-50 cursor-not-allowed text-indigo-700 font-extrabold'
    : 'ux-input';
  return `<div>
    <label class="ux-label">${label}</label>
    <div class="relative mt-1">
      <div class="absolute left-3 top-1/2 -translate-y-1/2">${icon(iconName)}</div>
      <input ${readonly ? 'readonly' : ''} type="${type}" id="${id}" value="${value}" placeholder="${placeholder}" min="${min}" max="${max}" step="${step}" class="${inputCls} pl-11 ${type === 'text' ? 'text-left' : 'text-right'}"/>
    </div>
  </div>`;
}

function stepper({ id, label, value, min, max, step = 1, iconName = 'calendar' }) {
  return `<div>
    <label class="ux-label">${label}</label>
    <div class="stepper mt-1" data-stepper="${id}" data-step="${step}" data-min="${min}" data-max="${max}">
      <button type="button" class="step-btn" data-dir="-1">−</button>
      <div class="relative flex-1">
        <div class="absolute left-3 top-1/2 -translate-y-1/2">${icon(iconName)}</div>
        <input type="number" id="${id}" value="${value}" min="${min}" max="${max}" step="${step}" class="ux-input text-center pl-11"/>
      </div>
      <button type="button" class="step-btn" data-dir="1">＋</button>
    </div>
  </div>`;
}

function metric(label, value, tone = 'indigo', note = '') {
  const toneMap = {
    indigo: 'from-indigo-600 to-indigo-500 text-white',
    amber: 'from-amber-500 to-orange-500 text-white',
    green: 'from-emerald-500 to-teal-500 text-white',
    white: 'from-white to-slate-50 text-gray-900 border border-gray-100'
  };
  return `<div class="rounded-2xl p-4 shadow-sm bg-gradient-to-br ${toneMap[tone]}">
    <div class="text-xs ${tone === 'white' ? 'text-gray-500' : 'text-white/80'} font-medium">${label}</div>
    <div class="text-2xl font-extrabold tracking-tight mt-1">${value}</div>
    ${note ? `<div class="text-xs mt-1 ${tone === 'white' ? 'text-gray-500' : 'text-white/75'}">${note}</div>` : ''}
  </div>`;
}

function retirementChart(D, S) {
  const rows = D.opt || [];
  const values = rows.map(r => r.sv || 0);
  const maxY = Math.max(D.capDist || 0, ...values, 1);
  const w = 700, h = 220, pad = 34;
  const x = i => pad + (rows.length <= 1 ? 0 : i * (w - pad * 2) / (rows.length - 1));
  const y = v => h - pad - (v / maxY) * (h - pad * 2);
  const path = rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r.sv || 0).toFixed(1)}`).join(' ');
  const targetY = y(D.capDist || 0).toFixed(1);
  const retireIndex = Math.max(0, Math.min(rows.length - 1, D.ri || 0));
  const retireX = x(retireIndex).toFixed(1);
  const area = path ? `${path} L${x(rows.length - 1).toFixed(1)},${h - pad} L${pad},${h - pad} Z` : '';
  return `<div class="report-card p-5">
    <div class="flex items-start justify-between gap-4 mb-3">
      <div>
        <h2 class="text-xl font-extrabold text-gray-900">退休資金軌跡圖</h2>
        <p class="text-sm text-gray-500 mt-1">X 軸為年齡，Y 軸為累積資金。橘線是目標退休金，藍線是規劃軌跡。</p>
      </div>
      <div class="text-right text-xs text-gray-500 shrink-0">退休年齡<br><b class="text-indigo-600 text-lg">${S.retirementAge}歲</b></div>
    </div>
    <svg class="w-full" viewBox="0 0 ${w} ${h}" role="img" aria-label="退休資金軌跡圖">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4f46e5" stop-opacity=".22"/><stop offset="100%" stop-color="#4f46e5" stop-opacity="0"/></linearGradient>
      </defs>
      <rect x="0" y="0" width="${w}" height="${h}" rx="18" fill="#f8fafc"/>
      <line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="#cbd5e1"/>
      <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${h-pad}" stroke="#cbd5e1"/>
      <line x1="${pad}" y1="${targetY}" x2="${w-pad}" y2="${targetY}" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 7"/>
      <text x="${w-pad-4}" y="${Number(targetY)-8}" text-anchor="end" fill="#b45309" font-size="13" font-weight="700">目標 ${fmt(D.capDist)}</text>
      <line x1="${retireX}" y1="${pad}" x2="${retireX}" y2="${h-pad}" stroke="#94a3b8" stroke-dasharray="4 6"/>
      ${area ? `<path d="${area}" fill="url(#chartFill)"/>` : ''}
      ${path ? `<path d="${path}" fill="none" stroke="#4f46e5" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      <circle cx="${retireX}" cy="${y(D.svR || 0).toFixed(1)}" r="7" fill="#4f46e5" stroke="white" stroke-width="3"/>
      <text x="${pad}" y="${h-10}" fill="#64748b" font-size="12">${S.currentAge}歲</text>
      <text x="${w-pad}" y="${h-10}" text-anchor="end" fill="#64748b" font-size="12">${S.currentAge + rows.length - 1}歲</text>
    </svg>
  </div>`;
}

// ─── 輸入頁 ───
export function renderInputPage(S, onStateChange, onGenerate) {
  if (S.bankRate == null) S.bankRate = 1.2;
  const D = compute(S);
  const benefits = [
    ['看見目標', '把退休生活變成明確數字'], ['提早準備', '用時間降低每月壓力'],
    ['控制缺口', '知道現在離理想差多少'], ['避免降級', '退休後不被迫縮水生活'],
    ['保留選擇', '醫療、旅行、家庭更有底氣'], ['善用工具', '把收入轉成未來現金流'],
    ['留下保障', '規劃不只為自己，也為家人'], ['方便溝通', '讓客戶自己看懂自己的答案']
  ].map(([t, d]) => `<div class="benefit-card"><div>${icon('shield')}</div><div><b>${t}</b><span>${d}</span></div></div>`).join('');

  return {
    html: `
    <div id="input-outer" class="min-h-screen bg-gray-50 safe-pad">
      <div id="input-wrap">
        <div class="text-center py-5">
          <div class="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 px-4 py-1.5 text-xs font-bold mb-3">${icon('spark')} V1.27 Visual Upgrade</div>
          <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">退休財務計畫書</h1>
          <p class="text-gray-600 text-sm mt-2">把理想生活，變成安全可完成的財務路線。</p>
        </div>

        <div class="report-card p-5 mb-4">
          <h2 class="section-title">❶ 客戶基本資料</h2>
          <div class="flex flex-col items-center mb-5">
            <div id="photoBox" class="photo-box">
              <img src="${getAvatar(S)}" class="w-full h-full object-cover"/>
            </div>
            <input type="file" id="photoInput" accept="image/*" class="hidden"/>
            <div class="flex gap-3 mt-2">
              <span class="text-xs text-indigo-600 cursor-pointer hover:underline font-medium" id="changePhoto">更換照片</span>
              ${S.clientPhoto ? `<span class="text-xs text-red-400 cursor-pointer hover:underline" id="removePhoto">移除照片</span>` : ""}
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">${field({ id: 'iName', label: '姓名', value: S.clientName, type: 'text', placeholder: '請輸入客戶姓名', iconName: 'user' })}</div>
            <div class="col-span-2">
              <label class="ux-label">性別</label>
              <div class="grid grid-cols-2 gap-3 mt-1">
                <button id="genderM" type="button" class="gender-tab ${S.gender === 'M' ? 'active' : ''}">男性</button>
                <button id="genderF" type="button" class="gender-tab ${S.gender === 'F' ? 'active' : ''}">女性</button>
              </div>
            </div>
            ${stepper({ id: 'iAge', label: '目前年齡', value: S.currentAge, min: 16, max: 70 })}
            ${stepper({ id: 'iRetire', label: '預計退休年齡', value: S.retirementAge, min: 40, max: 80 })}
          </div>
        </div>

        <div class="report-card p-5 mb-4">
          <h2 class="section-title">❷ 退休規劃設定</h2>
          <div class="grid grid-cols-2 gap-4">
            ${stepper({ id: 'iLife', label: '平均餘命', value: S.lifeExpectancy, min: 60, max: 110 })}
            ${field({ id: 'iExpense', label: '預計退休花費（月）', value: S.monthlyExpense, step: 5000, iconName: 'cash' })}
            ${field({ id: 'iPrepared', label: '已準備退休金', value: S.preparedAmount, step: 100000, iconName: 'cash' })}
            ${field({ id: 'iReturn', label: '假設投報率 %', value: S.assumedReturn, min: 0, max: 12, step: 0.5, iconName: 'chart' })}
          </div>
        </div>

        <div class="report-card p-5 mb-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="section-title mb-1">❷․₅ 方案一：自己存</h2>
              <p class="text-xs text-gray-500">（假設銀行平均滾息利率為1.2%）</p>
            </div>
            <details class="info-pop">
              <summary>?</summary>
              <p>此處用「每月存入＋年度滾息」概念試算，讓客戶知道若只靠自己存，退休前每月需要準備多少。</p>
            </details>
          </div>
          <div class="mt-4">${field({ id: 'iBankRate', label: '銀行存款年利率 (%)', value: S.bankRate ?? 1.2, min: 0, max: 10, step: 0.1, iconName: 'chart' })}</div>
        </div>

        <div class="report-card p-5 mb-4">
          <h2 class="section-title">❸ 保單自動試算結果</h2>
          <p class="text-sm text-gray-500 mb-4">依據退休花費與年齡自動計算。月存上限 ${fmt(MAX_MS)} 元，超出自動轉入月超額保費。</p>
          ${S.preparedAmount > 0 ? `<div class="mb-4 bg-amber-50 rounded-2xl px-4 py-3 text-sm text-amber-800 border border-amber-100">已準備退休金 ${fmt(S.preparedAmount)} 元，以 7% 年化換算每月可提供 <b>${fmt(Math.round(D.preparedMonthly))}</b> 元，保單目標缺口已自動扣除。</div>` : ""}
          <div class="grid grid-cols-2 gap-3">
            ${metric('需準備退休資金', fmt(Math.round(D.capDist)), 'amber', S.preparedAmount > 0 ? '已扣除既有準備金' : '以月配息目標回推')}
            ${metric('月存金額', fmt(D.monthlySaving), 'indigo', D.monthlySaving >= MAX_MS ? '已達月存上限' : '系統自動試算')}
            ${metric('年目標保費', fmt(D.annualTarget), 'white')}
            ${metric('基本保額（萬）', fmt(D.saWan), 'white')}
          </div>
          <div class="mt-4 bg-indigo-50 rounded-2xl p-4 text-sm text-indigo-900 border border-indigo-100">
            <b>每月總存入：</b>${fmt(Math.round(D.policyMonthly))} 元 → 退休時預估解約金 <b class="text-emerald-700">${fmt(D.svR)}</b> 元
          </div>
        </div>

        <div class="report-card p-5 mb-4">
          <h2 class="section-title">退休規劃八大好處</h2>
          <div class="grid grid-cols-2 gap-2">${benefits}</div>
        </div>

        <button id="btnGenerate" class="tap-btn w-full py-4 rounded-2xl text-white font-extrabold text-lg bg-gradient-to-r from-indigo-600 to-indigo-500 active:from-indigo-700 active:to-indigo-600 shadow-lg shadow-indigo-200 cursor-pointer mt-2 mb-5">產生退休財務計畫書 →</button>
      </div>
    </div>`,
    bind() {
      document.getElementById('photoBox').onclick = () => document.getElementById('photoInput').click();
      document.getElementById('changePhoto').onclick = () => document.getElementById('photoInput').click();
      document.getElementById('photoInput').onchange = e => {
        const f = e.target.files?.[0];
        if (f) { const r = new FileReader(); r.onload = ev => { S.clientPhoto = ev.target.result; onStateChange(); }; r.readAsDataURL(f); }
      };
      if (document.getElementById('removePhoto')) document.getElementById('removePhoto').onclick = () => { S.clientPhoto = null; onStateChange(); };
      document.getElementById('genderM').onclick = () => { S.gender = 'M'; onStateChange(); };
      document.getElementById('genderF').onclick = () => { S.gender = 'F'; onStateChange(); };
      document.getElementById('iName').oninput = e => { S.clientName = e.target.value; };
      const bindNum = (id, key, rerender = true) => {
        const el = document.getElementById(id);
        el.onchange = e => { S[key] = +e.target.value; if (rerender) onStateChange(); };
        el.oninput = e => { S[key] = +e.target.value; };
      };
      bindNum('iAge', 'currentAge'); bindNum('iRetire', 'retirementAge'); bindNum('iLife', 'lifeExpectancy');
      bindNum('iExpense', 'monthlyExpense'); bindNum('iPrepared', 'preparedAmount', false);
      bindNum('iReturn', 'assumedReturn'); bindNum('iBankRate', 'bankRate');
      document.querySelectorAll('[data-stepper]').forEach(box => {
        const id = box.dataset.stepper, step = +(box.dataset.step || 1), min = +(box.dataset.min || -Infinity), max = +(box.dataset.max || Infinity);
        box.querySelectorAll('.step-btn').forEach(btn => btn.onclick = () => {
          const input = document.getElementById(id);
          input.value = Math.max(min, Math.min(max, (+input.value || 0) + step * +btn.dataset.dir));
          input.dispatchEvent(new Event('change'));
        });
      });
      document.getElementById('btnGenerate').onclick = onGenerate;
      scaleWrap('input-wrap', 480);
    }
  };
}

// ─── 報告頁 ───
export function renderReportPage(S, onBack, onPdfClick, onImgClick) {
  if (S.bankRate == null) S.bankRate = 1.2;
  const D = compute(S);
  const ticks = Array.from({ length: 21 }, (_, i) => i * 5).map(n =>
    `<div class="absolute flex flex-col items-center" style="left:${n}%;transform:translateX(-50%)"><div class="w-px h-1.5 bg-gray-300"></div><span class="text-xs text-gray-400 leading-none mt-0.5">${n}</span></div>`
  ).join('');
  const tableRows = D.opt.filter((_, i) => (i + 1) % 5 === 0 || i === 0 || i === D.ri).map(r =>
    `<tr class="border-t border-gray-200 ${r.year === D.workYears + 1 ? 'bg-amber-50 font-bold' : ''}"><td class="px-2 py-1.5 text-center">${r.year}</td><td class="px-2 py-1.5 text-center">${r.age}</td><td class="px-2 py-1.5 text-right">${fmt(r.cum)}</td><td class="px-2 py-1.5 text-right text-indigo-700">${fmt(r.av)}</td><td class="px-2 py-1.5 text-right text-emerald-700">${fmt(r.sv)}</td><td class="px-2 py-1.5 text-right">${fmt(r.db)}</td></tr>`
  ).join('');

  return {
    html: `
  <div id="report-outer" class="bg-gray-50 safe-pad">
    <div id="report-wrap">
      <button id="btnBack" class="tap-btn no-print flex items-center gap-2 text-indigo-700 text-sm font-bold mb-4 cursor-pointer px-4 py-2 rounded-2xl bg-indigo-50 border border-indigo-100">◀ 返回修改</button>

      <div class="report-card p-6 mb-4 overflow-hidden relative">
        <div class="absolute right-0 top-0 w-48 h-48 bg-indigo-100 rounded-full blur-3xl opacity-60 translate-x-16 -translate-y-20"></div>
        <div class="flex items-center gap-5 relative">
          <div class="flex-shrink-0" style="width:116px;height:116px">
            <div class="w-full h-full rounded-3xl overflow-hidden bg-gray-900 shadow-lg ring-4 ring-white">
              <img src="${getAvatar(S)}" class="w-full h-full object-cover"/>
            </div>
          </div>
          <div class="flex flex-col justify-center gap-1 min-w-0">
            <div class="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full w-fit">${icon('shield')} Retirement Plan</div>
            <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">退休財務計畫書</h1>
            <div class="text-xl text-gray-600 font-bold">${S.clientName || '客戶名稱'}</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-3 mb-4">
        ${metric('目前年齡', `${S.currentAge}歲`, 'white')}
        ${metric('預計退休年齡', `${S.retirementAge}歲`, 'white')}
        ${metric('預計退休花費', `${D.expW}萬 / 月`, 'amber')}
        ${metric('已準備退休金', S.preparedAmount > 0 ? fmt(S.preparedAmount) : '尚未填寫', 'white')}
      </div>

      <div class="report-card p-4 mb-4">
        <div class="flex text-[10px] text-gray-500 font-bold mb-1" style="-webkit-print-color-adjust:exact;print-color-adjust:exact">
          <div style="width:${S.currentAge}%" class="text-center">目前年紀</div>
          <div style="width:${S.retirementAge - S.currentAge}%" class="text-center">預計剩餘工作時間</div>
          <div style="width:${S.lifeExpectancy - S.retirementAge}%" class="text-center">退休生活時間</div>
          <div style="width:${100 - S.lifeExpectancy}%" class="text-center">超越平均餘命</div>
        </div>
        <div class="relative flex rounded-2xl overflow-hidden font-black text-base" style="height:42px;-webkit-print-color-adjust:exact;print-color-adjust:exact">
          <div class="flex items-center justify-center overflow-hidden" style="width:${S.currentAge}%;background:#cbd5e1;color:#fff"><span class="whitespace-nowrap">${S.currentAge}年</span></div>
          <div class="flex items-center justify-center overflow-hidden" style="width:${S.retirementAge - S.currentAge}%;background:#4f46e5;color:#fff"><span class="whitespace-nowrap">${D.workYears}年</span></div>
          <div class="flex items-center justify-center overflow-hidden" style="width:${S.lifeExpectancy - S.retirementAge}%;background:#f59e0b;color:#fff"><span class="whitespace-nowrap">${D.retireYears}年</span></div>
          <div class="flex items-center justify-center overflow-hidden" style="width:${100 - S.lifeExpectancy}%;background:#64748b;color:#fff"><span class="whitespace-nowrap">${100 - S.lifeExpectancy}年</span></div>
        </div>
        <div class="relative h-4 mt-0.5">${ticks}</div>
      </div>

      ${retirementChart(D, S)}

      <div class="grid grid-cols-2 gap-4 my-4">
        <div class="report-card p-5">
          <h2 class="text-xl font-extrabold text-gray-900 mb-1">退休方案一</h2>
          <p class="text-xs text-gray-500 mb-4">自己存｜假設銀行平均滾息利率為 ${S.bankRate ?? 1.2}%</p>
          <div class="text-center bg-gray-50 rounded-2xl p-4 mb-3">準備好退休金，每個月花存款 ${D.expW} 萬元</div>
          ${metric('需準備總退休金', `${D.needW}萬`, 'amber', `${D.expW}萬 × 12個月 × ${D.retireYears}年`)}
          <div class="mt-3 text-center rounded-2xl bg-red-50 border border-red-100 p-4">
            <div class="text-sm text-gray-500">每月需存下</div>
            <div class="text-3xl font-extrabold text-red-600">${fmt(Math.round(D.selfMonthly))}</div>
            <div class="text-xs text-gray-500 mt-1">每年 ${fmt(Math.round(D.selfAnnual))}</div>
          </div>
        </div>
        <div class="report-card p-5">
          <h2 class="text-xl font-extrabold text-gray-900 mb-1">退休方案二</h2>
          <p class="text-xs text-gray-500 mb-4">富邦退休規劃方案｜以月配息 7% 回推</p>
          <div class="text-center bg-indigo-50 text-indigo-900 rounded-2xl p-4 mb-3">打造月配息，每個月領 ${D.expW} 萬元</div>
          ${metric('需準備月配息本金', `約 ${D.capW}萬`, 'indigo', S.preparedAmount > 0 ? `已扣除既有準備金每月 ${fmt(Math.round(D.preparedMonthly))}` : '以退休現金流回推')}
          <div class="mt-3 text-center rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
            <div class="text-sm text-gray-500">每月存入</div>
            <div class="text-3xl font-extrabold text-indigo-600">${fmt(Math.round(D.policyMonthly))}</div>
            <div class="text-xs text-gray-500 mt-1">每年 ${fmt(D.policyAnnual)}</div>
          </div>
        </div>
      </div>

      <div id="page2-start" class="flex gap-4 mb-2">
        <div class="report-card p-5" style="flex:0 0 64%">
          <h2 class="text-xl font-extrabold text-gray-900 mb-1">富邦退休規劃方案明細</h2>
          <p class="text-xs text-gray-500 mb-3">年目標保費 ${fmt(D.annualTarget)} ｜月超額保費 ${fmt(D.monthlyExtra)} ｜壽險保額 ${D.saWan}萬 ｜假設投報率 ${S.assumedReturn}%</p>
          <table class="w-full text-xs border-collapse tbl-mobile overflow-hidden rounded-xl">
            <thead><tr class="bg-indigo-600 text-white"><th class="px-2 py-1.5 text-center">年度</th><th class="px-2 py-1.5 text-center">年齡</th><th class="px-2 py-1.5 text-right">累計投入</th><th class="px-2 py-1.5 text-right">帳戶價值</th><th class="px-2 py-1.5 text-right">解約金</th><th class="px-2 py-1.5 text-right">身故保障</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
        <div class="flex flex-col gap-4" style="flex:0 0 calc(36% - 1rem)">
          <div class="report-card p-5 bg-gradient-to-br from-emerald-50 to-white">
            <h2 class="text-xl font-extrabold text-gray-900 mb-2">退休後月配息試算</h2>
            <p class="text-xs text-gray-500 mb-3">以退休時解約金 ${fmt(D.svR)} 元<br>按年配息率 7% 試算</p>
            <div class="flex flex-col gap-2">
              ${metric('退休時解約金', fmt(D.svR), 'white')}
              ${metric('每月配息金額', fmt(D.monthDist), 'green')}
              ${metric('年度總配息', fmt(D.monthDist * 12), 'white')}
            </div>
          </div>
          <details class="report-card p-4 text-sm text-gray-600">
            <summary class="font-bold text-indigo-700 cursor-pointer">計算邏輯說明</summary>
            <p class="mt-2 leading-relaxed">方案一採每月存入、年末滾息概念；方案二依退休目標現金流回推所需本金，再依保單模擬帳戶價值與解約金。實際保單利益仍以正式建議書為準。</p>
          </details>
          <p class="text-xs text-gray-400 text-center leading-relaxed px-1">⚠ 本計畫書僅供參考試算，實際保單利益以富邦人壽正式建議書為準。假設投資報酬率不代表未來實際報酬。</p>
        </div>
      </div>

      <div class="no-print report-card p-5 mt-6 mb-4">
        <h2 class="text-lg font-extrabold text-gray-900 text-center mb-1">輸出計畫書</h2>
        <p class="text-xs text-gray-500 text-center mb-4">PDF 適合正式留存；PNG 圖片適合手機、LINE 快速傳遞。</p>
        <div class="flex justify-center gap-4">
          <button id="btnPDF" class="tap-btn flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-base bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg cursor-pointer">
            <svg id="pdfIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span id="pdfLabel">儲存為 PDF</span>
          </button>
          <button id="btnIMG" class="tap-btn flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-base bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg cursor-pointer">
            <svg id="imgIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span id="imgLabel">另存為圖片 PNG</span>
          </button>
        </div>
      </div>
    </div>
  </div>`,
    bind() {
      document.getElementById('btnBack').onclick = onBack;
      scaleWrap('report-wrap', 780);
      document.getElementById('btnPDF').onclick = () => onPdfClick(S);
      document.getElementById('btnIMG').onclick = () => onImgClick(S);
    }
  };
}
