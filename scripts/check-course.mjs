import assert from "node:assert/strict";
import { readFileSync, accessSync } from "node:fs";
import { entries } from "../src/journal-data.ts";

function json(name) {
  return JSON.parse(readFileSync(new URL(`../src/content/${name}.json`, import.meta.url), "utf8"));
}
function filled(value) {
  return typeof value === "string" && value.trim().length > 0;
}

const weeks = [1, 2, 3].flatMap((i) => json(`weeks-${i}`));
assert.equal(weeks.length, 12);
const validIds = new Set();
for (const [index, week] of weeks.entries()) {
  assert.equal(week.number, index + 1);
  for (const key of ["title", "goal", "easier", "harder", "watch", "transfer"]) {
    assert.ok(filled(week[key]), `Неделя ${week.number}: отсутствует ${key}`);
  }
  assert.equal(week.lessons.length, 3);
  for (const [i, lesson] of week.lessons.entries()) {
    assert.ok([lesson.title, lesson.goal, lesson.observe].every(filled));
    assert.ok(lesson.steps.length && lesson.steps.every(filled));
    assert.ok(lesson.materials.length && lesson.materials.every(filled));
    validIds.add(`${String(week.number).padStart(2, "0")}-${"abc"[i]}`);
  }
  assert.ok(
    filled(week.project.title) && week.project.steps.length && week.project.materials.length,
  );
  accessSync(new URL(`../public/art/week-${week.number}.webp`, import.meta.url));
}
for (const entry of entries) assert.ok(validIds.has(entry.lessonId));
const year = json("year");
assert.equal(year.months.length, 12);
for (const [index, month] of year.months.entries()) {
  assert.equal(month.number, index + 1);
  assert.equal(month.weeks.length, 4);
}
console.log(
  `Проверено: ${validIds.size} занятий, 12 проектов, 48 недель плана, записей в журнале: ${entries.length}.`,
);
