"use client";
import { useState, useEffect, useRef } from "react";

// ─── INLINE SVG ICONS (lucide-react 0.487 paths, like Figma — no dependency) ─
const Svg = ({ className, style, children, ...p }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} {...p}>{children}</svg>
);
const HomeIcon      = (p) => <Svg {...p}><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></Svg>;
const ActivityIcon  = (p) => <Svg {...p}><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></Svg>;
const Thermometer   = (p) => <Svg {...p}><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></Svg>;
const UsersIcon     = (p) => <Svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>;
const ClockIcon     = (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Svg>;
const AlertCircle   = (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></Svg>;
const ShieldIcon    = (p) => <Svg {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></Svg>;
const Sparkles      = (p) => <Svg {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></Svg>;
const TrendingUp    = (p) => <Svg {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Svg>;
const InfoIcon      = (p) => <Svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></Svg>;
const Database      = (p) => <Svg {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></Svg>;
const Cpu           = (p) => <Svg {...p}><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></Svg>;
const ChevronDown   = (p) => <Svg {...p}><path d="m6 9 6 6 6-6"/></Svg>;
const ChevronRight  = (p) => <Svg {...p}><path d="m9 18 6-6-6-6"/></Svg>;
const Loader2       = (p) => <Svg {...p}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></Svg>;
const StarIcon      = (p) => <Svg {...p}><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></Svg>;
const BellIcon      = (p) => <Svg {...p}><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></Svg>;

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SUPABASE_URL      = "https://iljzwxwopxuzpgkjivmn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_KEoCJtCLyGTJjqB1phGy2Q_v3PftUYH";
const FLOW              = "high_assisted";
const MODE_LABEL        = "Info: High · Control: Assisted";
const VISIBILITY        = "high";   // low | medium | high
const AUTOMATION        = "assisted";   // manual | assisted | automated

// ─── TAILWIND (v4, same version + theme as the Figma prototype) ───────────────
if (typeof document !== "undefined" && !document.getElementById("tailwind-cdn")) {
  // Figma theme: radius 0.625rem + base typography (identical to Figma's globals.css)
  const tw = document.createElement("style");
  tw.id = "tailwind-theme";
  tw.setAttribute("type", "text/tailwindcss");
  tw.textContent = `
@theme {
  --radius-sm: calc(0.625rem - 4px);
  --radius-md: calc(0.625rem - 2px);
  --radius-lg: 0.625rem;
  --radius-xl: calc(0.625rem + 4px);
}
@layer base {
  * { border-color: rgba(0, 0, 0, 0.1); outline-color: color-mix(in oklab, oklch(0.708 0 0) 50%, transparent); }
  body { background: #ffffff; color: oklch(0.145 0 0); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
}
/* Base typography — not applied to elements which have an ancestor with a Tailwind text class */
@layer base {
  :where(:not(:has([class*=' text-']), :not(:has([class^='text-'])))) {
    h1 { font-size: var(--text-2xl); font-weight: 500; line-height: 1.5; }
    h2 { font-size: var(--text-xl); font-weight: 500; line-height: 1.5; }
    h3 { font-size: var(--text-lg); font-weight: 500; line-height: 1.5; }
    h4 { font-size: var(--text-base); font-weight: 500; line-height: 1.5; }
    label { font-size: var(--text-base); font-weight: 500; line-height: 1.5; }
    button { font-size: var(--text-base); font-weight: 500; line-height: 1.5; }
    input { font-size: var(--text-base); font-weight: 400; line-height: 1.5; }
  }
}
html { font-size: 16px; }
`;
  document.head.appendChild(tw);
  const s = document.createElement("script");
  s.id = "tailwind-cdn"; s.src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.12";
  document.head.appendChild(s);
}

// ─── CSS (only for the study task sidebar — not part of the Figma design) ─────
if (typeof document !== "undefined" && !document.getElementById("hm-styles")) {
  const st = document.createElement("style");
  st.id = "hm-styles";
  st.textContent = `
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; }
.app { display: flex; min-height: 100vh; }

/* ── Sidebar ── */
.sidebar { width: 220px; flex-shrink: 0; background: #fff; border-right: 1px solid #e4e6ef; padding: 20px 0; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
.sidebar-title { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #6b7280; padding: 0 16px 12px; }
.task-lbl { font-size: 12px; font-weight: 600; color: #111827; }
.task-desc { font-size: 11px; color: #6b7280; margin-top: 2px; line-height: 1.4; }
`;
  document.head.appendChild(st);
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ACQ_CATS = [
  {
    id:"sensors", label:"Home Sensors", sensitivity:"medium", icon:"🏠",
    why:"Enables smart automation and personalized recommendations",
    warning:"Disabling this reduces offer quality. Consider allowing for better personalization.",
    subgroups:[
      { id:"kitchen",  label:"Kitchen Sensors",
        items:["Oven Usage Sensor","Stove Activity Sensor","Refrigerator Monitor"] },
      { id:"climate",  label:"Climate Sensors",
        items:["Thermostat","Humidity Sensor","Air Quality Monitor"] },
      { id:"living",   label:"Living Room Sensors",
        items:["Motion Sensor","Light Level Sensor","TV Usage Monitor"] },
      { id:"security", label:"Security Sensors",
        items:["Door Sensor","Window Sensor","Occupancy Detector"] },
    ],
  },
  {
    id:"behavior", label:"Behavior Patterns", sensitivity:"high", icon:"📊",
    why:"Predicts your needs and automates routines",
    warning:"Disabling this reduces offer quality. Consider allowing for better personalization.",
    subgroups:[
      { id:"routines",  label:"Daily Routines",
        items:["Wake-up Time Pattern","Meal Time Detection","Sleep Schedule Analysis"] },
      { id:"activity",  label:"Activity Patterns",
        items:["Home Presence Detection","Room Usage Patterns","Appliance Usage Frequency"] },
      { id:"timing",    label:"Time-based Analysis",
        items:["Peak Usage Hours","Weekday vs Weekend Patterns","Seasonal Behaviour Tracking"] },
    ],
  },
  {
    id:"purchases", label:"Purchase History", sensitivity:"medium", icon:"🛒",
    why:"Personalizes offers to match your preferences and budget",
    warning:"Disabling this reduces offer quality. Consider allowing for better personalization.",
    subgroups:[
      { id:"food_purch",     label:"Food & Grocery",
        items:["Restaurant Orders","Grocery Categories","Dietary Preferences"] },
      { id:"home_purch",     label:"Home & Services",
        items:["Home Service Bookings","Utility Payments","Subscription Services"] },
      { id:"wellness_purch", label:"Wellness & Fitness",
        items:["Fitness Equipment","Wellness Subscriptions","Health Products"] },
    ],
  },
];

const PROC_CATS = [
  {
    id:"food", label:"Food Services", sensitivity:"low", icon:"🍕",
    purpose:"Intelligent meal recommendations based on cooking patterns",
    benefit:"Saves time with relevant suggestions when you need them",
    uses:"Kitchen sensors · Time patterns · Purchase history",
    warning:"Without this permission, food services offers cannot be personalized for you.",
    subgroups:[
      { id:"delivery",  label:"Food Delivery",
        items:["Meal Recommendations","Optimal Timing Suggestions","Price Optimization","Cuisine Preference Matching"] },
      { id:"grocery",   label:"Grocery Shopping",
        items:["Smart Shopping Lists","Budget Optimization","Stock Level Alerts","Recipe-based Suggestions"] },
      { id:"meal_plan", label:"Meal Planning",
        items:["Weekly Meal Plans","Nutritional Balancing","Leftover Optimization"] },
    ],
  },
  {
    id:"home", label:"Home Services", sensitivity:"low", icon:"🏡",
    purpose:"Automation and maintenance suggestions for your home",
    benefit:"Optimizes comfort and prevents issues automatically",
    uses:"Climate sensors · Usage patterns · Presence detection",
    warning:"Without this permission, home services offers cannot be personalized for you.",
    subgroups:[
      { id:"climate_ctrl", label:"Climate Control",
        items:["Temperature Optimization","Energy Usage Reports","Automated Scheduling"] },
      { id:"lighting",     label:"Smart Lighting",
        items:["Presence-based Lighting","Schedule Automation","Energy Saving Profiles"] },
      { id:"maintenance",  label:"Home Maintenance",
        items:["Preventive Maintenance Alerts","Service Booking Suggestions","Appliance Health Monitoring"] },
    ],
  },
  {
    id:"wellness", label:"Wellness Services", sensitivity:"medium", icon:"💪",
    purpose:"Health and fitness support based on your activity",
    benefit:"Achieve wellness goals with personalized guidance",
    uses:"Activity patterns · Behavior data",
    warning:"Without this permission, wellness offers cannot be personalized for you.",
    subgroups:[
      { id:"fitness",     label:"Fitness & Training",
        items:["Personalized Workout Plans","Activity Goal Tracking","Exercise Timing Optimization"] },
      { id:"mindfulness", label:"Mindfulness & Recovery",
        items:["Stress Level Indicators","Sleep Quality Analysis","Relaxation Session Timing"] },
      { id:"nutrition",   label:"Nutrition Support",
        items:["Caloric Intake Monitoring","Hydration Reminders","Supplement Recommendations"] },
    ],
  },
];

// ASSISTED: system pre-selects recommended settings — user reviews & can change
const DEFAULT_ACQ  = { sensors:true, behavior:true, purchases:false };
const DEFAULT_PROC = { food:true, home:true, wellness:false };
// Categories marked "Recommended" by the system (same as Figma)
const RECOMMENDED  = { sensors:true, behavior:true, food:true, home:true };

const ALL_OFFERS = [
  { id:"1", nutritionInfo:"~1800 cal", name:"Pizza Meal",       desc:"2 Large Pizzas (Margherita & Pepperoni), 2 Pops, Large Fries",        price:"$24.99", orig:"$32.99", icon:"🍕", matchScore:95, cat:"Food",     tags:["Perfect for 2 people","Popular at dinner time","Matches past orders"],         topMatch:true,
    dataUsed:["Kitchen: no activity detected at 7:15 PM","Occupancy: 2 people at home","Purchase history: previous pizza orders"],
    whyRecommended:"Your kitchen sensors show no cooking activity at typical dinner time (7:15 PM) with 2 people at home — ideal for delivery. Your past orders show a preference for pizza." },
  { id:"2", nutritionInfo:"~1400 cal", name:"Burger Combo",     desc:"2 Gourmet Burgers, 2 Seasoned Fries, 2 Soft Drinks",                  price:"$18.99", orig:"$24.99", icon:"🍔", matchScore:92, cat:"Food",     tags:["Quick delivery","Budget-friendly","High ratings"],                          topMatch:false,
    dataUsed:["Kitchen activity: none since 3 PM","Home occupancy: 2 people","Meal time pattern: 7–8 PM window"],
    whyRecommended:"Quick delivery option matching your dinner window. Budget-friendly choice based on your spending patterns and highly rated in your delivery area." },
  { id:"3", nutritionInfo:"~2000 cal", name:"Chinese Dinner",   desc:"Fried Rice (Large), Chow Mein, 6 Spring Rolls, 2 Entrees",            price:"$32.99", orig:"$38.99", icon:"🥡", matchScore:88, cat:"Food",     tags:["Variety for sharing","Matches dietary preferences","Free fortune cookies"],  topMatch:false,
    dataUsed:["Occupancy: 2 people at home","Dietary preferences from purchase history","Order history: variety meals"],
    whyRecommended:"Sharing-style meal suited for 2 people detected at home. Based on your past orders, you enjoy variety meals and Chinese cuisine on weekdays." },
  { id:"4", nutritionInfo:"~1200 cal", name:"Pasta Bowl",       desc:"Large Pasta Bowl (Alfredo or Marinara), Garlic Bread, Caesar Salad",  price:"$16.99", orig:"$21.99", icon:"🍝", matchScore:85, cat:"Food",     tags:["Comfort food","Vegetarian option","Quick prep time"],                       topMatch:false,
    dataUsed:["Kitchen: no activity detected","Time pattern: weekday dinner slot","Dietary flags: vegetarian option preferred"],
    whyRecommended:"Comfort food option for a weekday dinner. Vegetarian-friendly choice matching your dietary flags and within your typical per-meal budget range." },
  { id:"5", name:"Climate Control",  desc:"Smart temperature optimization for your home",                         price:"$12.99", orig:"$19.99", icon:"🌡️", matchScore:90, cat:"Home",    tags:["Energy efficient","24/7 monitoring","Auto-adjust"],                         topMatch:true,
    dataUsed:["Thermostat readings: 22°C current","Occupancy patterns: 2 people detected","Energy usage history: evening peak"],
    whyRecommended:"Your home is currently at 22°C with 2 occupants. Smart climate optimization could reduce evening energy usage by up to 15% based on your usage patterns." },
  { id:"6", name:"Smart Lighting",   desc:"Automated presence-based lighting control",                            price:"$9.99",  orig:"$15.99", icon:"💡", matchScore:85, cat:"Home",    tags:["Presence-aware","Schedule-based","Energy saving"],                          topMatch:false,
    dataUsed:["Motion sensor data: activity in living room","Presence detection: 2 people","Light level sensor readings"],
    whyRecommended:"Motion sensors detect regular living room activity in the evening. Automated presence-based lighting can save energy and improve comfort automatically." },
  { id:"7", name:"Fitness Class",    desc:"Virtual personal training session, 60 min",                            price:"$15.99", orig:"$24.99", icon:"💪", matchScore:88, cat:"Wellness", tags:["Personalized workout","Flexible timing","Expert guidance"],                  topMatch:false,
    dataUsed:["Activity patterns: low physical activity detected today","Time availability: evening window open","Wellness history: fitness goals set"],
    whyRecommended:"Your activity sensors show low physical movement today. A virtual fitness session fits your available evening time slot and aligns with your stated wellness goals." },
  { id:"8", name:"Yoga Session",     desc:"Guided meditation and stretching, 60 min",                             price:"$19.99", orig:"$29.99", icon:"🧘", matchScore:94, cat:"Wellness", tags:["Stress relief","Beginner-friendly","Daily practice"],                        topMatch:true,
    dataUsed:["Daily routine: evening activity window detected","Behavior pattern: relaxation time 8–9 PM","Wellness history: mindfulness preference"],
    whyRecommended:"Your behavioral patterns show a consistent 8–9 PM relaxation window. Yoga and meditation closely match your recorded wellness preferences and stress-relief goals." },
  { id:"9", name:"Resistance Bands", desc:"Set of 5 resistance levels with door anchor",                          price:"$29.99", orig:"$44.99", icon:"🏋️", matchScore:82, cat:"Wellness", tags:["Home workout","All fitness levels","Compact storage"],                      topMatch:false,
    dataUsed:["Home presence: you spend most workouts at home","Purchase history: home fitness equipment","Space availability: living room detected large"],
    whyRecommended:"You tend to exercise at home based on presence data. Resistance bands are compact, versatile, and match your home fitness equipment purchase history." },
];

const TASKS = [
  { id:1, label:"Task 1", short:"Configure Data Collection",
    desc:"Go to Privacy Settings, Data Collection tab. Review and customize the types of data this system is allowed to collect about you. Adjust the settings to match your preferences and click to apply your changes." },
  { id:2, label:"Task 2", short:"Configure Data Use",
    desc:"Go to Data Usage tab. Review and configure how your data may be used. Adjust the settings to match your preferences and click to apply your changes." },
  { id:3, label:"Task 3", short:"Select an Offer",
    desc:"Browse the available offers across three categories: Food, Home, and Wellness. Select the one offer that best matches your preferences." },
  { id:4, label:"Task 4", short:"Place Your Order",
    desc:"Review the order summary based on the offer you selected. When you are ready, confirm your order to place it." },
];

// ═══ STUDY TRACKING ═══ identical in all 9 conditions (only VISIBILITY / AUTOMATION differ) ═══
// Tables (create once with study_supabase_setup.sql):
//   study_events          → one row per interaction
//   study_task_summaries  → exactly one row per task (1–4) per visit
// IDs:
//   participant_id → the SurveyMonkey ID from the URL (?session=…); use it to match survey + website data
//   session_id     → random ID of this visit (new tab = new visit)
// Counting rules (same everywhere):
//   clicks    → every click on a control (buttons, tabs, toggles, expand arrows, back links)
//   overrides → a click that contradicts a system choice (never in Manual):
//               • setting a privacy category to the opposite of the system's pre-selection
//               • choosing an offer that is not the system's highlighted/selected offer of its tab
//   errors    → backward navigation (Back / Return to Home) and clicks on disabled controls
// Every click belongs to the current (lowest unfinished) task. Task n+1 starts when task n finishes.
const EVENTS_TABLE = "study_events";
const TASKS_TABLE  = "study_task_summaries";

function sbInsert(table, row) {
  try {
    fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      keepalive: true, // still delivered when the page redirects to SurveyMonkey
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    })
      .then(r => { if (!r.ok) console.warn(`[study] insert into ${table} failed (${r.status})`); })
      .catch(() => {});
  } catch {}
}

function makeId(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  try {
    const bytes = crypto.getRandomValues(new Uint8Array(len));
    return Array.from(bytes, b => chars[b % chars.length]).join("");
  } catch {
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }
}

// SurveyMonkey ID from ?session=… (also accepts ?pid=…); kept for this tab so a reload cannot lose it
function resolveParticipant() {
  const KEY = "shdm_participant_id";
  const clean = v => (v || "").trim().replace(/^\[|\]$/g, "");
  let id = "", source = "url";
  try { const p = new URLSearchParams(window.location.search); id = clean(p.get("session") || p.get("pid")); } catch {}
  if (!id) { source = "storage"; try { id = clean(sessionStorage.getItem(KEY)); } catch {} }
  if (!id) { source = "missing"; id = "unknown"; }
  else { try { sessionStorage.setItem(KEY, id); } catch {} }
  return { id, source };
}

function resolveVisit() {
  const KEY = `shdm_visit_${FLOW}`;
  try {
    let v = sessionStorage.getItem(KEY);
    if (!v) { v = makeId(12); sessionStorage.setItem(KEY, v); }
    return v;
  } catch { return makeId(12); }
}

function createStudyTracker() {
  const participant = resolveParticipant();
  const sessionId   = resolveVisit();
  const tasks = {};
  [1, 2, 3, 4].forEach(n => { tasks[n] = { start: null, clicks: 0, overrides: 0, errors: 0, done: false }; });
  let current = 1;
  tasks[1].start = Date.now();

  const base = () => ({
    participant_id: participant.id, session_id: sessionId, flow: FLOW,
    visibility: VISIBILITY, automation: AUTOMATION, client_timestamp: new Date().toISOString(),
  });

  const t = {
    participantId: participant.id,
    participantSource: participant.source,
    sessionId,
    get current() { return current; },          // 1–4, or 5 when all tasks are done
    isDone: n => !!tasks[n] && tasks[n].done,

    // log without counting (page views, system events)
    event(event, f = {}) {
      sbInsert(EVENTS_TABLE, {
        ...base(), task: current <= 4 ? current : null, event,
        page: f.page ?? null, target: f.target ?? null, value: f.value ?? null,
        is_override: !!f.override, is_error: !!f.error, details: f.details ?? null,
      });
    },

    // every user click on a control goes through here → counted for the current task + logged
    action(event, f = {}) {
      if (current <= 4) {
        const k = tasks[current];
        k.clicks++;
        if (f.override) k.overrides++;
        if (f.error) k.errors++;
      }
      t.event(event, f);
    },

    // finish task n (and any earlier unfinished task); returns finished task indices (0-based, for the sidebar)
    complete(n, via, extra = {}) {
      const finished = [];
      while (current <= n && current <= 4) {
        const k = tasks[current];
        sbInsert(TASKS_TABLE, {
          ...base(), task: current,
          completed_via: current === n ? via : "auto_" + via,
          time_ms: Date.now() - k.start,
          clicks: k.clicks, overrides: k.overrides, errors: k.errors,
          offer_selected: current === n ? (extra.offer ?? null) : null,
          order_placed: current === n ? !!extra.orderPlaced : false,
        });
        k.done = true;
        finished.push(current - 1);
        current++;
        if (current <= 4) tasks[current].start = Date.now();
      }
      return finished;
    },
  };
  return t;
}

// override rules (shared)
// consent: override = changing a category to the opposite of the system's pre-selection (Assisted/Automated only)
function isConsentOverride(group, id, newValue, currentValue) {
  if (AUTOMATION === "manual" || newValue === currentValue) return false;
  const systemDefault = !!(group === "acquisition" ? DEFAULT_ACQ : DEFAULT_PROC)[id];
  return newValue !== systemDefault;
}
// offer: override = choosing an offer that is not the system's highlighted/selected offer of its tab (Assisted/Automated only)
function isOfferOverride(offer, offersOfTab) {
  if (AUTOMATION === "manual") return false;
  return offer.matchScore < Math.max(...offersOfTab.map(o => o.matchScore));
}
// ═══ END STUDY TRACKING ═══

// ─── ORDER HELPERS (display texts — identical to Figma) ───────────────────────
function getOrderDetails(offer) {
  if (!offer) return {};
  if (offer.cat === "Food") return {
    deliveryLabel:"Delivery Type", deliveryValue:"Standard delivery",
    timeLabel:"30-45 minutes", timeSub:"Free delivery",
    d1Label:"Nutrition", d1Value:offer.nutritionInfo || "N/A",
    d2Label:"Serves", d2Value:"2 people",
    ctxMsg:"Based on your preferences and timing, this offer saves you",
    ctxNote:"Smart Home System detected this is the optimal time for food delivery.",
  };
  if (offer.cat === "Home") return {
    deliveryLabel:"Service Type", deliveryValue:"One-time setup",
    timeLabel:"Same day", timeSub:"Installation included",
    d1Label:"Duration", d1Value:"2-3 hours",
    d2Label:"Warranty", d2Value:"1 year",
    ctxMsg:"Based on your home preferences, this offer saves you",
    ctxNote:"Smart Home System detected enhanced home automation would benefit you now.",
  };
  return {
    deliveryLabel:"Session Type", deliveryValue:"Virtual session",
    timeLabel:"Flexible", timeSub:"Schedule anytime",
    d1Label:"Duration", d1Value:"60 minutes",
    d2Label:"Level", d2Value:"Beginner-friendly",
    ctxMsg:"Based on your wellness goals, this offer saves you",
    ctxNote:"Smart Home System detected this is a perfect time for a wellness session.",
  };
}

const sensitivityColor = (level) => {
  if (level === "high")   return "bg-red-100 text-red-700 border-red-200";
  if (level === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-green-100 text-green-700 border-green-200";
};

// ─── TASK SIDEBAR ─────────────────────────────────────────────────────────────
function TaskSidebar({ doneTasks, currentTask }) {
  return (
    <div className="sidebar">
      <div className="sidebar-title">Your Tasks</div>
      {TASKS.map((t, i) => {
        const isDone   = doneTasks.includes(i);
        const isActive = i === currentTask;
        const isLocked = !isDone && !isActive;
        return (
          <div key={t.id} style={{
            display:"flex", alignItems:"flex-start", gap:10, padding:"10px 16px",
            borderLeft:`3px solid ${isActive?"#4263eb":"transparent"}`,
            background: isActive?"#eef1ff":"transparent",
            opacity: isLocked ? 0.35 : isDone ? 0.5 : 1,
          }}>
            <div style={{
              width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:2,
              border:`2px solid ${isDone?"#16a34a":isActive?"#4263eb":"#d1d5db"}`,
              background: isDone?"#16a34a":"transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:10, color:"#fff",
            }}>{isDone?"✓":""}</div>
            <div>
              <div className="task-lbl">{t.label}</div>
              <div className="task-desc">{t.short}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── TASK BAR (dark indigo strip above content) ───────────────────────────────
function TaskBar({ sidebarVisible, currentTask }) {
  if (!sidebarVisible || currentTask >= TASKS.length) return null;
  const t = TASKS[currentTask];
  return (
    <div style={{background:"#1e1b4b", color:"#e0e7ff", padding:"12px 20px", fontSize:13, lineHeight:1.5}}>
      <span style={{fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:".06em", opacity:.6, marginRight:8}}>{t.label}:</span>
      {t.desc}
    </div>
  );
}


// ─── MODE BADGE ───────────────────────────────────────────────────────────────
function ModeBadge() {
  return (
    <div className="fixed top-3 right-3 z-50">
      <span className="text-xs px-2.5 py-1 rounded-full border font-medium shadow-sm bg-indigo-50 text-indigo-700 border-indigo-200">
        {MODE_LABEL}
      </span>
    </div>
  );
}

// ─── CONSENT CATEGORY BLOCK ───────────────────────────────────────────────────
// parentEnabled: whether the top-level toggle is Allow (true) or Deny (false)
// For subcategory interactivity: only enabled when parentEnabled === true
function ConsentCatBlock({ cat, enabled, onToggle, onAction, isProc }) {
  const [expanded,    setExpanded]    = useState(false);
  const [expandedSub, setExpandedSub] = useState({});
  // Per-subgroup state (local, for visual feedback) — only matters when parent is enabled
  const [sgState, setSgState] = useState(() => {
    const init = {};
    (cat.subgroups || []).forEach(sg => {
      init[sg.id] = false; // start denied
      sg.items.forEach(item => { init[`${sg.id}__${item}`] = false; });
    });
    return init;
  });

  function toggleSg(sgId, val) {
    const target = `${cat.id}.${sgId}`;
    if (!enabled) { onAction("disabled_click", { page:"consent", target, error:true }); return; }
    onAction("sub_consent_change", { page:"consent", target, value: val ? "allow" : "deny" });
    setSgState(p => ({...p, [sgId]: val}));
  }
  function toggleItem(key, val) {
    const target = `${cat.id}.${key.replace("__", ".")}`;
    if (!enabled) { onAction("disabled_click", { page:"consent", target, error:true }); return; }
    onAction("sub_consent_change", { page:"consent", target, value: val ? "allow" : "deny" });
    setSgState(p => ({...p, [key]: val}));
  }
  function toggleExpand() {
    onAction("expand", { page:"consent", target:cat.id, value: expanded ? "close" : "open" });
    setExpanded(e => !e);
  }
  function toggleSubExpand(sgId) {
    const target = `${cat.id}.${sgId}`;
    if (!enabled) { onAction("disabled_click", { page:"consent", target, error:true }); return; }
    onAction("expand", { page:"consent", target, value: expandedSub[sgId] ? "close" : "open" });
    setExpandedSub(p => ({...p, [sgId]: !p[sgId]}));
  }

  const chevronColor = isProc ? "text-purple-600" : "text-blue-600";
  const isRec        = !!RECOMMENDED[cat.id];
  const subDenied    = !enabled;

  return (
    <div className="border-2 border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50">
      <div className="p-4">
        {/* Main header row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3 flex-1">
            <button onClick={toggleExpand} className="p-1 hover:bg-gray-100 rounded mt-1" aria-label="Expand">
              {expanded ? <ChevronDown className={`w-4 h-4 ${chevronColor}`}/> : <ChevronRight className={`w-4 h-4 ${chevronColor}`}/>}
            </button>
            <div className={`w-9 h-9 ${isProc ? "bg-purple-100" : "bg-blue-100"} rounded-lg flex items-center justify-center text-lg flex-shrink-0`}>{cat.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{cat.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${sensitivityColor(cat.sensitivity)}`}>
                  {cat.sensitivity} sensitivity
                </span>
                {isRec && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <StarIcon className="w-3 h-3"/> Recommended
                  </span>
                )}
              </div>
              {!isProc ? (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-xs text-blue-900"><strong>Why:</strong> {cat.why}</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-600 mb-1"><strong>Purpose:</strong> {cat.purpose}</p>
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
                    ✓ {cat.benefit}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Uses: {cat.uses}</p>
                </>
              )}
            </div>
          </div>
          <div className="ml-4 flex flex-col gap-1 items-end">
            {isRec && <span className="text-xs text-blue-600 font-medium flex items-center gap-1"><StarIcon className="w-3 h-3"/> Rec.</span>}
            <div className="flex gap-1">
              <button onClick={() => onToggle(false)} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${!enabled ? "bg-gray-400 text-white" : "bg-gray-100 text-gray-600 border border-gray-300"}`}>Deny</button>
              <button onClick={() => onToggle(true)}  className={`px-3 py-1.5 text-xs rounded-lg font-medium ${enabled  ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 border border-gray-300"}`}>Allow</button>
            </div>
          </div>
        </div>

        {/* Subgroups — only shown when expanded */}
        {expanded && cat.subgroups?.length > 0 && (
          <div className={`mt-3 pl-8 space-y-2 pt-3 border-t-2 ${isProc ? "border-purple-200" : "border-blue-200"}`}>
            {cat.subgroups.map(sg => {
              const sgAllowed  = !!sgState[sg.id];
              const sgExpanded = !!expandedSub[sg.id];
              return (
                <div key={sg.id} className={`border border-gray-300 rounded-lg bg-white p-3 ${subDenied ? "opacity-40" : ""}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleSubExpand(sg.id)} aria-disabled={subDenied} className="p-0.5 hover:bg-gray-100 rounded">
                        {sgExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-500"/> : <ChevronRight className="w-3.5 h-3.5 text-gray-500"/>}
                      </button>
                      <span className="text-sm font-medium">{sg.label}</span>
                    </div>
                    <div className="flex gap-1">
                      <button aria-disabled={subDenied} onClick={() => toggleSg(sg.id, false)} className={`px-2 py-0.5 text-xs rounded ${subDenied ? "bg-gray-50 text-gray-300 cursor-not-allowed" : !sgAllowed ? "bg-red-100 text-red-700 border border-red-300" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>Deny</button>
                      <button aria-disabled={subDenied} onClick={() => toggleSg(sg.id, true)}  className={`px-2 py-0.5 text-xs rounded ${subDenied ? "bg-gray-50 text-gray-300 cursor-not-allowed" : sgAllowed  ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-50 text-gray-500 border border-gray-200"}`}>Allow</button>
                    </div>
                  </div>
                  {sgExpanded && sg.items.map(item => {
                    const itemKey     = `${sg.id}__${item}`;
                    const itemAllowed = !!sgState[itemKey];
                    return (
                      <div key={item} className="flex items-center justify-between text-xs py-1 pl-6">
                        <span className="text-gray-700">{item}</span>
                        <div className="flex gap-1">
                          <button aria-disabled={subDenied} onClick={() => toggleItem(itemKey, false)} title="Deny"
                            className={`px-2 py-0.5 rounded ${subDenied ? "bg-gray-50 text-gray-300 cursor-not-allowed" : !itemAllowed ? "bg-red-50 text-red-600 border border-red-200" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>✕</button>
                          <button aria-disabled={subDenied} onClick={() => toggleItem(itemKey, true)} title="Allow"
                            className={`px-2 py-0.5 rounded ${subDenied ? "bg-gray-50 text-gray-300 cursor-not-allowed" : itemAllowed ? "bg-green-50 text-green-600 border border-green-200" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>✓</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({ onConsent, tracker }) {
  const sensorWidget = (label, value, icon, sub) => (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="mb-2 text-gray-400">{icon}</div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="flex-1 p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-2xl mx-auto pt-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 shadow-lg rounded-full mb-4">
            <HomeIcon className="w-9 h-9 text-blue-700"/>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Home System</h1>
          <p className="text-gray-600 text-sm">Wednesday, 7:15 PM</p>
        </div>

        {/* Live sensor dashboard */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-5 shadow-lg">
          <p className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-blue-600"/> Live Sensor Dashboard
          </p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {sensorWidget("Temperature",      "22°C",       <Thermometer className="w-5 h-5"/>, "Comfortable range")}
            {sensorWidget("People Home",      "2 detected", <UsersIcon className="w-5 h-5"/>,   "Motion active")}
            {sensorWidget("Kitchen Activity", "No cooking", <span className="text-lg">🍳</span>, "Since 3:00 PM")}
            {sensorWidget("Current Time",     "7:15 PM",    <ClockIcon className="w-5 h-5"/>,   "Dinner window")}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-amber-800">
              <strong>System Insight:</strong> No kitchen activity detected at typical dinner time (7:15 PM) with 2 people present — food delivery options may be useful.
            </p>
          </div>
        </div>

        {/* Main card with action */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg mb-5">
          <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <BellIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="font-bold text-blue-900 text-sm mb-1">💡 Personalized Offers Available</p>
                <p className="text-xs text-blue-800">
                  System detected no cooking at dinner time with 2 people home — food delivery offers have been personalized for you. Recommended privacy settings have been pre-selected.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => { tracker.action("nav", { page:"home", target:"privacy_settings" }); onConsent(); }}
            className="w-full flex items-center justify-between px-5 py-3 rounded-lg transition-all bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg font-medium"
          >
            <div className="flex items-center gap-2">
              <ShieldIcon className="w-5 h-5"/>
              <span>Review Privacy Settings &amp; Get Offers →</span>
            </div>
          </button>
        </div>

        {/* How it works */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-3">How Your Smart Home Learns</p>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            {[
              { icon:"🔍", label:"Collect", desc:"Sensors gather home data" },
              { icon:"⚙️", label:"Process", desc:"System analyzes patterns" },
              { icon:"🎯", label:"Suggest", desc:"Personalized offers sent" },
            ].map(step => (
              <div key={step.label} className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl mb-1">{step.icon}</div>
                <p className="font-medium text-gray-800">{step.label}</p>
                <p className="text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CONSENT SCREEN ───────────────────────────────────────────────────────────
function ConsentScreen({ acq, setAcq, proc, setProc, onDone, currentTask, tracker, saved, setSaved, syncTasks }) {
  const [tab, setTab] = useState(currentTask === 1 ? "processing" : "acquisition");

  function handleTabChange(t) {
    tracker.action("tab_switch", { page:"consent", target:t });
    if (t === "processing" && !tracker.isDone(1)) syncTasks(tracker.complete(1, "tab_switch"));
    setTab(t);
    setSaved(false);
  }

  function handleSave() {
    tracker.action("consent_apply", { page:"consent", target:tab });
    setSaved(true);
    const n = tab === "acquisition" ? 1 : 2;
    if (!tracker.isDone(n)) syncTasks(tracker.complete(n, "apply"));
  }

  // leaving the privacy settings completes Task 1 + 2 (if not done yet)
  function handleDone() {
    tracker.action("consent_done", { page:"consent", details:{ acquisition:acq, processing:proc } });
    if (!tracker.isDone(2)) syncTasks(tracker.complete(2, "continue"));
    onDone();
  }

  function changeConsent(group, id, val) {
    const current = !!(group === "acquisition" ? acq : proc)[id];
    tracker.action("consent_change", { page:"consent", target:id, value: val ? "allow" : "deny",
      override: isConsentOverride(group, id, val, current), details:{ tab:group } });
    (group === "acquisition" ? setAcq : setProc)(p => ({ ...p, [id]: val }));
    setSaved(false);
  }

  const saveButton = (
    <button
      onClick={handleSave}
      className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${saved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
    >
      {saved ? "✓ Saved!" : tab === "acquisition" ? "Apply Data Collection Settings" : "Apply Data Usage Settings"}
    </button>
  );

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 p-4 pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <ShieldIcon className="w-6 h-6 text-blue-600"/>
            <h1 className="text-2xl font-bold text-gray-900">Privacy Settings</h1>
          </div>
          <p className="text-sm text-gray-600 mb-3">Full transparency with granular control over your data</p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <StarIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="text-sm font-medium text-blue-900">Recommended settings applied</p>
                <p className="text-xs text-blue-700 mt-0.5">Based on your usage patterns, we suggest enabling sensor data and food service personalization. You can customize each setting individually below.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 flex">
            {["acquisition","processing"].map(t => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${tab === t ? "bg-white border-b-2 border-blue-600 text-blue-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
              >
                <div className="flex items-center justify-center gap-2">
                  {t === "acquisition" ? <Database className="w-4 h-4"/> : <Cpu className="w-4 h-4"/>}
                  <div>
                    <div className="text-sm">{t === "acquisition" ? "Data Collection" : "Data Usage"}</div>
                    <div className="text-xs opacity-75">{t === "acquisition" ? "What we gather" : "How we use it"}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-6 max-h-[600px] overflow-y-auto">
            {tab === "acquisition" && (
              <>
                <div className="space-y-4 mb-4">
                  {ACQ_CATS.map(cat => (
                    <ConsentCatBlock
                      key={cat.id}
                      cat={cat}
                      enabled={!!acq[cat.id]}
                      onToggle={val => changeConsent("acquisition", cat.id, val)}
                      onAction={tracker.action}
                      isProc={false}
                    />
                  ))}
                </div>
                {saveButton}
              </>
            )}

            {tab === "processing" && (
              <>
                <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
                    <p className="text-sm text-blue-800">
                      Data usage permissions control which services can generate personalized offers. Only enable services you want recommendations for — each uses the corresponding collected data above.
                    </p>
                  </div>
                </div>
                <div className="space-y-4 mb-4">
                  {PROC_CATS.map(cat => (
                    <ConsentCatBlock
                      key={cat.id}
                      cat={cat}
                      enabled={!!proc[cat.id]}
                      onToggle={val => changeConsent("processing", cat.id, val)}
                      onAction={tracker.action}
                      isProc={true}
                    />
                  ))}
                </div>
                {saveButton}
              </>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleDone}
            className="w-full py-3 rounded-lg font-medium transition-all bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            Save &amp; View My Offers →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── OFFERS SCREEN ────────────────────────────────────────────────────────────
function OffersScreen({ onSelect, onBack, tracker }) {
  const [tab, setTab] = useState("Food");

  const catOffers = ALL_OFFERS.filter(o => o.cat === tab);
  const topScore  = Math.max(...catOffers.map(o => o.matchScore));

  return (
    <div className="flex-1 p-4 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto pt-8">
        <button onClick={() => { tracker.action("nav", { page:"offers", target:"back_home", error:true }); onBack(); }} className="mb-5 text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1">
          ← Back to Home
        </button>

        {/* System recommendation */}
        <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <StarIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-medium text-blue-900">System Recommendation</p>
              <p className="text-xs text-blue-800 mt-0.5">Based on kitchen sensors (no cooking) and 2 people at home at dinner time, Food offers are highlighted. The top match is marked with a star.</p>
            </div>
          </div>
        </div>

        {/* Personalization context */}
        <div className="mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <InfoIcon className="w-6 h-6 text-blue-600"/>
            </div>
            <div>
              <p className="font-bold text-blue-900 mb-2">Personalization Context</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {[["Kitchen","No cooking"],["People","2 detected"],["Time","7:15 PM"]].map(([label,val]) => (
                  <div key={label} className="bg-white rounded-lg p-2">
                    <p className="text-xs text-blue-600">{label}</p>
                    <p className="font-medium">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200 flex">
            {["Food","Home","Wellness"].map(t => (
              <button key={t}
                onClick={() => { tracker.action("tab_switch", { page:"offers", target:t }); setTab(t); }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${tab === t ? "bg-white border-b-2 border-blue-600 text-blue-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                {t}{t === "Food" && <span className="ml-1 text-xs text-blue-400">✦</span>}
              </button>
            ))}
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600"/> Personalized Offers
                </h2>
                <p className="text-sm text-gray-600 mt-1">Curated for you based on your preferences</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Available</div>
                <div className="text-2xl font-bold text-blue-600">{catOffers.length}</div>
              </div>
            </div>

            <div className="space-y-4">
              {catOffers.map(offer => {
                const isTop = offer.matchScore === topScore;
                const orig  = parseFloat((offer.orig||"$0").replace("$",""));
                const curr  = parseFloat((offer.price||"$0").replace("$",""));
                const save  = (orig - curr).toFixed(2);
                return (
                  <button key={offer.id}
                    onClick={() => onSelect(offer)}
                    className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left group bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-start gap-5">
                      <span className="text-4xl">{offer.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="font-bold text-lg group-hover:text-blue-700 transition-colors">{offer.name}</h3>
                              {isTop && (
                                <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full font-medium">
                                  ⭐ Top Match
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{offer.desc}</p>
                            <div className="flex flex-wrap gap-1.5 mb-1">
                              {offer.tags.map(tag => (
                                <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{tag}</span>
                              ))}
                            </div>
                            {offer.nutritionInfo && <p className="text-xs text-gray-500">📊 {offer.nutritionInfo} · Serves 2</p>}
                          </div>
                          <div className="text-right ml-5 flex-shrink-0">
                            <div className="mb-2">
                              <div className="text-xs text-gray-500 mb-1">Match Score</div>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{width:`${offer.matchScore}%`}}/>
                                </div>
                                <span className="text-sm font-bold text-green-600">{offer.matchScore}%</span>
                              </div>
                            </div>
                            {offer.orig && <div className="text-xs text-gray-400 line-through mb-0.5">{offer.orig}</div>}
                            <div className="text-2xl font-bold text-blue-600">{offer.price}</div>
                            {offer.orig && (
                              <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1 inline-block font-medium">
                                Save ${save}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ORDER SCREEN ─────────────────────────────────────────────────────────────
function OrderScreen({ offer, onPlace, onBack, tracker }) {
  const meta = getOrderDetails(offer);
  const orig = parseFloat((offer.orig||"$0").replace("$",""));
  const curr = parseFloat((offer.price||"$0").replace("$",""));
  const disc = (orig - curr).toFixed(2);

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <button onClick={() => { tracker.action("nav", { page:"order", target:"back_offers", error:true }); onBack(); }} className="mb-5 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:text-blue-600 shadow-sm">
          ← Back to All Offers
        </button>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-5 pb-5 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-4xl">{offer.icon}</span> Order Confirmation
            </h2>
            <div className="text-right">
              <div className="text-xs text-gray-500">Match Score</div>
              <div className="text-2xl font-bold text-green-600">{offer.matchScore}%</div>
            </div>
          </div>

          <div className="mb-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <StarIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
              <div>
                <p className="font-bold text-blue-900 text-sm mb-1">Smart Recommendations Applied</p>
                <p className="text-xs text-blue-800">Standard delivery pre-selected for best value. Optimal timing based on your location. All details can be reviewed below.</p>
              </div>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl mb-4">
            <p className="text-xs text-blue-700 font-medium mb-1">SELECTED {offer.cat.toUpperCase()} SERVICE</p>
            <p className="text-lg font-bold text-blue-900">{offer.name}</p>
            <p className="text-sm text-blue-800 mt-1">{offer.desc}</p>
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-blue-300">
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500">{meta.d1Label}</p>
                <p className="text-sm font-medium">{meta.d1Value}</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500">{meta.d2Label}</p>
                <p className="text-sm font-medium">{meta.d2Value}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600"/>
              <span className="text-sm font-bold text-purple-900">Why This Matches You</span>
            </div>
            <div className="space-y-1.5">
              {offer.tags.map(r => (
                <div key={r} className="flex items-start gap-2 text-sm text-purple-800">
                  <span className="text-purple-500 mt-0.5">✓</span><span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <div>
                <span className="text-sm text-gray-600">{meta.deliveryLabel}</span>
                <p className="text-xs text-gray-500">{meta.deliveryValue}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{meta.timeLabel}</span>
                <p className="text-xs text-green-600">{meta.timeSub}</p>
              </div>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Service Price</span>
              <span className="text-sm">{offer.price}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Delivery Fee</span>
              <span className="text-sm text-green-600 font-medium">FREE</span>
            </div>
            {offer.orig && (
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Discount Applied</span>
                <span className="text-sm text-green-600 font-medium">-${disc}</span>
              </div>
            )}
            <div className="flex justify-between py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg px-4">
              <span className="font-bold text-lg">Total</span>
              <div className="text-right">
                {offer.orig && <span className="text-sm text-gray-400 line-through block">{offer.orig}</span>}
                <span className="font-bold text-2xl text-green-600">{offer.price}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 mb-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600"/>
              </div>
              <div>
                <p className="text-sm font-bold text-green-900 mb-1">💰 Smart Savings Alert!</p>
                <p className="text-xs text-green-800">{meta.ctxMsg} <strong>${disc}</strong>. {meta.ctxNote}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
            <div className="flex items-start gap-2">
              <ShieldIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-blue-900">
                <span className="font-medium">Privacy Notice: </span>
                This offer was generated using data you consented to share. All data is encrypted and processed according to your privacy settings.
              </p>
            </div>
          </div>

          <button
            onClick={onPlace}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-bold text-lg shadow-xl transition-all"
          >
            ✓ Confirm &amp; Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPLETE SCREEN ──────────────────────────────────────────────────────────
function CompleteScreen({ orderNum, offer }) {
  const orig    = parseFloat((offer?.orig||"$0").replace("$",""));
  const curr    = parseFloat((offer?.price||"$0").replace("$",""));
  const savings = (orig - curr).toFixed(2);

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-md w-full text-center bg-white border-2 border-green-200 rounded-xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 shadow-lg rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 text-sm mb-2">{offer?.name} has been confirmed</p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-green-700 text-xs">Order #</p>
              <p className="font-medium">{orderNum}</p>
            </div>
            <div>
              <p className="text-green-700 text-xs">Est. Time</p>
              <p className="font-medium">30-45 min</p>
            </div>
            <div>
              <p className="text-green-700 text-xs">You Save</p>
              <p className="font-medium text-green-600">${savings}</p>
            </div>
            <div>
              <p className="text-green-700 text-xs">Total Paid</p>
              <p className="font-medium">{offer?.price}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-green-700 mb-4 bg-green-50 border border-green-200 rounded-lg py-2 px-4">
          <ShieldIcon className="w-4 h-4"/>
          <span>Your data was used securely to personalize this offer</span>
        </div>

        <p className="text-sm font-medium text-gray-700">All tasks completed. Please close this tab and return to the survey to answer the remaining questions.</p>
      </div>
    </div>
  );
}

// ─── ANALYZING SCREEN ─────────────────────────────────────────────────────────
function AnalyzingScreen() {
  const items = ["Checking kitchen sensors (no cooking detected)", "Analyzing presence (2 people home)", "Matching with your purchase history"];
  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full text-center bg-white border-2 border-blue-200 rounded-xl p-8 shadow-2xl">
        <div className="relative mb-5">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto"/>
          <Sparkles className="w-5 h-5 text-purple-500 absolute top-0 right-1/3 animate-pulse"/>
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Personalizing Your Offers
        </h2>
        <p className="text-gray-600 text-sm mb-5">Analyzing your preferences and current home status...</p>
        <div className="space-y-2 mb-4 text-left">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
              <div className={`w-2 h-2 rounded-full animate-pulse ${["bg-blue-600","bg-purple-600","bg-indigo-600"][i]}`} style={{animationDelay:`${i*0.2}s`}}/>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-center gap-2 text-xs text-blue-900">
            <ShieldIcon className="w-4 h-4"/>
            <span>All data processed securely and encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const trackerRef = useRef(null);
  if (!trackerRef.current) trackerRef.current = createStudyTracker();
  const tracker = trackerRef.current;

  const [stage,         setStage]        = useState("home");
  const [acq,           setAcq]          = useState({...DEFAULT_ACQ});
  const [proc,          setProc]         = useState({...DEFAULT_PROC});
  const [saved,         setSaved]        = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [orderNum,      setOrderNum]     = useState(null);
  const [sidebarVisible,setSidebarVisible] = useState(false);
  const [currentTask,   setCurrentTask]  = useState(0);
  const [doneTasks,     setDoneTasks]    = useState([]);

  // sidebar/task bar follow the tracker (single source of truth)
  const syncTasks = (finished) => {
    if (!finished.length) return;
    setDoneTasks(prev => Array.from(new Set([...prev, ...finished])));
    setCurrentTask(tracker.current - 1);
  };

  // visit start (once)
  useEffect(() => {
    tracker.event("session_start", { details: {
      participant_source: tracker.participantSource,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      user_agent: navigator.userAgent,
    } });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // task sidebar appears after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => { setSidebarVisible(true); tracker.event("tasks_shown"); }, 5000);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // every screen change
  useEffect(() => { tracker.event("page_view", { page: stage }); }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  function goConsent() {            // click is logged in HomeScreen
    setStage("consent");
  }
  function goOffers() {             // click + task completion are logged in ConsentScreen
    setStage("analyzing");
    setTimeout(() => setStage("offers"), 2500);
  }
  function handleSelectOffer(offer) {
    const tabOffers = ALL_OFFERS.filter(o => o.cat === offer.cat);
    tracker.action("offer_select", { page:"offers", target:offer.name, value:offer.cat,
      override: isOfferOverride(offer, tabOffers) });
    if (!tracker.isDone(3)) syncTasks(tracker.complete(3, "offer_select", { offer:offer.name }));
    setSelectedOffer(offer);
    setStage("order");
  }
  function handlePlaceOrder() {
    if (tracker.isDone(4)) return; // ignore double clicks
    const num = `SH-${Math.floor(Math.random() * 90000) + 10000}`;
    tracker.action("order_place", { page:"order", target:selectedOffer?.name, details:{ order_num:num } });
    syncTasks(tracker.complete(4, "order_place", { offer:selectedOffer?.name, orderPlaced:true }));
    setOrderNum(num);
    setStage("complete");
    // participant returns to the SurveyMonkey tab (still open) for the remaining questions
    tracker.event("study_finished", { page:"complete" });
  }

  const sp = { tracker };

  return (
    <div className="app">
      <ModeBadge/>
      {sidebarVisible && <TaskSidebar doneTasks={doneTasks} currentTask={currentTask}/>}
      <div style={{flex:1, minWidth:0, display:"flex", flexDirection:"column"}}>
        <TaskBar sidebarVisible={sidebarVisible} currentTask={currentTask}/>
        <div style={{flex:1, display:"flex", flexDirection:"column"}}>
          {stage === "home"      && <HomeScreen    {...sp} onConsent={goConsent}/>}
          {stage === "consent"   && <ConsentScreen {...sp} acq={acq} setAcq={setAcq} proc={proc} setProc={setProc} saved={saved} setSaved={setSaved} onDone={goOffers} currentTask={currentTask} syncTasks={syncTasks}/>}
          {stage === "analyzing" && <AnalyzingScreen/>}
          {stage === "offers"    && <OffersScreen  {...sp} onSelect={handleSelectOffer} onBack={() => setStage("home")}/>}
          {stage === "order"     && selectedOffer && <OrderScreen {...sp} offer={selectedOffer} onPlace={handlePlaceOrder} onBack={() => setStage("offers")}/>}
          {stage === "complete"  && <CompleteScreen orderNum={orderNum} offer={selectedOffer}/>}
        </div>
      </div>
    </div>
  );
}
