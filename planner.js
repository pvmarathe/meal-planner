// Meal Planner: the landing page (weekly meal planner).

// ----- Weekly meal planner -----
// Builds a breakfast, lunch and dinner for each day of next week. Every meal is made of 1 to 3 dishes
// at portion sizes chosen so the meal hits its calorie target and its protein / carb / fat split.
// The plan is saved in this browser only (localStorage).

// General daily energy levels for an adult, based on ICMR-NIN 2020 figures as reported in published summaries.
const ACTIVITY = {
  sedentary: { label: "Sedentary (desk job)", kcal: 2110 },
  moderate: { label: "Moderately active", kcal: 2710 },
  heavy: { label: "Heavy physical work", kcal: 3470 },
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
// Body weight (optional). The calorie levels above are for a 65 kg adult; with a weight entered, they scale in proportion.
const WEIGHT_KEY = "meal-planner-weight";
const BASE_KG = 65, MIN_KG = 40, MAX_KG = 100;
let bodyKg = null; // null means "not entered": use the 65 kg levels
try { const w = parseFloat(localStorage.getItem(WEIGHT_KEY)); if (w >= MIN_KG && w <= MAX_KG) bodyKg = w; } catch (e) { /* fine without saving */ }
const setBodyKg = (w) => { bodyKg = w; try { if (w) localStorage.setItem(WEIGHT_KEY, String(w)); else localStorage.removeItem(WEIGHT_KEY); } catch (e) { /* fine */ } };
const dailyKcal = (activity) => Math.round((ACTIVITY[activity].kcal * (bodyKg || BASE_KG)) / BASE_KG / 10) * 10;
const PLANS_KEY = "indian-protein-recipes-plans-v4"; // one saved plan for each date range
const V3_PLANS_KEY = "indian-protein-recipes-plans-v3"; // the earlier week-by-week plans, carried over once
const OLD_PLAN_KEY = "indian-protein-recipes-plan-v2"; // the very first single-plan format, carried over once
const MAX_DAYS = 14; // the longest range a plan can cover

const idOf = (r) => r.video.split("v=")[1];
const byId = {};
sections.forEach((s) => s.recipes.forEach((r) => { byId[idOf(r)] = { r, s }; }));

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

function totalsOf(items) {
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  items.forEach(({ id, s }) => {
    const m = byId[id].r.macros;
    t.kcal += m.kcal * s; t.p += m.p * s; t.c += m.c * s; t.f += m.f * s;
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
function solveMeal(meal, target, banned, level = 0) {
  let mains = POOLS[meal].main.filter((id) => !banned.has(id));
  if (!mains.length) mains = POOLS[meal].main;
  const sides = POOLS[meal].side.filter((id) => !banned.has(id));
  const stepsMain = [1, 1.5, 2, 2.5, 3];
  const stepsSide = [0.5, 1, 1.5, 2, 2.5, 3];
  const found = [];
  for (let n = 0; n < 6000; n++) {
    const items = [{ id: randomFrom(mains), s: randomFrom(stepsMain) }];
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
  if (!found.length) return level < WINDOWS.length - 1 ? solveMeal(meal, target, banned, level + 1) : null;
  found.sort((a, b) => a.score - b.score);
  const best = found.slice(0, Math.max(5, Math.ceil(found.length * 0.15)));
  return { items: randomFrom(best).items, locked: false };
}

// How a finished meal compares with the target: balanced, or which part is off.
function checkMeal(items, target) {
  const t = totalsOf(items);
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

function idsOfDay(day, except) {
  const ids = new Set();
  MEALS.forEach((m) => { if (m !== except && day[m]) day[m].items.forEach((i) => ids.add(i.id)); });
  return ids;
}
function mainsUsed(days, meal) {
  const used = new Set();
  days.forEach((d) => { if (d[meal]) d[meal].items.forEach((i) => { if (byId[i.id].r.meals[meal] === "main") used.add(i.id); }); });
  return used;
}

function buildDays(old, activity, n) {
  const days = Array.from({ length: n }, (_, i) => {
    const day = {};
    MEALS.forEach((m) => { if (old && old.days.length === n && old.days[i][m].locked) day[m] = old.days[i][m]; });
    return day;
  });
  days.forEach((day) => {
    MEALS.forEach((meal) => {
      if (day[meal]) return;
      const banned = new Set([...mainsUsed(days, meal), ...idsOfDay(day, meal)]);
      day[meal] = solveMeal(meal, mealTarget(activity, meal), banned) || { items: [{ id: POOLS[meal].main[0], s: 1 }], locked: false };
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

function newPlan(old, activity, start, end) {
  const s = start || old.start;
  const e = end || old.end;
  const act = activity || (old && old.activity) || "sedentary";
  const days = buildDays(old, act, daysBetween(s, e));
  const used = new Set(days.flatMap((d) => MEALS.flatMap((m) => d[m].items.map((i) => i.id))));
  const done = old ? Object.fromEntries(Object.entries(old.done || {}).filter(([id]) => used.has(id))) : {};
  return { start: s, end: e, activity: act, mode: (old && old.mode) || "fresh", days, done };
}

const validPlan = (p) => !!p && typeof p.start === "string" && typeof p.end === "string" && !!ACTIVITY[p.activity] && Array.isArray(p.days)
  && p.days.length >= 1 && p.days.length <= MAX_DAYS && p.days.length === daysBetween(p.start, p.end)
  && p.days.every((d) => MEALS.every((m) => d[m] && Array.isArray(d[m].items) && d[m].items.length && d[m].items.every((i) => byId[i.id])));

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

function targetsBox(activity) {
  const kcal = dailyKcal(activity);
  const g = (share, per) => Math.round((kcal * share) / per);
  const w = WINDOWS[0];
  return h("div", { class: "targets" },
    h("p", {},
      h("strong", { text: `Daily target: about ${kcal} kcal` }),
      ` (${ACTIVITY[activity].label.toLowerCase()}). Each day is split into breakfast ${pct(MEAL_SPLIT.breakfast)}, lunch ${pct(MEAL_SPLIT.lunch)} and dinner ${pct(MEAL_SPLIT.dinner)} of those calories. ${bodyKg ? `Scaled to your weight of ${bodyKg} kg, as a rough guide.` : `These are general levels for a 65 kg adult; enter your weight above to scale them.`}`),
    h("ul", {},
      h("li", { text: `Protein: ${pct(w.p[0])} to ${pct(w.p[1])} of calories (${g(w.p[0], 4)} to ${g(w.p[1], 4)} g a day), ideally about ${pct(IDEAL.p)}. The Indian minimum allowance is about ${PROTEIN_RDA_G_PER_KG} g for every kg of body weight a day${bodyKg ? `, which is about ${Math.round(PROTEIN_RDA_G_PER_KG * bodyKg)} g at ${bodyKg} kg` : ""}.` }),
      h("li", { text: `Carbs: ${pct(w.c[0])} to ${pct(w.c[1])} of calories (${g(w.c[0], 4)} to ${g(w.c[1], 4)} g a day), ideally about ${pct(IDEAL.c)}.` }),
      h("li", { text: `Fat: ${pct(w.f[0])} to ${pct(w.f[1])} of calories (${g(w.f[0], 9)} to ${g(w.f[1], 9)} g a day), ideally about ${pct(IDEAL.f)}.` }),
    ),
  );
}

function plannerSectionEl() {
  const section = h("section", { id: "plan", "aria-labelledby": "plan-heading" });
  const body = h("div", { id: "plan-body" });

  const store = loadStore();
  const plans = store.plans;
  const firstRange = store.last ? { start: plans[store.last].start, end: plans[store.last].end } : { start: isoDate(defaultWeek()), end: isoDate(addDays(defaultWeek(), 6)) };
  let range = firstRange;
  let plan = plans[rangeKey(range.start, range.end)] || null;
  let activity = plan ? plan.activity : "sedentary";
  const planKey = () => rangeKey(range.start, range.end);

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
    h("p", { class: "week-question", id: "range-question", text: "Which dates are you planning for?" }),
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
    h("h2", { id: "plan-heading", text: "Plan my meals" }),
    h("p", {
      class: "section-note",
      text: `Choose any dates, from one day up to ${MAX_DAYS} days. It builds a breakfast, lunch and dinner for each day. Each meal combines 1 to 3 dishes and scales the portions so the meal reaches its calorie target and a healthy split of protein, carbs and fat. Each plan is saved in this browser.`,
    }),
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

  function mealBlock(dayIdx, meal) {
    const slot = plan.days[dayIdx][meal];
    const target = mealTarget(plan.activity, meal);
    const { t, sh, issues } = checkMeal(slot.items, target);

    const lines = slot.items.map(({ id, s }) => {
      const { r } = byId[id];
      return h("li", {},
        h("strong", { text: `${fmtServ(s)} × ` }),
        h("a", { href: `recipes.html#r-${id}`, text: r.name }),
        " ", h("a", { class: "watch", href: r.video, target: "_blank", rel: "noopener noreferrer", "aria-label": `Watch ${r.name} on YouTube`, text: "▶" }),
        h("span", { class: "serving-note", text: `1 serving = ${r.macros.serving}` }),
      );
    });

    return h("div", { class: "meal" },
      h("p", { class: "meal-label" }, MEAL_LABEL[meal], h("span", { text: ` · target ${Math.round(target / 5) * 5} kcal` })),
      h("ul", { class: "meal-items" }, lines),
      h("p", { class: "meal-macros" },
        h("strong", { text: `${Math.round(t.kcal / 5) * 5} kcal` }),
        ` · protein ${fmt(t.p)} g (${pct(sh.p)}) · carbs ${fmt(t.c)} g (${pct(sh.c)}) · fat ${fmt(t.f)} g (${pct(sh.f)})`),
      issues.length
        ? h("p", { class: "badge close", text: `Close: ${issues.join(", ")}` })
        : h("p", { class: "badge ok", text: "✓ Balanced for this meal" }),
      h("div", { class: "meal-actions" },
        h("button", {
          class: "btn small", type: "button", "aria-label": `Replace ${MEAL_LABEL[meal]} on ${dayName(plan, dayIdx)}`, text: "Reroll",
          onclick: () => {
            const day = plan.days[dayIdx];
            const banned = new Set([...mainsUsed(plan.days, meal), ...idsOfDay(day, meal)]);
            const fresh = solveMeal(meal, target, banned);
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
    return h("div", { class: "prep-box" },
      h("p", {}, h("strong", { text: "Reminders on your phone. " }),
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

    if (!plan) {
      body.append(
        h("div", { class: "plan-empty" },
          h("p", { text: `No plan yet for ${rangeLabel(range)} (${n} day${n === 1 ? "" : "s"}).` }),
          weightPicker(),
          activityPicker(),
          targetsBox(activity),
          h("button", { id: "plan-pick", class: "btn primary", type: "button", onclick: () => update(newPlan(null, activity, range.start, range.end)), text: "Pick my meals" }),
        ),
      );
      return;
    }

    const first = parseIso(plan.start);
    const dayKcal = dailyKcal(plan.activity);
    const total = { kcal: 0, p: 0, c: 0, f: 0 };
    let balanced = 0;

    const dayCards = plan.days.map((_, i) => {
      const date = addDays(first, i);
      const all = MEALS.flatMap((m) => plan.days[i][m].items);
      const t = totalsOf(all);
      const sh = sharesOf(t);
      Object.keys(total).forEach((k) => { total[k] += t[k]; });
      MEALS.forEach((m) => { if (!checkMeal(plan.days[i][m].items, mealTarget(plan.activity, m)).issues.length) balanced++; });
      const dayOk = Math.abs(t.kcal / dayKcal - 1) <= 0.08 && inWindow(sh, WINDOWS[0]);
      return h("article", { class: "plan-day" },
        h("header", {},
          h("h3", {}, dayName(plan, i), h("span", { text: ` · ${dateLabel(date)}` })),
          h("p", { class: "day-total" },
            h("strong", { text: `${Math.round(t.kcal / 10) * 10} kcal` }),
            ` · protein ${Math.round(t.p)} g (${pct(sh.p)}) · carbs ${Math.round(t.c)} g (${pct(sh.c)}) · fat ${Math.round(t.f)} g (${pct(sh.f)}) `,
            h("span", { class: dayOk ? "badge ok" : "badge close", text: dayOk ? "✓ Day on target" : "Day close to target" })),
        ),
        h("div", { class: "meals" }, MEALS.map((m) => mealBlock(i, m))),
      );
    });
    const days = plan.days.length;

    body.append(
      h("p", { class: "plan-week", text: `Planning ${rangeLabel(plan)} (${days} day${days === 1 ? "" : "s"})` }),
      h("div", { class: "plan-toolbar" },
        weightPicker(),
        activityPicker(),
        h("button", { id: "plan-again", class: "btn primary", type: "button", onclick: () => update(newPlan(plan, plan.activity)), text: "Pick again (keeps meals marked Keep)" }),
        h("button", { class: "btn", type: "button", onclick: () => { document.body.classList.add("print-plan"); window.print(); document.body.classList.remove("print-plan"); }, text: "Print plan" }),
        h("button", { class: "btn", type: "button", onclick: () => { delete plans[planKey()]; saveStore(plans, null); plan = null; render(); refreshSaved(); }, text: "Clear this plan" }),
      ),
      reminderBox(),
      targetsBox(plan.activity),
      h("p", { class: "plan-total", text: `${balanced} of ${days * 3} meals are balanced. ${days > 1 ? "Daily average" : "Total"}: ${Math.round(total.kcal / days / 10) * 10} kcal, ${Math.round(total.p / days)} g protein, ${Math.round(total.c / days)} g carbs and ${Math.round(total.f / days)} g fat.` }),
      h("div", { class: "plan-days" }, dayCards),
    );

    // shopping list: every recipe used in this plan, with the servings you will eat
    const planned = {};
    plan.days.forEach((d) => MEALS.forEach((m) => d[m].items.forEach(({ id, s }) => { planned[id] = (planned[id] || 0) + s; })));
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
        h("p", { class: "shopping-servings", text: `The recipe makes ${r.macros.servings} servings. This plan uses ${fmtServ(planned[id])}.` }),
        list,
      );
    });
    body.append(shopping);
  }

  render();
  refreshSaved();
  rangeMsg.textContent = rangeSummary(range.start, range.end);
  return section;
}

document.getElementById("sections").appendChild(plannerSectionEl());
if (location.hash.length > 1) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) target.scrollIntoView({ behavior: "instant" });
}
