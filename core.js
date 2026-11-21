// Meal Planner core: the planning logic (no page code), shared by the web page and by the accountability agent that runs in Node.

// ----- Weekly meal planner -----
// Builds a breakfast, lunch and dinner for each day of next week. Every meal is made of 1 to 3 dishes
// at portion sizes chosen so the meal hits its calorie target and its protein / carb / fat split.
// The plan is saved in this browser only (localStorage).

// General daily energy levels for an adult, based on ICMR-NIN 2020 figures as reported in published summaries.
// kcal is for the reference man (65 kg); kcalF is for the reference woman (55 kg). The women's sedentary and moderate
// figures are the published ones; the heavy-work figure is estimated from the men's value at the same ratio (about 0.79).
const ACTIVITY = {
  sedentary: { label: "Sedentary (desk job)", kcal: 2110, kcalF: 1660 },
  moderate: { label: "Moderately active", kcal: 2710, kcalF: 2130 },
  heavy: { label: "Heavy physical work", kcal: 3470, kcalF: 2730 },
};
const MEALS = ["breakfast", "lunch", "dinner"];
const MEAL_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
const MEAL_SPLIT = { breakfast: 0.3, lunch: 0.35, dinner: 0.35 }; // of the day's calories (no snacks planned)
// Shares of calories. Ranges follow the US/Canada acceptable macronutrient ranges, with protein's floor raised to 15%.
const WINDOWS = [
  { p: [0.15, 0.35], c: [0.45, 0.65], f: [0.2, 0.35] }, // the target
  { p: [0.13, 0.38], c: [0.4, 0.68], f: [0.18, 0.38] }, // a little looser
  { p: [0.1, 0.4], c: [0.35, 0.7], f: [0.15, 0.42] }, // loosest, used only if nothing else works
];
const TOLERANCE = [0.1, 0.15, 0.2]; // allowed calories away from the meal's target
const IDEAL = { p: 0.2, c: 0.5, f: 0.3 };
const PROTEIN_RDA_G_PER_KG = 0.83; // ICMR-NIN 2020
// Gender (optional) picks which reference body the calorie levels start from. Without a choice, the general (reference man) levels are used.
const GENDER_KEY = "meal-planner-gender";
const REFERENCE = {
  general: { label: "Prefer not to say", kg: 65, field: "kcal", about: "a 65 kg adult" },
  female: { label: "Female", kg: 55, field: "kcalF", about: "a 55 kg woman" },
  male: { label: "Male", kg: 65, field: "kcal", about: "a 65 kg man" },
};
let gender = "general";
try { const g = localStorage.getItem(GENDER_KEY); if (REFERENCE[g]) gender = g; } catch (e) { /* fine without saving */ }
const setGender = (g) => { gender = g; try { if (g !== "general") localStorage.setItem(GENDER_KEY, g); else localStorage.removeItem(GENDER_KEY); } catch (e) { /* fine */ } };
// Body weight (optional). The calorie levels are for the reference body above; with a weight entered, they scale in proportion.
const WEIGHT_KEY = "meal-planner-weight";
const MIN_KG = 40, MAX_KG = 100;
let bodyKg = null; // null means "not entered": use the reference weight
try { const w = parseFloat(localStorage.getItem(WEIGHT_KEY)); if (w >= MIN_KG && w <= MAX_KG) bodyKg = w; } catch (e) { /* fine without saving */ }
const setBodyKg = (w) => { bodyKg = w; try { if (w) localStorage.setItem(WEIGHT_KEY, String(w)); else localStorage.removeItem(WEIGHT_KEY); } catch (e) { /* fine */ } };
const kcalFor = (activity, g, kg) => { const ref = REFERENCE[g]; return Math.round((ACTIVITY[activity][ref.field] * (kg || ref.kg)) / ref.kg / 10) * 10; };
const dailyKcal = (activity) => kcalFor(activity, gender, bodyKg);
// Planning for two: each person has a name (optional), gender, weight and activity level. A one-person plan uses the settings above.
const TWO_KEY = "meal-planner-two";
const PERSON_NAMES = ["You", "Partner"];
const cleanPerson = (p) => ({
  name: String((p && p.name) || "").trim().slice(0, 20),
  gender: p && REFERENCE[p.gender] ? p.gender : "general",
  kg: p && p.kg >= MIN_KG && p.kg <= MAX_KG ? p.kg : null,
  activity: p && ACTIVITY[p.activity] ? p.activity : "sedentary",
});
const nameOf = (p, k) => p.name || PERSON_NAMES[k];
const personKcal = (p) => kcalFor(p.activity, p.gender, p.kg);
const peopleOf = (plan) => plan.people || [{ name: "", gender, kg: bodyKg, activity: plan.activity }];
const PLANS_KEY = "indian-protein-recipes-plans-v4"; // one saved plan for each date range
const V3_PLANS_KEY = "indian-protein-recipes-plans-v3"; // the earlier week-by-week plans, carried over once
const OLD_PLAN_KEY = "indian-protein-recipes-plan-v2"; // the very first single-plan format, carried over once
const MAX_DAYS = 14; // the longest range a plan can cover

const idOf = (r) => r.id || r.video.split("v=")[1]; // home recipes have no video, so they carry their own id
const byId = {};
sections.forEach((s) => s.recipes.forEach((r) => { byId[idOf(r)] = { r, s }; }));

// Recipes marked dailyWith (e.g. the lunch drink) are added to every one of that meal, and the rest of the meal is balanced around them.
const DAILY = {};
MEALS.forEach((m) => { DAILY[m] = []; });
Object.keys(byId).forEach((id) => { const w = byId[id].r.dailyWith; if (w && DAILY[w] && byId[id].r.macros && !byId[id].r.macros.na) DAILY[w].push({ id, s: 1 }); });

const POOLS = {};
MEALS.forEach((m) => { POOLS[m] = { main: [], side: [] }; });
Object.keys(byId).forEach((id) => {
  const { r, s } = byId[id];
  if (s.inPlanner === false) return; // e.g. the Dressings section: shown on the recipes page, never picked for a meal
  if (!r.macros || r.macros.na || !r.meals) return;
  MEALS.forEach((meal) => { if (r.meals[meal]) POOLS[meal][r.meals[meal]].push(id); });
});


// ----- dates -----
// Weeks run Monday to Sunday. "This week" is the one we are in, "next week" is the one after.
const thisMonday = () => mondayOf(new Date());
const upcomingMonday = () => addDays(thisMonday(), 7);
// Monday and Tuesday are for cooking this week's plan. From Wednesday on (plan, shop, batch cook) the useful week is the next one.
const defaultWeek = () => ([1, 2].includes(new Date().getDay()) ? thisMonday() : upcomingMonday());
function isoDate(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function parseIso(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
const dateLabel = (d) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });

// ----- numbers -----
function fmtServ(n) {
  const whole = Math.floor(n);
  const half = n - whole >= 0.5 ? "½" : "";
  return `${whole || ""}${half}` || "0";
}
let rng = Math.random; // the accountability agent swaps in a seeded generator so a week's plan can be rebuilt exactly
const setRng = (f) => { rng = f; };
const randomFrom = (arr) => arr[Math.floor(rng() * arr.length)];

// k is which person's portions to add up: 0 for the first person (s), 1 for the second (s2).
function totalsOf(items, k = 0) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  items.forEach((it) => {
    const x = k ? it.s2 : it.s;
    const m = byId[it.id].r.macros;
    t.kcal += m.kcal * x; t.p += m.p * x; t.c += m.c * x; t.f += m.f * x;
  });
  return t;
}
function sharesOf(t) {
  const e = t.p * 4 + t.c * 4 + t.f * 9;
  return e ? { p: (t.p * 4) / e, c: (t.c * 4) / e, f: (t.f * 9) / e } : { p: 0, c: 0, f: 0 };
}
const inWindow = (sh, w) => ["p", "c", "f"].every((k) => sh[k] >= w[k][0] && sh[k] <= w[k][1]);
const pct = (x) => `${Math.round(x * 100)}%`;

// ----- solving one meal -----
const STEPS_MAIN = [1, 1.5, 2, 2.5, 3];
const STEPS_SIDE = [0.5, 1, 1.5, 2, 2.5, 3];
const scoreOf = (t, target, level) => {
  const off = Math.abs(t.kcal / target - 1);
  if (off > TOLERANCE[level]) return null;
  const sh = sharesOf(t);
  if (!inWindow(sh, WINDOWS[level])) return null;
  return off * 3 + Math.abs(sh.p - IDEAL.p) + Math.abs(sh.c - IDEAL.c) + Math.abs(sh.f - IDEAL.f);
};
// For two people: the same dishes, but each person gets their own portions. Tries many dish sets and keeps the ones
// where both people can reach their own target.
function bestServings(ids, target, level, fixed) {
  let best = null;
  const cur = [];
  const walk = (i) => {
    if (i === ids.length) {
      const sc = scoreOf(totalsOf([...fixed, ...ids.map((id, j) => ({ id, s: cur[j] }))]), target, level);
      if (sc !== null && (!best || sc < best.score)) best = { servs: cur.slice(), score: sc };
      return;
    }
    for (const v of (i === 0 ? STEPS_MAIN : STEPS_SIDE)) { cur[i] = v; walk(i + 1); }
  };
  walk(0);
  return best;
}
function solvePair(meal, targets, banned, level = 0) {
  let mains = POOLS[meal].main.filter((id) => !banned.has(id));
  if (!mains.length) mains = POOLS[meal].main;
  const sides = POOLS[meal].side.filter((id) => !banned.has(id));
  const fixed = DAILY[meal].map((d) => ({ ...d }));
  const found = [];
  for (let n = 0; n < 1500; n++) {
    const ids = [randomFrom(mains)];
    if (sides.length && rng() < 0.8) ids.push(randomFrom(sides));
    if (sides.length > 1 && rng() < 0.4) { const extra = randomFrom(sides); if (!ids.includes(extra)) ids.push(extra); }
    const a = bestServings(ids, targets[0], level, fixed);
    if (!a) continue;
    const b = bestServings(ids, targets[1], level, fixed);
    if (!b) continue;
    found.push({ ids, a, b, score: a.score + b.score });
  }
  if (!found.length) return level < WINDOWS.length - 1 ? solvePair(meal, targets, banned, level + 1) : null;
  found.sort((x, y) => x.score - y.score);
  const pick = randomFrom(found.slice(0, Math.max(5, Math.ceil(found.length * 0.15))));
  return { items: [...fixed.map((d) => ({ ...d, s2: d.s })), ...pick.ids.map((id, j) => ({ id, s: pick.a.servs[j], s2: pick.b.servs[j] }))], locked: false };
}
// One slot for one or two people (targets is a list of calorie targets, one for each person).
const solveMeal = (meal, targets, banned) => (targets.length === 2 ? solvePair(meal, targets, banned) : solveOne(meal, targets[0], banned));

function solveOne(meal, target, banned, level = 0) {
  let mains = POOLS[meal].main.filter((id) => !banned.has(id));
  if (!mains.length) mains = POOLS[meal].main;
  const sides = POOLS[meal].side.filter((id) => !banned.has(id));
  const stepsMain = [1, 1.5, 2, 2.5, 3];
  const stepsSide = [0.5, 1, 1.5, 2, 2.5, 3];
  const found = [];
  const fixed = DAILY[meal].map((d) => ({ ...d }));
  for (let n = 0; n < 6000; n++) {
    const items = [...fixed, { id: randomFrom(mains), s: randomFrom(stepsMain) }];
    if (sides.length && rng() < 0.8) items.push({ id: randomFrom(sides), s: randomFrom(stepsSide) });
    if (sides.length > 1 && rng() < 0.4) {
      const extra = randomFrom(sides);
      if (!items.some((i) => i.id === extra)) items.push({ id: extra, s: randomFrom(stepsSide) });
    }
    const t = totalsOf(items);
    const off = Math.abs(t.kcal / target - 1);
    if (off > TOLERANCE[level]) continue;
    const sh = sharesOf(t);
    if (!inWindow(sh, WINDOWS[level])) continue;
    found.push({ items, score: off * 3 + Math.abs(sh.p - IDEAL.p) + Math.abs(sh.c - IDEAL.c) + Math.abs(sh.f - IDEAL.f) });
  }
  if (!found.length) return level < WINDOWS.length - 1 ? solveOne(meal, target, banned, level + 1) : null;
  found.sort((a, b) => a.score - b.score);
  const best = found.slice(0, Math.max(5, Math.ceil(found.length * 0.15)));
  return { items: randomFrom(best).items, locked: false };
}

// How a finished meal compares with the target: balanced, or which part is off.
function checkMeal(items, target, k = 0) {
  const t = totalsOf(items, k);
  const sh = sharesOf(t);
  const issues = [];
  if (Math.abs(t.kcal / target - 1) > TOLERANCE[0]) issues.push(`calories ${t.kcal > target ? "above" : "below"} target`);
  if (sh.p < WINDOWS[0].p[0]) issues.push(`protein low (${pct(sh.p)})`);
  if (sh.p > WINDOWS[0].p[1]) issues.push(`protein high (${pct(sh.p)})`);
  if (sh.c < WINDOWS[0].c[0]) issues.push(`carbs low (${pct(sh.c)})`);
  if (sh.c > WINDOWS[0].c[1]) issues.push(`carbs high (${pct(sh.c)})`);
  if (sh.f < WINDOWS[0].f[0]) issues.push(`fat low (${pct(sh.f)})`);
  if (sh.f > WINDOWS[0].f[1]) issues.push(`fat high (${pct(sh.f)})`);
  return { t, sh, issues };
}

// ----- the week -----
const mealTarget = (activity, meal) => dailyKcal(activity) * MEAL_SPLIT[meal];
const targetsFor = (people, meal) => people.map((p) => personKcal(p) * MEAL_SPLIT[meal]);

function idsOfDay(day, except) {
  const ids = new Set();
  MEALS.forEach((m) => { if (m !== except && day[m]) day[m].items.forEach((i) => ids.add(i.id)); });
  return ids;
}
function mainsUsed(days, meal) {
  const used = new Set();
  days.forEach((d) => { if (d[meal]) d[meal].items.forEach((i) => { if (byId[i.id].r.meals && byId[i.id].r.meals[meal] === "main") used.add(i.id); }); });
  return used;
}

function buildDays(old, people, n) {
  const days = Array.from({ length: n }, (_, i) => {
    const day = {};
    MEALS.forEach((m) => {
      const o = old && old.days.length === n ? old.days[i][m] : null;
      // a meal marked Keep stays, as long as it has portions for everyone in this plan
      if (o && o.locked && (people.length === 1 || o.items.every((it) => typeof it.s2 === "number"))) day[m] = o;
    });
    return day;
  });
  days.forEach((day) => {
    MEALS.forEach((meal) => {
      if (day[meal]) return;
      const banned = new Set([...mainsUsed(days, meal), ...idsOfDay(day, meal)]);
      day[meal] = solveMeal(meal, targetsFor(people, meal), banned) || { items: [...DAILY[meal].map((d) => ({ ...d, s2: d.s })), { id: POOLS[meal].main[0], s: 1, s2: 1 }], locked: false };
    });
  });
  return days;
}

const rangeKey = (start, end) => `${start}_${end}`;
const daysBetween = (startIso, endIso) => Math.round((parseIso(endIso) - parseIso(startIso)) / 86400000) + 1; // counts both the first and the last day
const rangeLabel = (p) => (p.start === p.end ? dateLabel(parseIso(p.start)) : `${dateLabel(parseIso(p.start))} to ${dateLabel(parseIso(p.end))}`);
const rangeSummary = (s, e) => {
  const n = daysBetween(s, e);
  const from = `${WEEKDAY_NAMES[parseIso(s).getDay()]} ${dateLabel(parseIso(s))}`;
  return n === 1 ? `1 day: ${from}` : `${n} days: ${from} to ${WEEKDAY_NAMES[parseIso(e).getDay()]} ${dateLabel(parseIso(e))}`;
};
const dayName = (p, i) => WEEKDAY_NAMES[addDays(parseIso(p.start), i).getDay()];

// peopleArg: undefined keeps the old plan's people, null makes a one-person plan, a list of two makes a plan for two.
function newPlan(old, activity, start, end, peopleArg) {
  const s = start || old.start;
  const e = end || old.end;
  const pp = peopleArg === undefined ? (old && old.people) || null : peopleArg;
  const act = pp ? pp[0].activity : (activity || (old && old.activity) || "sedentary");
  const people = pp || [{ name: "", gender, kg: bodyKg, activity: act }];
  const days = buildDays(old, people, daysBetween(s, e));
  const used = new Set(days.flatMap((d) => MEALS.flatMap((m) => d[m].items.map((i) => i.id))));
  const done = old ? Object.fromEntries(Object.entries(old.done || {}).filter(([id]) => used.has(id))) : {};
  return { start: s, end: e, activity: act, mode: (old && old.mode) || "fresh", days, done, ...(pp ? { people: pp } : {}) };
}

const validPlan = (p) => !!p && typeof p.start === "string" && typeof p.end === "string" && !!ACTIVITY[p.activity] && Array.isArray(p.days)
  && p.days.length >= 1 && p.days.length <= MAX_DAYS && p.days.length === daysBetween(p.start, p.end)
  && (!p.people || (Array.isArray(p.people) && p.people.length === 2 && p.people.every((q) => q && REFERENCE[q.gender] && ACTIVITY[q.activity])))
  && p.days.every((d) => MEALS.every((m) => d[m] && Array.isArray(d[m].items) && d[m].items.length
    && d[m].items.every((i) => byId[i.id] && typeof i.s === "number" && (!p.people || typeof i.s2 === "number"))));

// Every saved plan, keyed by its dates, plus which one was open last. Plans that ended more than two weeks ago are dropped.
function loadStore() {
  let saved = {};
  let last = null;
  try {
    const raw = JSON.parse(localStorage.getItem(PLANS_KEY) || "null");
    if (raw && raw.plans) { saved = raw.plans; last = raw.last || null; }
    else { // carry over plans made by earlier versions, which were Monday-to-Sunday weeks
      const weekly = [];
      const v3 = JSON.parse(localStorage.getItem(V3_PLANS_KEY) || "null");
      if (v3 && v3.plans) Object.entries(v3.plans).forEach(([week, p]) => weekly.push({ ...p, week }));
      else { const v2 = JSON.parse(localStorage.getItem(OLD_PLAN_KEY) || "null"); if (v2 && v2.week) weekly.push(v2); }
      weekly.forEach((p) => { const plan = { ...p, start: p.week, end: isoDate(addDays(parseIso(p.week), 6)) }; saved[rangeKey(plan.start, plan.end)] = plan; });
    }
  } catch (e) { saved = {}; }
  const cutoff = addDays(new Date(), -14);
  const plans = {};
  Object.entries(saved).forEach(([key, p]) => {
    if (validPlan(p) && rangeKey(p.start, p.end) === key && parseIso(p.end) >= cutoff) plans[key] = { ...p, mode: p.mode === "batch" ? "batch" : "fresh", done: p.done || {} };
  });
  return { plans, last: plans[last] ? last : null };
}
function saveStore(plans, last) {
  try { localStorage.setItem(PLANS_KEY, JSON.stringify({ plans, last })); } catch (e) { /* the page still works without saving */ }
}

// ----- the planner section -----
function flatLines(r) {
  const lines = [];
  r.ingredients.forEach((part) => {
    if (typeof part === "string") lines.push({ text: part });
    else part.items.forEach((t, i) => lines.push({ text: t, group: i === 0 ? part.title : null }));
  });
  return lines;
}

// A plan can be shared as a link: the whole plan (dishes and portions) is packed into the part after the #.
function encodePlan(plan) {
  const lite = { v: 1, a: plan.start, e: plan.end, c: plan.activity, m: plan.mode, p: plan.people || null, x: plan.away && plan.away.length ? plan.away : undefined,
    d: plan.days.map((d) => MEALS.map((m) => d[m].items.map((i) => (plan.people ? [i.id, i.s, i.s2] : [i.id, i.s])))) };
  return btoa(unescape(encodeURIComponent(JSON.stringify(lite)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodePlan(code) {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const lite = JSON.parse(decodeURIComponent(escape(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)))));
    if (!lite || lite.v !== 1) return null;
    const plan = {
      start: lite.a, end: lite.e, activity: lite.c, mode: lite.m === "batch" ? "batch" : "fresh", done: {},
      days: lite.d.map((day) => Object.fromEntries(MEALS.map((m, j) => [m, { locked: false, items: day[j].map(([id, sv, s2]) => (lite.p ? { id, s: sv, s2 } : { id, s: sv })) }]))),
    };
    if (lite.p) plan.people = lite.p.map(cleanPerson);
    if (Array.isArray(lite.x)) plan.away = lite.x.filter((d) => typeof d === "string"); // days the agent was told you are away
    return validPlan(plan) ? plan : null;
  } catch (e) { return null; }
}

