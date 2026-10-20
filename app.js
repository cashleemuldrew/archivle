(() => {
  const MAX_GUESSES = 6;
  // green: within $5 for items under $100, within $50 for everything else
  const winRange = price => (price < 100 ? 5 : 50);
  // yellow: within 25%, or twice the green range if that's bigger ($100 for items $100+)
  const nearRange = price => Math.max(price * NEAR_PCT, winRange(price) * 2);
  const NEAR_PCT = 0.25;     // yellow: within 25%
  const START = Date.UTC(2026, 9, 19); // No. 1 = Oct 19, 2026
  const DAY = 86400000;
  const $ = id => document.getElementById(id);

  // --- storage that never throws (private windows, blocked storage) ---
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  // --- which item is today's ---
  function todayNumber() {
    const n = new Date();
    return Math.floor((Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) - START) / DAY) + 1;
  }
  function seededOrder(len, seed) {
    let s = seed >>> 0;
    const rand = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const a = [...Array(len).keys()];
    for (let i = len - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const ORDER = seededOrder(ITEMS.length, 2026);
  const dayNo = Math.max(1, todayNumber());
  const dailyIndex = ORDER[(dayNo - 1) % ITEMS.length];

  // --- game state ---
  let mode = "daily";
  let item, game, photoIdx = 0;

  function loadDaily() {
    mode = "daily";
    item = ITEMS[dailyIndex];
    game = store.get(`archivle-${dayNo}`, null);
    if (!game || game.itemId !== item.id) game = { itemId: item.id, guesses: [], done: false, won: false };
    render(true);
  }
  function loadPractice() {
    mode = "practice";
    let i;
    do { i = Math.floor(Math.random() * ITEMS.length); } while (i === dailyIndex || ITEMS[i] === item);
    item = ITEMS[i];
    game = { guesses: [], done: false, won: false };
    render(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function grade(g, price) {
    const diff = Math.abs(g - price);
    const kind = diff <= winRange(price) ? "hit" : diff <= nearRange(price) ? "near" : "miss";
    const dir = kind === "hit" ? "✓" : g < price ? "↑" : "↓";
    return { kind, dir };
  }
  const money = n => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });

  // --- rendering ---
  function render(fresh) {
    $("issue").textContent = mode === "daily" ? `No. ${dayNo}` : "Practice";
    $("mode-banner").hidden = mode === "daily";
    $("brand").textContent = item.brand;
    $("title").textContent = item.title;
    $("size").textContent = item.size;
    $("cond").textContent = item.cond;
    $("seller").textContent = "@" + item.seller;
    $("seller").href = item.sellerUrl;
    $("listing").href = listingHref(item.url);
    if (fresh) { photoIdx = 0; showPhoto(); $("guess").value = ""; $("msg").textContent = ""; }
    renderGuesses();
    renderResult();
  }

  function showPhoto() {
    const img = $("photo");
    img.src = item.photos[photoIdx];
    img.alt = `${item.brand} ${item.title}, photo ${photoIdx + 1} of ${item.photos.length}`;
    const many = item.photos.length > 1;
    $("prev").hidden = $("next").hidden = !many;
    $("dots").innerHTML = many ? item.photos.map((_, i) => `<span class="${i === photoIdx ? "on" : ""}"></span>`).join("") : "";
  }
  $("photo").addEventListener("error", () => { $("msg").textContent = "This photo didn't load. The listing may have been taken down."; });
  $("prev").onclick = () => { photoIdx = (photoIdx - 1 + item.photos.length) % item.photos.length; showPhoto(); };
  $("next").onclick = () => { photoIdx = (photoIdx + 1) % item.photos.length; showPhoto(); };

  function renderGuesses(animateLast) {
    const ol = $("guesses");
    ol.innerHTML = "";
    for (let i = 0; i < MAX_GUESSES; i++) {
      const li = document.createElement("li");
      const g = game.guesses[i];
      if (g == null) { li.className = "empty"; }
      else {
        const r = grade(g, item.price);
        li.className = r.kind + (animateLast && i === game.guesses.length - 1 ? " new" : "");
        li.innerHTML = `<span class="amt">${money(g)}</span><span class="dir" aria-label="${r.kind === "hit" ? "correct" : r.dir === "↑" ? "higher" : "lower"}">${r.dir}</span>`;
      }
      ol.appendChild(li);
    }
  }

  function renderResult() {
    const done = game.done;
    $("form").hidden = done;
    $("result").hidden = !done;
    if (!done) return;
    $("result-head").textContent = game.won
      ? ["Called it.", "Sharp eye.", "Good read.", "Nice.", "Got there.", "Phew."][game.guesses.length - 1]
      : "Not this time.";
    $("answer").textContent = money(item.price);
    $("share").hidden = mode !== "daily";
    $("next-in").hidden = mode !== "daily";
    tick();
  }

  function tick() {
    if ($("next-in").hidden) return;
    const n = new Date(), mid = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
    const s = Math.max(0, Math.floor((mid - n) / 1000));
    const p = x => String(x).padStart(2, "0");
    $("next-in").textContent = `Next item in ${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
  }
  setInterval(tick, 1000);

  // --- guessing ---
  $("form").addEventListener("submit", e => {
    e.preventDefault();
    if (game.done) return;
    const raw = $("guess").value.replace(/[$,\s]/g, "");
    const g = Math.round(parseFloat(raw) * 100) / 100;
    if (!raw || !isFinite(g) || g <= 0) { $("msg").textContent = "Enter a price in dollars, like 450."; return; }
    if (g > 1000000) { $("msg").textContent = "That's over a million dollars. Try something lower."; return; }
    $("msg").textContent = "";
    game.guesses.push(g);
    const r = grade(g, item.price);
    if (r.kind === "hit") { game.done = true; game.won = true; }
    else if (game.guesses.length >= MAX_GUESSES) { game.done = true; }
    $("guess").value = "";
    if (mode === "daily") {
      store.set(`archivle-${dayNo}`, game);
      if (game.done) recordStats();
    }
    renderGuesses(true);
    renderResult();
    if (game.done && mode === "daily") setTimeout(openStats, 900);
  });

  // --- stats ---
  function recordStats() {
    const s = store.get("archivle-stats", { played: 0, wins: 0, streak: 0, maxStreak: 0, dist: [0, 0, 0, 0, 0, 0], lastDay: 0, lastWinDay: 0 });
    if (s.lastDay === dayNo) return;
    s.played++;
    s.lastDay = dayNo;
    if (game.won) {
      s.wins++;
      s.streak = s.lastWinDay === dayNo - 1 ? s.streak + 1 : 1;
      s.lastWinDay = dayNo;
      s.maxStreak = Math.max(s.maxStreak, s.streak);
      s.dist[game.guesses.length - 1]++;
    } else {
      s.streak = 0;
    }
    store.set("archivle-stats", s);
  }
  function openStats() {
    const s = store.get("archivle-stats", { played: 0, wins: 0, streak: 0, maxStreak: 0, dist: [0, 0, 0, 0, 0, 0], lastWinDay: 0 });
    const streak = s.lastWinDay >= dayNo - 1 ? s.streak : 0;
    $("stat-row").innerHTML = [
      [s.played, "Played"],
      [s.played ? Math.round((s.wins / s.played) * 100) : 0, "Win %"],
      [streak, "Streak"],
      [s.maxStreak, "Best streak"],
    ].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join("");
    const max = Math.max(1, ...s.dist);
    const today = mode === "daily" && game.won ? game.guesses.length : 0;
    $("dist").innerHTML = s.dist.map((c, i) =>
      `<div><span>${i + 1}</span><i class="${today === i + 1 ? "cur" : ""}" style="width:${Math.max(8, (c / max) * 100)}%">${c}</i></div>`
    ).join("");
    $("stats").showModal();
  }
  $("stats-btn").onclick = openStats;
  $("help-btn").onclick = () => $("help").showModal();

  // --- share ---
  $("share").onclick = async () => {
    const emoji = { hit: "🟩", near: "🟨", miss: "⬛" };
    const arrow = { "↑": "⬆️", "↓": "⬇️", "✓": "✅" };
    const lines = game.guesses.map(g => { const r = grade(g, item.price); return emoji[r.kind] + arrow[r.dir]; });
    const text = `Archivle No. ${dayNo} ${game.won ? game.guesses.length : "X"}/${MAX_GUESSES}\n${lines.join("\n")}\n${location.origin + location.pathname}`;
    try { await navigator.clipboard.writeText(text); $("share").textContent = "Copied"; }
    catch { $("msg").textContent = text; $("share").textContent = "Copy the text below"; }
    setTimeout(() => { $("share").textContent = "Copy result"; }, 2000);
  };
  $("practice").onclick = loadPractice;
  $("back-daily").onclick = loadDaily;

  // --- money: affiliate links, sponsor spot, tips, ads ---
  function listingHref(url) {
    return CONFIG.affiliateTemplate ? CONFIG.affiliateTemplate.replace("{url}", encodeURIComponent(url)) : url;
  }
  if (CONFIG.affiliateTemplate) {
    $("affiliate-note").hidden = false;
    $("listing").rel = "sponsored noopener";
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sp = CONFIG.sponsor || {};
  const box = $("sponsor");
  if (sp.name) {
    box.innerHTML = `<span class="sp-label">Sponsor</span><a href="${esc(sp.url)}" target="_blank" rel="sponsored noopener"><strong>${esc(sp.name)}</strong>${sp.text ? ` <span>${esc(sp.text)}</span>` : ""}</a>`;
  } else {
    const contact = sp.contact || `https://github.com/${CONFIG.repo}/issues/new?title=Sponsorship%20inquiry`;
    box.classList.add("open");
    box.innerHTML = `<span class="sp-label">Sponsor</span><a href="${esc(contact)}" target="_blank" rel="noopener">Run a shop or brand? <strong>Sponsor this spot.</strong></a>`;
  }
  box.hidden = false;

  if (CONFIG.tipUrl) { $("tip").href = CONFIG.tipUrl; $("tip").hidden = false; }

  $("takedown").href = `https://github.com/${CONFIG.repo}/issues/new?title=Photo%20removal%20request`;
  const ads = CONFIG.adsense;
  if (ads && ads.client && !document.querySelector('script[src*="adsbygoogle.js"]')) {
    const s = document.createElement("script");
    s.async = true; s.crossOrigin = "anonymous";
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ads.client)}`;
    document.head.appendChild(s);
  }
  if (ads && ads.client) {
    [["ad-top", ads.slotTop], ["ad-bottom", ads.slotBottom]].forEach(([id, slot]) => {
      if (!slot) return;
      const box = $(id);
      box.hidden = false;
      box.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${ads.client}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    });
  }

  loadDaily();
  if (!store.get("archivle-seen-help", false)) { store.set("archivle-seen-help", true); $("help").showModal(); }
})();
