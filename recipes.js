// Meal Planner: the recipe database page.

// ----- How the nutrition numbers work -----

function methodSectionEl() {
  const section = document.createElement("section");
  section.id = "how";
  section.setAttribute("aria-labelledby", "how-heading");

  const h2 = document.createElement("h2");
  h2.id = "how-heading";
  h2.textContent = "How the nutrition numbers work";

  const note = document.createElement("p");
  note.className = "section-note";
  note.textContent =
    "Every recipe shows calories, protein, carbs and fat for one serving, and says exactly what that serving is. These are estimates, not lab results.";

  const box = document.createElement("div");
  box.className = "method";

  const list = document.createElement("ul");
  [
    ["Calculated from the ingredient list.", " Each main ingredient was looked up in the USDA FoodData Central database (SR Legacy, 2018) and the amounts were added up. Paneer, urad dal and poha use packaged-product labels, because they are not in that list."],
    ["What is counted.", " Grains, flours, dals, dairy, oils, sugars, nuts and vegetables. Salt, water, spices, herbs and any ingredient with no amount (like \"oil for roasting\") count as zero. Sprouted lentils are counted like boiled ones."],
    ["What a serving is.", " If the recipe states its yield (for example \"makes 20 idlis\" or \"serves 4\"), the card says From the source. Otherwise I used a typical serving and marked it Assumed."],
    ["Not available.", " When a recipe leaves out a key amount (like the dough in some parathas), I did not guess, and the card says why."],
  ].forEach(([bold, rest]) => {
    const li = document.createElement("li");
    const b = document.createElement("strong");
    b.textContent = bold;
    li.append(b, rest);
    list.appendChild(li);
  });

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "The typical servings I assumed";
  const assumed = document.createElement("ul");
  [
    "Idlis: 2 idlis, at about 16 g of dry ingredients per idli (the average of Hebbar's idli recipes).",
    "Roti or paratha: 1 piece, at about 40 g of flour (as in Hebbar's roti and paneer paratha recipes).",
    "Dosas (in the Dosas section): 2 dosas, at about 65 g of dry grain, flour and dal (the average of the dosa recipes that state how many they make).",
    "Chilla, omelette and similar: about 50 g of dry batter ingredients, roughly 2 pieces.",
    "Poha: 1 plate, at about 40 g of dry poha.",
    "Upma, pulao, quinoa and millet dishes: 1 plate, at about 50 g of dry grain.",
    "Khichdi, pongal and similar one-pot meals: 1 bowl, at about 100 g of dry rice or grain and dal.",
    "Dal, sambar and rajma: 1 bowl, at about 40 g of dry dal (50 g for rajma).",
    "Salads: 1 bowl, at about 200 g.",
    "Dressings: 2 tablespoons, at about 30 g (or the creator's own serving when the recipe gives one).",
    "Kheer, sweet pongal and porridge: 1 bowl, at about 250 g of the finished dish.",
  ].forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    assumed.appendChild(li);
  });
  details.append(summary, assumed);

  const caveat = document.createElement("p");
  caveat.className = "method-caveat";
  caveat.textContent =
    "Real numbers change with brands, portion size and how much oil or ghee you use. Treat them as a guide, not as medical or dietary advice.";

  box.append(list, details, caveat);
  section.append(h2, note, box);
  return section;
}

// ----- Page logic -----

const seen = new Set(); // names and video links already added, so nothing repeats

function makeList(items) {
  const ul = document.createElement("ul");
  ul.className = "ingredients" + (items.length > 8 ? " long" : "");
  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    ul.appendChild(li);
  });
  return ul;
}

function ingredientsCell(r) {
  const td = document.createElement("td");
  td.dataset.label = "Ingredients";
  td.className = "ingredients-cell";

  if (r.makes) {
    const makes = document.createElement("p");
    makes.className = "makes";
    makes.textContent = r.makes;
    td.appendChild(makes);
  }

  r.ingredients.forEach((part) => {
    if (typeof part === "string") return; // plain lines are handled below
    const title = document.createElement("p");
    title.className = "group-title";
    title.textContent = part.title;
    td.append(title, makeList(part.items));
  });

  const plain = r.ingredients.filter((p) => typeof p === "string");
  if (plain.length) td.appendChild(makeList(plain));

  if (r.note) {
    const note = document.createElement("p");
    note.className = "note";
    note.textContent = r.note;
    td.appendChild(note);
  }

  const from = document.createElement("p");
  from.className = "from";
  from.textContent = `Ingredients from: ${r.from}`;
  td.appendChild(from);
  return td;
}


function macrosCell(r) {
  const td = document.createElement("td");
  td.dataset.label = "Per serving";
  td.className = "macros-cell";
  const m = r.macros;

  if (!m || m.na) {
    const na = document.createElement("p");
    na.className = "na";
    na.textContent = "Not available. " + (m ? m.na : "");
    td.appendChild(na);
    return td;
  }

  const kcal = document.createElement("p");
  kcal.className = "macro-kcal";
  kcal.textContent = `${Math.round(m.kcal / 5) * 5} kcal`;

  const list = document.createElement("ul");
  list.className = "macros";
  [["Protein", m.p], ["Carbs", m.c], ["Fat", m.f]].forEach(([label, value]) => {
    const li = document.createElement("li");
    const b = document.createElement("strong");
    b.textContent = `${fmt(value)} g`;
    li.append(b, ` ${label.toLowerCase()}`);
    list.appendChild(li);
  });

  const serving = document.createElement("p");
  serving.className = "serving-text";
  serving.textContent = `1 serving = ${m.serving}`;

  const basis = document.createElement("p");
  basis.className = `basis ${m.basis}`;
  const tag = document.createElement("span");
  tag.textContent = m.basis === "source" ? "From the source" : "Assumed";
  const why = m.why.replace(/^Assumed:\s*/, "");
  basis.append(tag, ` ${why.charAt(0).toUpperCase()}${why.slice(1)}`);

  td.append(kcal, list, serving, basis);
  return td;
}

function row(r, sectionTitle) {
  const tr = document.createElement("tr");
  tr.id = `r-${r.video.split("v=")[1]}`;
  tr.dataset.search = [r.name, r.channel, sectionTitle, ...r.ingredients.flatMap((p) => (typeof p === "string" ? [p] : p.items))].join(" ").toLowerCase();

  const nameCell = document.createElement("td");
  nameCell.className = "name";
  const nameText = document.createElement("span");
  nameText.textContent = r.name;
  const channel = document.createElement("span");
  channel.className = "channel";
  channel.textContent = r.channel;
  nameCell.append(nameText, channel);

  const linkCell = document.createElement("td");
  linkCell.dataset.label = "Video";
  linkCell.className = "video-cell";
  const a = document.createElement("a");
  a.className = "video-link";
  a.href = r.video;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = "Watch video ▶";
  a.setAttribute("aria-label", `Watch the ${r.name} video on YouTube (opens in a new tab)`);
  linkCell.appendChild(a);

  tr.append(nameCell, ingredientsCell(r), macrosCell(r), linkCell);
  return tr;
}

function sectionEl(s) {
  const section = document.createElement("section");
  section.id = s.id;
  section.setAttribute("aria-labelledby", `${s.id}-heading`);

  const h2 = document.createElement("h2");
  h2.id = `${s.id}-heading`;
  h2.textContent = s.title;

  const note = document.createElement("p");
  note.className = "section-note";
  note.textContent = s.note;

  const wrap = document.createElement("div");
  wrap.className = "table-wrap";
  const table = document.createElement("table");
  table.innerHTML =
    '<thead><tr><th scope="col">Recipe</th><th scope="col">Ingredients</th><th scope="col">Per serving</th><th scope="col">Video</th></tr></thead>';
  const tbody = document.createElement("tbody");

  let count = 0;
  s.recipes.forEach((r) => {
    // Safety net: skip any recipe whose name or video link was already added.
    const nameKey = r.name.toLowerCase();
    if (seen.has(nameKey) || seen.has(r.video)) {
      console.warn("Skipped duplicate recipe:", r.name);
      return;
    }
    seen.add(nameKey);
    seen.add(r.video);
    tbody.appendChild(row(r, s.title));
    count++;
  });
  s.count = count;

  table.appendChild(tbody);
  wrap.appendChild(table);
  section.append(h2, note, wrap);
  return section;
}


const main = document.getElementById("sections");
const jump = document.getElementById("jump");
const search = document.getElementById("search");
const countEl = document.getElementById("count");
const emptyEl = document.getElementById("search-empty");

main.appendChild(methodSectionEl());
sections.forEach((s) => main.appendChild(sectionEl(s)));

const total = sections.reduce((n, s) => n + s.count, 0);
document.querySelectorAll(".recipe-total").forEach((el) => { el.textContent = String(total); });

// Jump menu, with a recipe count for each section.
function chip(href, text) {
  const a = document.createElement("a");
  a.className = "chip";
  a.href = href;
  a.textContent = text;
  jump.appendChild(a);
}
chip("#how", "How the numbers work");
sections.forEach((s) => chip(`#${s.id}`, `${s.title} (${s.count})`));

// Search: shows only the recipes that match every word typed (name, ingredient, channel or section).
function applySearch() {
  const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  sections.forEach((s) => {
    const sectionEl_ = document.getElementById(s.id);
    let visible = 0;
    sectionEl_.querySelectorAll("tbody tr").forEach((tr) => {
      const match = words.every((w) => tr.dataset.search.includes(w));
      tr.hidden = !match;
      if (match) visible++;
    });
    sectionEl_.hidden = visible === 0;
    shown += visible;
  });
  const howEl = document.getElementById("how");
  if (howEl) howEl.hidden = words.length > 0;
  countEl.textContent = words.length ? `Showing ${shown} of ${total} recipes` : `${total} recipes`;
  emptyEl.hidden = shown > 0;
}
search.addEventListener("input", applySearch);
document.getElementById("search-clear").addEventListener("click", () => { search.value = ""; applySearch(); search.focus(); });
applySearch();

// Opening a link like recipes.html#r-abc123 scrolls to that recipe and highlights it.
if (location.hash.length > 1) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) {
    target.scrollIntoView({ block: target.tagName === "TR" ? "center" : "start", behavior: "instant" });
    if (target.tagName === "TR") target.classList.add("flash");
  }
}
