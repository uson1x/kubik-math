import first from "./content/weeks-1.json";
import second from "./content/weeks-2.json";
import third from "./content/weeks-3.json";

export const weeks = [...first, ...second, ...third];
export const letters = ["А", "Б", "В"] as const;
const idSuffixes = ["a", "b", "c"] as const;

export function lessonIdFor(week: number, index: number) {
  return `${String(week).padStart(2, "0")}-${idSuffixes[index]}`;
}

export function durationFor(week: number) {
  return week <= 2 ? "8–12 мин" : "12–15 мин";
}

export const lessons = weeks.flatMap((week) =>
  week.lessons.map((lesson, index) => ({
    id: lessonIdFor(week.number, index),
    week,
    lesson,
    index,
    letter: letters[index],
  })),
);

export function findLesson(id: string) {
  return lessons.find((item) => item.id === id);
}
