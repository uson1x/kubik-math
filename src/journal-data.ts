import source from "./content/journal.json" with { type: "json" };

export const journalOutcomes = ["сам", "с подсказкой", "пока трудно", "не пробовали"] as const;

export type JournalEntry = {
  lessonId: string;
  date: string;
  observation: string;
  next?: string;
  outcome: (typeof journalOutcomes)[number];
};

function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function readJournal(value: unknown): JournalEntry[] {
  if (!Array.isArray(value)) throw new Error("journal.json должен содержать массив записей.");

  return value.map((item: unknown, index) => {
    const location = `journal.json, запись №${index + 1}`;
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error(`${location} должна быть объектом.`);
    }

    const { lessonId, date, observation, next, outcome } = item as Record<string, unknown>;
    if (typeof lessonId !== "string" || !/^(0[1-9]|1[0-2])-[abc]$/.test(lessonId)) {
      throw new Error(`${location}. Укажите lessonId от 01-a до 12-c.`);
    }
    if (!isDate(date)) {
      throw new Error(`${location}. Укажите существующую дату в формате ГГГГ-ММ-ДД.`);
    }
    if (typeof observation !== "string" || !observation.trim()) {
      throw new Error(`${location}. В поле observation опишите, как прошло занятие.`);
    }
    if (next !== undefined && typeof next !== "string") {
      throw new Error(`${location}. Поле next должно быть строкой, если оно указано.`);
    }
    const matchedOutcome = journalOutcomes.find((option) => option === outcome);
    if (!matchedOutcome) {
      throw new Error(`${location}. Допустимые статусы outcome: ${journalOutcomes.join(", ")}.`);
    }
    return { lessonId, date, observation, next, outcome: matchedOutcome };
  });
}

export const entries = readJournal(source).sort((first, second) =>
  second.date.localeCompare(first.date),
);

export const completedLessonIds = new Set(
  entries.filter(({ outcome }) => outcome !== "не пробовали").map(({ lessonId }) => lessonId),
);
