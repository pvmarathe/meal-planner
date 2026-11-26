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
    "Recipe shelf (the collapsed sections): 1 serving, as each recipe is written. Where there is a video, it is a close match found by searching YouTube, not this exact recipe. Their nutrition is worked out ingredient by ingredient from USDA data, and spices, fresh herbs, lemon and lime, salt, vinegars and curry pastes count as zero. Idli and dosa batter, appam batter, bhajani flour and ready-made kachori have no reliable weight, so those 12 recipes show no numbers.",
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
  if (r.url) {
    const a = document.createElement("a");
    a.href = r.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "Full recipe ↗";
    from.append(" · ", a);
  }
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

function row(r, sectionTitle, style) {
  const tr = document.createElement("tr");
  tr.id = `r-${r.id || r.video.split("v=")[1]}`;
  tr.dataset.tags = (r.tags || []).join("|");
  tr.dataset.style = style || "";
  tr.dataset.search = [r.name, r.channel, sectionTitle, style || "", ...(r.tags || []), ...r.ingredients.flatMap((p) => (typeof p === "string" ? [p] : p.items))].join(" ").toLowerCase();

  const nameCell = document.createElement("td");
  nameCell.className = "name";
  const nameText = document.createElement("span");
  nameText.textContent = r.name;
  const channel = document.createElement("span");
  channel.className = "channel";
  channel.textContent = r.channel;
  nameCell.append(nameText, channel);
  if (style) { const pill = document.createElement("span"); pill.className = "tag-pill style-pill"; pill.textContent = style; nameCell.appendChild(pill); }
  (r.tags || []).forEach((t) => { const pill = document.createElement("span"); pill.className = "tag-pill"; pill.textContent = t; nameCell.appendChild(pill); });

  const linkCell = document.createElement("td");
  linkCell.dataset.label = "Video";
  linkCell.className = "video-cell";
  if (r.video) {
    const a = document.createElement("a");
    a.className = "video-link";
    a.href = r.video;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = "Watch video ▶";
    a.setAttribute("aria-label", `Watch the ${r.name} video on YouTube (opens in a new tab)`);
    linkCell.appendChild(a);
  } else if (r.url) {
    const a = document.createElement("a");
    a.className = "video-link";
    a.href = r.url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = "Full recipe ↗";
    linkCell.appendChild(a);
  } else {
    linkCell.textContent = "No video";
  }

  tr.append(nameCell, ingredientsCell(r), macrosCell(r), linkCell);
  return tr;
}

function sectionEl(s) {
  const section = document.createElement("section");
  section.id = s.id;
  section.setAttribute("aria-labelledby", `${s.id}-heading`);

  const h2 = document.createElement("h2");
  h2.id = `${s.id}-heading`;
  // Inside the shelf the "Recipe shelf: " prefix is redundant, and inside the Veggie Delights group so is its name.
  let heading = s.inPlanner === false ? s.title.replace(/^Recipe shelf: /, "") : s.title;
  if (heading.startsWith("Veggie Delights, ")) heading = heading.charAt(17).toUpperCase() + heading.slice(18);
  h2.textContent = heading;

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
    const linkKey = r.video || r.id;
    if (seen.has(nameKey) || seen.has(linkKey)) {
      console.warn("Skipped duplicate recipe:", r.name);
      return;
    }
    seen.add(nameKey);
    seen.add(linkKey);
    tbody.appendChild(row(r, s.title, s.style));
    count++;
  });
  s.count = count;

  table.appendChild(tbody);
  wrap.appendChild(table);
  if (s.id.startsWith("more-")) {
    // The long "Recipe shelf" sections stay folded until clicked.
    h2.textContent = `${heading} (${count})`;
    const fold = document.createElement("details");
    fold.className = "fold";
    const summary = document.createElement("summary");
    summary.appendChild(h2);
    fold.append(summary, note, wrap);
    section.appendChild(fold);
    return section;
  }
  section.append(h2, note, wrap);
  return section;
}


const main = document.getElementById("sections");
const jump = document.getElementById("jump");
const search = document.getElementById("search");
const countEl = document.getElementById("count");
const emptyEl = document.getElementById("search-empty");

main.appendChild(methodSectionEl());
const plannerSections = sections.filter((s) => s.inPlanner !== false);
const shelfSections = sections.filter((s) => s.inPlanner === false);
plannerSections.forEach((s) => main.appendChild(sectionEl(s)));

// The Recipe shelf: every recipe the planner never picks, in one block that starts closed (the filters live inside it).
const shelfEl = document.createElement("details");
shelfEl.className = "shelf";
shelfEl.id = "shelf";
const shelfBody = document.createElement("div");
shelfBody.className = "shelf-body";
// The nine Veggie Delights sections sit together in their own closed group at the end of the shelf.
const isVD = (s) => s.id.startsWith("more-ivd-");
const vdEl = document.createElement("details");
vdEl.className = "subshelf";
vdEl.id = "veggie-delights";
const vdBody = document.createElement("div");
shelfSections.forEach((s) => (isVD(s) ? vdBody : shelfBody).appendChild(sectionEl(s)));
const vdTotal = shelfSections.filter(isVD).reduce((n, s) => n + s.count, 0);
const vdSummary = document.createElement("summary");
const vdTitle = document.createElement("span");
vdTitle.className = "subshelf-title";
vdTitle.textContent = "Veggie Delights";
const vdCountEl = document.createElement("span");
vdCountEl.className = "shelf-count";
vdSummary.append(vdTitle, vdCountEl);
vdEl.append(vdSummary, vdBody);
shelfBody.appendChild(vdEl);
const shelfTotal = shelfSections.reduce((n, s) => n + s.count, 0);
const shelfSummary = document.createElement("summary");
const shelfTitle = document.createElement("span");
shelfTitle.className = "shelf-title";
shelfTitle.textContent = "Recipe shelf";
const shelfCountEl = document.createElement("span");
shelfCountEl.className = "shelf-count";
const shelfHint = document.createElement("span");
shelfHint.className = "shelf-hint";
shelfHint.textContent = "Browse by style and main ingredient";
shelfSummary.append(shelfTitle, shelfCountEl, shelfHint);
shelfEl.append(shelfSummary, shelfBody);
main.appendChild(shelfEl);

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
plannerSections.forEach((s) => chip(`#${s.id}`, `${s.title} (${s.count})`));
chip("#shelf", `Recipe shelf (${shelfTotal})`);

// Two filters that combine: Style (Indian, Blue Zones, Mediterranean...) and Main ingredient. Only the recipes on this page that the planner
// never picks (the "Recipe shelf") carry a style and a main-ingredient tag. A button shows how many recipes it holds.
const filters = { style: "", tag: "" };
const styleCounts = {};
sections.forEach((s) => { if (s.style) styleCounts[s.style] = (styleCounts[s.style] || 0) + s.count; });
const tagCounts = {};
sections.forEach((s) => s.recipes.forEach((r) => (r.tags || []).forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; })));
const STYLE_ORDER = ["Indian", "Blue Zones", "Mediterranean", "Thai × Indian", "Restaurant", "Kids' lunch boxes", "Dressings"];
const TAG_ORDER = ["Paneer", "Lentil & Beans", "Rice & Grains", "Millet", "Quinoa", "Makhana", "Pasta & Noodles", "Vegetables", "Other"];

function filterBar(labelText, ariaLabel, key, order, counts) {
  const bar = document.createElement("div");
  bar.className = "tag-filter";
  bar.setAttribute("role", "group");
  bar.setAttribute("aria-label", ariaLabel);
  const label = document.createElement("span");
  label.className = "tag-filter-label";
  label.textContent = labelText;
  bar.appendChild(label);
  const buttons = [];
  [["", "All"], ...order.filter((v) => counts[v]).map((v) => [v, `${v} (${counts[v]})`])].forEach(([value, text]) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip tag-btn"; b.textContent = text; b.setAttribute("aria-pressed", value === "" ? "true" : "false");
    b.addEventListener("click", () => { filters[key] = value; buttons.forEach((x) => x.el.setAttribute("aria-pressed", String(x.value === value))); applySearch(); });
    buttons.push({ el: b, value });
    bar.appendChild(b);
  });
  return bar;
}
const styleBar = filterBar("Style:", "Filter by style", "style", STYLE_ORDER, styleCounts);
const tagBar = filterBar("Main ingredient:", "Filter by main ingredient", "tag", TAG_ORDER, tagCounts);
const shelfIntro = document.createElement("p");
shelfIntro.className = "shelf-intro";
shelfIntro.textContent = "Recipes the meal planner never picks. Choose a style, a main ingredient, or both.";
shelfBody.prepend(shelfIntro, styleBar, tagBar);

// Search: shows only the recipes that match every word typed (name, ingredient, channel, style or section) and the chosen style and main ingredient.
function applySearch() {
  const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
  const filtering = words.length > 0 || filters.style !== "" || filters.tag !== "";
  let shown = 0;
  let shelfShown = 0;
  let vdShown = 0;
  sections.forEach((s) => {
    const sectionEl_ = document.getElementById(s.id);
    let visible = 0;
    sectionEl_.querySelectorAll("tbody tr").forEach((tr) => {
      const match = words.every((w) => tr.dataset.search.includes(w)) && (!filters.style || tr.dataset.style === filters.style) && (!filters.tag || (tr.dataset.tags || "").split("|").includes(filters.tag));
      tr.hidden = !match;
      if (match) visible++;
    });
    sectionEl_.hidden = visible === 0;
    const fold = sectionEl_.querySelector("details.fold");
    if (fold) fold.open = filtering && visible > 0; // folded sections open while a search is showing their matches
    shown += visible;
    if (s.inPlanner === false) shelfShown += visible;
    if (isVD(s)) vdShown += visible;
  });
  shelfCountEl.textContent = filtering ? `${shelfShown} of ${shelfTotal} recipes` : `${shelfTotal} recipes`;
  vdCountEl.textContent = filtering ? `${vdShown} of ${vdTotal} recipes` : `${vdTotal} recipes`;
  if (filtering && vdShown > 0) vdEl.open = true; // the Veggie Delights group opens when a search or filter finds recipes in it
  if (filtering && shelfShown > 0) shelfEl.open = true; // a search or filter that finds shelf recipes opens the shelf
  const howEl = document.getElementById("how");
  if (howEl) howEl.hidden = filtering;
  countEl.textContent = filtering ? `Showing ${shown} of ${total} recipes` : `${total} recipes`;
  emptyEl.hidden = shown > 0;
}
search.addEventListener("input", applySearch);
document.getElementById("search-clear").addEventListener("click", () => { search.value = ""; applySearch(); search.focus(); });
applySearch();

// Opening a link like recipes.html#r-abc123 scrolls to that recipe and highlights it.
// A folded section is opened first, so the target is visible.
function goToHash() {
  if (location.hash.length <= 1) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  const isShelf = target.matches("details.shelf");
  const shelfFold = isShelf ? target : target.closest("details.shelf");
  if (shelfFold) shelfFold.open = true;
  const vdFold = target.matches("details.subshelf") ? target : target.closest("details.subshelf");
  if (vdFold) vdFold.open = true;
  const fold = isShelf || target === vdFold ? null : target.querySelector("details.fold") || target.closest("details.fold");
  if (fold) fold.open = true;
  target.scrollIntoView({ block: target.tagName === "TR" ? "center" : "start", behavior: "instant" });
  if (target.tagName === "TR") target.classList.add("flash");
}
goToHash();
window.addEventListener("hashchange", goToHash);
