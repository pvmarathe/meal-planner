// Meal Planner: the landing page (weekly meal planner).

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
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

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
    if (sides.length && Math.random() < 0.8) ids.push(randomFrom(sides));
    if (sides.length > 1 && Math.random() < 0.4) { const extra = randomFrom(sides); if (!ids.includes(extra)) ids.push(extra); }
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
    if (sides.length && Math.random() < 0.8) items.push({ id: randomFrom(sides), s: randomFrom(stepsSide) });
    if (sides.length > 1 && Math.random() < 0.4) {
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

function targetsBox(people) {
  const w = WINDOWS[0];
  const grams = (kcal, share, per) => Math.round((kcal * share) / per);
  if (people.length === 2) {
    const lines = people.map((p, k) => {
      const kcal = personKcal(p);
      return h("li", { text: `${nameOf(p, k)}: about ${kcal} kcal a day (${ACTIVITY[p.activity].label.toLowerCase()}). Protein ${grams(kcal, w.p[0], 4)} to ${grams(kcal, w.p[1], 4)} g, carbs ${grams(kcal, w.c[0], 4)} to ${grams(kcal, w.c[1], 4)} g, fat ${grams(kcal, w.f[0], 9)} to ${grams(kcal, w.f[1], 9)} g. ${p.kg ? `Scaled to ${p.kg} kg.` : `General levels for ${REFERENCE[p.gender].about}.`}` });
    });
    return h("details", { class: "targets" },
      h("summary", { text: `Daily targets: ${people.map((p, k) => `${nameOf(p, k)} ${personKcal(p)} kcal`).join(" · ")}` }),
      h("p", { text: `Each day is split into breakfast ${pct(MEAL_SPLIT.breakfast)}, lunch ${pct(MEAL_SPLIT.lunch)} and dinner ${pct(MEAL_SPLIT.dinner)} of each person's calories. You cook one pot; each person's portions are worked out for their own target.` }),
      h("ul", {}, lines),
      h("p", { text: `Protein should be ${pct(w.p[0])} to ${pct(w.p[1])} of calories (ideally about ${pct(IDEAL.p)}), carbs ${pct(w.c[0])} to ${pct(w.c[1])} (about ${pct(IDEAL.c)}) and fat ${pct(w.f[0])} to ${pct(w.f[1])} (about ${pct(IDEAL.f)}). The Indian minimum protein allowance is about ${PROTEIN_RDA_G_PER_KG} g for every kg of body weight a day.` }),
    );
  }
  const p = people[0];
  const kcal = personKcal(p);
  const g = (share, per) => grams(kcal, share, per);
  const label = ACTIVITY[p.activity].label.toLowerCase();
  return h("details", { class: "targets" },
    h("summary", { text: `My daily targets: about ${kcal} kcal (${label})` }),
    h("p", {},
      h("strong", { text: `Daily target: about ${kcal} kcal` }),
      ` (${label}). Each day is split into breakfast ${pct(MEAL_SPLIT.breakfast)}, lunch ${pct(MEAL_SPLIT.lunch)} and dinner ${pct(MEAL_SPLIT.dinner)} of those calories. ${p.kg ? `Scaled to your weight of ${p.kg} kg, as a rough guide.` : `These are general levels for ${REFERENCE[p.gender].about}; enter your weight above to scale them.`}${p.gender === "female" && p.activity === "heavy" ? " The heavy-work level for women is my estimate, using the same ratio to the men's level that the other two levels show." : ""}`),
    h("ul", {},
      h("li", { text: `Protein: ${pct(w.p[0])} to ${pct(w.p[1])} of calories (${g(w.p[0], 4)} to ${g(w.p[1], 4)} g a day), ideally about ${pct(IDEAL.p)}. The Indian minimum allowance is about ${PROTEIN_RDA_G_PER_KG} g for every kg of body weight a day${p.kg ? `, which is about ${Math.round(PROTEIN_RDA_G_PER_KG * p.kg)} g at ${p.kg} kg` : ""}.` }),
      h("li", { text: `Carbs: ${pct(w.c[0])} to ${pct(w.c[1])} of calories (${g(w.c[0], 4)} to ${g(w.c[1], 4)} g a day), ideally about ${pct(IDEAL.c)}.` }),
      h("li", { text: `Fat: ${pct(w.f[0])} to ${pct(w.f[1])} of calories (${g(w.f[0], 9)} to ${g(w.f[1], 9)} g a day), ideally about ${pct(IDEAL.f)}.` }),
    ),
  );
}

// A plan can be shared as a link: the whole plan (dishes and portions) is packed into the part after the #.
function encodePlan(plan) {
  const lite = { v: 1, a: plan.start, e: plan.end, c: plan.activity, m: plan.mode, p: plan.people || null,
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
    return validPlan(plan) ? plan : null;
  } catch (e) { return null; }
}

function plannerSectionEl() {
  const section = h("section", { id: "plan", "aria-labelledby": "plan-heading" });
  const body = h("div", { id: "plan-body" });

  const store = loadStore();
  const plans = store.plans;
  let importedMsg = "";
  if (location.hash.startsWith("#share=")) { // someone sent a plan link
    const shared = decodePlan(location.hash.slice(7));
    if (shared) {
      plans[rangeKey(shared.start, shared.end)] = shared;
      store.last = rangeKey(shared.start, shared.end);
      saveStore(plans, store.last);
      importedMsg = `Opened a shared plan for ${rangeLabel(shared)}.`;
    } else importedMsg = "That plan link could not be read.";
    history.replaceState(null, "", location.pathname + location.search);
  }
  const firstRange = store.last ? { start: plans[store.last].start, end: plans[store.last].end } : { start: isoDate(defaultWeek()), end: isoDate(addDays(defaultWeek(), 6)) };
  let range = firstRange;
  let plan = plans[rangeKey(range.start, range.end)] || null;
  let activity = plan ? plan.activity : "sedentary";
  const planKey = () => rangeKey(range.start, range.end);
  // Settings for planning for two (kept in this browser, so the next plan starts with them)
  let two = { on: false, people: [cleanPerson({ gender, kg: bodyKg, activity }), cleanPerson({})] };
  try {
    const saved = JSON.parse(localStorage.getItem(TWO_KEY) || "null");
    if (saved && Array.isArray(saved.people) && saved.people.length === 2) two = { on: !!saved.on, people: saved.people.map(cleanPerson) };
  } catch (e) { /* fine without saving */ }
  const saveTwo = () => { try { localStorage.setItem(TWO_KEY, JSON.stringify(two)); } catch (e) { /* fine */ } };
  const copyPeople = () => two.people.map((q) => ({ ...q }));

  // ----- the dates the user chooses -----
  const startInput = h("input", { type: "date", id: "range-start", value: range.start, "aria-label": "First day" });
  const endInput = h("input", { type: "date", id: "range-end", value: range.end, "aria-label": "Last day" });
  const rangeMsg = h("p", { class: "range-msg", id: "range-msg", role: "status" });
  const savedSelect = h("select", { id: "saved-plans", "aria-label": "Open a saved plan", onchange: (e) => { const p = plans[e.target.value]; if (p) setDates(p.start, p.end); } });
  const savedLabel = h("label", { class: "activity" }, "Saved plans ", savedSelect);

  const dayCount = (s, e) => (s && e ? daysBetween(s, e) : 0);
  function problem(s, e) {
    if (!s || !e) return "Pick both a first day and a last day.";
    if (dayCount(s, e) < 1) return "The last day must be on or after the first day.";
    if (dayCount(s, e) > MAX_DAYS) return `A plan can cover up to ${MAX_DAYS} days. Choose an earlier last day.`;
    return "";
  }
  function refreshSaved() {
    const keys = Object.keys(plans).sort();
    savedLabel.hidden = keys.length === 0;
    savedSelect.replaceChildren(h("option", { value: "", text: "Open a saved plan" }),
      ...keys.map((k) => h("option", { value: k, selected: k === planKey(), text: `${rangeLabel(plans[k])} (${plans[k].days.length} days)` })));
  }
  // Show whatever plan belongs to the dates in the boxes (or invite the user to build one)
  function showRange() {
    const s = startInput.value;
    const e = endInput.value;
    const msg = problem(s, e);
    rangeMsg.textContent = msg || rangeSummary(s, e);
    rangeMsg.className = msg ? "range-msg problem" : "range-msg";
    if (msg) { plan = null; body.replaceChildren(); return; }
    range = { start: s, end: e };
    plan = plans[planKey()] || null;
    if (plan) { activity = plan.activity; saveStore(plans, planKey()); }
    render();
    refreshSaved();
  }
  function setDates(s, e) { startInput.value = s; endInput.value = e; showRange(); }
  startInput.addEventListener("change", () => {
    if (startInput.value && endInput.value && endInput.value < startInput.value) endInput.value = isoDate(addDays(parseIso(startInput.value), 6)); // moved the start past the end: offer a week
    showRange();
  });
  endInput.addEventListener("change", showRange);

  const preset = (label, id, s, e) => h("button", { type: "button", id, class: "btn small", text: label, onclick: () => setDates(isoDate(s), isoDate(e)) });
  const tomorrow = addDays(new Date(), 1);
  const picker = h("div", { class: "range-picker" },
    h("p", { class: "week-question", id: "range-question", text: `Which dates are you planning for? (1 to ${MAX_DAYS} days)` }),
    h("div", { class: "range-row" },
      h("label", { class: "activity" }, "From ", startInput),
      h("label", { class: "activity" }, "To ", endInput),
      savedLabel),
    h("div", { class: "range-row" },
      h("span", { class: "range-hint", text: "Quick picks:" }),
      preset("Next Monday to Sunday", "preset-week", upcomingMonday(), addDays(upcomingMonday(), 6)),
      preset("Next 7 days", "preset-7", tomorrow, addDays(tomorrow, 6)),
      preset("Next 3 days", "preset-3", tomorrow, addDays(tomorrow, 2))),
    rangeMsg);

  section.append(
    h("h2", { id: "plan-heading", class: "visually-hidden", text: "Plan my meals" }),
    picker,
    body,
  );

  function update(next) {
    plan = next;
    plans[planKey()] = next;
    saveStore(plans, planKey());
    render();
    refreshSaved();
  }

  function activityPicker() {
    const select = h("select", {
      id: "plan-activity", "aria-label": "Activity level",
      onchange: (e) => {
        activity = e.target.value;
        if (plan) update(newPlan(plan, activity)); else render();
      },
    }, Object.entries(ACTIVITY).map(([key, a]) => h("option", { value: key, selected: key === activity, text: `${a.label}: ${dailyKcal(key)} kcal a day` })));
    return h("label", { class: "activity" }, "Activity level ", select);
  }

  function genderPicker() {
    const select = h("select", {
      id: "gender", "aria-label": "Gender",
      onchange: (e) => { setGender(e.target.value); if (plan) update(newPlan(plan, activity)); else render(); },
    }, Object.entries(REFERENCE).map(([key, g]) => h("option", { value: key, selected: key === gender, text: g.label })));
    return h("label", { class: "activity" }, "Gender ", select);
  }

  function weightPicker() {
    const input = h("input", { id: "body-weight", type: "number", min: String(MIN_KG), max: String(MAX_KG), step: "0.5", inputmode: "decimal", placeholder: "optional", value: bodyKg ? String(bodyKg) : "" });
    const msg = h("span", { id: "weight-msg", class: "range-msg", role: "status" });
    input.addEventListener("change", () => {
      const raw = input.value.trim();
      const w = parseFloat(raw);
      if (raw && !(w >= MIN_KG && w <= MAX_KG)) { msg.textContent = `Enter a weight between ${MIN_KG} and ${MAX_KG} kg, or leave it blank.`; return; }
      msg.textContent = "";
      setBodyKg(raw ? w : null);
      if (plan) update(newPlan(plan, activity)); else render();
    });
    return h("label", { class: "activity" }, "Your weight (kg) ", input, " ", msg);
  }

  function modePicker() {
    const select = h("select", {
      id: "plan-for", "aria-label": "Who is this plan for",
      onchange: (e) => {
        two.on = e.target.value === "two";
        if (two.on) two.people[0] = cleanPerson({ ...two.people[0], gender, kg: bodyKg, activity: plan ? plan.activity : activity });
        saveTwo();
        if (plan) update(newPlan(plan, activity, null, null, two.on ? copyPeople() : null)); else render();
      },
    }, h("option", { value: "one", selected: !two.on, text: "Just me" }), h("option", { value: "two", selected: two.on, text: "Me and my partner (one pot)" }));
    return h("label", { class: "activity" }, "Planning for ", select);
  }

  // The two people's own settings: name, gender, weight and activity level.
  function peoplePanel() {
    const change = () => { saveTwo(); if (plan) update(newPlan(plan, null, null, null, copyPeople())); else render(); };
    const card = (k) => {
      const q = two.people[k];
      const name = h("input", { id: `person-${k}-name`, type: "text", maxlength: "20", placeholder: PERSON_NAMES[k], value: q.name });
      name.addEventListener("change", () => { q.name = name.value.trim().slice(0, 20); change(); });
      const gsel = h("select", { id: `person-${k}-gender`, onchange: (e) => { q.gender = e.target.value; change(); } },
        Object.entries(REFERENCE).map(([key, g]) => h("option", { value: key, selected: key === q.gender, text: g.label })));
      const wt = h("input", { id: `person-${k}-weight`, type: "number", min: String(MIN_KG), max: String(MAX_KG), step: "0.5", inputmode: "decimal", placeholder: "optional", value: q.kg ? String(q.kg) : "" });
      wt.addEventListener("change", () => {
        const raw = wt.value.trim(); const v = parseFloat(raw);
        if (raw && !(v >= MIN_KG && v <= MAX_KG)) { wt.value = q.kg ? String(q.kg) : ""; return; }
        q.kg = raw ? v : null; change();
      });
      const asel = h("select", { id: `person-${k}-activity`, onchange: (e) => { q.activity = e.target.value; change(); } },
        Object.entries(ACTIVITY).map(([key, a]) => h("option", { value: key, selected: key === q.activity, text: `${a.label}: ${personKcal({ ...q, activity: key })} kcal` })));
      return h("div", { class: "person" },
        h("p", { class: "person-title", text: nameOf(q, k) }),
        h("label", {}, "Name", name), h("label", {}, "Gender", gsel), h("label", {}, "Weight (kg)", wt), h("label", {}, "Activity", asel));
    };
    return h("div", { class: "people" }, card(0), card(1));
  }

  function mealBlock(dayIdx, meal) {
    const slot = plan.days[dayIdx][meal];
    const people = peopleOf(plan);
    const targets = targetsFor(people, meal);
    const checks = people.map((_, k) => checkMeal(slot.items, targets[k], k));
    const two_ = people.length === 2;

    const lines = slot.items.map((it) => {
      const { r } = byId[it.id];
      const amount = two_
        ? h("strong", { class: "who", text: people.map((q, k) => `${nameOf(q, k)} ${fmtServ(k ? it.s2 : it.s)}`).join(" · ") })
        : h("strong", { text: `${fmtServ(it.s)} × ` });
      return h("li", {},
        amount,
        h("a", { href: `recipes.html#r-${it.id}`, text: r.name }),
        ...(r.video ? [" ", h("a", { class: "watch", href: r.video, target: "_blank", rel: "noopener noreferrer", "aria-label": `Watch ${r.name} on YouTube`, text: "▶" })] : []),
        h("span", { class: "serving-note", text: `1 serving = ${r.macros.serving}` }),
      );
    });

    const macroLines = people.map((q, k) => {
      const { t, sh } = checks[k];
      return h("p", { class: "meal-macros" },
        two_ ? h("span", { class: "who", text: `${nameOf(q, k)}: ` }) : null,
        h("strong", { text: `${Math.round(t.kcal / 5) * 5} kcal` }),
        ` · protein ${fmt(t.p)} g (${pct(sh.p)}) · carbs ${fmt(t.c)} g (${pct(sh.c)}) · fat ${fmt(t.f)} g (${pct(sh.f)})`);
    });
    const badges = checks.map((c, k) => (c.issues.length ? h("p", { class: "badge close", text: `${two_ ? `${nameOf(people[k], k)}: ` : ""}Close: ${c.issues.join(", ")}` }) : null));

    return h("div", { class: "meal" },
      h("p", { class: "meal-label" }, MEAL_LABEL[meal], h("span", { text: ` · target ${targets.map((x) => Math.round(x / 5) * 5).join(" / ")} kcal` })),
      h("ul", { class: "meal-items" }, lines),
      ...macroLines,
      ...badges,
      h("div", { class: "meal-actions" },
        h("button", {
          class: "btn small", type: "button", "aria-label": `Replace ${MEAL_LABEL[meal]} on ${dayName(plan, dayIdx)}`, text: "Reroll",
          onclick: () => {
            const day = plan.days[dayIdx];
            const banned = new Set([...mainsUsed(plan.days, meal), ...idsOfDay(day, meal)]);
            const fresh = solveMeal(meal, targets, banned);
            if (!fresh) return;
            const days = plan.days.map((d, k) => (k === dayIdx ? { ...d, [meal]: fresh } : d));
            update({ ...plan, days });
          },
        }),
        h("label", { class: "keep" },
          h("input", {
            type: "checkbox", checked: slot.locked, "aria-label": `Keep ${MEAL_LABEL[meal]} on ${dayName(plan, dayIdx)}`,
            onchange: (e) => {
              const days = plan.days.map((d, k) => (k === dayIdx ? { ...d, [meal]: { ...d[meal], locked: e.target.checked } } : d));
              update({ ...plan, days });
            },
          }),
          " Keep"),
      ),
    );
  }

  // The reminders for the dates on screen: how you will cook, which days you plan, shop and batch cook, and the calendar file.
  function reminderBox() {
    const settings = loadReminderSettings();
    const status = h("p", { class: "reminder-status", id: "prep-status", "aria-live": "polite" });
    const preview = h("details", { class: "reminder-preview" });
    const refresh = () => {
      const events = buildReminders(plan, settings);
      preview.replaceChildren(h("summary", { text: `What's in the reminders file for ${rangeLabel(plan)} (${events.length} reminders)` }), h("ul", {}, events.map((e) => h("li", { text: describeReminder(e) }))));
    };
    const pick = (id, label, options, value, onPick) => h("label", { class: "activity" }, label, " ",
      h("select", { id, onchange: (e) => onPick(e.target.value) }, options.map(([v, text]) => h("option", { value: String(v), selected: String(v) === String(value), text }))));
    const set = (key) => (v) => { settings[key] = key === "time" ? v : Number(v); saveReminderSettings(settings); refresh(); status.textContent = ""; };

    const controls = [
      pick("cook-mode", `For ${rangeLabel(plan)} I will`, [["fresh", "cook fresh each day"], ["batch", "batch cook on the weekend"]], plan.mode, (v) => update({ ...plan, mode: v })),
      pick("set-plan-day", "Plan on", [[3, "Wednesday"], [4, "Thursday"]], settings.planDay, set("planDay")),
      pick("set-shop-day", "Shop on", [[6, "Saturday"], [0, "Sunday"]], settings.shopDay, set("shopDay")),
      ...(plan.mode === "batch" ? [pick("set-batch-day", "Batch cook on", [[6, "Saturday"], [0, "Sunday"]], settings.batchDay, set("batchDay"))] : []),
      pick("prep-time", "Evening reminders at", PREP_TIMES.map((x) => [x, timeLabel(x)]), settings.time, set("time")),
    ];
    refresh();
    return h("details", { class: "prep-box" },
      h("summary", { text: "Reminders on my phone (Google Calendar)" }),
      h("p", {},
        "One calendar file holds every nudge for the dates you are planning: plan, shopping list, batch cooking (if you chose it) and each evening's prep, including sprouts and soaking that must start early."),
      h("div", { class: "prep-controls" }, controls),
      h("div", { class: "prep-controls" },
        h("button", {
          id: "prep-download", class: "btn primary", type: "button", text: `Download reminders for ${rangeLabel(plan)}`,
          onclick: () => {
            const n = downloadReminders(plan, settings);
            status.textContent = n
              ? `Downloaded ${n} reminders. Import the file into Google Calendar (steps below). If you change the plan or the settings, download again. Calendar apps usually update the same events; if you see duplicates, delete the old ones.`
              : "Nothing to add: every reminder for this week has already passed.";
          },
        })),
      status,
      preview,
      h("details", { class: "reminder-preview" },
        h("summary", { text: "How to get these on your phone, with email (Google Calendar)" }),
        h("ol", {},
          h("li", { text: "On your laptop, open calendar.google.com. Next to \"Other calendars\" click + and choose Create new calendar. Name it Meal prep." }),
          h("li", { text: "Open the settings for Meal prep and, under Event notifications, add the alerts you want: a notification (this reaches your phone) and an email, for example 10 minutes before." }),
          h("li", { text: "In Settings, choose Import & export, pick the downloaded file, choose the Meal prep calendar as the destination and click Import." }),
          h("li", { text: "Each time you plan a week, download and import again. The Google Calendar app on your phone shows the same reminders." })),
        h("p", { class: "shopping-note", text: "I can't see inside your Google Calendar, so check one imported reminder to confirm it shows the alerts you set. If a switch from batch to fresh leaves an old Batch cook event behind, delete it there." })),
    );
  }

  function render() {
    body.replaceChildren();
    const n = daysBetween(range.start, range.end);
    if (plan) { two.on = !!plan.people; if (plan.people) two.people = plan.people.map(cleanPerson); } // show what this plan was made for

    if (!plan) {
      const people = two.on ? two.people : [cleanPerson({ gender, kg: bodyKg, activity })];
      body.append(
        h("div", { class: "plan-empty" },
          h("div", { class: "plan-controls" }, modePicker(), ...(two.on ? [] : [genderPicker(), weightPicker(), activityPicker()])),
          two.on ? peoplePanel() : null,
          h("button", { id: "plan-pick", class: "btn primary", type: "button", onclick: () => update(newPlan(null, activity, range.start, range.end, two.on ? copyPeople() : null)), text: "Pick my meals" }),
          targetsBox(people),
        ),
      );
      return;
    }

    const first = parseIso(plan.start);
    const people = peopleOf(plan);
    const two_ = people.length === 2;
    const dayKcals = people.map(personKcal);
    const total = people.map(() => ({ kcal: 0, p: 0, c: 0, f: 0 }));
    let balanced = 0;

    const dayCards = plan.days.map((_, i) => {
      const date = addDays(first, i);
      const all = MEALS.flatMap((m) => plan.days[i][m].items);
      const dayLines = people.map((q, k) => {
        const t = totalsOf(all, k);
        const sh = sharesOf(t);
        Object.keys(total[k]).forEach((key) => { total[k][key] += t[key]; });
        const ok = Math.abs(t.kcal / dayKcals[k] - 1) <= 0.08 && inWindow(sh, WINDOWS[0]);
        return h("p", { class: "day-total" },
          two_ ? h("span", { class: "who", text: `${nameOf(q, k)}: ` }) : null,
          h("strong", { text: `${Math.round(t.kcal / 10) * 10} kcal` }),
          ` · protein ${Math.round(t.p)} g (${pct(sh.p)}) · carbs ${Math.round(t.c)} g (${pct(sh.c)}) · fat ${Math.round(t.f)} g (${pct(sh.f)}) `,
          h("span", { class: ok ? "badge ok" : "badge close", text: ok ? "✓ Day on target" : "Day close to target" }));
      });
      MEALS.forEach((m) => {
        const tg = targetsFor(people, m);
        if (people.every((_q, k) => !checkMeal(plan.days[i][m].items, tg[k], k).issues.length)) balanced++;
      });
      return h("article", { class: "plan-day" },
        h("header", {}, h("h3", {}, dayName(plan, i), h("span", { text: ` · ${dateLabel(date)}` })), ...dayLines),
        h("div", { class: "meals" }, MEALS.map((m) => mealBlock(i, m))),
      );
    });
    const days = plan.days.length;
    const avg = (t) => `${Math.round(t.kcal / days / 10) * 10} kcal, ${Math.round(t.p / days)} g protein, ${Math.round(t.c / days)} g carbs and ${Math.round(t.f / days)} g fat`;
    const shareStatus = h("span", { id: "share-status", class: "range-msg", role: "status" });

    body.append(
      h("p", { class: "plan-week", text: `Planning ${rangeLabel(plan)} (${days} day${days === 1 ? "" : "s"})` }),
      h("div", { class: "plan-toolbar" },
        modePicker(),
        ...(two_ ? [] : [genderPicker(), weightPicker(), activityPicker()]),
        h("button", { id: "plan-again", class: "btn primary", type: "button", onclick: () => update(newPlan(plan, plan.activity)), text: "Pick again (keeps meals marked Keep)" }),
      ),
      two_ ? peoplePanel() : null,
      h("div", { class: "plan-minor" },
        h("button", { id: "share-plan", class: "btn small", type: "button", text: "Copy link to share this plan", onclick: () => {
          const url = location.origin === "null" || location.protocol === "file:" ? `${location.href.split("#")[0]}#share=${encodePlan(plan)}` : `${location.origin}${location.pathname}#share=${encodePlan(plan)}`;
          const done = () => { shareStatus.textContent = "Link copied. Anyone who opens it gets this exact plan."; };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => window.prompt("Copy this link:", url));
          else window.prompt("Copy this link:", url);
        } }),
        h("button", { class: "btn small", type: "button", onclick: () => { document.body.classList.add("print-plan"); window.print(); document.body.classList.remove("print-plan"); }, text: "Print plan" }),
        h("button", { class: "btn small", type: "button", onclick: () => { delete plans[planKey()]; saveStore(plans, null); plan = null; render(); refreshSaved(); }, text: "Clear this plan" }),
        shareStatus,
      ),
      reminderBox(),
      targetsBox(people),
      h("p", { class: "plan-total", text: two_
        ? `${balanced} of ${days * 3} meals are balanced for both of you. ${days > 1 ? "Daily average" : "Total"}: ${people.map((q, k) => `${nameOf(q, k)} ${avg(total[k])}`).join("; ")}.`
        : `${balanced} of ${days * 3} meals are balanced. ${days > 1 ? "Daily average" : "Total"}: ${avg(total[0])}.` }),
      h("div", { class: "plan-days" }, dayCards),
    );

    // shopping list: every recipe used in this plan, with the servings you will eat
    const planned = {};
    plan.days.forEach((d) => MEALS.forEach((m) => d[m].items.forEach(({ id, s, s2 }) => { planned[id] = (planned[id] || 0) + s + (plan.people ? s2 : 0); })));
    const shopping = h("details", { class: "shopping" }, h("summary", { text: "Shopping list (tick what you already have)" }),
      h("p", { class: "shopping-note", text: "Each list is the full recipe. The line under each name says how many servings this plan uses, so you can scale the amounts down or cook the full recipe and keep the rest." }));
    Object.keys(planned).forEach((id) => {
      const { r } = byId[id];
      const done = new Set(plan.done[id] || []);
      const list = h("ul", { class: "shopping-list" });
      flatLines(r).forEach((line, idx) => {
        if (line.group) list.append(h("li", { class: "shopping-group", text: line.group }));
        list.append(h("li", {}, h("label", {},
          h("input", {
            type: "checkbox", checked: done.has(idx),
            onchange: (e) => {
              const now = new Set(plan.done[id] || []);
              if (e.target.checked) now.add(idx); else now.delete(idx);
              plan.done = { ...plan.done, [id]: [...now] };
              saveStore(plans, planKey());
            },
          }),
          ` ${line.text}`)));
      });
      shopping.append(
        h("h3", { text: r.name }),
        h("p", { class: "shopping-servings", text: `The recipe makes ${r.macros.servings} servings. This plan uses ${fmtServ(planned[id])}${plan.people ? " for both of you" : ""}.` }),
        list,
      );
    });
    body.append(shopping);
  }

  render();
  refreshSaved();
  rangeMsg.textContent = importedMsg || rangeSummary(range.start, range.end);
  return section;
}

document.getElementById("sections").appendChild(plannerSectionEl());
if (location.hash.length > 1) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) target.scrollIntoView({ behavior: "instant" });
}
