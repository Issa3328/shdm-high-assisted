import { useState, useEffect, useRef } from "react";

const SUPABASE_URL      = "https://iljzwxwopxuzpgkjivmn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KEoCJtCLyGTJjqB1phGy2Q_v3PftUYH";
const S_SESSION = "shdm_low_manual_session_id";
const FLOW      = "low_manual";

const ACQ_CATS = [
  { id: "sensors",   label: "Home Sensors" },
  { id: "behavior",  label: "Behavior Patterns" },
  { id: "purchases", label: "Purchase History" },
];
const PROC_CATS = [
  { id: "food",     label: "Food Services" },
  { id: "home",     label: "Home Services" },
  { id: "wellness", label: "Wellness Services" },
];
const OFFERS = [
  { id: "1", emoji: "🍕", name: "Pizza Meal",     desc: "2 Large Pizzas, 2 Pops, Large Fries",    price: 24.99, original: 32.99 },
  { id: "2", emoji: "🍔", name: "Burger Combo",   desc: "2 Burgers, 2 Fries, 2 Drinks",           price: 18.99, original: 24.99 },
  { id: "3", emoji: "🥡", name: "Chinese Dinner", desc: "Fried Rice, Noodles, Spring Rolls",       price: 32.99, original: 38.99 },
  { id: "4", emoji: "🍝", name: "Pasta Bowl",     desc: "Pasta, Garlic Bread, Salad",              price: 16.99, original: 21.99 },
];

const TASKS = [
  { id: "task1", label: "Task 1", desc: "Review the suggested settings in the Data Collection and Data Usage tabs and adjust them according to your preferences." },
  { id: "task2", label: "Task 2", desc: "Configure the Data Collection tab by allowing or denying access to home sensors and purchase history." },
  { id: "task3", label: "Task 3", desc: "Configure the Data Usage tab by allowing or denying access to home services and wellness-related services." },
  { id: "task4", label: "Task 4", desc: "Review all three tabs: Food, Home, and Wellness. Explore and select one offer that best matches your preferences." },
  { id: "task5", label: "Task 5", desc: "Review the final order summary and confirm or place the order." },
];

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
    depth(d)   { if (d > s.depth) s.depth = d; },
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
  .task-lbl { font-size: 12px; font-weight: 600; color: #111827; }
  .task-desc { font-size: 11px; color: #6b7280; margin-top: 2px; line-height: 1.4; }
  .content-area { flex: 1; display: flex; justify-content: center; background: #f5f6fa; }
  .main { width: 100%; max-width: 600px; padding: 24px; }
  .task-banner { background: #1e1b4b; color: #e0e7ff; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px; }
  .task-banner-lbl { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; opacity: .6; margin-bottom: 4px; }
  .task-banner-desc { font-size: 13px; line-height: 1.5; }
  .btn-task-done { display: block; width: 100%; margin-top: 10px; padding: 11px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-task-done:hover { background: #4338ca; }
  .page-title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .page-sub { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
  .back { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; color: #6b7280; cursor: pointer; margin-bottom: 16px; }
  .back:hover { color: #4263eb; }
  .tabs { display: flex; border-bottom: 2px solid #e4e6ef; margin-bottom: 16px; }
  .tab { flex: 1; text-align: center; padding: 10px 8px; font-size: 14px; font-weight: 500; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; }
  .tab.active { color: #4263eb; border-bottom-color: #4263eb; }
  .cat-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; background: #fff; border: 1px solid #e4e6ef; border-radius: 10px; margin-bottom: 8px; }
  .cat-label { font-size: 14px; font-weight: 500; }
  .da { display: flex; gap: 6px; }
  .da-btn { padding: 5px 14px; border-radius: 7px; border: 1.5px solid #e4e6ef; background: #fff; font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; color: #6b7280; }
  .da-deny.on  { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
  .da-allow.on { background: #dcfce7; border-color: #86efac; color: #16a34a; }
  .save-row { display: flex; justify-content: flex-end; margin: 8px 0; }
  .btn-save { padding: 9px 22px; background: #4263eb; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .btn-save.saved { background: #16a34a; }
  .btn-done { display: block; width: 100%; padding: 14px; background: #16a34a; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 8px; }
  .off-card { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: #fff; border: 1px solid #e4e6ef; border-radius: 10px; margin-bottom: 8px; cursor: pointer; }
  .off-card:hover { border-color: #4263eb; }
  .off-name { font-size: 14px; font-weight: 500; }
  .off-price { font-size: 15px; font-weight: 700; color: #4263eb; }
  .order-card { background: #fff; border: 1px solid #e4e6ef; border-radius: 12px; overflow: hidden; margin-bottom: 12px; }
  .order-title { font-size: 17px; font-weight: 700; padding: 16px 20px; border-bottom: 1px solid #e4e6ef; }
  .order-line { display: flex; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid #e4e6ef; font-size: 14px; }
  .order-line:last-child { border-bottom: none; font-weight: 700; }
  .btn-confirm { display: block; width: 100%; padding: 14px; background: #4263eb; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; margin-top: 12px; }
  .confirm-wrap { display: flex; align-items: center; justify-content: center; min-height: 50vh; }
  .confirm-box { background: #fff; border: 1px solid #e4e6ef; border-radius: 12px; padding: 40px 32px; text-align: center; max-width: 360px; width: 100%; }
  .confirm-icon { width: 56px; height: 56px; border-radius: 50%; background: #dcfce7; border: 2px solid #86efac; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 26px; color: #16a34a; }
  .confirm-title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .confirm-sub { font-size: 14px; color: #6b7280; }
  .home-card { background: #fff; border: 1px solid #e4e6ef; border-radius: 12px; overflow: hidden; margin-bottom: 12px; }
  .home-card-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; cursor: pointer; font-size: 14px; font-weight: 500; border-top: 1px solid #e4e6ef; }
  .home-card-row:hover { background: #f5f6fa; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
  .stat { background: #fff; border: 1px solid #e4e6ef; border-radius: 10px; padding: 14px 16px; }
  .stat-lbl { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
  .stat-val { font-size: 20px; font-weight: 700; }
`;

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

function Wrap({ children }) {
  return <div className="content-area"><div className="main">{children}</div></div>;
}

function HomeScreen({ onConsent, activeTask, onTaskComplete, sessionId, tracker }) {
  useEffect(() => {
    const t0 = Date.now();
    logEvent({ session_id: sessionId, flow: FLOW, event_type: "page_enter", page: "home", client_timestamp: new Date().toISOString() });
    return () => logEvent({ session_id: sessionId, flow: FLOW, event_type: "page_exit", page: "home", time_on_page_ms: Date.now() - t0, client_timestamp: new Date().toISOString() });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const now = new Date();
  return (
    <Wrap>
      <TaskBanner task={activeTask} onComplete={onTaskComplete} />
      <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#eef1ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>🏠</div>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Welcome Home</div>
        <div style={{ fontSize: 14, color: "#6b7280" }}>{now.toLocaleDateString("en-US", { weekday: "long" })}, {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
      </div>
      <div className="home-card">
        <div style={{ padding: "14px 20px 10px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 3 }}>Your Smart Home</div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Manage your home automation and privacy settings</div>
        </div>
        <div className="home-card-row" onClick={() => { tracker.click(); logEvent({ session_id: sessionId, flow: FLOW, event_type: "click", element: "privacy_settings", page: "home", client_timestamp: new Date().toISOString() }); onConsent(); }}>
          <span>Privacy Settings</span><span style={{ color: "#9ca3af" }}>→</span>
        </div>
      </div>
      <div className="stats">
        <div className="stat"><div className="stat-lbl">Temperature</div><div className="stat-val">22°C</div></div>
        <div className="stat"><div className="stat-lbl">People Home</div><div className="stat-val">2</div></div>
      </div>
    </Wrap>
  );
}

function ConsentScreen({ acq, setAcq, proc, setProc, onBack, onDone, activeTask, onTaskComplete, sessionId, tracker, saved, setSaved }) {
  useEffect(() => {
    const t0 = Date.now();
    logEvent({ session_id: sessionId, flow: FLOW, event_type: "page_enter", page: "privacy_settings", task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
    return () => logEvent({ session_id: sessionId, flow: FLOW, event_type: "page_exit", page: "privacy_settings", time_on_page_ms: Date.now() - t0, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [tab, setTab] = useState(activeTask?.id === "task3" ? "usage" : "collection");

  function toggleAcq(id, val) {
    const prev = acq[id]; const next = prev === val ? null : val;
    if (prev !== null && prev !== next && next !== null) tracker.override(); else tracker.click();
    setAcq(a => ({ ...a, [id]: next })); setSaved(false);
    logEvent({ session_id: sessionId, flow: FLOW, event_type: prev !== null && next !== null ? "override" : "toggle", item: id, value: next, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
  }
  function toggleProc(id, val) {
    const prev = proc[id]; const next = prev === val ? null : val;
    if (prev !== null && prev !== next && next !== null) tracker.override(); else tracker.click();
    setProc(p => ({ ...p, [id]: next })); setSaved(false);
    logEvent({ session_id: sessionId, flow: FLOW, event_type: prev !== null && next !== null ? "override" : "toggle", item: id, value: next, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
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
      <div className="tabs">
        <div className={`tab${tab === "collection" ? " active" : ""}`} onClick={() => switchTab("collection")}>Data Collection</div>
        <div className={`tab${tab === "usage" ? " active" : ""}`} onClick={() => switchTab("usage")}>Data Usage</div>
      </div>
      {tab === "collection" && (
        <>
          {ACQ_CATS.map(cat => (
            <div className="cat-row" key={cat.id}>
              <span className="cat-label">{cat.label}</span>
              <div className="da">
                <button className={`da-btn da-deny${acq[cat.id] === "deny" ? " on" : ""}`} onClick={() => toggleAcq(cat.id, "deny")}>Deny</button>
                <button className={`da-btn da-allow${acq[cat.id] === "allow" ? " on" : ""}`} onClick={() => toggleAcq(cat.id, "allow")}>Allow</button>
              </div>
            </div>
          ))}
          <div className="save-row"><button className={`btn-save${saved ? " saved" : ""}`} onClick={handleSave}>{saved ? "Saved!" : "Save My Choices"}</button></div>
        </>
      )}
      {tab === "usage" && (
        <>
          {PROC_CATS.map(cat => (
            <div className="cat-row" key={cat.id}>
              <span className="cat-label">{cat.label}</span>
              <div className="da">
                <button className={`da-btn da-deny${proc[cat.id] === "deny" ? " on" : ""}`} onClick={() => toggleProc(cat.id, "deny")}>Deny</button>
                <button className={`da-btn da-allow${proc[cat.id] === "allow" ? " on" : ""}`} onClick={() => toggleProc(cat.id, "allow")}>Allow</button>
              </div>
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
      <div className="tabs">
        {["food","home","wellness"].map(t => (
          <div key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => switchTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>
        ))}
      </div>
      {tab === "food" ? (
        <>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Available Offers</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>{OFFERS.length} available</div>
          {OFFERS.map(o => (
            <div key={o.id} className="off-card" onClick={() => { tracker.click(); logEvent({ session_id: sessionId, flow: FLOW, event_type: "click", element: "select_offer", offer: o.name, task: activeTask?.id || null, client_timestamp: new Date().toISOString() }); onSelect(o); }}>
              <span className="off-name">{o.emoji} {o.name}</span>
              <span className="off-price">${o.price.toFixed(2)}</span>
            </div>
          ))}
        </>
      ) : (
        <div style={{ fontSize: 14, color: "#6b7280", padding: "20px 0" }}>No offers available for this category.</div>
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
        <div className="order-title">Order Summary</div>
        <div className="order-line"><span>Item</span><span>{offer.name}</span></div>
        <div className="order-line"><span>Delivery</span><span>Standard</span></div>
        <div className="order-line"><span>Delivery Fee</span><span>Free</span></div>
        <div className="order-line"><span>Total</span><span>${offer.price.toFixed(2)}</span></div>
      </div>
      <button className="btn-confirm" onClick={() => {
        tracker.click(); setOrderConfirmed(true);
        logEvent({ session_id: sessionId, flow: FLOW, event_type: "click", element: "confirm_place_order", offer: offer.name, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
        logEvent({ session_id: sessionId, flow: FLOW, event_type: "order_placed", offer: offer.name, task: activeTask?.id || null, client_timestamp: new Date().toISOString() });
        onPlace();
      }}>Place Order</button>
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

  const [screen,         setScreen]         = useState("consent");
  const [offer,          setOffer]          = useState(null);
  const [activeTask,     setActiveTask]     = useState(null);
  const [completed,      setCompleted]      = useState([]);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [saved,          setSaved]          = useState(false);

  const [acq,  setAcq]  = useState({ sensors: null, behavior: null, purchases: null });
  const [proc, setProc] = useState({ food: null, home: null, wellness: null });

  function startTask(task) {
    if (completed.includes(task.id)) return;
    setSaved(false);
    if (task.id === "task2") setAcq({ sensors: "deny", behavior: "deny", purchases: "deny" });
    if (task.id === "task3") setProc({ food: "deny", home: "deny", wellness: "deny" });
    tracker.start(task.id);
    setActiveTask(task);
    if (["task1","task2","task3"].includes(task.id)) setScreen("consent");
    else if (task.id === "task4") setScreen("offers");
    else if (task.id === "task5") setScreen("order");
  }

  function handleTaskComplete() {
    const result = tracker.complete(offer?.name || null, orderConfirmed);
    if (result?.task) setCompleted(prev => [...prev, result.task]);
    setActiveTask(null);
    setOrderConfirmed(false);
    setScreen("consent");
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <TaskSidebar completed={completed} active={activeTask} onSelect={startTask} />
        {screen === "home"    && <HomeScreen    onConsent={() => setScreen("consent")} activeTask={activeTask} onTaskComplete={handleTaskComplete} sessionId={sessionId} tracker={tracker} />}
        {screen === "consent" && <ConsentScreen acq={acq} setAcq={setAcq} proc={proc} setProc={setProc} onBack={() => setScreen("home")} onDone={() => setScreen("offers")} activeTask={activeTask} onTaskComplete={handleTaskComplete} sessionId={sessionId} tracker={tracker} saved={saved} setSaved={setSaved} />}
        {screen === "offers"  && <OffersScreen  onSelect={o => { setOffer(o); setScreen("order"); }} onBack={() => setScreen("consent")} activeTask={activeTask} onTaskComplete={handleTaskComplete} sessionId={sessionId} tracker={tracker} />}
        {screen === "order"   && <OrderScreen   offer={offer || OFFERS[0]} onPlace={() => setScreen("confirm")} onBack={() => setScreen("offers")} activeTask={activeTask} onTaskComplete={handleTaskComplete} sessionId={sessionId} tracker={tracker} setOrderConfirmed={setOrderConfirmed} />}
        {screen === "confirm" && <ConfirmScreen onHome={() => setScreen("consent")} activeTask={activeTask} onTaskComplete={handleTaskComplete} />}
      </div>
    </>
  );
}