import { useState, useEffect, useRef } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL     = "https://iljzwxwopxuzpgkjivmn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KEoCJtCLyGTJjqB1phGy2Q_v3PftUYH";

const S_STATE   = "shdm_med_state";
const S_LOG     = "shdm_med_log";
const S_SESSION = "shdm_med_session_id";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const COLLECTION_CATS = [
  {
    key: "homeSensors", icon: "🏠", label: "Home Sensors",
    subs: ["Kitchen Sensors", "Climate Sensors"],
  },
  {
    key: "behaviorPatterns", icon: "📊", label: "Behavior Patterns",
    subs: ["Motion Tracking", "Presence Detection"],
  },
  {
    key: "purchaseHistory", icon: "🛒", label: "Purchase History",
    subs: [],
  },
];

const USAGE_CATS = [
  { key: "foodServices",     icon: "🍕", label: "Food Services",    desc: "Meal recommendations and delivery",   subs: ["Food Delivery", "Grocery Shopping"] },
  { key: "homeServices",     icon: "🏠", label: "Home Services",     desc: "Automation and maintenance",          subs: ["Home Automation", "Maintenance Services"] },
  { key: "wellnessServices", icon: "💪", label: "Wellness Services", desc: "Health and fitness support",          subs: [] },
];

const OFFERS = [
  { id: 1, emoji: "🍕", name: "Pizza Meal",     desc: "2 Large Pizzas, 2 Pops, Fries",    price: 24.99, original: 32.99, save: 8 },
  { id: 2, emoji: "🍔", name: "Burger Combo",   desc: "2 Burgers, 2 Fries, 2 Drinks",     price: 18.99, original: 24.99, save: 6 },
  { id: 3, emoji: "🥡", name: "Chinese Dinner", desc: "Fried Rice, Noodles, Spring Rolls", price: 32.99, original: 38.99, save: 6 },
  { id: 4, emoji: "🍝", name: "Pasta Bowl",     desc: "Pasta, Garlic Bread, Salad",        price: 16.99, original: 21.99, save: 5 },
];

const initPrivacy = () => ({
  collection: { homeSensors: null, behaviorPatterns: null, purchaseHistory: null },
  collectionSubs: {},
  usage:      { foodServices: null, homeServices: null, wellnessServices: null },
  usageSubs:  {},
});

// ─── SESSION ──────────────────────────────────────────────────────────────────
function getOrCreateSessionId() {
  try {
    let id = localStorage.getItem(S_SESSION);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(S_SESSION, id);
    }
    return id;
  } catch (_) {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
async function sendToSupabase(row) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/interaction_logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(row),
    });
  } catch (_) {}
}

// ─── LOGGER ───────────────────────────────────────────────────────────────────
function makeLogger(setLog, sessionId) {
  const t0 = Date.now();
  function push(e) {
    const entry = { ...e, timestamp: Date.now(), elapsed_ms: Date.now() - t0 };
    setLog(prev => {
      const next = [...prev, entry];
      try { localStorage.setItem(S_LOG, JSON.stringify(next)); } catch (_) {}
      return next;
    });
    sendToSupabase({
      session_id: sessionId, flow: "medium",
      event_type: entry.event, page: entry.page || null,
      element: entry.element || null, item: entry.item || null,
      value: entry.value != null ? String(entry.value) : null,
      task: entry.task || null, offer: entry.offer || null,
      from_state: entry.from || null, to_state: entry.to || null,
      time_on_page_ms: entry.time_on_page_ms || null,
      elapsed_ms: entry.elapsed_ms,
      client_timestamp: new Date(entry.timestamp).toISOString(),
    });
  }
  return {
    pageEnter:    (page)              => push({ event: "page_enter",    page }),
    pageExit:     (page, ms)          => push({ event: "page_exit",     page, time_on_page_ms: ms }),
    click:        (el, ctx={})        => push({ event: "click",         element: el, ...ctx }),
    toggle:       (item, val, ctx={}) => push({ event: "toggle",        item, value: val, ...ctx }),
    expand:       (cat)               => push({ event: "expand",        item: cat }),
    tabSwitch:    (from, to)          => push({ event: "tab_switch",    from, to }),
    taskComplete: (task)              => push({ event: "task_complete", task }),
    orderPlaced:  (offer)             => push({ event: "order_placed",  offer }),
  };
}

function usePageTimer(name, logger) {
  const t = useRef(Date.now());
  useEffect(() => {
    t.current = Date.now();
    logger.pageEnter(name);
    return () => logger.pageExit(name, Date.now() - t.current);
  }, [name]); // eslint-disable-line
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f5f6fa; --surface: #fff; --border: #e4e6ef;
    --text: #111827; --text2: #6b7280; --text3: #9ca3af;
    --blue: #4263eb; --blue-dark: #3451c7; --blue-bg: #eef1ff; --blue-bd: #c7d2fe;
    --green: #16a34a; --green-bg: #dcfce7; --green-bd: #86efac;
    --red: #dc2626; --red-bg: #fee2e2; --red-bd: #fca5a5;
    --r: 12px; --sh: 0 1px 3px rgba(0,0,0,.07), 0 4px 12px rgba(0,0,0,.05);
  }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  .wrap { max-width: 580px; margin: 0 auto; padding: 0 16px 32px; }

  /* home */
  .home-hero { text-align: center; padding: 40px 0 28px; }
  .home-icon { width: 68px; height: 68px; border-radius: 50%; background: var(--blue-bg); display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px; }
  .home-title { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
  .home-sub { font-size: 14px; color: var(--text2); }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
  .stat { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 18px; box-shadow: var(--sh); }
  .stat-lbl { font-size: 12px; color: var(--text2); margin-bottom: 4px; }
  .stat-val { font-size: 20px; font-weight: 700; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh); overflow: hidden; margin-top: 12px; }
  .card-head { padding: 16px 20px 12px; }
  .card-head-title { font-size: 15px; font-weight: 600; margin-bottom: 3px; }
  .card-head-sub { font-size: 13px; color: var(--text2); }
  .card-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-top: 1px solid var(--border); cursor: pointer; transition: background .12s; }
  .card-row:hover { background: var(--bg); }
  .card-row-lbl { font-size: 14px; font-weight: 500; }
  .card-row-arrow { font-size: 16px; color: var(--text3); }

  /* back */
  .back { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: var(--text2); cursor: pointer; margin-bottom: 20px; padding: 4px 0; }
  .back:hover { color: var(--blue); }

  /* privacy */
  .page-wrap { padding-top: 24px; }
  .priv-head { margin-bottom: 16px; }
  .priv-head h2 { font-size: 22px; font-weight: 700; margin-bottom: 2px; }
  .priv-head p { font-size: 13px; color: var(--text2); }

  /* info banner */
  .info-banner { display: flex; gap: 10px; padding: 12px 14px; border-radius: 10px; background: var(--blue-bg); border: 1px solid var(--blue-bd); margin-bottom: 16px; }
  .info-banner-icon { font-size: 14px; color: var(--blue); margin-top: 1px; flex-shrink: 0; }
  .info-banner-title { font-size: 13px; font-weight: 600; color: var(--blue-dark); }
  .info-banner-sub { font-size: 12px; color: var(--text2); margin-top: 1px; }

  /* tabs */
  .tabs { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 16px; }
  .tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 8px; font-size: 14px; font-weight: 500; color: var(--text2); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color .12s, border-color .12s; }
  .tab.active { color: var(--blue); border-bottom-color: var(--blue); }

  /* category block */
  .cat-block { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 10px; box-shadow: var(--sh); overflow: hidden; }
  .cat-header { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; cursor: pointer; transition: background .12s; }
  .cat-header:hover { background: var(--bg); }
  .cat-header-left { display: flex; align-items: center; gap: 8px; }
  .cat-icon { font-size: 16px; }
  .cat-label { font-size: 14px; font-weight: 600; }
  .cat-desc { font-size: 12px; color: var(--text2); margin-top: 1px; }
  .cat-chevron { color: var(--text3); font-size: 12px; transition: transform .15s; }
  .cat-chevron.open { transform: rotate(180deg); }

  /* da buttons */
  .da { display: flex; gap: 6px; flex-shrink: 0; }
  .da-btn { padding: 5px 12px; border-radius: 7px; border: 1.5px solid var(--border); background: var(--surface); font-size: 12px; font-weight: 500; cursor: pointer; transition: background .12s, border-color .12s, color .12s; font-family: inherit; color: var(--text2); }
  .da-deny.on  { background: var(--red-bg);   border-color: var(--red-bd);   color: var(--red);   }
  .da-allow.on { background: var(--green-bg); border-color: var(--green-bd); color: var(--green); }
  .da-deny:hover:not(.on)  { background: var(--red-bg);   border-color: var(--red-bd); }
  .da-allow:hover:not(.on) { background: var(--green-bg); border-color: var(--green-bd); }

  /* sub items */
  .sub-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px 10px 24px; border-top: 1px solid var(--border); }
  .sub-label { font-size: 13px; color: var(--text2); }
  .xcheck { display: flex; gap: 5px; }
  .btn-x { width: 26px; height: 26px; border-radius: 6px; border: 1.5px solid var(--red-bd); background: var(--red-bg); color: var(--red); font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity .12s; }
  .btn-ck { width: 26px; height: 26px; border-radius: 6px; border: 1.5px solid var(--green-bd); background: var(--green-bg); color: var(--green); font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity .12s; }
  .btn-x.dim, .btn-ck.dim { opacity: 0.28; }

  /* save row */
  .save-row { display: flex; align-items: center; justify-content: flex-end; margin: 4px 0 8px; }
  .btn-save { padding: 9px 22px; background: var(--blue); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .12s; font-family: inherit; }
  .btn-save.saved { background: var(--green); }
  .btn-save:hover:not(.saved) { background: var(--blue-dark); }

  /* done */
  .btn-done { display: block; width: 100%; padding: 15px; background: #16a34a; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px; transition: background .12s; font-family: inherit; text-align: center; }
  .btn-done:hover { background: #15803d; }

  /* offers */
  .off-tabs { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 16px; }
  .off-tab { flex: 1; text-align: center; padding: 11px 8px; font-size: 14px; font-weight: 500; color: var(--text2); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color .12s, border-color .12s; }
  .off-tab.active { color: var(--blue); border-bottom-color: var(--blue); }
  .off-head { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .off-head-count { font-size: 13px; color: var(--text2); margin-bottom: 14px; }

  /* context box */
  .ctx-box { background: var(--blue-bg); border: 1px solid var(--blue-bd); border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; }
  .ctx-title { font-size: 13px; font-weight: 600; color: var(--blue-dark); margin-bottom: 4px; display: flex; align-items: center; gap: 5px; }
  .ctx-sub { font-size: 12px; color: var(--text2); }

  /* offer card */
  .off-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 16px; margin-bottom: 10px; cursor: pointer; transition: border-color .12s, box-shadow .12s; box-shadow: var(--sh); }
  .off-card:hover { border-color: var(--blue); box-shadow: 0 4px 16px rgba(0,0,0,.10); }
  .off-card-row { display: flex; align-items: flex-start; gap: 12px; }
  .off-emoji { font-size: 28px; line-height: 1; }
  .off-body { flex: 1; }
  .off-name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
  .off-desc { font-size: 13px; color: var(--text2); margin-bottom: 4px; }
  .off-save { font-size: 12px; color: var(--green); font-weight: 600; background: var(--green-bg); padding: 2px 7px; border-radius: 20px; display: inline-block; }
  .off-price-col { text-align: right; flex-shrink: 0; }
  .off-original { font-size: 12px; color: var(--text3); text-decoration: line-through; }
  .off-price { font-size: 16px; font-weight: 700; color: var(--blue); }
  .no-off { font-size: 14px; color: var(--text2); padding: 20px 0; }

  /* order */
  .order-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh); overflow: hidden; margin-bottom: 12px; }
  .order-title { font-size: 17px; font-weight: 700; padding: 18px 20px 14px; border-bottom: 1px solid var(--border); }
  .order-line { display: flex; justify-content: space-between; align-items: center; padding: 13px 20px; border-bottom: 1px solid var(--border); font-size: 14px; }
  .order-line:last-child { border-bottom: none; }
  .order-line.total { font-weight: 700; font-size: 15px; }
  .order-line .val { color: var(--text); }
  .order-original { font-size: 12px; color: var(--text3); text-decoration: line-through; margin-right: 6px; }
  .smart-tip { background: var(--blue-bg); border: 1px solid var(--blue-bd); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: var(--blue-dark); margin-top: 12px; }
  .btn-confirm { display: block; width: 100%; padding: 15px; background: var(--blue); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background .12s; font-family: inherit; margin-top: 12px; }
  .btn-confirm:hover { background: var(--blue-dark); }

  /* confirm */
  .confirm-wrap { display: flex; align-items: center; justify-content: center; min-height: 60vh; }
  .confirm-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh); padding: 40px 32px; text-align: center; max-width: 380px; width: 100%; }
  .confirm-icon { width: 56px; height: 56px; border-radius: 50%; background: var(--green-bg); border: 2px solid var(--green-bd); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 26px; color: var(--green); }
  .confirm-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .confirm-sub { font-size: 14px; color: var(--text2); margin-bottom: 24px; }
  .btn-home { padding: 11px 24px; background: var(--blue); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-home:hover { background: var(--blue-dark); }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
function DA({ value, onDeny, onAllow }) {
  return (
    <div className="da">
      <button className={`da-btn da-deny${value === "deny" ? " on" : ""}`} onClick={onDeny}>Deny</button>
      <button className={`da-btn da-allow${value === "allow" ? " on" : ""}`} onClick={onAllow}>Allow</button>
    </div>
  );
}

function XCheck({ value, onDeny, onAllow }) {
  return (
    <div className="xcheck">
      <button className={`btn-x${value === "deny" ? "" : " dim"}`} onClick={onDeny}>✕</button>
      <button className={`btn-ck${value === "allow" ? "" : " dim"}`} onClick={onAllow}>✓</button>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ logger, onPrivacy }) {
  usePageTimer("home", logger);
  const now  = new Date();
  const day  = now.toLocaleDateString("en-US", { weekday: "long" });
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return (
    <div style={{ paddingTop: 32 }}>
      <div className="home-hero">
        <div className="home-icon">🏠</div>
        <div className="home-title">Welcome Home</div>
        <div className="home-sub">{day}, {time}</div>
      </div>
      <div className="card">
        <div className="card-head">
          <div className="card-head-title">Your Smart Home</div>
          <div className="card-head-sub">Manage your home automation and privacy settings</div>
        </div>
        <div className="card-row" onClick={() => { logger.click("privacy_settings"); onPrivacy(); }}>
          <span className="card-row-lbl">Privacy Settings</span>
          <span className="card-row-arrow">→</span>
        </div>
      </div>
      <div className="stats">
        <div className="stat"><div className="stat-lbl">Temperature</div><div className="stat-val">72°F</div></div>
        <div className="stat"><div className="stat-lbl">People Home</div><div className="stat-val">2</div></div>
      </div>
    </div>
  );
}

// ─── PRIVACY SETTINGS ────────────────────────────────────────────────────────
function PrivacyScreen({ privacy, onSave, logger, onBack, onDone }) {
  usePageTimer("privacy_settings", logger);

  const [tab,     setTab]     = useState("collection");
  const [catVal,  setCatVal]  = useState({ ...privacy.collection });
  const [subVal,  setSubVal]  = useState({ ...privacy.collectionSubs });
  const [usgVal,  setUsgVal]  = useState({ ...privacy.usage });
  const [usgSub,  setUsgSub]  = useState({ ...privacy.usageSubs });
  const [expanded, setExpanded] = useState({});
  const [saved,   setSaved]   = useState(false);

  function toggleCat(key, val) {
    const next = catVal[key] === val ? null : val;
    logger.toggle(key, next, { tab: "collection" });
    setCatVal(c => ({ ...c, [key]: next }));
    setSaved(false);
  }
  function toggleSub(catKey, sub, val) {
    const k = `${catKey}_${sub}`;
    const next = subVal[k] === val ? null : val;
    logger.toggle(sub, next, { category: catKey });
    setSubVal(s => ({ ...s, [k]: next }));
    setSaved(false);
  }
  function toggleUsg(key, val) {
    const next = usgVal[key] === val ? null : val;
    logger.toggle(key, next, { tab: "usage" });
    setUsgVal(u => ({ ...u, [key]: next }));
    setSaved(false);
  }
  function toggleUsgSub(catKey, sub, val) {
    const k = `${catKey}_${sub}`;
    const next = usgSub[k] === val ? null : val;
    logger.toggle(sub, next, { category: catKey, tab: "usage" });
    setUsgSub(s => ({ ...s, [k]: next }));
    setSaved(false);
  }
  function toggleExpand(key) {
    logger.expand(key);
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  }
  function handleSave() {
    logger.click("save_my_choices");
    logger.taskComplete("privacy_settings_saved");
    onSave({ collection: catVal, collectionSubs: subVal, usage: usgVal, usageSubs: usgSub });
    setSaved(true);
  }
  function handleTabSwitch(t) { logger.tabSwitch(tab, t); setTab(t); }

  return (
    <div className="page-wrap">
      <div className="back" onClick={() => { logger.click("back_to_home", { from: "privacy" }); onBack(); }}>← Back to Home</div>

      <div className="priv-head">
        <h2>Privacy Settings</h2>
        <p>Control what data is collected and how it's used</p>
      </div>

      <div className="info-banner">
        <span className="info-banner-icon">ℹ️</span>
        <div>
          <div className="info-banner-title">Manage Your Privacy</div>
          <div className="info-banner-sub">Expand categories to control specific data types.</div>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab${tab === "collection" ? " active" : ""}`} onClick={() => handleTabSwitch("collection")}>
          🗄️ Data Collection
        </div>
        <div className={`tab${tab === "usage" ? " active" : ""}`} onClick={() => handleTabSwitch("usage")}>
          ⚙️ Data Usage
        </div>
      </div>

      {tab === "collection" && (
        <>
          {COLLECTION_CATS.map(cat => (
            <div className="cat-block" key={cat.key}>
              <div className="cat-header">
                <div className="cat-header-left" onClick={() => cat.subs.length > 0 && toggleExpand(cat.key)}>
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-label">{cat.label}</span>
                  {cat.subs.length > 0 && (
                    <span className={`cat-chevron${expanded[cat.key] ? " open" : ""}`}>▾</span>
                  )}
                </div>
                <DA value={catVal[cat.key]}
                  onDeny={()  => toggleCat(cat.key, "deny")}
                  onAllow={() => toggleCat(cat.key, "allow")} />
              </div>
              {expanded[cat.key] && cat.subs.map(sub => (
                <div className="sub-item" key={sub}>
                  <span className="sub-label">{sub}</span>
                  <XCheck
                    value={subVal[`${cat.key}_${sub}`]}
                    onDeny={()  => toggleSub(cat.key, sub, "deny")}
                    onAllow={() => toggleSub(cat.key, sub, "allow")} />
                </div>
              ))}
            </div>
          ))}
          <div className="save-row">
            <button className={`btn-save${saved ? " saved" : ""}`} onClick={handleSave}>
              {saved ? "Saved!" : "Save My Choices"}
            </button>
          </div>
        </>
      )}

      {tab === "usage" && (
        <>
          {USAGE_CATS.map(cat => (
            <div className="cat-block" key={cat.key}>
              <div className="cat-header">
                <div className="cat-header-left" onClick={() => cat.subs.length > 0 && toggleExpand("u_" + cat.key)}>
                  <span className="cat-icon">{cat.icon}</span>
                  <div>
                    <div className="cat-label">{cat.label}</div>
                    <div className="cat-desc">{cat.desc}</div>
                  </div>
                  {cat.subs.length > 0 && (
                    <span className={`cat-chevron${expanded["u_" + cat.key] ? " open" : ""}`}>▾</span>
                  )}
                </div>
                <DA value={usgVal[cat.key]}
                  onDeny={()  => toggleUsg(cat.key, "deny")}
                  onAllow={() => toggleUsg(cat.key, "allow")} />
              </div>
              {expanded["u_" + cat.key] && cat.subs.map(sub => (
                <div className="sub-item" key={sub}>
                  <span className="sub-label">{sub}</span>
                  <XCheck
                    value={usgSub[`${cat.key}_${sub}`]}
                    onDeny={()  => toggleUsgSub(cat.key, sub, "deny")}
                    onAllow={() => toggleUsgSub(cat.key, sub, "allow")} />
                </div>
              ))}
            </div>
          ))}
          <div className="save-row">
            <button className={`btn-save${saved ? " saved" : ""}`} onClick={handleSave}>
              {saved ? "Saved!" : "Save My Choices"}
            </button>
          </div>
        </>
      )}

      <button className="btn-done" onClick={() => { logger.click("done_return_to_home"); onDone(); }}>
        Done – Return to Home
      </button>
    </div>
  );
}

// ─── OFFERS ───────────────────────────────────────────────────────────────────
function OffersScreen({ logger, onSelect, onHome }) {
  usePageTimer("offers", logger);
  const [tab, setTab] = useState("food");

  return (
    <div className="page-wrap">
      <div className="back" onClick={() => { logger.click("back_to_home", { from: "offers" }); onHome(); }}>← Back to Home</div>

      <div className="off-tabs">
        {["food", "home", "wellness"].map(t => (
          <div key={t} className={`off-tab${tab === t ? " active" : ""}`}
            onClick={() => { logger.tabSwitch(tab, t); setTab(t); }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {tab === "food" ? (
        <>
          <div className="off-head">Personalized Offers for You</div>
          <div className="off-head-count">{OFFERS.length} available</div>
          <div className="ctx-box">
            <div className="ctx-title">ℹ️ Based on Your Settings</div>
            <div className="ctx-sub">These offers match your preferences and current situation (2 people home, 7:15 PM, no cooking activity)</div>
          </div>
          {OFFERS.map(o => (
            <div className="off-card" key={o.id}
              onClick={() => { logger.click("select_offer", { offer: o.name, price: o.price }); onSelect(o); }}>
              <div className="off-card-row">
                <span className="off-emoji">{o.emoji}</span>
                <div className="off-body">
                  <div className="off-name">{o.name}</div>
                  <div className="off-desc">{o.desc}</div>
                  <span className="off-save">Save ${o.save}.00</span>
                </div>
                <div className="off-price-col">
                  <div className="off-original">${o.original.toFixed(2)}</div>
                  <div className="off-price">${o.price.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="no-off">No offers available for this category.</div>
      )}
    </div>
  );
}

// ─── ORDER SUMMARY ────────────────────────────────────────────────────────────
function OrderScreen({ offer, logger, onPlace, onBack }) {
  usePageTimer("order_summary", logger);
  return (
    <div className="page-wrap">
      <div className="back" onClick={() => { logger.click("back_to_offers"); onBack(); }}>← Back to Offers</div>
      <div className="order-card">
        <div className="order-title">{offer.emoji} Order Summary</div>
        <div className="order-line">
          <span>Selected Item</span><span className="val" style={{ fontWeight: 600 }}>{offer.name}</span>
        </div>
        <div className="order-line" style={{ fontSize: 13, color: "var(--text2)", padding: "6px 20px" }}>
          <span></span><span>{offer.desc}</span>
        </div>
        <div className="order-line">
          <span>Delivery Type</span><span className="val">Standard (30–45 min)</span>
        </div>
        <div className="order-line">
          <span>Delivery Fee</span><span className="val">Free</span>
        </div>
        <div className="order-line total">
          <span>Total</span>
          <span>
            <span className="order-original">${offer.original.toFixed(2)}</span>
            <span className="val">${offer.price.toFixed(2)}</span>
          </span>
        </div>
      </div>
      <div className="smart-tip">
        💡 <strong>Smart Tip:</strong> This offer matches your preferences and saves you ${offer.save}.00!
      </div>
      <button className="btn-confirm" onClick={() => {
        logger.click("confirm_place_order", { offer: offer.name });
        logger.orderPlaced(offer.name);
        logger.taskComplete("order_placed");
        onPlace();
      }}>Confirm &amp; Place Order</button>
    </div>
  );
}

// ─── CONFIRMATION ─────────────────────────────────────────────────────────────
function ConfirmScreen({ logger, onHome }) {
  usePageTimer("order_confirmation", logger);
  return (
    <div className="confirm-wrap">
      <div className="confirm-box">
        <div className="confirm-icon">✓</div>
        <div className="confirm-title">Order Placed</div>
        <div className="confirm-sub">Your order has been confirmed</div>
        <button className="btn-home" onClick={() => { logger.click("back_to_home", { from: "confirmation" }); onHome(); }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const sessionId = useRef(getOrCreateSessionId()).current;

  const [privacy, setPrivacy] = useState(() => {
    try { const s = localStorage.getItem(S_STATE); if (s) return JSON.parse(s); } catch(_) {}
    return initPrivacy();
  });
  const [log, setLog] = useState(() => {
    try { const s = localStorage.getItem(S_LOG); if (s) return JSON.parse(s); } catch(_) {}
    return [];
  });

  const logger = useRef(makeLogger(setLog, sessionId)).current;
  const [screen, setScreen] = useState("home");
  const [offer,  setOffer]  = useState(null);

  const showDebug = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";

  function savePrivacy(updated) {
    setPrivacy(updated);
    try { localStorage.setItem(S_STATE, JSON.stringify(updated)); } catch(_) {}
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="wrap">
        {screen === "home"    && <HomeScreen    logger={logger} onPrivacy={() => setScreen("privacy")} />}
        {screen === "privacy" && <PrivacyScreen privacy={privacy} onSave={savePrivacy} logger={logger} onBack={() => setScreen("home")} onDone={() => setScreen("offers")} />}
        {screen === "offers"  && <OffersScreen  logger={logger} onSelect={o => { setOffer(o); setScreen("order"); }} onHome={() => setScreen("home")} />}
        {screen === "order"   && <OrderScreen   offer={offer} logger={logger} onPlace={() => setScreen("confirm")} onBack={() => setScreen("offers")} />}
        {screen === "confirm" && <ConfirmScreen logger={logger} onHome={() => setScreen("home")} />}
      </div>
      {showDebug && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0f1117", color: "#c9d1f0", padding: "8px 14px", fontSize: 11, fontFamily: "monospace" }}>
          ⬛ {log.length} events logged | session: {sessionId}
        </div>
      )}
    </>
  );
}