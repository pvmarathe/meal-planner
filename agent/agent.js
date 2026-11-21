#!/usr/bin/env node
// Accountability agent helper: plans a week for one or two people and writes the emails.
// It reuses the web page's own planning code (data.js, common.js, reminders.js, core.js), so the plan matches the website exactly.
//
//   node agent/agent.js plan   --today 2026-11-18 --people '<json>' [--start auto|YYYY-MM-DD] [--days 7] [--mode fresh|batch] [--seed text] [--edits "reroll:2026-11-26:dinner:2;away:2026-11-24;back:2026-11-24;mode:batch"] [--out plan.json]
//   node agent/agent.js nudge  --plan-file plan.json --date YYYY-MM-DD [--kind morning|evening|all] [--format html] [--time 20:30] [--shop-day 6] [--plan-day 3]
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

// ----- one combined shopping list: every recipe's ingredient lines, scaled to the servings this week uses, then added up -----
const FRAC = { "¼": 0.25, "½": 0.5, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875 };
const UNITS = { cup: "cup", cups: "cup", tbsp: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp", tsp: "tsp", teaspoon: "tsp", teaspoons: "tsp", g: "g", gm: "g", gram: "g", grams: "g", kg: "kg", ml: "ml", l: "l", litre: "l", liter: "l", oz: "oz", lb: "lb", inch: "inch", inches: "inch", clove: "clove", cloves: "clove", pinch: "pinch", sprig: "sprig", sprigs: "sprig", slice: "slice", slices: "slice", can: "can", glass: "glass", bunch: "bunch" };
const TSP = { tsp: 1, tbsp: 3, cup: 48 };
function parseQty(str) {
  let m = str.match(/^\s*((?:\d+\s*)?(?:\d+\/\d+|[¼½¾⅓⅔⅛⅜⅝⅞])|\d+(?:\.\d+)?)(?:\s*[-–to]+\s*((?:\d+\s*)?(?:\d+\/\d+|[¼½¾⅓⅔⅛⅜⅝⅞])|\d+(?:\.\d+)?))?\s*(.*)$/i);
  if (!m) return null;
  const val = (t) => {
    t = t.trim(); let tot = 0;
    t.split(/\s+/).forEach((part) => { if (/^\d+\/\d+$/.test(part)) { const [a, b] = part.split("/"); tot += a / b; } else if (/^\d+(\.\d+)?$/.test(part)) tot += Number(part); else { for (const ch of part) { if (FRAC[ch]) tot += FRAC[ch]; else if (/\d/.test(ch)) tot += Number(ch); } } });
    return tot;
  };
  let q = val(m[2] || m[1]); // a range like 3-4 takes the larger number
  if (m[1] && /^\d+[¼½¾⅓⅔⅛⅜⅝⅞]$/.test(m[1].replace(/\s/g, ""))) q = val(m[2] || m[1]);
  return { qty: q, rest: m[3] };
}
function parseIngredient(text) {
  const raw = String(text).replace(/\(.*?\)/g, " ").replace(/\s+/g, " ").trim();
  const pq = parseQty(raw);
  if (!pq || !(pq.qty > 0)) return { name: raw.toLowerCase().replace(/,.*$/, "").replace(/\b(to taste|for [a-z ]+)\b/g, "").trim(), qty: 0, unit: "" };
  let rest = pq.rest, unit = "";
  const w = rest.split(" ")[0].toLowerCase().replace(/\.$/, "");
  if (UNITS[w]) { unit = UNITS[w]; rest = rest.slice(w.length).trim(); }
  rest = rest.replace(/^of\s+/i, "");
  const name = rest.toLowerCase().replace(/,.*$/, "").replace(/\b(finely|roughly|freshly|thinly|chopped|sliced|grated|crushed|ground|boiled|cooked|soaked|fresh|dry|dried|raw|optional|to taste|for [a-z ]+)\b/g, "").replace(/\s+/g, " ").trim();
  return { name: tidyName(name || rest.toLowerCase()), qty: pq.qty, unit };
}
function tidyName(n) {
  n = n.replace(/\s+/g, " ").trim();
  const SYN = { "cilantro leaves": "cilantro", "coriander leaves": "cilantro", "curry leaves": "curry leaves", "gram flour": "besan", "bajra atta": "bajra flour", "jowar atta": "jowar flour", "ragi atta": "ragi flour", "wheat flour": "whole wheat flour", "atta": "whole wheat flour", "curd": "yogurt", "dahi": "yogurt", "green chilies": "green chilli", "green chillies": "green chilli", "green chili": "green chilli", "chillies": "chilli", "chilies": "chilli", "red onion": "onion", "onions": "onion", "tomatoes": "tomato", "potatoes": "potato", "cucumbers": "cucumber", "carrots": "carrot", "lemons": "lemon", "limes": "lime", "apples": "apple", "avocados": "avocado", "beetroots": "beetroot", "peas": "green peas", "frozen green peas": "green peas", "moong sprouts": "sprouted moong", "sprouts": "sprouted moong", "palak": "spinach (palak)", "spinach": "spinach (palak)" };
  n = SYN[n] || n;
  return n.replace(/^(small|medium|large)\s+/, "");
}
const CATS = [
  ["Oils, sauces and other", /\boil\b|vinegar|sauce|sugar|jaggery|honey|syrup|baking|yeast|chutney|paste|ketchup|essence|coconut milk|nutritional/i],
  ["Spices and seasonings", /salt|pepper|turmeric|powder|masala|cumin|jeera|mustard|hing|asafoetida|cardamom|cinnamon|\bclove\b|ajwain|carom|kasuri|fennel|saunf|garam|paprika|chaat|oregano|thyme|bay leaf|seeds?$|chilli flakes|amchur/i],
  ["Dals, grains and flours", /dal\b|lentil|moong|chana|rajma|chickpea|rice|poha|oats|quinoa|millet|ragi|jowar|bajra|flour|besan|sattu|rava|sooji|semolina|bread|barley|bulgur|couscous|pasta|noodles|tortilla|pita|urad|toor|masoor|kala|sabudana|sago|dalia|beans/i],
  ["Dairy and protein", /paneer|yogurt|milk|cheese|tofu|soya|soy chunks|ghee|butter|cream|hummus|tempeh/i],
  ["Fresh produce", /onion|tomato|potato|carrot|cabbage|spinach|cucumber|ginger|garlic|chilli|cilantro|mint|curry leaves|lemon|lime|capsicum|bell pepper|peas|corn|beet|cauliflower|broccoli|mushroom|apple|banana|avocado|mango|orange|pomegranate|methi|fenugreek|radish|gourd|brinjal|eggplant|zucchini|celery|lettuce|scallion|pumpkin|okra|bhindi|drumstick|plantain|berries|dates|grapes|pineapple|papaya|green/i],
];
const catOf = (name) => { for (const [t, re] of CATS) if (re.test(name)) return t; return "Oils, sauces and other"; };
function niceQty(q, unit) {
  const step = unit === "" || unit === "clove" || unit === "can" || unit === "slice" || unit === "glass" ? 1 : unit === "g" || unit === "ml" ? 10 : unit === "cup" || unit === "tbsp" || unit === "tsp" ? 0.25 : 0.5;
  const v = Math.ceil(q / step - 1e-9) * step;
  const whole = Math.floor(v + 1e-9), frac = v - whole;
  const FR = [[0.25, "¼"], [0.5, "½"], [0.75, "¾"]];
  const f = (FR.find(([x]) => Math.abs(x - frac) < 1e-6) || [0, ""])[1];
  return `${whole || ""}${f}` || "¼";
}
function shoppingList(plan) {
  const planned = {};
  plan.days.forEach((d, i) => { if (isAway(plan, i)) return; MEALS.forEach((m) => d[m].items.forEach(({ id, s, s2 }) => { planned[id] = (planned[id] || 0) + s + (plan.people ? s2 : 0); })); });
  const bucket = {}; const noAmount = new Set();
  Object.keys(planned).forEach((id) => {
    const { r } = byId[id];
    const factor = planned[id] / r.macros.servings;
    flatLines(r).forEach((l) => {
      const ing = parseIngredient(l.text);
      if (!ing.name || ing.name.length < 2) return;
      if (!ing.qty) { noAmount.add(ing.name); return; }
      let unit = ing.unit, qty = ing.qty * factor;
      if (TSP[unit]) { qty *= TSP[unit]; unit = "tsp"; } // add cups, tablespoons and teaspoons together
      const key = `${ing.name}|${unit}`;
      bucket[key] = bucket[key] || { name: ing.name, unit, qty: 0 };
      bucket[key].qty += qty;
    });
  });
  const showTsp = (q) => (q >= 24 ? `${niceQty(q / 48, "cup")} cup` : q >= 6 ? `${niceQty(q / 3, "tbsp")} tbsp` : `${niceQty(q, "tsp")} tsp`);
  const groups = {};
  Object.values(bucket).forEach((b) => {
    const amount = b.unit === "tsp" ? showTsp(b.qty) : `${niceQty(b.qty, b.unit)}${b.unit ? " " + b.unit : ""}`;
    const cat = catOf(b.name);
    (groups[cat] = groups[cat] || []).push({ name: b.name, text: `${amount} ${b.name}` });
  });
  const order = ["Fresh produce", "Dals, grains and flours", "Dairy and protein", "Spices and seasonings", "Oils, sauces and other"];
  const out = order.filter((c) => groups[c]).map((c) => ({ title: c, items: groups[c].sort((a, b) => a.name.localeCompare(b.name)).map((x) => x.text) }));
  const extras = [...noAmount].filter((n) => !Object.values(bucket).some((b) => b.name === n)).sort();
  return { groups: out, extras, dishes: Object.keys(planned).length };
}

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


// ----- HTML emails: a small style block plus class names, so the message stays short and looks like the web app -----
const HTML = args.format === "html";
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const SYS = "-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";
const FONTS = { clean: { body: SYS, head: SYS }, editorial: { body: SYS, head: SERIF }, friendly: { body: "'Trebuchet MS',Verdana,sans-serif", head: "'Trebuchet MS',Verdana,sans-serif" }, readable: { body: "Verdana,Geneva,sans-serif", head: "Verdana,Geneva,sans-serif" }, classic: { body: SERIF, head: SERIF } };
const FONT_NAME = args.font && FONTS[args.font] ? args.font : "readable"; // the chosen style: Verdana
const FONT = FONTS[FONT_NAME];
const CSS = `body{margin:0;background:#fbf8f2}.w{max-width:940px;margin:0 auto;padding:14px 10px;font-family:${FONT.body};color:#2a2620;font-size:16px;line-height:1.5}.hd{background:#e3f1e8;border:1px solid #e6dfd0;border-radius:14px;padding:18px 20px;margin-bottom:12px}.ey{font-family:${FONT.head};font-size:13px;letter-spacing:.12em;font-weight:700;color:#226239}.t{font-family:${FONT.head};font-size:34px;font-weight:800;margin:2px 0;line-height:1.2}.g{color:#6c655a;font-size:14px}.c{background:#fff;border:1px solid #e6dfd0;border-radius:14px;padding:14px 16px;margin:0 0 12px}.cs{background:#e3f1e8}.cw{background:#fbead7;border-color:#f1d3b0}.d{font-family:${FONT.head};font-size:25px;font-weight:800;line-height:1.3}.m{margin-top:10px;font-size:11px;font-weight:700;letter-spacing:.08em;color:#226239}.i{margin:4px 0}.n{font-weight:600;font-size:16px}.p{display:inline-block;background:#e3f1e8;color:#226239;border-radius:10px;padding:2px 9px;font-size:13px;font-weight:700;margin:0 4px 2px 0}.pw{background:#fbead7;color:#b4570f}.b{display:inline-block;background:#2f7d4f;color:#fff!important;text-decoration:none;font-weight:700;font-size:16px;padding:12px 24px;border-radius:999px}.h{font-family:${FONT.head};font-weight:800;color:#226239;margin-bottom:6px;font-size:21px}.hw{color:#b4570f}.r{margin:3px 0;font-size:15px}.id{font-family:Menlo,Consolas,monospace;font-size:11px;color:#6c655a;word-break:break-all;margin-top:6px}.ml{font-family:${FONT.head};font-size:17px;font-weight:800;letter-spacing:.08em;margin-bottom:2px}.mp{border-radius:10px;padding:2px 9px;font-size:13px;font-weight:700}.si{font-size:17px;margin:5px 0;line-height:1.35}.sh{font-family:${FONT.head};font-size:18px;font-weight:800;letter-spacing:.06em;margin-bottom:8px}`;
const MEDIA = "@media (min-width:900px){.w{max-width:1200px!important;font-size:21px!important}.t{font-size:62px!important}.ey{font-size:17px!important}.d{font-size:40px!important}.g{font-size:19px!important}.n{font-size:26px!important}.mp,.p{font-size:18px!important;padding:3px 12px!important}.ml{font-size:25px!important}.r{font-size:22px!important}.h{font-size:32px!important}.b{font-size:21px!important}.c{font-size:21px!important}.si{font-size:24px!important}.sh{font-size:26px!important}.mc{display:table-cell!important;width:33.33%!important;margin:0!important}.mc2{display:table-cell!important;width:50%!important;margin:0!important}}";
const KEEP = new Set(["w", "t", "ey", "d", "g", "n", "p", "mp", "ml", "r", "h", "b", "c", "mc", "mc2", "si", "sh"]); // classes the wide-screen rules need, kept next to the inline styles
const pill = (t, warm) => `<span class="p${warm === true ? " pw" : warm ? " " + warm : ""}">${esc(t)}</span>`;
const card = (inner, cls) => `<div class="c${cls ? " " + cls : ""}">${inner}</div>`;
const button = (href, text) => `<a class="b" href="${esc(href)}">${esc(text)}</a>`;
const planIdBlock = (plan) => `<div class="id">${esc(planIdLine(plan))}</div>`;
const shell = (title, sub, bodyHtml) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${MEDIA}</style></head><body style="margin:0;background:#fbf8f2"><div class="w"><div class="hd"><div class="ey">MEAL PLANNER</div><div class="t">${esc(title)}</div><div class="g">${esc(sub)}${args.font ? esc(" · Font style: " + FONT_NAME) : ""}</div></div>${bodyHtml}</div></body></html>`;
// Some mail apps (the Gmail phone app among them) ignore a style block, so every class is turned into inline styles
const CLASS_STYLES = Object.fromEntries([...CSS.matchAll(/\.([a-z]+)\{([^}]*)\}/g)].map((m) => [m[1], m[2].replace(/!important/g, "")]));
function inlineStyles(html) {
  return html.replace(/<([a-z0-9]+)((?:\s[^>]*?)?)\sclass="([^"]*)"([^>]*)>/g, (all, tag, before, classes, after) => {
    const list = classes.split(/\s+/);
    const decl = list.map((c) => CLASS_STYLES[c] || "").filter(Boolean).join(";");
    const keep = list.filter((c) => KEEP.has(c)).join(" ");
    const rest = before + after;
    const m = rest.match(/\sstyle="([^"]*)"/);
    const style = m ? `${decl};${m[1]}` : decl;
    return `<${tag}${rest.replace(/\sstyle="[^"]*"/, "")}${keep ? ` class="${keep}"` : ""} style="${style}">`;
  });
}
const emailHtml = (subject, html) => `SUBJECT: ${subject}\nFORMAT: html\n\n${inlineStyles(html)}\n`;
const itemHtml = (plan, it, m) => {
  const r = byId[it.id].r;
  const text = plan.people ? people(plan).map((q, k) => `${nameOf(q, k)} ${fmtServ(k ? it.s2 : it.s)}`).join(" · ") : `${fmtServ(it.s)} serving${it.s === 1 ? "" : "s"}`;
  const who = m ? mealPill(text, m) : pill(text);
  return `<div class="i"><div class="n">${esc(r.name)}</div>${who}</div>`;
};
// Each meal is a table (bgcolor plus an inline background and a full border) so phone mail apps colour the whole rectangle
const MEAL_STYLE = {
  breakfast: { bg: "#fde8c6", bd: "#e3a949", label: "#8a4a06", pill: "#f8d28f", icon: "🌅" },
  lunch: { bg: "#d9eee1", bd: "#6fb08c", label: "#1d5a34", pill: "#b9dcc8", icon: "☀️" },
  dinner: { bg: "#dfe4f8", bd: "#8593d6", label: "#2f3d82", pill: "#c3ccf0", icon: "🌙" },
};
const mealPill = (t, m) => `<span class="mp" style="background:${MEAL_STYLE[m].pill};color:${MEAL_STYLE[m].label}">${esc(t)}</span>`;
const mealHtml = (plan, day, m) => { const c = MEAL_STYLE[m]; return `<td class="mc" bgcolor="${c.bg}" style="display:block;width:100%;box-sizing:border-box;background:${c.bg};border:1px solid ${c.bd};border-radius:10px;padding:8px 12px;margin:0 0 10px 0;vertical-align:top"><div class="ml" style="color:${c.label}">${c.icon} ${MEAL_LABEL[m].toUpperCase()}</div>${day[m].items.map((it) => itemHtml(plan, it, m)).join("")}</td>`; };
const dayCardHtml = (plan, day, i, label) => {
  const title = esc(label || dateStr(plan, i));
  if (isAway(plan, i)) return card(`<div class="d">${title}</div><div class="hw">Away: no meals planned</div>`);
  const all = MEALS.flatMap((m) => day[m].items);
  const tot = people(plan).map((q, k) => { const t = totalsOf(all, k); return `${nameOf(q, k)} ${Math.round(t.kcal / 10) * 10} kcal, ${Math.round(t.p)} g protein`; }).join(" · ");
  return card(`<div class="d">${title}</div><div class="g">${esc(tot)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:8px 0;margin:6px 0 0"><tr>${MEALS.map((m) => mealHtml(plan, day, m)).join("")}</tr></table>`);
};
const daysHtml = (plan) => plan.days.map((d, i) => dayCardHtml(plan, d, i)).join("");
const listHtml = (items) => items.map((t) => `<div class="r">• ${esc(t)}</div>`).join("");

function weeklyHtml(plan, opts) {
  const targets = people(plan).map((p, k) => pill(`${nameOf(p, k)} ${personKcal(p)} kcal a day`)).join("");
  const body = card(`<div style="margin-bottom:10px">${button(planLink(plan), "Open in the planner")}</div><div class="g">One pot, with a portion for each of you. ${plan.mode === "batch" ? "Batch cooking on the weekend." : "Cooking fresh each day."}</div><div style="margin-top:8px">${targets}</div>`, "cs") +
    daysHtml(plan) +
    card(`<div class="h hw">What I will nudge you about</div>${listHtml([`${opts.shopDayName} morning: shopping day, with the combined list`, `Every evening around ${opts.timeLabel}: tomorrow's meals and anything to soak, sprout or prepare`, ...(plan.mode === "batch" ? ["The weekend before: batch cooking, in the best order"] : [])])}<div class="g" style="margin-top:8px">Reply to this email to change anything: a swap, a trip, a skipped day, or batch cooking instead of fresh. I will adjust the plan.</div>`, "cw") +
    `<div class="g">Leave the line below in place when you reply; it lets me rebuild this exact plan.</div>` + planIdBlock(plan);
  return emailHtml(`Meal plan for ${rangeLabel(plan)}`, shell("Your week", `${rangeLabel(plan)} · ${who(plan).join(" and ")}`, body));
}
const SHOP_STYLE = {
  "Fresh produce": { bg: "#d9eee1", bd: "#6fb08c", fg: "#1d5a34", icon: "🥬" },
  "Dals, grains and flours": { bg: "#fde8c6", bd: "#e3a949", fg: "#8a4a06", icon: "🌾" },
  "Dairy and protein": { bg: "#dfe4f8", bd: "#8593d6", fg: "#2f3d82", icon: "🥛" },
  "Spices and seasonings": { bg: "#fbdfe6", bd: "#dd8ea3", fg: "#962d49", icon: "🌶️" },
  "Oils, sauces and other": { bg: "#d9eef1", bd: "#6fb3bd", fg: "#1f6370", icon: "🫙" },
};
function shoppingBox(title, items, c) {
  const half = Math.ceil(items.length / 2);
  const col = (list) => `<td class="mc2" style="display:block;width:100%;box-sizing:border-box;vertical-align:top;padding:0 6px">${list.map((t) => `<div class="si">☐ ${esc(t)}</div>`).join("")}</td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${c.bg}" style="background:${c.bg};border:1px solid ${c.bd};border-radius:12px;margin:0 0 12px"><tr><td bgcolor="${c.bg}" style="background:${c.bg};padding:12px 12px;border-radius:12px"><div class="sh" style="color:${c.fg}">${c.icon} ${esc(title.toUpperCase())}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;border-spacing:0"><tr>${col(items.slice(0, half))}${items.length > 1 ? col(items.slice(half)) : ""}</tr></table></td></tr></table>`;
}
function shoppingHtml(plan) {
  const sl = shoppingList(plan);
  const groups = sl.groups.map((g) => shoppingBox(g.title, g.items, SHOP_STYLE[g.title] || SHOP_STYLE["Oils, sauces and other"])).join("");
  const extra = sl.extras.length ? shoppingBox("Also (no amount in the recipes)", [sl.extras.join(", ")], { bg: "#f1ece0", bd: "#cfc5ae", fg: "#6c5f3d", icon: "📝" }) : "";
  const body = card(`<div>One combined list for the ${sl.dishes} dishes in the plan. Amounts are scaled to the servings you will eat and rounded up. Check your pantry first.</div><div style="margin-top:10px">${button(planLink(plan), "Open the full recipe lists")}</div>`, "cs") + groups + extra;
  return emailHtml(`Shopping day: ingredients for ${rangeLabel(plan)}`, shell("Shopping day", rangeLabel(plan), body));
}
// A nudge built from the website's reminder lines: sprouts line, "Tomorrow" menu, prep tips
function nudgeHtml(plan, e, dateIso) {
  const L = e.lines;
  const sprout = L.find((l) => l.startsWith("Start sprouting tonight"));
  const tomorrowIdx = Math.round((addDays(parseIso(dateIso), 1) - parseIso(plan.start)) / 86400000);
  const prep = L.findIndex((l) => l === "Prep tonight:");
  const tips = prep >= 0 ? L.slice(prep + 1).filter((l) => l.startsWith("- ")).map((l) => l.slice(2)) : [];
  const inPlan = tomorrowIdx >= 0 && tomorrowIdx < plan.days.length;
  let body = "";
  if (sprout) body += card(`<div class="h hw">🌱 Start sprouting tonight</div><div>${esc(sprout.replace(/^Start sprouting tonight for /, "For "))}</div>`, "cw");
  if (tips.length && !(inPlan && isAway(plan, tomorrowIdx))) body += card(`<div class="h hw">Prep tonight</div>${listHtml(tips)}`, "cw");
  if (inPlan) body += dayCardHtml(plan, plan.days[tomorrowIdx], tomorrowIdx, `Tomorrow · ${dateStr(plan, tomorrowIdx)}`);
  body += `<div>${button(planLink(plan), "Open the plan")}</div>`;
  return emailHtml(e.summary, shell("Tonight's nudge", e.summary, body));
}
function genericHtml(plan, e) {
  const names = who(plan);
  // "Mon lunch: 1 + 1 x Methi Dal" becomes "Mon lunch: Methi Dal" with a pill showing each person's portion
  const dish = (t) => {
    const m = t.match(/^(\w{3} \w+): ([\d½¼¾⅓⅔⅛]+) \+ ([\d½¼¾⅓⅔⅛]+) x (.+)$/);
    return m && names.length === 2 ? `<div class="r"><b>${esc(m[1])}</b>: ${esc(m[4])} ${pill(`${names[0]} ${m[2]} · ${names[1]} ${m[3]}`)}</div>` : `<div class="r">• ${esc(t)}</div>`;
  };
  const paras = e.lines.map((l) => (l === "" ? "" : l.startsWith("- ") ? dish(l.slice(2)) : `<div class="h" style="margin:10px 0 4px">${esc(l)}</div>`)).join("");
  return emailHtml(e.summary, shell(e.summary, rangeLabel(plan), card(paras) + `<div>${button(planLink(plan), "Open the plan")}</div>`));
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
  const sl = shoppingList(plan);
  const out = [`Shopping day for ${rangeLabel(plan)}. This is one combined list for the ${sl.dishes} dishes in the plan, with amounts scaled to the servings you will eat and rounded up. Check your pantry first.`, ""];
  sl.groups.forEach((g) => { out.push(g.title.toUpperCase()); g.items.forEach((t) => out.push(`  [ ] ${t}`)); out.push(""); });
  if (sl.extras.length) out.push("ALSO (no amount in the recipes, use to taste or as needed)", `  ${sl.extras.join(", ")}`, "");
  out.push(`The full recipe-by-recipe lists, with tick boxes: ${planLink(plan)}`);
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
    if (HTML) {
      if (e.uid.startsWith("shop-day-")) emails.push(shoppingHtml(plan));
      else if (e.uid.startsWith("shop-eve-")) emails.push(emailHtml(e.summary, shell("Shopping tomorrow", rangeLabel(plan), card(`<div>You shop tomorrow. Check what you already have at home. This is the week's menu:</div>`, "cs") + daysHtml(plan) + `<div>${button(planLink(plan), "Open the plan")}</div>`)));
      else if (e.uid.startsWith("evening-")) emails.push(nudgeHtml(plan, e, dateIso));
      else emails.push(genericHtml(plan, e));
      return;
    }
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
  const plan = buildPlan({ start, days: Number(args.days || 7), mode: args.mode, seed: args.seed || "auto2", edits: args.edits, ppl });
  if (args.out) fs.writeFileSync(args.out, JSON.stringify(plan));
  const wopts = { shopDayName: WEEKDAY_NAMES[Number(args["shop-day"] || 6)], timeLabel: timeLabel(args.time || "20:30") };
  console.log(HTML ? weeklyHtml(plan, wopts) : weeklyEmail(plan, wopts));
} else if (cmd === "rebuild") {
  const id = parseIdLine(args.id || "");
  const ppl = JSON.parse(args.people || "[]").map(cleanPerson);
  if (!id.start || !id.days || (ppl.length !== 1 && ppl.length !== 2)) { console.error("need --id (a Plan ID line) and --people"); process.exit(1); }
  const plan = buildPlan({ start: id.start, days: Number(id.days), mode: id.mode, seed: id.seed === "auto" ? undefined : id.seed, edits: id.edits === "none" ? "" : id.edits, ppl, legacyNames: id.seed === "auto" ? ["Prasad", "Wife"] : undefined });
  if (args.out) fs.writeFileSync(args.out, JSON.stringify(plan));
  console.log(plan.id.data === id.data ? `OK: rebuilt the plan for ${rangeLabel(plan)}.` : `WARNING: the recipe data changed since this plan was made (was ${id.data}, now ${plan.id.data}), so the rebuilt plan may differ from the one that was emailed. Tell the user.`);
  if (args.email) { // also print the plan email, for sending after a change was made (--id may carry new edits)
    console.log("=====EMAIL=====\n");
    const wopts = { shopDayName: WEEKDAY_NAMES[Number(args["shop-day"] || 6)], timeLabel: timeLabel(args.time || "20:30") };
    console.log((HTML ? weeklyHtml(plan, wopts) : weeklyEmail(plan, wopts)).replace("SUBJECT: Meal plan for", "SUBJECT: Updated meal plan for"));
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
