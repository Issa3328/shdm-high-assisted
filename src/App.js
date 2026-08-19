import { useState, useEffect, useRef } from "react";

const SUPABASE_URL      = "https://iljzwxwopxuzpgkjivmn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KEoCJtCLyGTJjqB1phGy2Q_v3PftUYH";
const S_SESSION = "shdm_high_assisted_session_id";
const FLOW      = "high_assisted";

const COLLECTION_CATS = [
  { id: "homeSensors",      icon: "🏠", label: "Home Sensors",      sensitivity: "medium", why: "Enables smart automation and personalized recommendations",
    subs: [
      { id: "kitchenSensors",   label: "Kitchen Sensors",   items: ["Oven Usage Sensor", "Stove Activity Sensor", "Refrigerator Monitor", "Dishwasher Sensor"] },
      { id: "climateSensors",   label: "Climate Sensors",   items: ["Thermostat", "Humidity Sensor", "CO₂ Monitor"] },
    ]},
  { id: "behaviorPatterns", icon: "📊", label: "Behavior Patterns", sensitivity: "high",   why: "Predicts your needs and automates routines",
    subs: [
      { id: "motionTracking",     label: "Motion Tracking",     items: ["Room Occupancy", "Movement Patterns"] },
      { id: "presenceDetection",  label: "Presence Detection",  items: ["Entry/Exit Times", "Room-by-Room Presence"] },
    ]},
  { id: "purchaseHistory",  icon: "🛒", label: "Purchase History",  sensitivity: "medium", why: "Personalizes offers to match your preferences and budget",
    subs: [
      { id: "pastOrders", label: "Past Orders", items: ["Food Orders", "Home Services", "Wellness Products"] },
    ]},
];
const USAGE_CATS = [
  { id: "foodServices",     icon: "🍕", label: "Food Services",     desc: "Intelligent meal recommendations based on cooking patterns",    benefit: "Saves time with relevant suggestions", tags: ["Kitchen sensors", "Time patterns", "Purchase history"] },
  { id: "homeServices",     icon: "🏠", label: "Home Services",     desc: "Automation and maintenance suggestions",                         benefit: "Optimizes comfort and prevents issues", tags: ["Climate sensors", "Usage patterns"] },
  { id: "wellnessServices", icon: "💪", label: "Wellness Services", desc: "Health and fitness support",                                     benefit: "Achieve wellness goals with insights",  tags: ["Activity patterns", "Behavior data"] },
];
const OFFERS = [
  { id: "1", emoji: "🍕", name: "Pizza Meal",     desc: "2 Large Pizzas (Margherita & Pepperoni), 2 Pops, Large Fries", price: 24.99, original: 32.99, save: 8,  cal: 1800, serves: 2, match: 95, tags: ["Perfect for 2 people", "Popular at dinner time"] },
  { id: "2", emoji: "🍔", name: "Burger Combo",   desc: "2 Gourmet Burgers, 2 Seasoned Fries, 2 Soft Drinks",          price: 18.99, original: 24.99, save: 6,  cal: 1400, serves: 2, match: 92, tags: ["Quick delivery", "Budget-friendly"] },
  { id: "3", emoji: "🥡", name: "Chinese Dinner", desc: "Fried Rice (Large), Chow Mein, 6 Spring Rolls, 2 Entrees",    price: 32.99, original: 38.99, save: 6,  cal: 2000, serves: 2, match: 88, tags: ["Variety for sharing"] },
  { id: "4", emoji: "🍝", name: "Pasta Bowl",     desc: "Fettuccine Alfredo or Marinara, Garlic Ciabatta, Caesar Salad", price: 16.99, original: 21.99, save: 5, cal: 1200, serves: 2, match: 81, tags: ["Comfort food", "Vegetarian option"] },
];
const TASKS = [
  { id: "task1", label: "Task 1", desc: "Review the suggested settings in the Data Collection and Data Usage tabs and adjust them according to your preferences." },
  { id: "task2", label: "Task 2", desc: "Configure the Data Collection tab by allowing or denying access to home sensors and purchase history." },
  { id: "task3", label: "Task 3", desc: "Configure the Data Usage tab by allowing or denying access to home services and wellness-related services." },
  { id: "task4", label: "Task 4", desc: "Review all three tabs: Food, Home, and Wellness. Explore and select one offer that best matches your preferences." },
  { id: "task5", label: "Task 5", desc: "Review the final order summary and confirm or place the order." },
];

// Assisted: pre-filled defaults
const DEFAULT_CAT = { homeSensors: "allow", behaviorPatterns: "allow", purchaseHistory: "deny" };
const DEFAULT_USG = { foodServices: "allow", homeServices: "allow", wellnessServices: "deny" };

function getOrCreateSessionId() {
  try {
    let id = localStorage.getItem(S_SESSION);
    if (!id) { id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`; localStorage.setItem(S_SESSION, id); }
    return id;
  } catch (_) { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
}
async function logEvent(row) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/interaction_logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Prefer": "return=minimal" },
      body: JSON.stringify(row),
    });
  } catch (_) {}
}
async function logTaskSummary(row) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/task_summaries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${SUPABASE_ANON_KEY}`, "Prefer": "return=minimal" },
      body: JSON.stringify(row),
    });
  } catch (_) {}
}
function createTracker(sessionId) {
  const s = { task: null, start: null, clicks: 0, errors: 0, overrides: 0, depth: 0 };
  return {
    start(taskId) { s.task = taskId; s.start = Date.now(); s.clicks = 0; s.errors = 0; s.overrides = 0; s.depth = 0; },
    click()    { s.clicks++; },
    error()    { s.errors++; },
    override() { s.clicks++; s.overrides++; },
    expand(d)  { s.clicks++; if (d > s.depth) s.depth = d; },
    complete(offerName = null, orderPlaced = false) {
      if (!s.task) return null;
      const time_ms = Date.now() - s.start;
      const result = { task: s.task, time_ms, clicks: s.clicks, errors: s.errors, overrides: s.overrides, depth: s.depth };
      logTaskSummary({ session_id: sessionId, flow: FLOW, task: s.task, time_ms, clicks: s.clicks, errors: s.errors, overrides: s.overrides, depth: s.depth, offer_selected: offerName, order_placed: orderPlaced, client_timestamp: new Date().toISOString() });
      s.task = null;
      return result;
    },
  };
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f5f6fa; color: #111827; min-height: 100vh; }
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; flex-shrink: 0; background: #fff; border-right: 1px solid #e4e6ef; padding: 20px 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
  .sidebar-title { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #6b7280; padding: 0 16px 12px; }
  .task-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 16px; cursor: pointer; transition: background .12s; border-left: 3px solid transparent; }
  .task-item:hover:not(.done):not(.locked) { background: #f5f6fa; }
  .task-item.active { background: #eef1ff; border-left-color: #4263eb; }
  .task-item.done { opacity: 0.5; cursor: default; }
  .task-item.locked { opacity: 0.35; cursor: not-allowed; }
  .task-cb { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d1d5db; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .task-cb.done { background: #16a34a; border-color: #16a34a; color: #fff; }
  .task-cb.active { border-color: #4263eb; }
  .task-lbl { font-size: 12px; font-weight: 600; }
  .task-desc { font-size: 11px; color: #6b7280; margin-top: 2px; line-height: 1.4; }
  .content-area { flex: 1; display: flex; justify-content: center; background: #f5f6fa; }
  .main { width: 100%; max-width: 620px; padding: 24px; }
  .task-banner { background: #1e1b4b; color: #e0e7ff; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; }
  .task-banner-lbl { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; opacity: .6; margin-bottom: 4px; }
  .task-banner-desc { font-size: 13px; line-height: 1.5; }
  .btn-task-done { display: block; width: 100%; margin-top: 10px; padding: 11px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-task-done:hover { background: #4338ca; }
  .back { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: #6b7280; cursor: pointer; margin-bottom: 16px; }
  .back:hover { color: #4263eb; }
  .page-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .page-sub { font-size: 13px; color: #6b7280; margin-bottom: 16px; }
  .high-banner { border-radius: 10px; background: #eef1ff; border: 1px solid #c7d2fe; margin-bottom: 16px; overflow: hidden; }
  .high-banner-top { display: flex; gap: 12px; padding: 14px 16px 10px; }
  .high-banner-icon { font-size: 18px; color: #4263eb; flex-shrink: 0; }
  .high-banner-title { font-size: 14px; font-weight: 700; color: #3451c7; margin-bottom: 2px; }
  .high-banner-sub { font-size: 12px; color: #6b7280; }
  .high-banner-pills { display: flex; gap: 12px; padding: 0 16px 14px; }
  .pill { font-size: 12px; color: #3451c7; font-weight: 500; display: flex; align-items: center; gap: 4px; }
  .tabs { display: flex; border-bottom: 2px solid #e4e6ef; margin-bottom: 16px; }
  .tab { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px 8px; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; gap: 1px; }
  .tab.active { color: #4263eb; border-bottom-color: #4263eb; }
  .tab-sub { font-size: 11px; font-weight: 400; opacity: 0.7; }
  .badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; display: inline-flex; align-items: center; }
  .badge-medium { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
  .badge-high   { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
  .cat1 { background: #fff; border: 1px solid #e4e6ef; border-radius: 12px; margin-bottom: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
  .cat1-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 14px 16px; cursor: pointer; }
  .cat1-left { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
  .cat1-chevron { font-size: 11px; color: #9ca3af; margin-top: 3px; transition: transform .15s; flex-shrink: 0; }
  .cat1-chevron.open { transform: rotate(90deg); }
  .cat1-icon { font-size: 18px; }
  .cat1-label { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
  .why-box { font-size: 12px; color: #6b7280; background: #f5f6fa; border-top: 1px solid #e4e6ef; padding: 8px 16px; }
  .why-box strong { color: #111827; }
  .cat2 { border-top: 1px solid #e4e6ef; }
  .cat2-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px 10px 32px; cursor: pointer; }
  .cat2-label { font-size: 13px; font-weight: 500; }
  .cat2-chevron { font-size: 10px; color: #9ca3af; transition: transform .15s; margin-left: 6px; }
  .cat2-chevron.open { transform: rotate(180deg); }
  .cat3-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px 8px 48px; border-top: 1px solid #e4e6ef; }
  .cat3-label { font-size: 12px; color: #6b7280; }
  .da { display: flex; gap: 5px; flex-shrink: 0; }
  .da-btn { padding: 4px 10px; border-radius: 6px; border: 1.5px solid #e4e6ef; background: #fff; font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; color: #6b7280; }
  .da-deny.on  { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
  .da-allow.on { background: #dcfce7; border-color: #86efac; color: #16a34a; }
  .xcheck { display: flex; gap: 4px; }
  .btn-x  { width: 24px; height: 24px; border-radius: 5px; border: 1.5px solid #fca5a5; background: #fee2e2; color: #dc2626; font-size: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .btn-ck { width: 24px; height: 24px; border-radius: 5px; border: 1.5px solid #86efac; background: #dcfce7; color: #16a34a; font-size: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .btn-x.dim, .btn-ck.dim { opacity: 0.25; }
  .usage-card { background: #fff; border: 1px solid #e4e6ef; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
  .usage-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
  .usage-card-title { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
  .usage-card-desc { font-size: 12px; color: #6b7280; }
  .benefit-box { font-size: 12px; background: #dcfce7; border: 1px solid #86efac; border-radius: 6px; padding: 5px 10px; margin-bottom: 8px; color: #16a34a; }
  .benefit-box::before { content: "✦ Benefit: "; font-weight: 600; }
  .tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .tag { font-size: 11px; padding: 2px 8px; background: #f5f6fa; border: 1px solid #e4e6ef; border-radius: 20px; color: #6b7280; }
  .save-row { display: flex; justify-content: flex-end; margin: 8px 0; }
  .btn-save { padding: 9px 22px; background: #4263eb; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-save.saved { background: #16a34a; }
  .btn-done { display: block; width: 100%; padding: 14px; background: #16a34a; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 8px; }
  .off-tabs { display: flex; border-bottom: 2px solid #e4e6ef; margin-bottom: 16px; }
  .off-tab { flex: 1; text-align: center; padding: 11px 8px; font-size: 14px; font-weight: 500; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; }
  .off-tab.active { color: #4263eb; border-bottom-color: #4263eb; }
  .off-head-row { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px; }
  .off-head { font-size: 18px; font-weight: 700; }
  .off-count-box { text-align: right; }
  .off-count-lbl { font-size: 11px; color: #6b7280; }
  .off-count-num { font-size: 22px; font-weight: 700; color: #4263eb; }
  .off-sub { font-size: 13px; color: #6b7280; margin-bottom: 14px; }
  .ctx-box { background: #eef1ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 12px 14px; margin-bottom: 14px; }
  .ctx-title { font-size: 13px; font-weight: 600; color: #3451c7; margin-bottom: 8px; }
  .ctx-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 6px; }
  .ctx-item { background: #fff; border-radius: 6px; padding: 6px 8px; }
  .ctx-item-lbl { font-size: 10px; color: #6b7280; margin-bottom: 2px; }
  .ctx-item-val { font-size: 13px; font-weight: 600; }
  .ctx-note { font-size: 11px; color: #3451c7; }
  .off-card { background: #fff; border: 1px solid #e4e6ef; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; cursor: pointer; transition: border-color .12s; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
  .off-card:hover { border-color: #4263eb; box-shadow: 0 4px 12px rgba(0,0,0,.08); }
  .off-card.top { border-color: #4263eb; background: #fafbff; }
  .off-card-row { display: flex; align-items: flex-start; gap: 12px; }
  .off-emoji { font-size: 30px; line-height: 1; }
  .off-body { flex: 1; }
  .off-name-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 3px; }
  .off-name { font-size: 14px; font-weight: 600; color: #4263eb; }
  .top-badge { font-size: 11px; background: #7c3aed; color: #fff; padding: 2px 8px; border-radius: 20px; font-weight: 600; }
  .off-desc { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
  .off-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
  .off-tag { font-size: 11px; padding: 2px 7px; background: #f5f6fa; border: 1px solid #e4e6ef; border-radius: 20px; color: #6b7280; }
  .off-meta { font-size: 11px; color: #9ca3af; }
  .off-price-col { text-align: right; flex-shrink: 0; min-width: 80px; }
  .match-lbl { font-size: 10px; color: #6b7280; margin-bottom: 3px; }
  .match-bar { width: 60px; height: 4px; background: #e4e6ef; border-radius: 3px; overflow: hidden; margin-bottom: 2px; margin-left: auto; }
  .match-fill { height: 100%; background: #16a34a; border-radius: 3px; }
  .match-pct { font-size: 11px; font-weight: 700; color: #16a34a; margin-bottom: 4px; }
  .off-original { font-size: 11px; color: #9ca3af; text-decoration: line-through; }
  .off-price { font-size: 17px; font-weight: 700; color: #4263eb; }
  .off-save { font-size: 11px; color: #16a34a; font-weight: 600; }
  .no-off { font-size: 14px; color: #6b7280; padding: 20px 0; }
  .order-card { background: #fff; border: 1px solid #e4e6ef; border-radius: 12px; overflow: hidden; margin-bottom: 12px; }
  .order-title { font-size: 17px; font-weight: 700; padding: 16px 20px; border-bottom: 1px solid #e4e6ef; }
  .order-line { display: flex; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #e4e6ef; font-size: 14px; }
  .order-line:last-child { border-bottom: none; font-weight: 700; }
  .smart-tip { background: #eef1ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #3451c7; margin-top: 12px; }
  .btn-confirm { display: block; width: 100%; padding: 14px; background: #4263eb; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 12px; }
  .hint-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #1e40af; margin-bottom: 14px; }
  .off-card.recommended { border-color: #93c5fd; background: #eff6ff; }
  .rec-badge { font-size: 11px; color: #2563eb; font-weight: 600; margin-left: 6px; }
  .confirm-wrap { display: flex; align-items: center; justify-content: center; min-height: 50vh; }
  .confirm-box { background: #fff; border: 1px solid #e4e6ef; border-radius: 12px; padding: 40px 32px; text-align: center; max-width: 360px; width: 100%; }
  .confirm-icon { width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; border: 2px solid #86efac; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 26px; color: #16a34a; }
  .confirm-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .confirm-sub { font-size: 14px; color: #6b7280; }
`;

function Wrap({ children }) {
  return <div className="content-area"><div className="main">{children}</div></div>;
}

function TaskSidebar({ completed, active, onSelect }) {
  return (
    <div className="sidebar">
      <div className="sidebar-title">Study Tasks</div>
      {TASKS.map((t, i) => {
        const isDone   = completed.includes(t.id);
        const isActive = active?.id === t.id;
        const isLocked = !isDone && !isActive && (i === 0 ? false : !completed.includes(TASKS[i-1].id));
        return (
          <div key={t.id} className={`task-item${isDone ? " done" : ""}${isActive ? " active" : ""}${isLocked ? " locked" : ""}`}
            onClick={() => { if (!isDone && !isLocked) onSelect(t); }}>
            <div className={`task-cb${isDone ? " done" : isActive ? " active" : ""}`}>{isDone ? "✓" : ""}</div>
            <div>
              <div className="task-lbl">{t.label}</div>
              <div className="task-desc">{t.desc.slice(0, 50)}…</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskBanner({ task, onComplete }) {
  if (!task) return null;
  return (
    <div className="task-banner">
      <div className="task-banner-lbl">{task.label}</div>
      <div className="task-banner-desc">{task.desc}</div>
      <button className="btn-task-done" onClick={onComplete}>✓ Task Completed</button>
    </div>
  );
}

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

function PrivacyScreen({ catVal, setCatVal, subVal, setSubVal, itemVal, setItemVal, usgVal, setUsgVal, onBack, onDone, activeTask, onTaskComplete, sessionId, tracker, saved, setSaved }) {
  useEffect(() => {
    const t0 = Date.now();
    logEvent({ session_id: sessionId, flow: FLOW, event_type: "page_enter", page: "privacy_settings", task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
    return () => logEvent({ session_id: sessionId, flow: FLOW, event_type: "page_exit", page: "privacy_settings", time_on_page_ms: Date.now() - t0, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [tab, setTab]           = useState(activeTask?.id === "task3" ? "usage" : "collection");
  const [expanded, setExpanded] = useState({});

  function toggle(key, val, state, setState, isOverride) {
    const prev = state[key]; const next = prev === val ? null : val;
    if (prev !== null && prev !== next && next !== null) tracker.override(); else tracker.click();
    setState(s => ({ ...s, [key]: next })); setSaved(false);
    logEvent({ session_id: sessionId, flow: FLOW, event_type: prev !== null && next !== null ? "override" : "toggle", item: key, value: next, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
  }
  function expand(key, depth) {
    tracker.expand(depth); setExpanded(e => ({ ...e, [key]: !e[key] }));
    logEvent({ session_id: sessionId, flow: FLOW, event_type: "expand", item: key, value: depth, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
  }
  function switchTab(t) {
    if (activeTask?.id === "task2" && t === "usage")      { tracker.error(); logEvent({ session_id: sessionId, flow: FLOW, event_type: "error", element: "tab_switch_wrong", value: t, task: activeTask?.id, client_timestamp: new Date().toISOString() }); }
    if (activeTask?.id === "task3" && t === "collection") { tracker.error(); logEvent({ session_id: sessionId, flow: FLOW, event_type: "error", element: "tab_switch_wrong", value: t, task: activeTask?.id, client_timestamp: new Date().toISOString() }); }
    tracker.click(); setTab(t);
    logEvent({ session_id: sessionId, flow: FLOW, event_type: "tab_switch", from: tab, to: t, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
  }
  function handleSave() { tracker.click(); setSaved(true); logEvent({ session_id: sessionId, flow: FLOW, event_type: "click", element: "save_my_choices", task: activeTask?.id || null, client_timestamp: new Date().toISOString() }); }
  function handleDone() {
    if (!saved && activeTask && ["task2","task3"].includes(activeTask.id)) { tracker.error(); logEvent({ session_id: sessionId, flow: FLOW, event_type: "error", element: "done_without_saving", task: activeTask.id, client_timestamp: new Date().toISOString() }); }
    tracker.click(); onDone();
  }

  return (
    <Wrap>
      <TaskBanner task={activeTask} onComplete={onTaskComplete} />
      <div className="back" onClick={() => { tracker.click(); onBack(); }}>← Back to Home</div>
      <div className="page-title">Privacy Settings</div>
      <div className="page-sub">Control what data is collected and how it's used</div>
      <div className="high-banner">
        <div className="high-banner-top">
          <span className="high-banner-icon">ℹ️</span>
          <div>
            <div className="high-banner-title">Your Data, Your Choice</div>
            <div className="high-banner-sub">Full transparency with granular control. Expand categories to see and control specific data points.</div>
          </div>
        </div>
        <div className="high-banner-pills">
          <span className="pill">👁 Complete visibility</span>
          <span className="pill">🔒 Encrypted &amp; secure</span>
        </div>
      </div>
      <div className="hint-box">💡 Recommended settings have been pre-selected based on your preferences.</div>
      <div className="tabs">
        <div className={`tab${tab === "collection" ? " active" : ""}`} onClick={() => switchTab("collection")}>
          🗄️ Data Collection<span className="tab-sub">What we gather</span>
        </div>
        <div className={`tab${tab === "usage" ? " active" : ""}`} onClick={() => switchTab("usage")}>
          ⚙️ Data Usage<span className="tab-sub">How we use it</span>
        </div>
      </div>

      {tab === "collection" && (
        <>
          {COLLECTION_CATS.map(cat => (
            <div className="cat1" key={cat.id}>
              <div className="cat1-header">
                <div className="cat1-left" onClick={() => expand(cat.id, 1)}>
                  <span className={`cat1-chevron${expanded[cat.id] ? " open" : ""}`}>▶</span>
                  <span className="cat1-icon">{cat.icon}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                      <span className="cat1-label">{cat.label}</span>
                      <span className={`badge badge-${cat.sensitivity}`}>{cat.sensitivity} sensitivity</span>
                    </div>
                  </div>
                </div>
                <DA value={catVal[cat.id]}
                  onDeny={() => toggle(cat.id, "deny", catVal, setCatVal)}
                  onAllow={() => toggle(cat.id, "allow", catVal, setCatVal)} />
              </div>
              {expanded[cat.id] && (
                <>
                  <div className="why-box"><strong>Why:</strong> {cat.why}</div>
                  {cat.subs.map(sub => (
                    <div className="cat2" key={sub.id}>
                      <div className="cat2-header" onClick={() => expand(`${cat.id}_${sub.id}`, 2)}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span className="cat2-label">{sub.label}</span>
                          <span className={`cat2-chevron${expanded[`${cat.id}_${sub.id}`] ? " open" : ""}`}>▾</span>
                        </div>
                        <DA value={subVal[sub.id]}
                          onDeny={() => toggle(sub.id, "deny", subVal, setSubVal)}
                          onAllow={() => toggle(sub.id, "allow", subVal, setSubVal)} />
                      </div>
                      {expanded[`${cat.id}_${sub.id}`] && sub.items.map(item => (
                        <div className="cat3-item" key={item}>
                          <span className="cat3-label">{item}</span>
                          <XCheck value={itemVal[item]}
                            onDeny={() => toggle(item, "deny", itemVal, setItemVal)}
                            onAllow={() => toggle(item, "allow", itemVal, setItemVal)} />
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
          <div className="save-row"><button className={`btn-save${saved ? " saved" : ""}`} onClick={handleSave}>{saved ? "Saved!" : "Save My Choices"}</button></div>
        </>
      )}

      {tab === "usage" && (
        <>
          {USAGE_CATS.map(cat => (
            <div className="usage-card" key={cat.id}>
              <div className="usage-card-top">
                <div style={{ flex: 1 }}>
                  <div className="usage-card-title">{cat.icon} {cat.label}</div>
                  <div className="usage-card-desc">{cat.desc}</div>
                </div>
                <DA value={usgVal[cat.id]}
                  onDeny={() => toggle(cat.id, "deny", usgVal, setUsgVal)}
                  onAllow={() => toggle(cat.id, "allow", usgVal, setUsgVal)} />
              </div>
              <div className="benefit-box">{cat.benefit}</div>
              <div className="tags">{cat.tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
            </div>
          ))}
          <div className="save-row"><button className={`btn-save${saved ? " saved" : ""}`} onClick={handleSave}>{saved ? "Saved!" : "Save My Choices"}</button></div>
        </>
      )}
      <button className="btn-done" onClick={handleDone}>Done – Return to Home</button>
    </Wrap>
  );
}

function OffersScreen({ onSelect, onBack, activeTask, onTaskComplete, sessionId, tracker }) {
  useEffect(() => {
    const t0 = Date.now();
    logEvent({ session_id: sessionId, flow: FLOW, event_type: "page_enter", page: "offers", task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
    return () => logEvent({ session_id: sessionId, flow: FLOW, event_type: "page_exit", page: "offers", time_on_page_ms: Date.now() - t0, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [tab, setTab] = useState("food");

  function handleBack() {
    if (activeTask?.id === "task4") { tracker.error(); logEvent({ session_id: sessionId, flow: FLOW, event_type: "error", element: "left_offers_without_selection", task: "task4", client_timestamp: new Date().toISOString() }); }
    tracker.click(); onBack();
  }
  function switchTab(t) {
    tracker.click(); setTab(t);
    logEvent({ session_id: sessionId, flow: FLOW, event_type: "tab_switch", from: tab, to: t, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
  }

  return (
    <Wrap>
      <TaskBanner task={activeTask} onComplete={onTaskComplete} />
      <div className="back" onClick={handleBack}>← Back to Home</div>
      <div className="off-tabs">
        {["food","home","wellness"].map(t => (
          <div key={t} className={`off-tab${tab === t ? " active" : ""}`} onClick={() => switchTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>
        ))}
      </div>
      {tab === "food" ? (
        <>
          <div className="off-head-row">
            <div className="off-head">✦ Personalized Offers</div>
            <div className="off-count-box"><div className="off-count-lbl">Available Now</div><div className="off-count-num">{OFFERS.length}</div></div>
          </div>
          <div className="off-sub">Curated specifically for you based on your preferences</div>
          <div className="ctx-box">
            <div className="ctx-title">ℹ️ Personalization Context</div>
            <div className="ctx-grid">
              <div className="ctx-item"><div className="ctx-item-lbl">Kitchen Status</div><div className="ctx-item-val">No cooking</div></div>
              <div className="ctx-item"><div className="ctx-item-lbl">People Home</div><div className="ctx-item-val">2 detected</div></div>
              <div className="ctx-item"><div className="ctx-item-lbl">Time</div><div className="ctx-item-val">7:15 PM Wed</div></div>
            </div>
            <div className="ctx-note">Ranked by match score based on consent settings, past orders, and current situation.</div>
          </div>
          {OFFERS.map((o, i) => (
            <div key={o.id} className={`off-card${i === 0 ? " top recommended" : ""}`}
              onClick={() => { tracker.click(); logEvent({ session_id: sessionId, flow: FLOW, event_type: "click", element: "select_offer", offer: o.name, task: activeTask?.id || null, client_timestamp: new Date().toISOString() }); onSelect(o); }}>
              <div className="off-card-row">
                <span className="off-emoji">{o.emoji}</span>
                <div className="off-body">
                  <div className="off-name-row">
                    <span className="off-name">{o.name}</span>
                    {i === 0 && <span className="top-badge">✦ Top Match</span>}
                    {i === 0 && <span className="rec-badge">Recommended</span>}
                  </div>
                  <div className="off-desc">{o.desc}</div>
                  <div className="off-tags">{o.tags.map(t => <span key={t} className="off-tag">{t}</span>)}</div>
                  <div className="off-meta">📊 ~{o.cal} cal · Serves {o.serves}</div>
                </div>
                <div className="off-price-col">
                  <div className="match-lbl">Match Score</div>
                  <div className="match-bar"><div className="match-fill" style={{ width: o.match + "%" }}></div></div>
                  <div className="match-pct">{o.match}%</div>
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
    </Wrap>
  );
}

function OrderScreen({ offer, onPlace, onBack, activeTask, onTaskComplete, sessionId, tracker, setOrderConfirmed }) {
  useEffect(() => {
    const t0 = Date.now();
    logEvent({ session_id: sessionId, flow: FLOW, event_type: "page_enter", page: "order_summary", task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
    return () => logEvent({ session_id: sessionId, flow: FLOW, event_type: "page_exit", page: "order_summary", time_on_page_ms: Date.now() - t0, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleBack() {
    if (activeTask?.id === "task5") { tracker.error(); logEvent({ session_id: sessionId, flow: FLOW, event_type: "error", element: "left_order_without_confirming", task: "task5", client_timestamp: new Date().toISOString() }); }
    tracker.click(); onBack();
  }

  return (
    <Wrap>
      <TaskBanner task={activeTask} onComplete={onTaskComplete} />
      <div className="back" onClick={handleBack}>← Back to Offers</div>
      <div className="order-card">
        <div className="order-title">{offer.emoji} Order Summary</div>
        <div className="order-line"><span>Selected Item</span><span style={{ fontWeight: 600 }}>{offer.name}</span></div>
        <div style={{ padding: "4px 20px 8px", fontSize: 12, color: "#6b7280" }}>{offer.desc}</div>
        <div className="order-line"><span>Delivery Type</span><span>Standard (30–45 min)</span></div>
        <div className="order-line"><span>Delivery Fee</span><span>Free</span></div>
        <div className="order-line"><span>Total</span><span style={{ color: "#4263eb" }}>${offer.price.toFixed(2)}</span></div>
      </div>
      <div className="smart-tip">💡 <strong>Smart Tip:</strong> This offer matches your preferences and saves you ${offer.save}.00!</div>
      <button className="btn-confirm" onClick={() => {
        tracker.click(); setOrderConfirmed(true);
        logEvent({ session_id: sessionId, flow: FLOW, event_type: "click", element: "confirm_place_order", offer: offer.name, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
        logEvent({ session_id: sessionId, flow: FLOW, event_type: "order_placed", offer: offer.name, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
        onPlace();
      }}>Confirm &amp; Place Order</button>
    </Wrap>
  );
}

function ConfirmScreen({ onHome, activeTask, onTaskComplete }) {
  return (
    <Wrap>
      <TaskBanner task={activeTask} onComplete={onTaskComplete} />
      <div className="confirm-wrap">
        <div className="confirm-box">
          <div className="confirm-icon">✓</div>
          <div className="confirm-title">Order Placed</div>
          <div className="confirm-sub">Your order has been confirmed</div>
          <button className="btn-confirm" style={{ marginTop: 24 }} onClick={onHome}>Back to Home</button>
        </div>
      </div>
    </Wrap>
  );
}

export default function App() {
  const sessionId = useRef(getOrCreateSessionId()).current;
  const tracker   = useRef(createTracker(sessionId)).current;

  const [screen,         setScreen]         = useState("privacy");
  const [offer,          setOffer]          = useState(null);
  const [activeTask,     setActiveTask]     = useState(null);
  const [completed,      setCompleted]      = useState([]);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [saved,          setSaved]          = useState(false);

  // Assisted: pre-filled
  const [catVal,  setCatVal]  = useState({ ...DEFAULT_CAT });
  const [subVal,  setSubVal]  = useState({});
  const [itemVal, setItemVal] = useState({});
  const [usgVal,  setUsgVal]  = useState({ ...DEFAULT_USG });

  function startTask(task) {
    if (completed.includes(task.id)) return;
    setSaved(false);
    if (task.id === "task2") {
      setCatVal({ homeSensors: "deny", behaviorPatterns: "deny", purchaseHistory: "deny" });
      setSubVal({}); setItemVal({});
    }
    if (task.id === "task3") {
      setUsgVal({ foodServices: "deny", homeServices: "deny", wellnessServices: "deny" });
    }
    tracker.start(task.id);
    setActiveTask(task);
    if (["task1","task2","task3"].includes(task.id)) setScreen("privacy");
    else if (task.id === "task4") setScreen("offers");
    else if (task.id === "task5") setScreen("order");
  }

  function handleTaskComplete() {
    const result = tracker.complete(offer?.name || null, orderConfirmed);
    if (result?.task) setCompleted(prev => [...prev, result.task]);
    setActiveTask(null);
    setOrderConfirmed(false);
    setScreen("privacy");
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <TaskSidebar completed={completed} active={activeTask} onSelect={startTask} />
        {screen === "privacy"  && <PrivacyScreen catVal={catVal} setCatVal={setCatVal} subVal={subVal} setSubVal={setSubVal} itemVal={itemVal} setItemVal={setItemVal} usgVal={usgVal} setUsgVal={setUsgVal} onBack={() => setScreen("privacy")} onDone={() => setScreen("offers")} activeTask={activeTask} onTaskComplete={handleTaskComplete} sessionId={sessionId} tracker={tracker} saved={saved} setSaved={setSaved} />}
        {screen === "offers"   && <OffersScreen  onSelect={o => { setOffer(o); setScreen("order"); }} onBack={() => setScreen("privacy")} activeTask={activeTask} onTaskComplete={handleTaskComplete} sessionId={sessionId} tracker={tracker} />}
        {screen === "order"    && <OrderScreen   offer={offer || OFFERS[0]} onPlace={() => setScreen("confirm")} onBack={() => setScreen("offers")} activeTask={activeTask} onTaskComplete={handleTaskComplete} sessionId={sessionId} tracker={tracker} setOrderConfirmed={setOrderConfirmed} />}
        {screen === "confirm"  && <ConfirmScreen onHome={() => setScreen("privacy")} activeTask={activeTask} onTaskComplete={handleTaskComplete} />}
      </div>
    </>
  );
}
