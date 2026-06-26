import { useState, useEffect, useRef } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL      = "https://iljzwxwopxuzpgkjivmn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KEoCJtCLyGTJjqB1phGy2Q_v3PftUYH";

const S_STATE   = "shdm_high_state";
const S_LOG     = "shdm_high_log";
const S_SESSION = "shdm_high_session_id";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const COLLECTION_CATS = [
  {
    key: "homeSensors", icon: "🏠", label: "Home Sensors", sensitivity: "medium",
    why: "Enables smart automation and personalized recommendations",
    subs: [
      { key: "kitchenSensors", label: "Kitchen Sensors",
        items: ["Oven Usage Sensor", "Stove Activity Sensor", "Refrigerator Monitor", "Dishwasher Sensor"] },
      { key: "climateSensors", label: "Climate Sensors",
        items: ["Thermostat", "Humidity Sensor", "CO₂ Monitor"] },
    ],
  },
  {
    key: "behaviorPatterns", icon: "📊", label: "Behavior Patterns", sensitivity: "high",
    why: "Predicts your needs and automates routines",
    subs: [
      { key: "motionTracking", label: "Motion Tracking",
        items: ["Room Occupancy", "Movement Patterns"] },
      { key: "presenceDetection", label: "Presence Detection",
        items: ["Entry/Exit Times", "Room-by-Room Presence"] },
    ],
  },
  {
    key: "purchaseHistory", icon: "🛒", label: "Purchase History", sensitivity: "medium",
    why: "Personalizes offers to match your preferences and budget",
    subs: [
      { key: "pastOrders", label: "Past Orders",
        items: ["Food Orders", "Home Services", "Wellness Products"] },
    ],
  },
];

const USAGE_CATS = [
  { key: "foodServices",     icon: "🍕", label: "Food Services",    desc: "Intelligent meal recommendations based on cooking patterns",
    benefit: "Saves time with relevant suggestions when you need them",
    tags: ["Kitchen sensors", "Time patterns", "Purchase history"] },
  { key: "homeServices",     icon: "🏠", label: "Home Services",    desc: "Automation and maintenance suggestions",
    benefit: "Optimizes comfort and prevents issues",
    tags: ["Climate sensors", "Usage patterns", "Presence detection"] },
  { key: "wellnessServices", icon: "💪", label: "Wellness Services", desc: "Health and fitness support",
    benefit: "Achieve wellness goals with personalized insights",
    tags: ["Activity patterns", "Behavior data"] },
];

const OFFERS = [
  { id: 1, emoji: "🍕", name: "Pizza Meal",     desc: "2 Large Pizzas (Margherita & Pepperoni), 2 Pops, Large Fries",
    price: 24.99, original: 32.99, save: 8, cal: 1800, serves: 2, match: 95,
    tags: ["Perfect for 2 people", "Popular at dinner time", "Matches past orders"] },
  { id: 2, emoji: "🍔", name: "Burger Combo",   desc: "2 Gourmet Burgers, 2 Seasoned Fries, 2 Soft Drinks",
    price: 18.99, original: 24.99, save: 6, cal: 1400, serves: 2, match: 92,
    tags: ["Quick delivery", "Budget-friendly", "High ratings"] },
  { id: 3, emoji: "🥡", name: "Chinese Dinner", desc: "Fried Rice (Large), Chow Mein, 6 Spring Rolls, 2 Entrees",
    price: 32.99, original: 38.99, save: 6, cal: 2000, serves: 2, match: 88,
    tags: ["Variety for sharing", "Matches dietary preferences", "Free fortune cookies"] },
  { id: 4, emoji: "🍝", name: "Pasta Bowl",     desc: "Fettuccine Alfredo or Marinara, Garlic Ciabatta, Caesar Salad",
    price: 16.99, original: 21.99, save: 5, cal: 1200, serves: 2, match: 81,
    tags: ["Comfort food", "Vegetarian option", "Locally sourced"] },
];

const initPrivacy = () => ({
  cats: {}, subs: {}, items: {}, usage: {}, usageSubs: {},
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
      session_id: sessionId, flow: "high",
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
    --amber: #d97706; --amber-bg: #fef3c7; --amber-bd: #fde68a;
    --purple: #7c3aed; --purple-bg: #ede9fe; --purple-bd: #c4b5fd;
    --r: 12px; --sh: 0 1px 3px rgba(0,0,0,.07), 0 4px 12px rgba(0,0,0,.05);
  }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  .wrap { max-width: 620px; margin: 0 auto; padding: 0 16px 32px; }

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
  .page-wrap { padding-top: 24px; }

  /* info banner HIGH */
  .info-banner-high { border-radius: 10px; background: var(--blue-bg); border: 1px solid var(--blue-bd); margin-bottom: 16px; overflow: hidden; }
  .info-banner-high-top { display: flex; gap: 12px; padding: 14px 16px 10px; }
  .info-banner-high-icon { font-size: 18px; color: var(--blue); flex-shrink: 0; margin-top: 1px; }
  .info-banner-high-title { font-size: 14px; font-weight: 700; color: var(--blue-dark); margin-bottom: 2px; }
  .info-banner-high-sub { font-size: 12px; color: var(--text2); }
  .info-banner-pills { display: flex; gap: 12px; padding: 0 16px 14px; }
  .info-pill { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--blue-dark); font-weight: 500; }

  /* tabs HIGH */
  .tabs { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 16px; }
  .tab { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px 8px; font-size: 13px; font-weight: 500; color: var(--text2); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color .12s, border-color .12s; gap: 1px; }
  .tab.active { color: var(--blue); border-bottom-color: var(--blue); }
  .tab-sub { font-size: 11px; font-weight: 400; color: inherit; opacity: 0.7; }

  /* sensitivity badge */
  .badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; display: inline-flex; align-items: center; }
  .badge-medium { background: var(--amber-bg); color: var(--amber); border: 1px solid var(--amber-bd); }
  .badge-high   { background: var(--red-bg);   color: var(--red);   border: 1px solid var(--red-bd);   }

  /* category L1 */
  .cat1 { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 10px; box-shadow: var(--sh); overflow: hidden; }
  .cat1-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 14px 16px; cursor: pointer; }
  .cat1-left { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
  .cat1-chevron { font-size: 11px; color: var(--text3); margin-top: 3px; transition: transform .15s; flex-shrink: 0; }
  .cat1-chevron.open { transform: rotate(90deg); }
  .cat1-icon { font-size: 18px; }
  .cat1-label { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
  .cat1-da { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
  .why-box { font-size: 12px; color: var(--text2); background: var(--bg); border-top: 1px solid var(--border); padding: 8px 16px; }
  .why-box strong { color: var(--text); }

  /* category L2 */
  .cat2 { border-top: 1px solid var(--border); }
  .cat2-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px 10px 32px; cursor: pointer; }
  .cat2-label { font-size: 13px; font-weight: 500; }
  .cat2-chevron { font-size: 10px; color: var(--text3); transition: transform .15s; margin-left: 6px; }
  .cat2-chevron.open { transform: rotate(180deg); }

  /* category L3 items */
  .cat3-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px 8px 48px; border-top: 1px solid var(--border); }
  .cat3-label { font-size: 12px; color: var(--text2); }

  /* da buttons */
  .da { display: flex; gap: 5px; flex-shrink: 0; }
  .da-btn { padding: 4px 10px; border-radius: 6px; border: 1.5px solid var(--border); background: var(--surface); font-size: 12px; font-weight: 500; cursor: pointer; transition: background .12s, border-color .12s, color .12s; font-family: inherit; color: var(--text2); }
  .da-deny.on  { background: var(--red-bg);   border-color: var(--red-bd);   color: var(--red);   }
  .da-allow.on { background: var(--green-bg); border-color: var(--green-bd); color: var(--green); }
  .da-deny:hover:not(.on)  { background: var(--red-bg);   border-color: var(--red-bd); }
  .da-allow:hover:not(.on) { background: var(--green-bg); border-color: var(--green-bd); }

  /* xcheck */
  .xcheck { display: flex; gap: 4px; }
  .btn-x { width: 24px; height: 24px; border-radius: 5px; border: 1.5px solid var(--red-bd); background: var(--red-bg); color: var(--red); font-size: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity .12s; }
  .btn-ck { width: 24px; height: 24px; border-radius: 5px; border: 1.5px solid var(--green-bd); background: var(--green-bg); color: var(--green); font-size: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity .12s; }
  .btn-x.dim, .btn-ck.dim { opacity: 0.25; }

  /* usage cards */
  .usage-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 16px; margin-bottom: 10px; box-shadow: var(--sh); }
  .usage-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
  .usage-card-title { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }
  .usage-card-desc { font-size: 12px; color: var(--text2); }
  .benefit-box { font-size: 12px; background: var(--green-bg); border: 1px solid var(--green-bd); border-radius: 6px; padding: 5px 10px; margin-bottom: 8px; color: var(--green); }
  .benefit-box::before { content: "✦ Benefit: "; font-weight: 600; }
  .tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .tag { font-size: 11px; padding: 2px 8px; background: var(--bg); border: 1px solid var(--border); border-radius: 20px; color: var(--text2); }

  /* save / done */
  .save-row { display: flex; justify-content: flex-end; margin: 4px 0 8px; }
  .btn-save { padding: 9px 22px; background: var(--blue); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: background .12s; }
  .btn-save.saved { background: var(--green); }
  .btn-save:hover:not(.saved) { background: var(--blue-dark); }
  .btn-done { display: block; width: 100%; padding: 15px; background: #16a34a; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px; font-family: inherit; text-align: center; }
  .btn-done:hover { background: #15803d; }

  /* offers */
  .off-tabs { display: flex; border-bottom: 2px solid var(--border); margin-bottom: 16px; }
  .off-tab { flex: 1; text-align: center; padding: 11px 8px; font-size: 14px; font-weight: 500; color: var(--text2); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: color .12s, border-color .12s; }
  .off-tab.active { color: var(--blue); border-bottom-color: var(--blue); }
  .off-head-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px; }
  .off-head { font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
  .off-count { text-align: right; }
  .off-count-label { font-size: 11px; color: var(--text2); }
  .off-count-num { font-size: 22px; font-weight: 700; color: var(--blue); }
  .off-sub { font-size: 13px; color: var(--text2); margin-bottom: 14px; }

  /* personalization context */
  .ctx-box { background: var(--blue-bg); border: 1px solid var(--blue-bd); border-radius: 10px; padding: 12px 14px; margin-bottom: 14px; }
  .ctx-title { font-size: 13px; font-weight: 600; color: var(--blue-dark); margin-bottom: 8px; display: flex; align-items: center; gap: 5px; }
  .ctx-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 6px; }
  .ctx-item { background: var(--surface); border-radius: 6px; padding: 6px 8px; }
  .ctx-item-label { font-size: 10px; color: var(--text2); margin-bottom: 2px; }
  .ctx-item-val { font-size: 13px; font-weight: 600; }
  .ctx-note { font-size: 11px; color: var(--blue-dark); }

  /* offer card HIGH */
  .off-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); padding: 14px 16px; margin-bottom: 10px; cursor: pointer; transition: border-color .12s, box-shadow .12s; box-shadow: var(--sh); }
  .off-card:hover { border-color: var(--blue); box-shadow: 0 4px 16px rgba(0,0,0,.10); }
  .off-card.top { border-color: var(--blue); background: #fafbff; }
  .off-card-row { display: flex; align-items: flex-start; gap: 12px; }
  .off-emoji { font-size: 30px; line-height: 1; }
  .off-body { flex: 1; }
  .off-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 3px; }
  .off-name { font-size: 14px; font-weight: 600; color: var(--blue); }
  .off-top-badge { font-size: 11px; background: var(--purple); color: #fff; padding: 2px 8px; border-radius: 20px; font-weight: 600; display: flex; align-items: center; gap: 3px; }
  .off-desc { font-size: 12px; color: var(--text2); margin-bottom: 6px; }
  .off-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
  .off-tag { font-size: 11px; padding: 2px 7px; background: var(--bg); border: 1px solid var(--border); border-radius: 20px; color: var(--text2); }
  .off-meta { font-size: 11px; color: var(--text3); }
  .off-price-col { text-align: right; flex-shrink: 0; min-width: 80px; }
  .off-match-label { font-size: 10px; color: var(--text2); margin-bottom: 3px; }
  .off-match-bar { width: 60px; height: 4px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 2px; margin-left: auto; }
  .off-match-fill { height: 100%; background: var(--green); border-radius: 3px; }
  .off-match-pct { font-size: 11px; font-weight: 700; color: var(--green); margin-bottom: 4px; }
  .off-original { font-size: 11px; color: var(--text3); text-decoration: line-through; }
  .off-price { font-size: 17px; font-weight: 700; color: var(--blue); }
  .off-save { font-size: 11px; color: var(--green); font-weight: 600; }
  .no-off { font-size: 14px; color: var(--text2); padding: 20px 0; }

  /* order */
  .order-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh); overflow: hidden; margin-bottom: 12px; }
  .order-title { font-size: 17px; font-weight: 700; padding: 18px 20px 14px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
  .order-line { display: flex; justify-content: space-between; align-items: center; padding: 13px 20px; border-bottom: 1px solid var(--border); font-size: 14px; }
  .order-line:last-child { border-bottom: none; }
  .order-line.total { font-weight: 700; font-size: 15px; }
  .order-line .val { color: var(--text); }
  .order-original { font-size: 12px; color: var(--text3); text-decoration: line-through; margin-right: 6px; }
  .smart-tip { background: var(--blue-bg); border: 1px solid var(--blue-bd); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: var(--blue-dark); margin-top: 12px; }
  .btn-confirm { display: block; width: 100%; padding: 15px; background: var(--blue); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 12px; }
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
      <button className={`da-btn da-deny${value === "deny"  ? " on" : ""}`} onClick={onDeny}>Deny</button>
      <button className={`da-btn da-allow${value === "allow" ? " on" : ""}`} onClick={onAllow}>Allow</button>
    </div>
  );
}

function XCheck({ value, onDeny, onAllow }) {
  return (
    <div className="xcheck">
      <button className={`btn-x${value === "deny"  ? "" : " dim"}`} onClick={onDeny}>✕</button>
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

  const [tab,      setTab]      = useState("collection");
  const [catVal,   setCatVal]   = useState({ ...privacy.cats });
  const [subVal,   setSubVal]   = useState({ ...privacy.subs });
  const [itemVal,  setItemVal]  = useState({ ...privacy.items });
  const [usgVal,   setUsgVal]   = useState({ ...privacy.usage });
  const [expanded, setExpanded] = useState({});
  const [saved,    setSaved]    = useState(false);

  function toggle(key, val, setState) {
    setState(s => {
      const next = s[key] === val ? null : val;
      logger.toggle(key, next);
      setSaved(false);
      return { ...s, [key]: next };
    });
  }

  function toggleExpand(key) {
    logger.expand(key);
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  }

  function handleSave() {
    logger.click("save_my_choices");
    logger.taskComplete("privacy_settings_saved");
    onSave({ cats: catVal, subs: subVal, items: itemVal, usage: usgVal, usageSubs: {} });
    setSaved(true);
  }

  return (
    <div className="page-wrap">
      <div className="back" onClick={() => { logger.click("back_to_home"); onBack(); }}>← Back to Home</div>

      {/* HIGH info banner */}
      <div className="info-banner-high">
        <div className="info-banner-high-top">
          <span className="info-banner-high-icon">ℹ️</span>
          <div>
            <div className="info-banner-high-title">Your Data, Your Choice</div>
            <div className="info-banner-high-sub">Full transparency with granular control. Expand categories to see and control specific data points.</div>
          </div>
        </div>
        <div className="info-banner-pills">
          <span className="info-pill">👁 Complete visibility</span>
          <span className="info-pill">🔒 Encrypted &amp; secure</span>
        </div>
      </div>

      {/* Tabs with subtitles */}
      <div className="tabs">
        <div className={`tab${tab === "collection" ? " active" : ""}`} onClick={() => { logger.tabSwitch(tab, "collection"); setTab("collection"); }}>
          🗄️ Data Collection
          <span className="tab-sub">What we gather</span>
        </div>
        <div className={`tab${tab === "usage" ? " active" : ""}`} onClick={() => { logger.tabSwitch(tab, "usage"); setTab("usage"); }}>
          ⚙️ Data Usage
          <span className="tab-sub">How we use it</span>
        </div>
      </div>

      {tab === "collection" && (
        <>
          {COLLECTION_CATS.map(cat => (
            <div className="cat1" key={cat.key}>
              <div className="cat1-header">
                <div className="cat1-left" onClick={() => toggleExpand(cat.key)}>
                  <span className={`cat1-chevron${expanded[cat.key] ? " open" : ""}`}>▶</span>
                  <span className="cat1-icon">{cat.icon}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                      <span className="cat1-label">{cat.label}</span>
                      <span className={`badge badge-${cat.sensitivity}`}>{cat.sensitivity} sensitivity</span>
                    </div>
                  </div>
                </div>
                <div className="cat1-da">
                  <DA value={catVal[cat.key]}
                    onDeny={()  => toggle(cat.key, "deny",  setCatVal)}
                    onAllow={() => toggle(cat.key, "allow", setCatVal)} />
                </div>
              </div>

              {expanded[cat.key] && (
                <>
                  <div className="why-box"><strong>Why:</strong> {cat.why}</div>
                  {cat.subs.map(sub => (
                    <div className="cat2" key={sub.key}>
                      <div className="cat2-header" onClick={() => toggleExpand(cat.key + "_" + sub.key)}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span className="cat2-label">{sub.label}</span>
                          <span className={`cat2-chevron${expanded[cat.key + "_" + sub.key] ? " open" : ""}`}>▾</span>
                        </div>
                        <DA value={subVal[sub.key]}
                          onDeny={()  => toggle(sub.key, "deny",  setSubVal)}
                          onAllow={() => toggle(sub.key, "allow", setSubVal)} />
                      </div>
                      {expanded[cat.key + "_" + sub.key] && sub.items.map(item => (
                        <div className="cat3-item" key={item}>
                          <span className="cat3-label">{item}</span>
                          <XCheck
                            value={itemVal[item]}
                            onDeny={()  => toggle(item, "deny",  setItemVal)}
                            onAllow={() => toggle(item, "allow", setItemVal)} />
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
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
            <div className="usage-card" key={cat.key}>
              <div className="usage-card-top">
                <div style={{ flex: 1 }}>
                  <div className="usage-card-title">{cat.icon} {cat.label}</div>
                  <div className="usage-card-desc">{cat.desc}</div>
                </div>
                <DA value={usgVal[cat.key]}
                  onDeny={()  => toggle(cat.key, "deny",  setUsgVal)}
                  onAllow={() => toggle(cat.key, "allow", setUsgVal)} />
              </div>
              <div className="benefit-box">{cat.benefit}</div>
              <div className="tags">{cat.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
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
          <div className="off-head-row">
            <div className="off-head">✦ Personalized Offers</div>
            <div className="off-count">
              <div className="off-count-label">Available Now</div>
              <div className="off-count-num">{OFFERS.length}</div>
            </div>
          </div>
          <div className="off-sub">Curated specifically for you based on your preferences</div>

          <div className="ctx-box">
            <div className="ctx-title">ℹ️ Personalization Context</div>
            <div className="ctx-grid">
              <div className="ctx-item"><div className="ctx-item-label">Kitchen Status</div><div className="ctx-item-val">No cooking</div></div>
              <div className="ctx-item"><div className="ctx-item-label">People Home</div><div className="ctx-item-val">2 detected</div></div>
              <div className="ctx-item"><div className="ctx-item-label">Time</div><div className="ctx-item-val">7:15 PM Wed</div></div>
            </div>
            <div className="ctx-note">These offers are ranked by match score based on your consent settings, past orders, and current situation.</div>
          </div>

          {OFFERS.map((o, i) => (
            <div key={o.id} className={`off-card${i === 0 ? " top" : ""}`}
              onClick={() => { logger.click("select_offer", { offer: o.name, price: o.price }); onSelect(o); }}>
              <div className="off-card-row">
                <span className="off-emoji">{o.emoji}</span>
                <div className="off-body">
                  <div className="off-name-row">
                    <span className="off-name">{o.name}</span>
                    {i === 0 && <span className="off-top-badge">✦ Top Match</span>}
                  </div>
                  <div className="off-desc">{o.desc}</div>
                  <div className="off-tags">{o.tags.map(t => <span key={t} className="off-tag">{t}</span>)}</div>
                  <div className="off-meta">📊 ~{o.cal} cal · Serves {o.serves}</div>
                </div>
                <div className="off-price-col">
                  <div className="off-match-label">Match Score</div>
                  <div className="off-match-bar"><div className="off-match-fill" style={{ width: o.match + "%" }}></div></div>
                  <div className="off-match-pct">{o.match}%</div>
                  <div className="off-original">${o.original.toFixed(2)}</div>
                  <div className="off-price">${o.price.toFixed(2)}</div>
                  <div className="off-save">Save ${o.save}.00</div>
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
        <div style={{ padding: "4px 20px 8px", fontSize: 12, color: "var(--text2)" }}>{offer.desc}</div>
        <div className="order-line"><span>Delivery Type</span><span className="val">Standard (30–45 min)</span></div>
        <div className="order-line"><span>Delivery Fee</span><span className="val">Free</span></div>
        <div className="order-line total">
          <span>Total</span>
          <span><span className="order-original">${offer.original.toFixed(2)}</span><span className="val">${offer.price.toFixed(2)}</span></span>
        </div>
      </div>
      <div className="smart-tip">💡 <strong>Smart Tip:</strong> This offer matches your preferences and saves you ${offer.save}.00!</div>
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
    </>
  );
}