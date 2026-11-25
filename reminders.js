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
// Servings for one person ("2"), or for two people ("2 + 1½": the first person's portion, then the partner's)
const servText = (it) => (typeof it.s2 === "number" ? `${fmtServ(it.s)} + ${fmtServ(it.s2)}` : fmtServ(it.s));
const mealLine = (day, m) => `${MEAL_LABEL[m]}: ${day[m].items.map((it) => `${servText(it)} x ${byId[it.id].r.name}`).join(" + ")}`;
const uniqueDishes = (day) => [...new Map(dayItems(day).map((i) => [i.id, byId[i.id]])).values()];

// Things to start ahead of time. These go by the dish name and section, so they are reminders, not exact timings.
function prepTips(day, mode) {
  const dishes = uniqueDishes(day);
  const tips = [];
  const batter = dishes.filter((d) => d.s.id === "idlis" || d.s.id === "dosas").map((d) => d.r.name);
  if (batter.length) tips.push(`${batter.join(", ")}: the batter may need soaking, grinding or fermenting. Check the video for the timing.`);
  const soak = dishes.filter((d) => /rajma|kala chana|chole|chickpea/i.test(d.r.name)).map((d) => d.r.name);
  if (soak.length) tips.push(`${soak.join(", ")}: rajma and chickpeas usually need an overnight soak.`);
  const ahead = dishes.filter((d) => dishKind(d.r.id || idOf(d.r)) === "ahead");
  if (mode === "batch" && ahead.length) tips.push(`${ahead.map((d) => d.r.name).join(", ")}: if you froze it, move it to the fridge tonight to thaw. Reheat until steaming hot.`);
  const eggs = dishes.filter((d) => /boiled eggs/i.test(d.r.name)).map((d) => d.r.name);
  if (eggs.length) tips.push("Boiled Eggs: boil them tonight in one batch and keep them in the fridge, so breakfast is ready.");
  return tips;
}
const sproutDishes = (day) => uniqueDishes(day).filter((d) => /sprout/i.test(d.r.name)).map((d) => d.r.name);

// "Prep once, use all week" suggestions for the shopping-day email. Each one only appears when enough of the week's dishes use that ingredient.
// The storage times come from the Masala Lab meal prep video (fridge 3 to 4 days and freezer 2 to 3 months for dal; frozen cubes up to 6 months).
function prepOnce(plan) {
  const seen = new Map();
  plan.days.forEach((day) => dayItems(day).forEach((it) => seen.set(it.id, byId[it.id])));
  const dishes = [...seen.values()].filter((d) => d && d.r && d.r.ingredients);
  const text = (d) => flatLines(d.r).map((l) => l.text).join(" | ").toLowerCase();
  const withWord = (re) => dishes.filter((d) => re.test(text(d)));
  const names = (list) => list.slice(0, 4).map((d) => d.r.name).join(", ") + (list.length > 4 ? ` and ${list.length - 4} more` : "");
  const tips = [];
  const dal = dishes.filter((d) => /\b(dal|dhal|lentil|moong|masoor|toor|tur|rajma|chana|chole|chickpea)\b/i.test(d.r.name) && !/sprout|salad|chaat|idli|dosa|dhokla|chilla|paratha|soup|patties|roti/i.test(d.r.name));
  if (dal.length >= 2) tips.push({ icon: "🫘", title: "Cook the dal in bulk", text: `${dal.length} dishes this week are dal or beans (${names(dal)}). Pressure-cook them together and portion into containers. They keep 3 to 4 days in the fridge or 2 to 3 months in the freezer. Thick dal loosens with a splash of water when reheated.` });
  const gravy = withWord(/onion/).filter((d) => /tomato/.test(text(d)) && /masala|curry|gravy|sabzi|korma|kofta|makhani|chole|rajma|palak paneer|paneer/i.test(d.r.name) && !/salad|raita|chaat|paratha|dal\b/i.test(d.r.name));
  if (gravy.length >= 3) tips.push({ icon: "🍅", title: "Make one onion-tomato base gravy", text: `${gravy.length} dishes start from onion and tomato (${names(gravy)}). Cook a big batch once, cool it and freeze it in portions. Then every gravy is about 10 minutes away.` });
  const onions = withWord(/onion/).filter((d) => !/salad|raita|chaat|omelette/i.test(d.r.name));
  if (onions.length >= 4) tips.push({ icon: "🧅", title: "Chop and freeze the onions", text: `${onions.length} dishes use onion. Chop it all at once, spread it on a tray, freeze until solid, then bag it. It turns softer when cooked, which is fine for curries and gravies. Not for salads.` });
  const gg = withWord(/\b(ginger|garlic)\b/);
  if (gg.length >= 3) tips.push({ icon: "🧄", title: "Ginger-garlic cubes", text: `${gg.length} dishes use ginger or garlic. Blend them, pour into an ice cube tray and freeze. They last up to 6 months, and one cube goes straight into hot oil (watch the splatter).` });
  const coco = withWord(/coconut/);
  if (coco.length >= 2) tips.push({ icon: "🥥", title: "Freeze coconut in cubes", text: `${coco.length} dishes use coconut (${names(coco)}). Freeze the milk or paste in an ice cube tray and drop a cube into the curry at the end.` });
  const rice = dishes.filter((d) => /\b(rice|khichdi|pulao|biryani|pongal)\b/i.test(d.r.name) || /\bcooked rice\b/.test(text(d)));
  if (rice.length >= 2) tips.push({ icon: "🍚", title: "Cook the rice once and chill it", text: `${rice.length} dishes use rice. Cook a large batch, cool it, press it flat in bags and freeze or refrigerate. According to the video, chilled and reheated rice raises blood sugar less than fresh rice.` });
  const roti = dishes.filter((d) => /\b(roti|paratha|chapati|phulka|thepla)\b/i.test(d.r.name));
  if (roti.length >= 1) tips.push({ icon: "🫓", title: "Freeze rolled dough or cooked rotis", text: `${names(roti)}: freeze dough balls and thaw them 30 minutes before rolling, or stack cooked rotis with paper between them and reheat from frozen on a hot tawa for about 90 seconds.` });
  const eggs = dishes.filter((d) => /boiled eggs/i.test(d.r.name));
  if (eggs.length) tips.push({ icon: "🥚", title: "Boil the eggs in one batch", text: "Boiled eggs are in the plan. Boil them all at once, keep them in the fridge, and have two with a meal for about 12 g of protein." });
  return tips.slice(0, 5);
}

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
    MEALS.forEach((m) => plan.days[i][m].items.forEach((it) => {
      groups[dishKind(it.id)].push(`${dayName(plan, i).slice(0, 3)} ${m}: ${servText(it)} x ${byId[it.id].r.name}`);
    }));
  }
  const lines = [`Batch cook for ${dayName(plan, 0)}${last ? ` to ${dayName(plan, last)}` : ""}.`, ""];
  if (groups.ahead.length) lines.push("Cook now (usually keeps 2 to 3 days in the fridge; dals and beans also freeze for 2 to 3 months):", ...groups.ahead.map((x) => "- " + x), "");
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
    lines: ["Open PlanMate on your laptop, choose your dates and pick your meals.", `You shop on ${WEEKDAY_NAMES[settings.shopDay]}, so plan before then.`,
      "Choose batch cook or cook fresh, then download the new reminders and import them into Google Calendar."],
  });

  const menu = [];
  plan.days.forEach((day, i) => { menu.push(`${dayOf(i)}:`); MEALS.forEach((m) => menu.push("  " + mealLine(day, m))); });
  const eatenServings = {};
  plan.days.forEach((day) => dayItems(day).forEach(({ id, s, s2 }) => { eatenServings[id] = (eatenServings[id] || 0) + s + (typeof s2 === "number" ? s2 : 0); }));

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
      const tips = prepTips(plan.days[tomorrow], plan.mode);
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
