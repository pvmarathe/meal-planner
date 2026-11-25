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

// Recipes marked dailyPick (the fresh fruits) work like the daily drink, but a different one is picked at random for each
// of that meal: one is added to every such meal, and the rest of the meal is balanced around it.
const FRUITS = {};
MEALS.forEach((m) => { FRUITS[m] = []; });
Object.keys(byId).forEach((id) => { const { r, s } = byId[id]; if (s.inPlanner !== false && r.dailyPick && FRUITS[r.dailyPick] && r.macros && !r.macros.na) FRUITS[r.dailyPick].push(id); });
const fruitFor = (meal, banned, date) => {
  const all = FRUITS[meal];
  if (!all.length) return [];
  // fruits in season (US East Coast) in the month of this day; a fruit without months is available all year
  const month = date ? Number(String(date).slice(5, 7)) : null;
  const inSeason = month ? all.filter((id) => !byId[id].r.months || byId[id].r.months.includes(month)) : all;
  const pool = inSeason.length ? inSeason : all;
  const fresh = pool.filter((id) => !banned.has(id));
  if (fresh.length) return [{ id: randomFrom(fresh), s: 1 }];
  // every fruit in season has been used: reuse the ones eaten longest ago (banned keeps the order the days were planned in)
  const order = [...banned];
  const byAge = pool.map((id) => ({ id, at: order.lastIndexOf(id) })).sort((x, y) => x.at - y.at);
  return [{ id: randomFrom(byAge.slice(0, Math.max(1, Math.ceil(byAge.length / 2))).map((x) => x.id)), s: 1 }];
};

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
// A recipe can carry group: "eggs"; two dishes of one group never share a meal.
// A recipe can carry weight (default 1): below 1 it is picked as a side less often.
const pickSide = (sides) => {
  const w = sides.map((id) => (byId[id].r.weight == null ? 1 : byId[id].r.weight));
  let x = rng() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < sides.length; i++) { x -= w[i]; if (x < 0) return sides[i]; }
  return sides[sides.length - 1];
};
const clashes = (ids, id) => ids.includes(id) || (!!byId[id].r.group && ids.some((x) => byId[x].r.group === byId[id].r.group));
function solvePair(meal, targets, banned, level = 0, date = null) {
  let mains = POOLS[meal].main.filter((id) => !banned.has(id));
  if (!mains.length) mains = POOLS[meal].main;
  const sides = POOLS[meal].side.filter((id) => !banned.has(id));
  const fixed = [...DAILY[meal].map((d) => ({ ...d })), ...fruitFor(meal, banned, date)];
  const found = [];
  for (let n = 0; n < 1500; n++) {
    const ids = [randomFrom(mains)];
    if (sides.length && rng() < 0.8) ids.push(pickSide(sides));
    if (sides.length > 1 && rng() < 0.4) { const extra = pickSide(sides); if (!clashes(ids, extra)) ids.push(extra); }
    const a = bestServings(ids, targets[0], level, fixed);
    if (!a) continue;
    const b = bestServings(ids, targets[1], level, fixed);
    if (!b) continue;
    found.push({ ids, a, b, score: a.score + b.score });
  }
  if (!found.length) return level < WINDOWS.length - 1 ? solvePair(meal, targets, banned, level + 1, date) : null;
  found.sort((x, y) => x.score - y.score);
  const pick = randomFrom(found.slice(0, Math.max(5, Math.ceil(found.length * 0.15))));
  return { items: [...fixed.map((d) => ({ ...d, s2: d.s })), ...pick.ids.map((id, j) => ({ id, s: pick.a.servs[j], s2: pick.b.servs[j] }))], locked: false };
}
// One slot for one or two people (targets is a list of calorie targets, one for each person).
// date (YYYY-MM-DD) is the day being planned; it picks the fruit that is in season.
const solveMeal = (meal, targets, banned, date = null) => (targets.length === 2 ? solvePair(meal, targets, banned, 0, date) : solveOne(meal, targets[0], banned, 0, date));

function solveOne(meal, target, banned, level = 0, date = null) {
  let mains = POOLS[meal].main.filter((id) => !banned.has(id));
  if (!mains.length) mains = POOLS[meal].main;
  const sides = POOLS[meal].side.filter((id) => !banned.has(id));
  const stepsMain = [1, 1.5, 2, 2.5, 3];
  const stepsSide = [0.5, 1, 1.5, 2, 2.5, 3];
  const found = [];
  const fixed = [...DAILY[meal].map((d) => ({ ...d })), ...fruitFor(meal, banned, date)];
  for (let n = 0; n < 6000; n++) {
    const items = [...fixed, { id: randomFrom(mains), s: randomFrom(stepsMain) }];
    if (sides.length && rng() < 0.8) items.push({ id: pickSide(sides), s: randomFrom(stepsSide) });
    if (sides.length > 1 && rng() < 0.4) {
      const extra = pickSide(sides);
      if (!clashes(items.map((i) => i.id), extra)) items.push({ id: extra, s: randomFrom(stepsSide) });
    }
    const t = totalsOf(items);
    const off = Math.abs(t.kcal / target - 1);
    if (off > TOLERANCE[level]) continue;
    const sh = sharesOf(t);
    if (!inWindow(sh, WINDOWS[level])) continue;
    found.push({ items, score: off * 3 + Math.abs(sh.p - IDEAL.p) + Math.abs(sh.c - IDEAL.c) + Math.abs(sh.f - IDEAL.f) });
  }
  if (!found.length) return level < WINDOWS.length - 1 ? solveOne(meal, target, banned, level + 1, date) : null;
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
  // a fruit is deleted and added again, so the set keeps the order of last use (fruitFor relies on it)
  days.forEach((d) => { if (d[meal]) d[meal].items.forEach((i) => { if ((byId[i.id].r.meals && byId[i.id].r.meals[meal] === "main") || byId[i.id].r.dailyPick === meal) { used.delete(i.id); used.add(i.id); } }); });
  return used;
}

function buildDays(old, people, n, start) {
  const days = Array.from({ length: n }, (_, i) => {
    const day = {};
    MEALS.forEach((m) => {
      const o = old && old.days.length === n ? old.days[i][m] : null;
      // a meal marked Keep stays, as long as it has portions for everyone in this plan
      if (o && o.locked && (people.length === 1 || o.items.every((it) => typeof it.s2 === "number"))) day[m] = o;
    });
    return day;
  });
  days.forEach((day, di) => {
    const date = start ? isoDate(addDays(parseIso(start), di)) : null;
    MEALS.forEach((meal) => {
      if (day[meal]) return;
      const banned = new Set([...mainsUsed(days, meal), ...idsOfDay(day, meal)]);
      day[meal] = solveMeal(meal, targetsFor(people, meal), banned, date) || { items: [...DAILY[meal].map((d) => ({ ...d, s2: d.s })), { id: POOLS[meal].main[0], s: 1, s2: 1 }], locked: false };
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
  const days = buildDays(old, people, daysBetween(s, e), s);
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


// ----- rebuilding a plan from a short recipe (used by the agent and by the planner page when you open an emailed link) -----
// A small seeded random generator, so the same seed always gives the same plan
function seeded(text) {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) { h = Math.imul(h ^ text.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = (h ^= h >>> 16) >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// A short fingerprint of the recipes the planner can pick from (names, numbers and meal tags), so a rebuilt plan can say if
// those recipes changed since it was made. Recipes that are only on the recipes page never change a plan, so they are left out.
const dataHash = () => {
  let h = 2166136261;
  const text = Object.keys(byId).filter((id) => { const { r, s } = byId[id]; return s.inPlanner !== false && (r.meals || r.dailyPick) && r.macros && !r.macros.na; })
    .map((id) => { const { r } = byId[id]; return `${id}${JSON.stringify(r.meals)}${r.dailyPick || ""}${r.macros.kcal}${r.macros.p}${r.macros.c}${r.macros.f}`; }).join("|");
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8, "0");
};
function applyEdits(plan, edits) {
  (edits || "").split(";").map((x) => x.trim()).filter(Boolean).forEach((spec) => {
    const [kind, a, b, c] = spec.split(":");
    if (kind === "mode") plan.mode = a === "batch" ? "batch" : "fresh";
    else if (kind === "away") plan.away = [...new Set([...(plan.away || []), a])];
    else if (kind === "back") plan.away = (plan.away || []).filter((d) => d !== a);
    else if (kind === "reroll") {
      const i = Math.round((parseIso(a) - parseIso(plan.start)) / 86400000);
      if (!(i >= 0 && i < plan.days.length) || !MEALS.includes(b)) throw new Error(`bad edit: ${spec}`);
      setRng(seeded(`${a}-${b}-${c || "1"}`));
      const day = plan.days[i];
      const banned = new Set([...mainsUsed(plan.days, b), ...idsOfDay(day, b)]);
      const fresh = solveMeal(b, targetsFor(peopleOf(plan), b), banned, a);
      if (fresh) plan.days[i] = { ...day, [b]: fresh };
    } else throw new Error(`unknown edit: ${spec}`);
  });
  return plan;
}
// Everything that defines a plan: start, length, cooking mode, seed, edits and the recipe data. Same inputs always give the same plan.
// seed: "auto2" (new plans) depends only on the dates and the people's gender, weight and activity, so renaming someone never changes a plan.
// "auto" (the first plans sent) also mixed in the names; legacyNames lets a rebuild use the names that were in use then.
function buildPlan({ start, days, mode, seed, edits, ppl, legacyNames }) {
  const end = isoDate(addDays(parseIso(start), days - 1));
  const seedText = seed && seed !== "auto" && seed !== "auto2" ? seed
    : seed === "auto2" ? `${start}-${ppl.map((p) => p.gender + p.kg + p.activity).join("|")}`
    : `${start}-${ppl.map((p, i) => ((legacyNames && legacyNames[i]) || p.name) + p.gender + p.kg + p.activity).join("|")}`;
  setRng(seeded(seedText));
  let plan;
  const savedGender = gender, savedKg = bodyKg;
  try {
    if (ppl.length === 1) { gender = ppl[0].gender; bodyKg = ppl[0].kg; } // a one-person plan uses the page's own settings, so set them to this person's
    plan = newPlan(null, ppl[0].activity, start, end, ppl.length === 2 ? ppl : null);
  } finally { gender = savedGender; bodyKg = savedKg; }
  if (ppl.length === 1) plan.people = undefined;
  plan.pplCfg = ppl;
  plan.mode = mode === "batch" ? "batch" : "fresh";
  if (!validPlan(plan)) throw new Error("plan did not validate");
  applyEdits(plan, edits);
  plan.id = { start, days, mode: plan.mode, seed: seed || "auto", edits: edits || "none", data: dataHash() };
  setRng(Math.random); // go back to ordinary random choices for anything done afterwards (rerolls on the page)
  return plan;
}
const planIdLine = (plan) => `Plan ID: start=${plan.id.start} days=${plan.id.days} mode=${plan.id.mode} seed=${plan.id.seed} data=${plan.id.data} edits=${plan.id.edits}`;
const parseIdLine = (line) => Object.fromEntries([...line.matchAll(/(\w+)=(\S+)/g)].map((m) => [m[1], m[2]]));

// The short link in an email: a small code holding the plan's recipe (dates, mode, changes) and the people it is for.
function encodeRecipe(plan, people) {
  const j = JSON.stringify({ v: 2, i: plan.id, p: people });
  return btoa(unescape(encodeURIComponent(j))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeRecipe(code) {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const o = JSON.parse(decodeURIComponent(escape(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)))));
    if (!o || o.v !== 2 || !o.i || !Array.isArray(o.p) || ![1, 2].includes(o.p.length)) return null;
    const ppl = o.p.map(cleanPerson);
    const plan = buildPlan({ start: o.i.start, days: Number(o.i.days), mode: o.i.mode, seed: o.i.seed === "auto" ? undefined : o.i.seed, edits: o.i.edits === "none" ? "" : o.i.edits, ppl });
    return { plan, changed: plan.id.data !== o.i.data };
  } catch (e) { return null; }
}

// ----- the combined shopping list (shared by the website and the email agent) -----
// Names only, each ingredient once: every recipe's ingredient lines are reduced to the plain ingredient name
// ("2 tbsp onion, finely chopped" and "onions" both become "onion"), then listed under a category.
const isAway = (plan, i) => (plan.away || []).includes(isoDate(addDays(parseIso(plan.start), i)));
const SHOP_UNITS = new Set(["cup", "cups", "tbsp", "tablespoon", "tablespoons", "tsp", "teaspoon", "teaspoons", "g", "gm", "gram", "grams", "kg", "ml", "l", "litre", "liter", "oz", "lb", "inch", "inches", "clove", "cloves", "pinch", "sprig", "sprigs", "slice", "slices", "can", "glass", "bunch", "bowl", "piece", "pieces", "handful", "stalk", "stalks", "stick", "sticks", "pod", "pods", "pack", "packet", "cob", "cobs", "small", "medium", "large", "big", "few", "some", "heaped", "level", "scant", "rounded", "generous"]);
const SHOP_DROP = /\b(finely|roughly|freshly|thinly|coarsely|chopped|sliced|grated|crushed|ground|boiled|cooked|soaked|fresh|dry|dried|raw|optional|ripe|frozen|canned|whole|peeled|diced|minced|roasted|toasted|packed|powdered|shredded|cubed|halved|uncooked|washed|rinsed|drained|soft|hot|warm|cold|extra|good|quality|homemade|ready-made|pitted|deseeded|seedless|skinless|julienne|julienned|florets?|stalks?|sprigs?|leaves of)\b/g;
const SHOP_SYN = {
  "cilantro leaf": "cilantro", "coriander leaf": "cilantro", "coriander": "cilantro", "green coriander": "cilantro", "coriander stem": "cilantro", "cilantro stem": "cilantro", "fresh coriander": "cilantro",
  "coriander powder": "coriander seeds or powder", "coriander seed": "coriander seeds or powder", "dhania powder": "coriander seeds or powder", "dhania": "coriander seeds or powder",
  "cumin seed": "cumin", "cumin powder": "cumin", "jeera": "cumin", "jeera powder": "cumin", "jeera seed": "cumin", "ground cumin": "cumin",
  "turmeric powder": "turmeric", "haldi": "turmeric", "pepper": "black pepper", "pepper powder": "black pepper", "black pepper powder": "black pepper", "pepper mix": "black pepper",
  "red chilli powder": "red chilli powder", "kashmiri red chilli powder": "red chilli powder", "chilli powder": "red chilli powder", "kashmiri chilli powder": "red chilli powder", "kashmiri red chilli": "red chilli powder",
  "chilli": "green chilli", "chili": "green chilli", "green chili": "green chilli", "chilli pepper": "green chilli", "dried red chilli": "red chilli",
  "garam masala powder": "garam masala", "hing": "hing (asafoetida)", "asafoetida": "hing (asafoetida)", "pinch of hing": "hing (asafoetida)",
  "pea": "green peas", "peas": "green peas", "green pea": "green peas", "frozen pea": "green peas", "frozen green peas": "green peas",
  "oil": "cooking oil", "refined oil": "cooking oil", "vegetable oil": "cooking oil", "neutral oil": "cooking oil", "sunflower oil": "cooking oil", "canola oil": "cooking oil", "virgin olive oil": "olive oil", "extra virgin olive oil": "olive oil",
  "sweet corn": "corn", "corn kernel": "corn", "corn kernels": "corn", "baby corn": "corn",
  "gram flour": "besan", "bajra atta": "bajra flour", "jowar atta": "jowar flour", "ragi atta": "ragi flour", "wheat flour": "whole wheat flour", "atta": "whole wheat flour",
  "curd": "yogurt", "dahi": "yogurt", "yoghurt": "yogurt", "greek yogurt": "yogurt", "plain yogurt": "yogurt",
  "palak": "spinach", "spinach palak": "spinach", "baby spinach": "spinach", "moong sprout": "sprouted moong", "sprout": "sprouted moong", "kasoori methi": "kasuri methi",
  "red onion": "onion", "scallion": "spring onion", "green onion": "spring onion",
  "capsicum": "bell pepper", "red capsicum": "bell pepper", "green capsicum": "bell pepper", "yellow capsicum": "bell pepper", "red bell pepper": "bell pepper", "yellow bell pepper": "bell pepper", "green bell pepper": "bell pepper",
  "chickpea": "chickpeas", "salt": "salt", "kosher salt": "salt", "sea salt": "salt", "rock salt": "salt", "black salt": "kala namak",
  "lime juice": "lime", "lemon juice": "lemon", "lemon zest": "lemon", "lime zest": "lime", "garlic clove": "garlic", "clove garlic": "garlic",
  "green apple": "apple", "purple cabbage": "red cabbage", "lettuce leaf": "lettuce", "bay leaf": "bay leaf", "mixed herb": "mixed herbs", "medjool date": "dates", "date": "dates", "peanut": "peanuts", "sesame": "sesame seeds",
  "tamarind juice": "tamarind", "tamarind pulp": "tamarind", "tamarind paste": "tamarind", "spoon sugar": "sugar", "cube processed cheese": "processed cheese", "cubes processed cheese": "processed cheese", "crumbled paneer": "paneer", "paneer cube": "paneer",
  "cinnamon stick": "cinnamon", "eno": "eno fruit salt", "fruit salt": "eno fruit salt", "eno fruit salt": "eno fruit salt", "jaggery powder": "jaggery", "oats": "rolled oats", "oat": "rolled oats", "french beans": "green beans", "french bean": "green beans", "coriander": "cilantro", "cumin-coriander powder": "cumin and coriander seeds or powder", "peanuts": "peanuts", "bay leaves": "bay leaf", "cilantro leaves": "cilantro", "kiwi fruit": "kiwi", "pomegranate seeds": "pomegranate", "pomegranate seed": "pomegranate", "kiwis": "kiwi", "blueberries": "blueberry", "blackberries": "blackberry", "grapes": "grape", "coriander leaves": "cilantro", "green coriander leaves": "cilantro", "cumin seeds": "cumin", "jeera seeds": "cumin", "pounded cumin seeds": "cumin", "coriander seeds": "coriander seeds or powder", "fennel seeds": "fennel", "saunf": "fennel", "carom seeds": "ajwain", "moong sprouts": "sprouted moong", "red pepper": "chilli flakes", "red pepper flakes": "chilli flakes", "kidney beans": "kidney beans (rajma)", "rajma": "kidney beans (rajma)", "white quinoa": "quinoa", "mustard seeds": "mustard seeds", "turmeric": "turmeric", "cinnamon powder": "cinnamon", "clove": "cloves", "flax": "flax seeds", "mix of flax": "flax seeds", "ginger paste": "ginger", "garlic paste": "garlic", "ginger-chilli paste": "ginger and green chilli", "ginger chilli paste": "ginger and green chilli",
};
const SHOP_KEEP_PLURAL = new Set(["peas", "beans", "lentils", "oats", "chickpeas", "noodles", "greens", "leaves", "seeds", "flakes", "crumbs", "kernels", "sprouts", "nuts", "cashews", "grapes", "berries", "molasses", "hummus", "couscous", "asparagus", "swiss", "citrus", "bhindi"]);
const SHOP_SPLIT = { "ginger and green chilli": ["ginger", "green chilli"], "cumin and coriander seeds or powder": ["cumin", "coriander seeds or powder"] };
const SHOP_SKIP = /^(vegetables? of your choice|water|ice|ice cubes?|salt and pepper|a pinch|as needed|to taste|oil for [a-z ]+)$/;
function shopSingular(word) {
  if (SHOP_KEEP_PLURAL.has(word) || word.length < 4) return word;
  if (/(chill|chil)ies$/.test(word)) return word.replace(/ies$/, "i");
  if (/ies$/.test(word)) return word.replace(/ies$/, "y");
  if (/(tomato|potato|mango|avocado)es$/.test(word)) return word.slice(0, -2);
  if (/(ss|us|is)$/.test(word)) return word;
  if (/s$/.test(word)) return word.slice(0, -1);
  return word;
}
function shopOne(t) {
  let words = t.split(" ").filter(Boolean);
  while (words.length > 1 && SHOP_UNITS.has(words[0].replace(/\.$/, ""))) words.shift();
  if (words[0] === "of") words.shift();
  t = words.join(" ").replace(SHOP_DROP, " ").replace(/\s+/g, " ").trim();
  t = t.replace(/\b(garlic) (cloves?)\b/, "$1").replace(/\b(cloves?) (garlic)\b/, "$2").replace(/\b(corn) (cobs?)\b/, "$1").replace(/\b(lettuce) (leaves|leaf)\b/, "$1");
  words = t.split(" ").filter(Boolean);
  if (!words.length) return "";
  words[words.length - 1] = shopSingular(words[words.length - 1]);
  t = words.join(" ");
  t = SHOP_SYN[t] || t;
  t = SHOP_SYN[t] || t;
  return SHOP_SKIP.test(t) ? "" : t;
}
// One ingredient line can give zero, one or two names ("coriander and green chilli" gives two).
function shopName(text) {
  let t = String(text).toLowerCase().replace(/\(.*?\)/g, " ").replace(/[’']/g, "'");
  t = t.replace(/,.*$/, "").replace(/\b(to taste|to garnish|for [a-z ]+|as needed|as required|optional)\b.*$/, "").replace(/\s+/g, " ").trim();
  for (let n = 0; n < 4; n++) t = t.replace(/^(a few|a pinch of|a handful of|a little|a bit of|a mix of|half an?|juice of|zest of|few|some|pinch of|and|pounded|mixed|a|an)\s+/, "");
  // drop amounts and unit words from the front, however they are chained ("½ cup + 2 tbsp", "½ to 1 tsp", "1 heaped tbsp")
  for (let prev = ""; prev !== t;) {
    prev = t;
    t = t.replace(/^[\d¼½¾⅓⅔⅛⅜⅝⅞.\/\s–+-]+/, "").replace(/^(to|or|and)\s+/, "");
    const w = t.split(" ");
    if (w.length > 1 && SHOP_UNITS.has(w[0])) t = w.slice(1).join(" ");
  }
  t = t.replace(/\s+\d+$/, "").replace(/\s+or\s+.*$/, "").replace(/\s*\/\s*.*$/, ""); // a trailing number, and "oil or ghee": the first one
  const names = t.split(/\s+and\s+/).map((part) => shopOne(part.trim())).filter(Boolean);
  return names.flatMap((n) => (SHOP_SPLIT[n] ? SHOP_SPLIT[n] : [n]));
}
const SHOP_CATS = [
  ["Oils, sauces and other", /\boil\b|vinegar|sauce|sugar|jaggery|honey|syrup|baking|yeast|chutney|paste|ketchup|essence|coconut milk|nutritional|vanilla|cocoa|coffee|tea\b/],
  ["Spices and seasonings", /salt|namak|(?<!bell )pepper$|turmeric|powder|masala|cumin|jeera|mustard|hing|asafoetida|cardamom|cinnamon|\bcloves?\b|ajwain|carom|kasuri|methi dana|fennel|saunf|garam|paprika|chaat|oregano|thyme|bay leaf|seeds?$|chilli flakes|amchur|saffron|nutmeg/],
  ["Dals, grains and flours", /dal\b|lentil|moong|chana|rajma|chickpea|rice|poha|oats|quinoa|millet|ragi|jowar|bajra|flour|besan|sattu|rava|sooji|semolina|bread|barley|bulgur|couscous|pasta|noodles|tortilla|pita|urad|toor|masoor|kala|sabudana|sago|dalia|beans/],
  ["Dairy and protein", /\begg\b|paneer|yogurt|milk|cheese|tofu|soya|soy chunks|ghee|butter|cream|hummus|tempeh|buttermilk/],
  ["Fresh produce", /apple|banana|orange|mandarin|tangerine|blueberr|blackberr|mango|papaya|guava|pomegranate|watermelon|grape|pear|pineapple|muskmelon|melon|kiwi|onion|dill|parsley|coconut|tomato|potato|carrot|cabbage|spinach|cucumber|ginger|garlic|chilli|cilantro|mint|curry leaf|curry leaves|lemon|lime|bell pepper|peas|corn|beet|cauliflower|broccoli|mushroom|apple|banana|avocado|mango|orange|pomegranate|methi|fenugreek|radish|gourd|brinjal|eggplant|zucchini|celery|lettuce|pumpkin|okra|bhindi|drumstick|plantain|berry|berries|dates|grape|pineapple|papaya|green|leaf|leaves|sprouted/],
];
const shopCat = (name) => { for (const [t, re] of SHOP_CATS) if (re.test(name)) return t; return "Oils, sauces and other"; };
const SHOP_ORDER = ["Fresh produce", "Dals, grains and flours", "Dairy and protein", "Spices and seasonings", "Oils, sauces and other"];
function shoppingList(plan) {
  const planned = {};
  plan.days.forEach((d, i) => { if (isAway(plan, i)) return; MEALS.forEach((m) => d[m].items.forEach(({ id, s }) => { planned[id] = (planned[id] || 0) + s; })); });
  const names = new Set();
  Object.keys(planned).forEach((id) => flatLines(byId[id].r).forEach((l) => { shopName(l.text).forEach((n) => { if (n && n.length > 1) names.add(n); }); }));
  const groups = {};
  [...names].forEach((n) => { (groups[shopCat(n)] = groups[shopCat(n)] || []).push(n); });
  const cap = (n) => n.charAt(0).toUpperCase() + n.slice(1);
  return { groups: SHOP_ORDER.filter((c) => groups[c]).map((c) => ({ title: c, items: groups[c].sort((a, b) => a.localeCompare(b)).map(cap) })), extras: [], dishes: Object.keys(planned).length };
}
