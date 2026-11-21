import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { findLesson } from "./course";
import { entries, journalOutcomes, type JournalEntry } from "./journal-data";
import "./journal.css";

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function EntryList({ items, showLesson }: { items: JournalEntry[]; showLesson?: boolean }) {
  return (
    <ul className="journal-entries">
      {items.map(({ lessonId, date, observation, next, outcome }, index) => {
        const title = findLesson(lessonId)?.lesson.title ?? lessonId;
        return (
          <li className="journal-entry" key={`${lessonId}-${date}-${index}`}>
            <div className="journal-entry-meta">
              <time dateTime={date}>{dateFormat.format(new Date(date))}</time>
              <span className="journal-outcome">{outcome}</span>
            </div>
            {showLesson && (
              <h2>
                <Link to="/lesson/$lessonId" params={{ lessonId }}>
                  {title}
                </Link>
              </h2>
            )}
            <p>{observation}</p>
            {next && (
              <p>
                <strong>Следующий шаг.</strong> {next}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function JournalPage() {
  return (
    <section className="journal-page" aria-labelledby="journal-title">
      <h1 id="journal-title">Журнал занятий</h1>
      {entries.length ? (
        <EntryList items={entries} showLesson />
      ) : (
        <div className="journal-empty">
          <h2>Здесь будут записи о занятиях</h2>
          <p>
            После игры можно прислать в чат название занятия и пару слов о том, как оно прошло. На
            странице занятия есть и готовая форма.
          </p>
          <Link className="journal-button" to="/lesson/$lessonId" params={{ lessonId: "01-a" }}>
            Открыть первое занятие
          </Link>
        </div>
      )}
    </section>
  );
}

type Draft = {
  date: string;
  outcome: JournalEntry["outcome"] | "";
  observation: string;
  next: string;
};

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function DraftForm({ lessonId }: { lessonId: string }) {
  const storageKey = `math5-journal-draft:${lessonId}`;
  const [draft, setDraft] = useState<Draft>({ date: "", outcome: "", observation: "", next: "" });
  const [feedback, setFeedback] = useState<"idle" | "copied" | "manual">("idle");
  const manualText = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const empty = { date: today(), outcome: "", observation: "", next: "" } satisfies Draft;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        setDraft({ ...empty, ...JSON.parse(saved) });
        return;
      }
    } catch {
      // The draft can still be edited when browser storage is unavailable.
    }
    setDraft(empty);
  }, [storageKey]);

  useEffect(() => {
    if (feedback === "manual") {
      manualText.current?.focus();
      manualText.current?.select();
    }
  }, [feedback]);

  function update(changes: Partial<Draft>) {
    const upcoming = { ...draft, ...changes };
    setDraft(upcoming);
    setFeedback("idle");
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(upcoming));
    } catch {
      // Keep the draft in memory for the current visit.
    }
  }

  const chatText = [
    "Опубликуй, пожалуйста, запись в журнале занятий.",
    `Занятие: ${lessonId}`,
    `Дата: ${draft.date}`,
    `Как прошло: ${draft.outcome}`,
    `Наблюдение: ${draft.observation.trim()}`,
    draft.next.trim() && `Следующий шаг: ${draft.next.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");

  async function copyDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.date || !draft.outcome || !draft.observation.trim()) return;

    try {
      await navigator.clipboard.writeText(chatText);
      setFeedback("copied");
    } catch {
      setFeedback("manual");
    }
  }

  return (
    <form className="journal-draft" onSubmit={copyDraft}>
      <p>
        Это черновик для чата. Скопируйте его и пришлите с просьбой добавить в журнал. После
        публикации запись будет видна всем, у кого есть ссылка на сайт.
      </p>
      <div className="journal-fields">
        <label>
          Дата и занятие {lessonId}
          <input
            type="date"
            required
            value={draft.date}
            onChange={(event) => update({ date: event.target.value })}
          />
        </label>
        <label>
          Как прошло
          <select
            aria-label="Как прошло"
            required
            value={draft.outcome}
            onChange={(event) => {
              const value = event.target.value;
              update({ outcome: journalOutcomes.find((option) => option === value) ?? "" });
            }}
          >
            <option value="">Выберите статус</option>
            {journalOutcomes.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Короткое наблюдение
        <textarea
          rows={3}
          required
          value={draft.observation}
          onChange={(event) => update({ observation: event.target.value })}
        />
      </label>
      <label>
        Следующий шаг (по желанию)
        <textarea
          rows={2}
          value={draft.next}
          onChange={(event) => update({ next: event.target.value })}
        />
      </label>
      <div className="journal-draft-actions">
        <button
          type="submit"
          className="journal-button"
          disabled={!draft.observation.trim() || !draft.outcome || !draft.date}
        >
          Скопировать для чата
        </button>
        <span role="status">{feedback === "copied" ? "Запись скопирована" : ""}</span>
      </div>
      {feedback === "manual" && (
        <label>
          Автоматическое копирование недоступно. Выделите и скопируйте запись вручную.
          <textarea ref={manualText} readOnly rows={7} value={chatText} />
        </label>
      )}
    </form>
  );
}

export function LessonJournal({ lessonId }: { lessonId: string }) {
  const items = entries.filter((entry) => entry.lessonId === lessonId);
  return (
    <section className="lesson-journal" aria-labelledby="lesson-journal-title">
      <h2 id="lesson-journal-title">После занятия</h2>
      {items.length > 0 && <EntryList items={items} />}
      <details key={lessonId} className="journal-details">
        <summary>Записать, как прошло</summary>
        <DraftForm lessonId={lessonId} />
      </details>
    </section>
  );
}
