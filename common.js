// Small helpers shared by both pages.

function h(tag, props = {}, ...kids) {
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v === true) e.setAttribute(k, "");
    else if (v !== false && v != null) e.setAttribute(k, v);
  });
  kids.flat().forEach((k) => e.append(k));
  return e;
}

function fmt(n) {
  return n >= 10 ? String(Math.round(n)) : n.toFixed(1);
}

// Dates (used by the planner and its reminders).
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// The Monday of the week that contains d (weeks run Monday to Sunday).
const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));
