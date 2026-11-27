/* 網站後台：SEO／GEO 小幫手
 * 在案例、文章、服務的編輯畫面右下角即時檢查內容，並預覽 Google 搜尋結果。
 * 只讀取表單內容，不會寫入任何資料。 */
(function () {
  // 品牌與服務地區從網站設定讀取（/site-config.json），換客戶不用改程式
  const CFG = { brand: '', areas: [] };
  fetch('/site-config.json', { cache: 'no-store' }).then((r) => r.json()).then((c) => Object.assign(CFG, c)).catch(() => {});
  const areaNames = () => (CFG.areas || []).map((a) => String(a).replace(/[市縣]$/, '')).filter(Boolean);
  const areaRe = () => new RegExp(`(${[...areaNames(), '臺中', '[\\u4e00-\\u9fa5]{1,3}區', '[\\u4e00-\\u9fa5]{1,3}[鄉鎮市]'].join('|')})`);
  const areaList = () => areaNames().join('／') || '服務地區';
  const brand = () => CFG.brand || '品牌名稱';
  const NUM = /\d/;
  const QUESTION = /[？?]|嗎|如何|怎麼|怎樣|多少|哪些|哪一|為什麼|是否|要不要|值得/;
  const FLUFF = /^(隨著|在現今|現代人|很多人|許多人|您是否|你是否|相信|大家都|近年來)/;
  const len = (s) => [...String(s || '').trim()].length;
  const text = (s) => String(s || '').replace(/[#>*_`|\-\[\]()!]/g, ' ').replace(/\s+/g, ' ').trim();
  const firstSentence = (s) => String(s || '').trim().split(/[。！？!?\n]/)[0] || '';
  const countNums = (s) => (String(s || '').match(/\d+(\.\d+)?\s*(坪|年|天|週|周|個月|月|萬|元|%|公分|cm|米|公尺|小時|層|間|戶|張|次)/g) || []).length;
  const headings = (s) => (String(s || '').match(/^#{2,3}\s+\S/gm) || []).length;

  // 每個檢查：[分類, 等級(ok/warn/bad), 說明]
  function checkCase(d) {
    const r = [];
    const t = d.title || '', sum = d.summary || '', body = d.body || '', loc = d.location || '';
    const photos = Array.isArray(d.photos) ? d.photos : [];
    const tl = len(t);
    r.push(['SEO', tl >= 15 && tl <= 34 ? 'ok' : tl ? 'warn' : 'bad', `標題 ${tl} 字（建議 15～34 字）`]);
    r.push(['SEO', areaRe().test(t) ? 'ok' : 'bad', areaRe().test(t) ? '標題有地區名稱' : `標題加上地區，例如「${areaNames()[0] || '地區'}＋行政區」——在地搜尋最重要`]);
    r.push(['SEO', d.category && t.includes(String(d.category).replace(/設計|施作|工程/g, '').slice(0, 2)) ? 'ok' : 'warn', '標題包含工程類型（例：老屋翻新、浴室、系統櫃）']);
    const sl = len(sum);
    r.push(['SEO', sl >= 50 && sl <= 100 ? 'ok' : sl >= 25 ? 'warn' : 'bad', `摘要 ${sl} 字（建議 50～100 字，會顯示在 Google 搜尋結果）`]);
    r.push(['SEO', /區|鄉|鎮/.test(loc) ? 'ok' : loc ? 'warn' : 'bad', loc ? (/區|鄉|鎮/.test(loc) ? `施工地點：${loc}` : '施工地點寫到「區」，例：○○市○○區') : '請填施工地點（寫到區）']);
    r.push(['SEO', /^[a-z0-9-]{3,40}$/.test(d.slug || '') ? 'ok' : 'bad', d.slug ? '網址代稱格式正確' : '請填網址代稱（英文小寫與 -）']);
    r.push(['SEO', photos.length >= 6 ? 'ok' : photos.length >= 3 ? 'warn' : 'bad', `施工照片 ${photos.length} 張（建議 6 張以上，含施工前、中、後）`]);
    const custom = photos.filter((p) => p && p.alt && !/施工照片\s*\d+$/.test(p.alt)).length;
    r.push(['SEO', photos.length && custom / photos.length >= 0.5 ? 'ok' : 'warn', `照片說明自己寫的 ${custom}/${photos.length} 張（寫施工階段＋位置，Google 圖片搜尋看得懂）`]);
    const bl = len(text(body));
    r.push(['SEO', bl >= 200 ? 'ok' : bl >= 80 ? 'warn' : 'bad', `案例說明 ${bl} 字（建議 200 字以上）`]);
    r.push(['SEO', headings(body) >= 2 ? 'ok' : 'warn', `說明有 ${headings(body)} 個小標題（建議用「屋況」「解決方式」「工期」分段）`]);
    // GEO
    const facts = countNums(sum + ' ' + body);
    r.push(['GEO', facts >= 3 ? 'ok' : facts >= 1 ? 'warn' : 'bad', `具體數字 ${facts} 個（屋齡、坪數、工期、預算……AI 最愛引用數字）`]);
    r.push(['GEO', NUM.test(firstSentence(sum)) ? 'ok' : 'warn', '摘要第一句直接講結果，例：「30 年透天全室翻新，工期 45 天。」']);
    r.push(['GEO', /(屋況|問題|漏水|老舊|裂縫|壁癌|原本)/.test(body) && /(解決|處理|改善|重做|更新|施作|規劃)/.test(body) ? 'ok' : 'warn', '說明包含「遇到什麼問題 → 怎麼解決」，AI 回答類似問題時會引用']);
    r.push(['GEO', (body + sum).includes(brand()) ? 'ok' : 'warn', `內容提到「${brand()}」品牌名稱（讓 AI 把案例和品牌連在一起）`]);
    return r;
  }

  function checkBlog(d) {
    const r = [];
    const t = d.title || '', sum = d.summary || '', body = d.body || '';
    const kp = Array.isArray(d.keyPoints) ? d.keyPoints.filter(Boolean) : [];
    const faqs = Array.isArray(d.faqs) ? d.faqs.filter((f) => f && f.q && f.a) : [];
    const tl = len(t);
    r.push(['SEO', tl >= 15 && tl <= 34 ? 'ok' : tl ? 'warn' : 'bad', `標題 ${tl} 字（建議 15～34 字）`]);
    r.push(['SEO', QUESTION.test(t) ? 'ok' : 'warn', QUESTION.test(t) ? '標題是問句（屋主常這樣搜尋）' : '標題改成屋主會搜尋的問句，例：「老屋水電要全部換嗎？」']);
    const sl = len(sum);
    r.push(['SEO', sl >= 50 && sl <= 100 ? 'ok' : sl >= 25 ? 'warn' : 'bad', `摘要 ${sl} 字（建議 50～100 字）`]);
    r.push(['SEO', /^[a-z0-9-]{3,60}$/.test(d.slug || '') ? 'ok' : 'bad', d.slug ? '網址代稱格式正確' : '請填網址代稱（英文小寫與 -）']);
    const bl = len(text(body));
    r.push(['SEO', bl >= 800 ? 'ok' : bl >= 400 ? 'warn' : 'bad', `內文 ${bl} 字（建議 800 字以上）`]);
    r.push(['SEO', headings(body) >= 3 ? 'ok' : 'warn', `內文有 ${headings(body)} 個小標題（建議 3 個以上）`]);
    r.push(['SEO', d.cover ? 'ok' : 'warn', d.cover ? '已設封面圖' : '加一張封面圖（社群分享時會顯示）']);
    r.push(['SEO', areaRe().test(t + sum + body) ? 'ok' : 'warn', `內容提到服務地區（${areaList()}）`]);
    // GEO
    const fs = firstSentence(sum);
    r.push(['GEO', fs && !FLUFF.test(fs) ? 'ok' : 'warn', FLUFF.test(fs) ? '摘要不要用「隨著…」「很多人…」開頭，第一句直接回答標題的問題' : '摘要第一句直接回答問題（AI 最常引用這一句）']);
    r.push(['GEO', kp.length >= 3 && kp.length <= 6 ? 'ok' : kp.length ? 'warn' : 'bad', `重點整理 ${kp.length} 點（建議 3～5 點，每點一句話）`]);
    r.push(['GEO', faqs.length >= 2 ? 'ok' : faqs.length ? 'warn' : 'bad', `延伸問答 ${faqs.length} 題（建議 2～4 題，AI 與 Google 會直接拿來回答）`]);
    const facts = countNums(sum + ' ' + body + ' ' + kp.join(' '));
    r.push(['GEO', facts >= 3 ? 'ok' : facts ? 'warn' : 'bad', `具體數字 ${facts} 個（費用、工期、屋齡、坪數……）`]);
    r.push(['GEO', /^\s*[-*]\s|^\s*\d+\.\s|^\|/m.test(body) ? 'ok' : 'warn', '內文有條列或表格（AI 容易擷取整理）']);
    r.push(['GEO', d.updated ? 'ok' : 'warn', d.updated ? '已填最後更新日期' : '修改文章時填「最後更新日期」（AI 偏好新資料）']);
    r.push(['GEO', body.includes(brand()) ? 'ok' : 'warn', `內文提到「${brand()}」與實際經驗（例：負責人提醒、我們的做法）`]);
    return r;
  }

  function checkService(d) {
    const r = [];
    const faqs = Array.isArray(d.faqs) ? d.faqs.filter((f) => f && f.q && f.a) : [];
    const signs = Array.isArray(d.signs) ? d.signs.filter(Boolean) : [];
    const al = len(d.answer);
    r.push(['SEO', len(d.summary) >= 30 && len(d.summary) <= 90 ? 'ok' : 'warn', `簡短介紹 ${len(d.summary)} 字（建議 30～90 字）`]);
    r.push(['SEO', len(text(d.body)) >= 200 ? 'ok' : 'warn', `服務說明 ${len(text(d.body))} 字（建議 200 字以上）`]);
    r.push(['SEO', signs.length >= 3 ? 'ok' : 'warn', `需要服務的徵兆 ${signs.length} 項（建議 3～5 項）`]);
    r.push(['GEO', al >= 80 && al <= 220 ? 'ok' : al ? 'warn' : 'bad', `「一段話說明」${al} 字（建議 80～220 字）`]);
    r.push(['GEO', areaRe().test(d.answer || '') ? 'ok' : 'bad', `一段話說明要寫服務地區（${areaList()}）`]);
    r.push(['GEO', /適合|需要|屋主|業主/.test(d.answer || '') ? 'ok' : 'warn', '一段話說明要寫「適合哪些人」']);
    r.push(['GEO', faqs.length >= 8 ? 'ok' : faqs.length >= 5 ? 'warn' : 'bad', `常見問題 ${faqs.length} 題（建議 8 題以上，把客人在 LINE 問過的問題加進來）`]);
    const withNum = faqs.filter((f) => NUM.test(f.a)).length;
    r.push(['GEO', withNum >= 3 ? 'ok' : 'warn', `有數字的回答 ${withNum} 題（費用、工期、年限，AI 最常引用）`]);
    return r;
  }

  const CHECKS = { cases: checkCase, blog: checkBlog, services: checkService };
  const scoreOf = (list) => list.length ? Math.round(list.reduce((a, [, lv]) => a + (lv === 'ok' ? 1 : lv === 'warn' ? 0.5 : 0), 0) / list.length * 100) : 0;
  window.FZJ_SEO = { CHECKS, scoreOf, len, countNums, CFG, areaRe, areaList, brand };
  const ICON = { ok: '✓', warn: '!', bad: '✕' };
  const COLOR = { ok: '#2f7d4f', warn: '#b7791f', bad: '#b3261e' };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function render(collection, d, open) {
    const list = (CHECKS[collection] || (() => []))(d);
    const pts = list.reduce((a, [, lv]) => a + (lv === 'ok' ? 1 : lv === 'warn' ? 0.5 : 0), 0);
    const score = list.length ? Math.round((pts / list.length) * 100) : 0;
    const sc = score >= 80 ? COLOR.ok : score >= 55 ? COLOR.warn : COLOR.bad;
    const seoT = d.seoTitle || d.title || '（尚未填標題）';
    const fullT = seoT.includes(brand()) ? seoT : `${seoT}｜${CFG.siteName || brand()}`;
    const desc = d.seoDescription || d.summary || d.answer || '（尚未填摘要）';
    const path = collection === 'cases' ? 'cases' : collection === 'blog' ? 'blog' : 'services';
    const tLen = len(fullT), dLen = len(desc);
    const group = (g) => list.filter(([k]) => k === g).map(([, lv, msg]) =>
      `<li style="display:flex;gap:8px;align-items:flex-start;margin:6px 0"><b style="flex:none;width:18px;height:18px;border-radius:50%;background:${COLOR[lv]};color:#fff;font-size:11px;display:grid;place-items:center;margin-top:2px">${ICON[lv]}</b><span>${esc(msg)}</span></li>`).join('');
    return `
      <div data-toggle style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;background:#2b2622;color:#fff;border-radius:${open ? '10px 10px 0 0' : '10px'}">
        <strong style="flex:1;font-size:14px">SEO／GEO 小幫手</strong>
        <span style="background:${sc};padding:2px 10px;border-radius:99px;font-weight:700;font-size:14px">${score} 分</span>
        <span style="font-size:12px;opacity:.8">${open ? '收合 ▾' : '展開 ▴'}</span>
      </div>
      ${open ? `<div style="padding:12px 14px;max-height:60vh;overflow:auto;font-size:13px;line-height:1.5;color:#2b2622">
        <div style="font-size:12px;color:#74695e;margin-bottom:4px">Google 搜尋結果預覽</div>
        <div style="border:1px solid #e2d8c7;border-radius:8px;padding:10px 12px;margin-bottom:12px;background:#fff">
          <div style="font-size:12px;color:#4d5156">fanzhuanjia › ${path} › ${esc(d.slug || '…')}</div>
          <div style="font-size:16px;color:#1a0dab;line-height:1.3;margin:2px 0">${esc(tLen > 34 ? [...fullT].slice(0, 33).join('') + '…' : fullT)}</div>
          <div style="color:#4d5156">${esc(dLen > 90 ? [...desc].slice(0, 88).join('') + '…' : desc)}</div>
          <div style="font-size:11px;color:${tLen > 34 || dLen > 100 ? COLOR.warn : '#74695e'};margin-top:4px">標題 ${tLen} 字・描述 ${dLen} 字${tLen > 34 ? '（標題太長會被截斷）' : ''}</div>
        </div>
        <div style="font-weight:700;margin:4px 0">SEO（Google 搜尋）</div><ul style="list-style:none;padding:0;margin:0 0 10px">${group('SEO')}</ul>
        <div style="font-weight:700;margin:4px 0">GEO（ChatGPT、AI 搜尋引用）</div><ul style="list-style:none;padding:0;margin:0">${group('GEO')}</ul>
        <div style="font-size:11px;color:#74695e;margin-top:10px">綠色＝很好・黃色＝建議加強・紅色＝一定要改。小幫手只提供建議，不會阻擋發布。</div>
      </div>` : ''}`;
  }

  // 讀取後台即時編輯中的內容（每次輸入都會更新）
  let STORE = null;
  function findStore() {
    if (STORE) return STORE;
    const el = document.querySelector('#nc-root *');
    if (!el) return null;
    const k = Object.keys(el).find((x) => x.startsWith('__reactFiber$'));
    let f = k && el[k];
    while (f) { const p = f.memoizedProps; if (p && p.store && p.store.getState) return (STORE = p.store); f = f.return; }
    return null;
  }
  function draftData(fallbackEntry) {
    const st = findStore();
    const e = st && st.getState().entryDraft && st.getState().entryDraft.get('entry');
    const src = e || fallbackEntry;
    const d = src && src.get('data') ? src.get('data').toJS() : {};
    if (!d.slug && src && src.get('slug')) d.slug = src.get('slug');
    return d;
  }

  let tries = 0;
  function register() {
    if (!window.CMS || !window.createClass) { if (++tries < 100) setTimeout(register, 50); return; }
    const Control = window.createClass({
      getInitialState() { let o = true; try { o = localStorage.getItem('seo-helper-open') !== '0'; } catch (e) {} if (window.innerWidth < 700) o = false; return { open: o }; },
      componentDidMount() {
        const st = findStore();
        let last = null, timer = 0;
        const tick = () => {
          const e = st && st.getState().entryDraft && st.getState().entryDraft.get('entry');
          if (e !== last) { last = e; clearTimeout(timer); timer = setTimeout(() => this.forceUpdate(), 250); }
        };
        this.unsub = st ? st.subscribe(tick) : null;
        if (!st) this.iv = setInterval(() => this.forceUpdate(), 1500);
      },
      componentWillUnmount() { if (this.unsub) this.unsub(); if (this.iv) clearInterval(this.iv); },
      toggle(e) {
        if (!e.target.closest('[data-toggle]')) return;
        const open = !this.state.open; this.setState({ open });
        try { localStorage.setItem('seo-helper-open', open ? '1' : '0'); } catch (err) {}
      },
      render() {
        const entry = this.props.entry, collection = this.props.collection && this.props.collection.get('name');
        const d = draftData(entry);
        return window.h('div', {
          onClick: this.toggle,
          style: { position: 'fixed', right: '16px', bottom: '16px', width: 'min(360px, calc(100vw - 32px))', zIndex: 9000, background: '#fbf8f3', border: '1px solid #e2d8c7', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,.18)', fontFamily: "'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif" },
          dangerouslySetInnerHTML: { __html: render(collection, d, this.state.open) },
        });
      },
    });
    const Preview = window.createClass({ render() { return window.h('span', null, ''); } });
    window.CMS.registerWidget('seohelper', Control, Preview);
  }
  register();
})();
