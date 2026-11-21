#!/usr/bin/env node
// Accountability agent helper: plans a week for one or two people and writes the emails.
// It reuses the web page's own planning code (data.js, common.js, reminders.js, core.js), so the plan matches the website exactly.
//
//   node agent/agent.js plan   --today 2026-11-18 --people '<json>' [--start auto|YYYY-MM-DD] [--days 7] [--mode fresh|batch] [--seed text] [--edits "reroll:2026-11-26:dinner:2;away:2026-11-24;back:2026-11-24;mode:batch"] [--out plan.json]
//   node agent/agent.js nudge  --plan-file plan.json --date YYYY-MM-DD [--kind morning|evening|all] [--time 20:30] [--shop-day 6] [--plan-day 3]
//   node agent/agent.js reroll --plan-file plan.json --date YYYY-MM-DD --meal breakfast|lunch|dinner [--seed text] --out plan.json   (swap one meal)
//   node agent/agent.js mode   --plan-file plan.json --mode fresh|batch --out plan.json
//   node agent/agent.js away   --plan-file plan.json --date YYYY-MM-DD [--undo] --out plan.json   (no meals or nudges for that day)
//   node agent/agent.js rebuild --id "<the Plan ID line from a plan email>" --people '<json>' --out plan.json   (rebuilds the exact same plan)
//   node agent/agent.js decode --code <text after #share=> --out plan.json
//   node agent/agent.js link   --plan-file plan.json
//
// Output is plain text. Each email starts with a SUBJECT: line, and emails are separated by a line of =====EMAIL=====.
// Nothing personal is stored in this folder: names, weights and email addresses are given on the command line.
// The page code looks for browser storage; there is none here, and that is fine.
Object.defineProperty(globalThis, "localStorage", { value: undefined, configurable: true });
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
for (const f of ["data.js", "common.js", "reminders.js", "core.js"]) vm.runInThisContext(fs.readFileSync(path.join(root, f), "utf8"), { filename: f });

const SITE = "https://pvmarathe.github.io/meal-planner/";
const args = {};
process.argv.slice(3).forEach((a, i, all) => { if (a.startsWith("--")) args[a.slice(2)] = all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : "true"; });
const cmd = process.argv[2];

const readPlan = () => JSON.parse(fs.readFileSync(args["plan-file"], "utf8"));
const planLink = (plan) => `${SITE}#plan=${encodeRecipe(plan, plan.pplCfg)}`; // short: dates, mode, changes and the people, not the whole plan
const people = (plan) => peopleOf(plan);
const who = (plan) => people(plan).map((p, k) => nameOf(p, k));
const dishLine = (plan, it) => {
  const name = byId[it.id].r.name;
  if (!plan.people) return `${fmtServ(it.s)} x ${name}`;
  return `${name} (${people(plan).map((p, k) => `${nameOf(p, k)} ${fmtServ(k ? it.s2 : it.s)}`).join(", ")})`;
};
const mealText = (plan, day, m) => `${MEAL_LABEL[m]}: ${day[m].items.map((it) => dishLine(plan, it)).join("; ")}`;
const email = (subject, body) => `SUBJECT: ${subject}\n\n${body.trim()}\n`;
const isAway = (plan, i) => (plan.away || []).includes(isoDate(addDays(parseIso(plan.start), i)));
const dateStr = (plan, i) => `${dayName(plan, i)} ${dateLabel(addDays(parseIso(plan.start), i))}`;

function menuLines(plan) {
  const out = [];
  plan.days.forEach((day, i) => {
    out.push(`${dateStr(plan, i)}`);
    if (isAway(plan, i)) { out.push("  Away: no meals planned", ""); return; }
    MEALS.forEach((m) => out.push("  " + mealText(plan, day, m)));
    const all = MEALS.flatMap((m) => day[m].items);
    out.push("  Day total: " + people(plan).map((p, k) => `${nameOf(p, k)} ${Math.round(totalsOf(all, k).kcal / 10) * 10} kcal`).join(" | "));
    out.push("");
  });
  return out;
}

function weeklyEmail(plan, opts) {
  const names = who(plan).join(" and ");
  const targets = people(plan).map((p, k) => `${nameOf(p, k)} about ${personKcal(p)} kcal a day`).join(", ");
  const body = [
    `Here is the meal plan for ${rangeLabel(plan)} (${names}). ${plan.mode === "batch" ? "This week you are batch cooking on the weekend." : "This week you cook fresh each day."}`,
    "",
    `Open it in the planner (you can tweak it there): ${planLink(plan)}`,
    "",
    `Daily targets: ${targets}. One pot, with a portion for each of you.`,
    "",
    ...menuLines(plan),
    "What I will nudge you about:",
    `- ${opts.shopDayName} morning: shopping day, with the full ingredient list.`,
    `- Every evening around ${opts.timeLabel}: tomorrow's meals and anything to soak, sprout or prepare tonight.`,
    ...(plan.mode === "batch" ? ["- The weekend before: batch cooking, in the best order."] : []),
    "",
    "Reply to this email if you want a change (a swap, a trip, a skipped day, or batch cooking instead of fresh) and I will adjust the plan.",
    "",
    `${planIdLine(plan)}`,
    "(The line above lets the assistant rebuild this exact plan each day. Please leave it in place when you reply.)",
  ].join("\n");
  return email(`Meal plan for ${rangeLabel(plan)}`, body);
}

function shoppingEmail(plan) {
  const planned = {};
  plan.days.forEach((d) => MEALS.forEach((m) => d[m].items.forEach(({ id, s, s2 }) => { planned[id] = (planned[id] || 0) + s + (plan.people ? s2 : 0); })));
  const out = [`Shopping day for ${rangeLabel(plan)}. Check your pantry first. Each list is the full recipe, and the line under the name says how many servings this week uses (scale the amounts, or cook the full recipe and keep the rest).`, ""];
  Object.keys(planned).forEach((id) => {
    const { r } = byId[id];
    const factor = planned[id] / r.macros.servings;
    out.push(`${r.name}: this week uses ${fmtServ(planned[id])} of the ${r.macros.servings} servings the recipe makes${factor >= 1.25 || factor < 0.75 ? ` (about ${factor >= 10 ? Math.round(factor) : factor.toFixed(1)}x the amounts below)` : ""}`);
    flatLines(r).forEach((l) => { if (l.group) out.push(`  [${l.group}]`); out.push(`  - ${l.text}`); });
    out.push("");
  });
  out.push(`Planner and the same shopping list with tick boxes: ${planLink(plan)}`);
  return email(`Shopping day: ingredients for ${rangeLabel(plan)}`, out.join("\n"));
}

// Emails for one calendar date: the same nudges the website puts in the reminders file, sent as email instead
function nudges(plan, dateIso) {
  const settings = { planDay: Number(args["plan-day"] || 3), shopDay: Number(args["shop-day"] || 6), batchDay: Number(args["batch-day"] || 0), time: args.time || "20:30" };
  const day = parseIso(dateIso);
  const kind = args.kind || "all";
  const events = buildReminders(plan, settings, addDays(day, -1))
    .filter((e) => isoDate(e.start) === dateIso && e.uid !== "plan-next-week")
    .filter((e) => kind === "all" || (kind === "morning") === (e.start.getHours() < 12));
  const emails = [];
  events.forEach((e) => {
    if (e.uid.startsWith("shop-day-")) emails.push(shoppingEmail(plan));
    else if (e.uid.startsWith("shop-eve-")) emails.push(email(e.summary, [`You shop tomorrow. Check what you already have at home. This is the week's menu:`, "", ...menuLines(plan), `Planner: ${planLink(plan)}`].join("\n")));
    else if (e.uid.startsWith("evening-")) {
      // swap the reminder's compact meal lines for lines that name each person's portion
      const tomorrow = Math.round((addDays(day, 1) - parseIso(plan.start)) / 86400000);
      const lines = e.lines.filter((l) => !/^(Breakfast|Lunch|Dinner): /.test(l));
      if (tomorrow >= 0 && tomorrow < plan.days.length) {
        const at = lines.findIndex((l) => l.startsWith("Tomorrow,"));
        if (isAway(plan, tomorrow)) {
          lines.splice(at + 1, lines.length, "You are away tomorrow: no meals or prep needed.");
        } else lines.splice(at + 1, 0, ...MEALS.map((m) => mealText(plan, plan.days[tomorrow], m)));
      }
      emails.push(email(e.summary, [...lines, "", `Planner: ${planLink(plan)}`].join("\n")));
    } else {
      const legend = plan.people && e.uid.startsWith("batch-") ? ["", `Portions are written ${who(plan).join(" + ")}, so "2 + 1 x Paratha" means ${who(plan)[0]} 2 and ${who(plan)[1]} 1.`] : [];
      emails.push(email(e.summary, [...e.lines, ...legend, "", `Planner: ${planLink(plan)}`].join("\n")));
    }
  });
  return emails;
}



if (cmd === "plan") {
  const today = parseIso(args.today || isoDate(new Date()));
  let start = args.start || "auto";
  if (start === "auto") { let d = addDays(today, 1); while (d.getDay() !== 1) d = addDays(d, 1); start = isoDate(d); }
  const ppl = JSON.parse(args.people || "[]").map(cleanPerson);
  if (ppl.length !== 1 && ppl.length !== 2) { console.error("--people needs a JSON list of one or two people"); process.exit(1); }
  const plan = buildPlan({ start, days: Number(args.days || 7), mode: args.mode, seed: args.seed, edits: args.edits, ppl });
  if (args.out) fs.writeFileSync(args.out, JSON.stringify(plan));
  console.log(weeklyEmail(plan, { shopDayName: WEEKDAY_NAMES[Number(args["shop-day"] || 6)], timeLabel: timeLabel(args.time || "20:30") }));
} else if (cmd === "rebuild") {
  const id = parseIdLine(args.id || "");
  const ppl = JSON.parse(args.people || "[]").map(cleanPerson);
  if (!id.start || !id.days || (ppl.length !== 1 && ppl.length !== 2)) { console.error("need --id (a Plan ID line) and --people"); process.exit(1); }
  const plan = buildPlan({ start: id.start, days: Number(id.days), mode: id.mode, seed: id.seed === "auto" ? undefined : id.seed, edits: id.edits === "none" ? "" : id.edits, ppl });
  if (args.out) fs.writeFileSync(args.out, JSON.stringify(plan));
  console.log(plan.id.data === id.data ? `OK: rebuilt the plan for ${rangeLabel(plan)}.` : `WARNING: the recipe data changed since this plan was made (was ${id.data}, now ${plan.id.data}), so the rebuilt plan may differ from the one that was emailed. Tell the user.`);
  if (args.email) { // also print the plan email, for sending after a change was made (--id may carry new edits)
    console.log("=====EMAIL=====\n");
    console.log(weeklyEmail(plan, { shopDayName: WEEKDAY_NAMES[Number(args["shop-day"] || 6)], timeLabel: timeLabel(args.time || "20:30") }).replace("SUBJECT: Meal plan for", "SUBJECT: Updated meal plan for"));
  }
} else if (cmd === "nudge") {
  const list = nudges(readPlan(), args.date);
  console.log(list.length ? list.join("\n=====EMAIL=====\n\n") : "NO NUDGES TODAY");
} else if (cmd === "reroll") {
  const plan = readPlan();
  const i = Math.round((parseIso(args.date) - parseIso(plan.start)) / 86400000);
  if (!(i >= 0 && i < plan.days.length) || !MEALS.includes(args.meal)) { console.error("need --date inside the plan and --meal breakfast|lunch|dinner"); process.exit(1); }
  setRng(seeded(args.seed || `${args.date}-${args.meal}-${Date.now()}`));
  const day = plan.days[i];
  const banned = new Set([...mainsUsed(plan.days, args.meal), ...idsOfDay(day, args.meal)]);
  const fresh = solveMeal(args.meal, targetsFor(peopleOf(plan), args.meal), banned);
  if (!fresh) { console.error("could not find a new meal"); process.exit(1); }
  plan.days[i] = { ...day, [args.meal]: fresh };
  fs.writeFileSync(args.out || args["plan-file"], JSON.stringify(plan));
  console.log(`New ${args.meal} for ${dateStr(plan, i)}: ${mealText(plan, plan.days[i], args.meal)}`);
} else if (cmd === "mode") {
  const plan = readPlan();
  plan.mode = args.mode === "batch" ? "batch" : "fresh";
  fs.writeFileSync(args.out || args["plan-file"], JSON.stringify(plan));
  console.log(`Plan is now ${plan.mode === "batch" ? "batch cooking on the weekend" : "cooking fresh each day"}.`);
} else if (cmd === "away") {
  const plan = readPlan();
  const set = new Set(plan.away || []);
  if (args.undo) set.delete(args.date); else set.add(args.date);
  plan.away = [...set];
  fs.writeFileSync(args.out || args["plan-file"], JSON.stringify(plan));
  console.log(`Away days: ${plan.away.join(", ") || "none"}.`);
} else if (cmd === "decode") {
  const plan = decodePlan(args.code);
  if (!plan) { console.error("could not read that plan code"); process.exit(1); }
  if (args.out) fs.writeFileSync(args.out, JSON.stringify(plan));
  console.log(`Plan for ${rangeLabel(plan)}, ${plan.days.length} days${plan.people ? ", for " + who(plan).join(" and ") : ""}.`);
} else if (cmd === "link") {
  console.log(planLink(readPlan()));
} else {
  console.error("commands: plan | nudge | reroll | mode | away | decode | link (see the top of this file)");
  process.exit(1);
}
