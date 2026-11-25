// Meal Planner: the page (dates, pickers, plan view). The planning logic lives in core.js.

function targetsBox(people) {
  const w = WINDOWS[0];
  const grams = (kcal, share, per) => Math.round((kcal * share) / per);
  if (people.length === 2) {
    const lines = people.map((p, k) => {
      const kcal = personKcal(p);
      return h("li", { text: `${nameOf(p, k)}: about ${kcal} kcal a day (${ACTIVITY[p.activity].label.toLowerCase()}). Protein ${grams(kcal, w.p[0], 4)} to ${grams(kcal, w.p[1], 4)} g, carbs ${grams(kcal, w.c[0], 4)} to ${grams(kcal, w.c[1], 4)} g, fat ${grams(kcal, w.f[0], 9)} to ${grams(kcal, w.f[1], 9)} g. ${p.kg ? `Scaled to ${p.kg} kg.` : `General levels for ${REFERENCE[p.gender].about}.`}` });
    });
    return h("details", { class: "targets" },
      h("summary", { text: `🎯 Daily calorie and nutrition targets: ${people.map((p, k) => `${nameOf(p, k)} ${personKcal(p)} kcal`).join(" · ")}` }),
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
    h("summary", { text: `🎯 Daily calorie and nutrition targets: about ${kcal} kcal (${label})` }),
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

function plannerSectionEl() {
  const section = h("section", { id: "plan", "aria-labelledby": "plan-heading" });
  const body = h("div", { id: "plan-body" });

  const store = loadStore();
  const plans = store.plans;
  let importedMsg = "";
  if (location.hash.startsWith("#plan=")) { // an emailed link: rebuild the plan from its short recipe
    const rebuilt = decodeRecipe(location.hash.slice(6));
    if (rebuilt) {
      const shared = rebuilt.plan;
      delete shared.pplCfg; delete shared.id; // not needed once it is saved here
      plans[rangeKey(shared.start, shared.end)] = shared;
      store.last = rangeKey(shared.start, shared.end);
      saveStore(plans, store.last);
      importedMsg = `Opened the emailed plan for ${rangeLabel(shared)}.${rebuilt.changed ? " The recipes have changed since it was made, so some dishes may differ from the email." : ""}`;
    } else importedMsg = "That plan link could not be read.";
    history.replaceState(null, "", location.pathname + location.search);
  } else if (location.hash.startsWith("#share=")) { // someone sent a plan link
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
    if (msg) { const had = !!plan; plan = null; if (had) render(); return; }
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
    h("p", { class: "week-question", id: "range-question", text: `📆 Plan dates: which days are you planning for? (1 to ${MAX_DAYS} days)` }),
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
    body,
  );
  let step = 0; // which card of the step-by-step form is showing

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

    return h("div", { class: `meal meal-${meal}` },
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
            const fresh = solveMeal(meal, targets, banned, isoDate(addDays(parseIso(plan.start), dayIdx)));
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
      h("summary", { text: "📅 Phone reminders: download a Google Calendar file" }),
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

  // The big boxes are always open and colour-coded (no expand arrow); only the small inner folds still open on click.
  function lockOpen(root) {
    root.querySelectorAll("details.settings-fold, details.prep-box, details.targets, details.shopping").forEach((d) => {
      d.open = true; d.classList.add("panel");
      const s = d.querySelector(":scope > summary");
      if (s) s.addEventListener("click", (e) => e.preventDefault());
    });
  }

  // The step-by-step form shown before a plan exists: one question per card.
  function wizard() {
    const STEPS = ["Who", "About you", "Dates", "Ready"];
    const last = STEPS.length - 1;
    const people = two.on ? two.people : [cleanPerson({ gender, kg: bodyKg, activity })];
    const setMode = (on) => {
      two.on = on;
      if (on) two.people[0] = cleanPerson({ ...two.people[0], gender, kg: bodyKg, activity });
      saveTwo(); render();
    };
    const choice = (id, icon, title, text, on) => h("button", { id, type: "button", class: `wiz-choice${two.on === on ? " picked" : ""}`, "aria-pressed": String(two.on === on), onclick: () => setMode(on) },
      h("span", { class: "wiz-icon", text: icon }), h("strong", { text: title }), h("span", { text }));
    let card;
    if (step === 0) {
      card = [h("h3", { text: "Who is this plan for?" }), h("p", { class: "wiz-hint", text: "Two people can eat the same dishes in one pot, each with their own portion size." }),
        h("div", { class: "wiz-choices" }, choice("plan-for-one", "🙂", "Just me", "One person's targets", false), choice("plan-for-two", "👫", "Me and my partner", "One pot, two portions", true))];
    } else if (step === 1) {
      card = two.on
        ? [h("h3", { text: "About the two of you" }), h("p", { class: "wiz-hint", text: "Weight and activity set how much each of you eats. Leave weight blank for a standard adult." }), peoplePanel()]
        : [h("h3", { text: "About you" }), h("p", { class: "wiz-hint", text: "Weight and activity set your daily calories. Leave weight blank for a standard adult." }), h("div", { class: "wiz-fields" }, genderPicker(), weightPicker(), activityPicker())];
    } else if (step === 2) {
      card = [h("h3", { text: "Which days?" }), h("p", { class: "wiz-hint", text: "Pick the days you want meals for, or use a quick pick." }), picker];
    } else {
      card = [h("h3", { text: "Ready to plan" }),
        h("ul", { class: "wiz-summary" },
          h("li", {}, h("strong", { text: "For: " }), two.on ? people.map((q, k) => nameOf(q, k)).join(" and ") + " (one pot)" : "Just me"),
          h("li", {}, h("strong", { text: "Days: " }), `${rangeLabel(range)} (${dayCount(range.start, range.end)} day${dayCount(range.start, range.end) === 1 ? "" : "s"})`)),
        targetsBox(people),
        h("button", { id: "plan-pick", class: "btn primary big", type: "button", onclick: () => update(newPlan(null, activity, range.start, range.end, two.on ? copyPeople() : null)), text: "Pick my meals" })];
    }
    const back = step > 0 ? h("button", { id: "wiz-back", class: "btn", type: "button", text: "Back", onclick: () => { step--; render(); } }) : h("span");
    const next = step < last ? h("button", { id: "wiz-next", class: "btn primary", type: "button", text: "Next", onclick: () => {
      if (step === 2 && problem(startInput.value, endInput.value)) { rangeMsg.focus(); return; }
      step++; render();
    } }) : h("span");
    return h("div", { class: "wizard" },
      h("ol", { class: "wiz-steps", "aria-label": "Steps" }, STEPS.map((t, i) => h("li", { class: i === step ? "current" : i < step ? "done" : "", "aria-current": i === step ? "step" : null }, h("span", { class: "wiz-dot", text: i < step ? "✓" : String(i + 1) }), h("span", { class: "wiz-name", text: t })))),
      h("div", { class: "wiz-card" }, ...card, h("div", { class: "wiz-nav" }, back, next)));
  }

  function render() {
    body.replaceChildren();
    const n = daysBetween(range.start, range.end);
    if (plan) { two.on = !!plan.people; if (plan.people) two.people = plan.people.map(cleanPerson); } // show what this plan was made for

    if (!plan) { body.append(wizard()); lockOpen(body); return; }
    section.insertBefore(picker, body); // with a plan on screen the date picker sits on top

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
        h("button", { id: "plan-again", class: "btn primary", type: "button", onclick: () => update(newPlan(plan, plan.activity)), text: "Pick again (keeps meals marked Keep)" }),
      ),
      h("details", { class: "settings-fold" }, h("summary", { text: "⚙️ Plan settings: who it is for, weight and activity" }),
        h("div", { class: "plan-toolbar" }, modePicker(), ...(two_ ? [] : [genderPicker(), weightPicker(), activityPicker()])),
        two_ ? peoplePanel() : null),
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
      targetsBox(people),
      h("p", { class: "plan-total", text: two_
        ? `${balanced} of ${days * 3} meals are balanced for both of you. ${days > 1 ? "Daily average" : "Total"}: ${people.map((q, k) => `${nameOf(q, k)} ${avg(total[k])}`).join("; ")}.`
        : `${balanced} of ${days * 3} meals are balanced. ${days > 1 ? "Daily average" : "Total"}: ${avg(total[0])}.` }),
      h("div", { class: "plan-days" }, dayCards),
    );

    // shopping list: one combined, colour-coded list, then the full recipe-by-recipe lists
    const planned = {};
    plan.days.forEach((d) => MEALS.forEach((m) => d[m].items.forEach(({ id, s, s2 }) => { planned[id] = (planned[id] || 0) + s + (plan.people ? s2 : 0); })));
    const shopping = h("details", { class: "shopping" }, h("summary", { text: "🛒 Shopping list: tick what you already have" }));
    const sl = shoppingList(plan);
    const ticked = new Set((plan.done && plan.done._list) || []);
    const CAT = {
      "Fresh produce": { cls: "cat-produce", icon: "🥬" }, "Dals, grains and flours": { cls: "cat-grains", icon: "🌾" },
      "Dairy and protein": { cls: "cat-dairy", icon: "🥛" }, "Spices and seasonings": { cls: "cat-spices", icon: "🌶️" },
      "Oils, sauces and other": { cls: "cat-other", icon: "🫙" },
    };
    const itemRow = (text) => h("li", {}, h("label", {},
      h("input", {
        type: "checkbox", checked: ticked.has(text),
        onchange: (e) => {
          const now = new Set((plan.done && plan.done._list) || []);
          if (e.target.checked) now.add(text); else now.delete(text);
          plan.done = { ...plan.done, _list: [...now] };
          saveStore(plans, planKey());
        },
      }), ` ${text}`));
    shopping.append(h("p", { class: "shopping-note", text: `One list for the ${sl.dishes} dishes in this plan, with every ingredient listed once. Amounts are in the full recipe lists below. Check your pantry first.` }));
    const cats = h("div", { class: "shop-cats" });
    sl.groups.forEach((g) => {
      const c = CAT[g.title] || CAT["Oils, sauces and other"];
      cats.append(h("section", { class: `shop-cat ${c.cls}` }, h("h3", { text: `${c.icon} ${g.title}` }), h("ul", { class: "shop-items" }, g.items.map(itemRow))));
    });
    shopping.append(cats);

    const full = h("details", { class: "shopping-full" }, h("summary", { text: "Full recipe-by-recipe lists" }),
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
      full.append(
        h("h3", { text: r.name }),
        h("p", { class: "shopping-servings", text: `The recipe makes ${r.macros.servings} servings. This plan uses ${fmtServ(planned[id])}${plan.people ? " for both of you" : ""}.` }),
        list,
      );
    });
    shopping.append(full);
    body.append(shopping);
    lockOpen(body);
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
