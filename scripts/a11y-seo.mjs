/* QUÉT BARRIEREFREIHEIT + SEO — dựng lại 31.08.2026 cho bản live của nullpunkt.
 *
 * Bản 19.08 chạy trong scratchpad và đã mất cùng scratchpad; đây là bản nằm
 * trong repo, để lần sau không phải viết lại lần thứ ba.
 *
 * Bốn lỗi dụng cụ ngày 19.08 (ZIELE §7) đều đọc ra Y HỆT kết quả thật, nên
 * mỗi phép đo ở đây mang theo hai thứ luật đó đòi:
 *   · MỘT GIÁ TRỊ BIẾT TRƯỚC — đen trên trắng phải ra 21,00. Sai thì dừng,
 *     không báo con số nào.
 *   · MỘT CÂU HỎI ĐẶT NHƯ NGƯỜI DÙNG ĐẶT — gõ Tab thật rồi xem có viền không,
 *     thay vì đếm rule `:focus` trong stylesheet. `el.focus()` KHÔNG bật
 *     `:focus-visible`; ngày 19.08 nó làm 20/20 trang báo oan "không có focus".
 *
 * Lỗi giả đã biết, phải tách chứ không được đếm: chữ nằm trên <img>/<canvas>/
 * background-image. Hàm dò nền chỉ đọc được `background-color` của tổ tiên nên
 * mọi tỉ lệ dưới ~1,5 ở các trang đó là dụng cụ mù, không phải lỗi trang.
 */
import { launch } from "./cdp.mjs";

const URL_BASE = process.argv[2] || "https://nullpunkt.vercel.app";
const ROUTES = process.argv[3] ? process.argv[3].split(",") : ["/", "/work", "/impressum"];
const RUNS = Number(process.env.RUNS || 1);

const KIEM_TRA_TUONG_PHAN = `
  const lum = (r,g,b) => { const f=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);};
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const ratio = (a,b) => { const L1=lum(...a), L2=lum(...b), hi=Math.max(L1,L2), lo=Math.min(L1,L2);
    return (hi+0.05)/(lo+0.05); };
  const parse = s => { const m=String(s).match(/rgba?\\(([^)]+)\\)/); if(!m) return null;
    const p=m[1].split(',').map(x=>parseFloat(x)); return p.length>3&&p[3]===0 ? null : [p[0],p[1],p[2]]; };
`;

async function doTrang(page, route) {
  await page.goto(URL_BASE + route);
  /* Chờ loader nhả. Nó khoá `body{overflow:hidden}` trong 900ms rồi tự gỡ;
     đo trong lúc nó còn phủ là đo màu của loader, không phải của trang. */
  await page.evaluate(`
    /* body có thể chưa tồn tại ngay sau loadEventFired — chờ nó trước, nếu không
       getComputedStyle ném và cả lượt quét chết ở dòng đầu. */
    for (let i=0;i<60;i++){ if (document.body) break; await new Promise(r=>setTimeout(r,100)); }
    if (!document.body) return false;
    for (let i=0;i<40;i++){ if (getComputedStyle(document.body).overflow !== 'hidden') break;
      await new Promise(r=>setTimeout(r,150)); }
    await new Promise(r=>setTimeout(r,400));
    return true;`);

  const tuongPhan = await page.evaluate(`
    ${KIEM_TRA_TUONG_PHAN}
    /* GIÁ TRỊ BIẾT TRƯỚC — dụng cụ tự chứng minh trước khi đo trang. */
    const chuan = ratio([0,0,0],[255,255,255]);
    if (Math.abs(chuan - 21) > 0.01) return { hong: 'den-tren-trang ra ' + chuan.toFixed(3) + ', khong phai 21' };

    const nen = (el) => {
      let n = el, anh = false;
      while (n && n !== document.documentElement) {
        const cs = getComputedStyle(n);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') anh = true;
        const c = parse(cs.backgroundColor);
        if (c) return { c, anh };
        n = n.parentElement;
      }
      const c = parse(getComputedStyle(document.documentElement).backgroundColor);
      return { c: c || [0,0,0], anh };
    };
    const deAnh = (el) => {
      /* Lỗi giả 19.08: chữ đè lên <img>/<canvas>. Không đếm là lỗi, đếm riêng. */
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const pts = [[r.left+r.width*0.5, r.top+r.height*0.5],[r.left+2,r.top+2],[r.right-2,r.bottom-2]];
      for (const [x,y] of pts) for (const e of document.elementsFromPoint(x,y)) {
        if (e === el) break;
        if (e.tagName === 'IMG' || e.tagName === 'CANVAS' || e.tagName === 'VIDEO' || e.tagName === 'SVG') return true;
      }
      return false;
    };

    let dem=0, truot=[], khongDo=0, teNhat=99;
    for (const el of document.querySelectorAll('p,h1,h2,h3,h4,h5,h6,a,span,li,button,label,td,th,figcaption,strong,em')) {
      if (el.children.length) continue;
      const t = (el.innerText||'').trim(); if (t.length < 2) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.05) continue;
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const fg = parse(cs.color); if (!fg) continue;
      if (deAnh(el)) { khongDo++; continue; }
      const { c: bg, anh } = nen(el);
      if (anh) { khongDo++; continue; }
      const px = parseFloat(cs.fontSize), dam = parseInt(cs.fontWeight,10) >= 700;
      const nguong = (px >= 24 || (px >= 18.66 && dam)) ? 3 : 4.5;
      const v = ratio(fg, bg);
      dem++;
      if (v < teNhat) teNhat = v;
      if (v < nguong) truot.push({ t: t.slice(0,42), v: +v.toFixed(2), nguong, px: +px.toFixed(1) });
    }
    return { dem, truot: truot.sort((a,b)=>a.v-b.v).slice(0,10), soTruot: truot.length, khongDo, teNhat: +teNhat.toFixed(2) };
  `);

  /* FOCUS — GÕ TAB THẬT. `el.focus()` không bật :focus-visible. */
  await page.evaluate(`document.body.focus(); window.scrollTo(0,0); return true;`);
  const focus = { buoc: 0, thayVien: 0, chiTiet: [] };
  for (let i = 0; i < 12; i++) {
    await page.s("Input.dispatchKeyEvent", { type: "rawKeyDown", windowsVirtualKeyCode: 9, key: "Tab", code: "Tab" });
    await page.s("Input.dispatchKeyEvent", { type: "keyUp", windowsVirtualKeyCode: 9, key: "Tab", code: "Tab" });
    const b = await page.evaluate(`
      await new Promise(r=>setTimeout(r,90));
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const cs = getComputedStyle(a);
      const vienNgoai = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      const bong = cs.boxShadow && cs.boxShadow !== 'none';
      const vien = cs.borderWidth && parseFloat(cs.borderWidth) > 0;
      return { tag: a.tagName, nhan: (a.innerText||a.getAttribute('aria-label')||'').trim().slice(0,30),
               focusVisible: a.matches(':focus-visible'), vienNgoai, bong, vien };
    `);
    if (!b) continue;
    focus.buoc++;
    const thay = b.vienNgoai || b.bong;
    if (thay) focus.thayVien++;
    if (focus.chiTiet.length < 6) focus.chiTiet.push({ ...b, thay });
  }

  const seo = await page.evaluate(`
    const m = n => document.querySelector('meta[name="'+n+'"]')?.content || null;
    const p = n => document.querySelector('meta[property="'+n+'"]')?.content || null;
    return {
      title: document.title || null,
      titleDai: (document.title||'').length,
      description: m('description'), descDai: (m('description')||'').length,
      canonical: document.querySelector('link[rel=canonical]')?.href || null,
      lang: document.documentElement.lang || null,
      ogImage: p('og:image'), ogTitle: p('og:title'),
      twitter: m('twitter:card'),
      jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
      h1: document.querySelectorAll('h1').length,
      heading: document.querySelectorAll('h1,h2,h3,h4,h5,h6').length,
      anhThieuAlt: [...document.querySelectorAll('img')].filter(i=>!i.hasAttribute('alt')).length,
      anhTong: document.querySelectorAll('img').length,
      landmark: document.querySelectorAll('main,nav,header,footer,[role=main],[role=navigation]').length,
      skipLink: !!document.querySelector('a[href^="#"]'),
      docHeight: document.documentElement.scrollHeight,
    };
  `);

  return { route, tuongPhan, focus, seo };
}

const page = await launch({ width: 1440, height: 900 });
const ketQua = [];
for (let run = 1; run <= RUNS; run++) {
  for (const r of ROUTES) {
    process.stdout.write(`\n=== ${r}  (lan ${run}/${RUNS}) ===\n`);
    const k = await doTrang(page, r);
    ketQua.push(k);
    const tp = k.tuongPhan;
    if (tp.hong) { console.log("DUNG CU HONG:", tp.hong); continue; }
    console.log(`tuong phan : ${tp.soTruot}/${tp.dem} truot  · te nhat ${tp.teNhat}  · khong do duoc ${tp.khongDo} (chu tren anh/canvas)`);
    for (const t of tp.truot) console.log(`   ${String(t.v).padStart(5)} < ${t.nguong}  ${t.px}px  "${t.t}"`);
    console.log(`focus      : ${k.focus.thayVien}/${k.focus.buoc} buoc Tab thay vien ro`);
    for (const d of k.focus.chiTiet) console.log(`   ${d.thay?'co':'KHONG'}  ${d.tag} :focus-visible=${d.focusVisible}  "${d.nhan}"`);
    const s = k.seo;
    console.log(`seo        : title ${s.titleDai}c · desc ${s.descDai}c · canonical ${s.canonical?'co':'THIEU'} · lang ${s.lang||'THIEU'}`);
    console.log(`             og:image ${s.ogImage?'co':'THIEU'} · twitter ${s.twitter||'THIEU'} · JSON-LD ${s.jsonLd} · h1 ${s.h1} · heading ${s.heading}`);
    console.log(`             img thieu alt ${s.anhThieuAlt}/${s.anhTong} · landmark ${s.landmark} · docHeight ${s.docHeight}`);
  }
}
await page.close();

/* robots.txt + sitemap.xml — hỏi máy chủ, không đoán từ repo. Ngày 19.08 chỉ
   `mono` có cả hai trong 20 trang. */
console.log("\n=== may chu ===");
for (const f of ["/robots.txt", "/sitemap.xml"]) {
  const r = await fetch(URL_BASE + f).catch(() => null);
  console.log(`${r && r.ok ? String(r.status) : "KHONG CO"}  ${f}`);
}
console.log(`\nso lan chay: ${RUNS} · ${ROUTES.length} route · dung cu tu kiem den-tren-trang=21 truoc moi lan do`);
