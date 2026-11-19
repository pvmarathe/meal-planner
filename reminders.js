// Weekly reminders: one calendar file (.ics) holding every nudge for a planned week.
// The functions below use helpers from common.js and planner.js (byId, MEALS, fmtServ, isoDate, parseIso, dateLabel, rangeLabel),
// which all exist by the time they are called.

const REMINDER_KEY = "indian-protein-recipes-reminders-v1";
const OLD_TIME_KEY = "indian-protein-recipes-prep-time";
const PREP_TIMES = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const RRULE_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const timeLabel = (hhmm) => { const [hr, mi] = hhmm.split(":").map(Number); return `${hr > 12 ? hr - 12 : hr}:${String(mi).padStart(2, "0")} pm`; };
const clockLabel = (d) => d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// ----- settings: which days to plan, shop and batch cook, and what time evening reminders arrive -----
function loadReminderSettings() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(REMINDER_KEY) || "{}") || {}; } catch (e) { s = {}; }
  let oldTime = null;
  try { oldTime = localStorage.getItem(OLD_TIME_KEY); } catch (e) { /* ignore */ }
  return {
    planDay: [3, 4].includes(s.planDay) ? s.planDay : 3, // Wednesday or Thursday
    shopDay: [6, 0].includes(s.shopDay) ? s.shopDay : 6, // Saturday or Sunday
    batchDay: [6, 0].includes(s.batchDay) ? s.batchDay : 0,
    time: PREP_TIMES.includes(s.time) ? s.time : PREP_TIMES.includes(oldTime) ? oldTime : "20:30",
  };
}
function saveReminderSettings(s) {
  try { localStorage.setItem(REMINDER_KEY, JSON.stringify(s)); } catch (e) { /* the page still works without saving */ }
}

// ----- what to say about the dishes -----
const dayItems = (day) => MEALS.flatMap((m) => day[m].items);
const mealLine = (day, m) => `${MEAL_LABEL[m]}: ${day[m].items.map(({ id, s }) => `${fmtServ(s)} x ${byId[id].r.name}`).join(" + ")}`;
const uniqueDishes = (day) => [...new Map(dayItems(day).map((i) => [i.id, byId[i.id]])).values()];

// Things to start ahead of time. These go by the dish name and section, so they are reminders, not exact timings.
function prepTips(day) {
  const dishes = uniqueDishes(day);
  const tips = [];
  const batter = dishes.filter((d) => d.s.id === "idlis" || d.s.id === "dosas").map((d) => d.r.name);
  if (batter.length) tips.push(`${batter.join(", ")}: the batter may need soaking, grinding or fermenting. Check the video for the timing.`);
  const soak = dishes.filter((d) => /rajma|kala chana|chole|chickpea/i.test(d.r.name)).map((d) => d.r.name);
  if (soak.length) tips.push(`${soak.join(", ")}: rajma and chickpeas usually need an overnight soak.`);
  return tips;
}
const sproutDishes = (day) => uniqueDishes(day).filter((d) => /sprout/i.test(d.r.name)).map((d) => d.r.name);

// Which dishes can be cooked ahead on a weekend: one-pot dishes and dals keep a few days, batters can be made ahead, the rest is best fresh.
function dishKind(id) {
  const { r, s } = byId[id];
  if (s.id === "idlis" || s.id === "dosas") return "batter";
  if (s.id === "instantpot" || /\b(khichdi|pulao|pongal|biryani|soup|sambar)\b/i.test(r.name)) return "ahead";
  return "fresh";
}
function batchLines(plan) {
  const groups = { ahead: [], batter: [], fresh: [] };
  const last = Math.min(2, plan.days.length - 1);
  for (let i = 0; i <= last; i++) {
    MEALS.forEach((m) => plan.days[i][m].items.forEach(({ id, s }) => {
      groups[dishKind(id)].push(`${dayName(plan, i).slice(0, 3)} ${m}: ${fmtServ(s)} x ${byId[id].r.name}`);
    }));
  }
  const lines = [`Batch cook for ${dayName(plan, 0)}${last ? ` to ${dayName(plan, last)}` : ""}.`, ""];
  if (groups.ahead.length) lines.push("Cook now (usually keeps 2 to 3 days in the fridge):", ...groups.ahead.map((x) => "- " + x), "");
  if (groups.batter.length) lines.push("Make the batter now (check each video for soaking and fermenting time):", ...groups.batter.map((x) => "- " + x), "");
  if (groups.fresh.length) lines.push("Best cooked fresh on the day:", ...groups.fresh.map((x) => "- " + x));
  return lines;
}

// ----- building the events -----
const atTime = (date, hhmm) => { const [hr, mi] = hhmm.split(":").map(Number); return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hr, mi); };

function buildReminders(plan, settings, now = new Date()) {
  const first = parseIso(plan.start);
  const count = plan.days.length;
  const evening = (d) => atTime(d, settings.time);
  const dateOf = (i) => addDays(first, i);
  const dayOf = (i) => `${dayName(plan, i)} ${dateLabel(dateOf(i))}`;
  const lastBefore = (weekday) => { let d = addDays(first, -1); while (d.getDay() !== weekday) d = addDays(d, -1); return d; }; // the latest such weekday before the plan starts
  const shopDate = lastBefore(settings.shopDay);
  const batchDate = lastBefore(settings.batchDay);
  const events = [];

  // 1. Plan your next meals (repeats every week, so you only import it once)
  let d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (d.getDay() !== settings.planDay || evening(d) <= now) d = addDays(d, 1);
  events.push({
    uid: "plan-next-week", start: evening(d), rrule: `FREQ=WEEKLY;BYDAY=${RRULE_DAYS[settings.planDay]}`, summary: "Plan next week's meals",
    lines: ["Open the meal planner on your laptop, choose your dates and pick your meals.", `You shop on ${WEEKDAY_NAMES[settings.shopDay]}, so plan before then.`,
      "Choose batch cook or cook fresh, then download the new reminders and import them into Google Calendar."],
  });

  const menu = [];
  plan.days.forEach((day, i) => { menu.push(`${dayOf(i)}:`); MEALS.forEach((m) => menu.push("  " + mealLine(day, m))); });
  const eatenServings = {};
  plan.days.forEach((day) => dayItems(day).forEach(({ id, s }) => { eatenServings[id] = (eatenServings[id] || 0) + s; }));

  // 2. The evening before shopping
  events.push({
    uid: `shop-eve-${plan.start}`, start: evening(addDays(shopDate, -1)), summary: `Shopping tomorrow: check your list (${rangeLabel(plan)})`,
    lines: [`You shop tomorrow (${WEEKDAY_NAMES[shopDate.getDay()]}). This is the menu for ${rangeLabel(plan)}:`, "", ...menu, "",
      "Check what you already have at home first. The full ingredient list is in the planner on your laptop."],
  });
  // 3. Shopping day
  events.push({
    uid: `shop-day-${plan.start}`, start: atTime(shopDate, "09:00"), summary: `Shopping day: ingredients for ${rangeLabel(plan)}`,
    lines: ["Buy ingredients for these dishes (servings in this plan):", ...Object.entries(eatenServings).map(([id, s]) => `- ${byId[id].r.name}: ${fmtServ(s)}`), "",
      "The full ingredient list is in the planner on your laptop."],
  });
  // 4. Batch cooking (only when this plan is a batch-cook plan)
  if (plan.mode === "batch") {
    const lastBatchDay = Math.min(2, count - 1);
    events.push({
      uid: `batch-${plan.start}`, start: atTime(batchDate, isoDate(batchDate) === isoDate(shopDate) ? "15:00" : "10:00"),
      summary: `Batch cook for ${dayName(plan, 0)}${lastBatchDay ? ` to ${dayName(plan, lastBatchDay)}` : ""}`, lines: batchLines(plan),
    });
  }
  // 5. Every evening: tomorrow's meals, and sprouts that must be started two days ahead
  for (let off = -2; off <= count - 2; off++) {
    const tomorrow = off + 1, sproutFor = off + 2;
    const sprouts = sproutFor >= 0 && sproutFor < count ? sproutDishes(plan.days[sproutFor]) : [];
    const lines = [];
    let summary = "";
    if (sprouts.length) lines.push(`Start sprouting tonight for ${dayOf(sproutFor)}: ${sprouts.join(", ")}. Sprouts take 1 to 2 days, or buy them ready-made.`, "");
    if (tomorrow >= 0 && tomorrow < count) {
      lines.push(`Tomorrow, ${dayOf(tomorrow)}:`, ...MEALS.map((m) => mealLine(plan.days[tomorrow], m)));
      const tips = prepTips(plan.days[tomorrow]);
      if (tips.length) lines.push("", "Prep tonight:", ...tips.map((x) => "- " + x));
      summary = `Prep for tomorrow's meals (${dayName(plan, tomorrow)})`;
    }
    if (sprouts.length) summary = summary ? `${summary} + start sprouts` : "Start sprouting tonight";
    if (summary) events.push({ uid: `evening-${isoDate(dateOf(off))}`, start: evening(dateOf(off)), summary, lines });
  }
  // Leave out anything that has already passed (the repeating event always starts in the future)
  return events.filter((e) => e.start > now).sort((a, b) => a.start - b.start);
}

// ----- writing the calendar file -----
const icsText = (s) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
function icsFold(line) { // calendar files must wrap lines longer than 75 bytes
  const enc = new TextEncoder();
  const out = [];
  let cur = "";
  for (const ch of line) {
    if (enc.encode(cur + ch).length > 74) { out.push(cur); cur = " " + ch; } else cur += ch;
  }
  out.push(cur);
  return out.join("\r\n");
}
const pad2 = (n) => String(n).padStart(2, "0");
const icsLocal = (d) => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
const icsUtc = (d) => `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;

function remindersToIcs(events, now = new Date()) {
  const sequence = Math.floor(now.getTime() / 60000); // a newer file replaces older copies of the same event
  const items = events.map((e) => [
    "BEGIN:VEVENT", `UID:${e.uid}@indian-protein-recipes`, `DTSTAMP:${icsUtc(now)}`, `SEQUENCE:${sequence}`,
    `DTSTART:${icsLocal(e.start)}`, "DURATION:PT15M", ...(e.rrule ? [`RRULE:${e.rrule}`] : []),
    `SUMMARY:${icsText(e.summary)}`, `DESCRIPTION:${icsText(e.lines.join("\n"))}`,
    "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsText(e.summary)}`, "TRIGGER:PT0S", "END:VALARM",
    "END:VEVENT",
  ].map(icsFold).join("\r\n"));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Meal Planner//Reminders//EN", "CALSCALE:GREGORIAN", ...items, "END:VCALENDAR"].join("\r\n") + "\r\n";
}
function downloadReminders(plan, settings) {
  const events = buildReminders(plan, settings);
  if (!events.length) return 0;
  const a = h("a", { href: URL.createObjectURL(new Blob([remindersToIcs(events)], { type: "text/calendar" })), download: `meal-prep-reminders-${plan.start}.ics` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  return events.length;
}
function describeReminder(e) {
  const when = e.rrule
    ? `Every ${WEEKDAY_NAMES[e.start.getDay()]}, ${clockLabel(e.start)}`
    : `${WEEKDAY_NAMES[e.start.getDay()].slice(0, 3)} ${dateLabel(e.start)}, ${clockLabel(e.start)}`;
  return `${when}: ${e.summary}`;
}
