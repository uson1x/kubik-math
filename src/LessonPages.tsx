import { Link } from "@tanstack/react-router";
import { durationFor, findLesson, lessonIdFor, letters, weeks } from "./course";
import { LessonJournal } from "./Journal";
import "./lesson.css";

function Materials({ items }: { items: string[] }) {
  return (
    <ul className="lesson-materials">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="lesson-steps">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}

function MissingPage({ kind }: { kind: "week" | "lesson" }) {
  return (
    <section className="lesson-page">
      <Link className="lesson-back" to="/">
        ← К программе
      </Link>
      <h1>{kind === "week" ? "Неделя не найдена" : "Занятие не найдено"}</h1>
      <p>Выберите нужную неделю в программе.</p>
    </section>
  );
}

export function WeekPage({ weekId }: { weekId: string }) {
  const week = weeks.find((item) => String(item.number) === weekId);

  if (!week) return <MissingPage kind="week" />;

  return (
    <div className="week-page">
      <Link className="lesson-back" to="/">
        ← К программе
      </Link>
      <header className="lesson-heading">
        <p className="lesson-meta">
          <span>Неделя {week.number}</span>
          <span>{durationFor(week.number)} на занятие</span>
        </p>
        <h1>{week.title}</h1>
        <p className="lesson-lead">{week.goal}</p>
      </header>

      <section aria-labelledby="week-lessons-heading">
        <h2 id="week-lessons-heading">Занятия</h2>
        <ol className="week-lessons">
          {week.lessons.map((lesson, index) => (
            <li key={lesson.title}>
              <Link
                className="week-lesson-link"
                to="/lesson/$lessonId"
                params={{ lessonId: lessonIdFor(week.number, index) }}
              >
                <span className="week-letter" aria-hidden="true">
                  {letters[index]}
                </span>
                <div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.goal}</p>
                </div>
                <span className="week-link-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="week-extras">
        <details className="lesson-disclosure">
          <summary>
            <span>
              <small>Проект по желанию</small>
              {week.project.title}
            </span>
          </summary>
          <div className="lesson-disclosure-body">
            <h3>Что приготовить</h3>
            <Materials items={week.project.materials} />
            <h3>Ход проекта</h3>
            <Steps items={week.project.steps} />
          </div>
        </details>
        <details className="lesson-disclosure">
          <summary>Как подстроить неделю</summary>
          <dl className="lesson-notes lesson-disclosure-body">
            <div>
              <dt>Проще</dt>
              <dd>{week.easier}</dd>
            </div>
            <div>
              <dt>Сложнее</dt>
              <dd>{week.harder}</dd>
            </div>
            <div>
              <dt>В другой ситуации</dt>
              <dd>{week.transfer}</dd>
            </div>
            <div>
              <dt>Что заметить за неделю</dt>
              <dd>{week.watch}</dd>
            </div>
          </dl>
        </details>
      </div>
    </div>
  );
}

export function LessonPage({ lessonId }: { lessonId: string }) {
  const result = findLesson(lessonId);

  if (!result) return <MissingPage kind="lesson" />;

  const { week, lesson, index, letter } = result;
  const previous = week.lessons[index - 1];
  const next = week.lessons[index + 1];
  const weekParams = { weekId: String(week.number) };

  return (
    <div className="lesson-page">
      <Link className="lesson-back" to="/week/$weekId" params={weekParams}>
        ← Неделя {week.number} · {week.title}
      </Link>
      <header className="lesson-heading">
        <p className="lesson-meta">
          <span>Занятие {letter}</span>
          <span>{durationFor(week.number)}</span>
        </p>
        <h1>{lesson.title}</h1>
        <p className="lesson-lead">{lesson.goal}</p>
      </header>

      <div className="lesson-layout">
        <section className="lesson-prep" aria-labelledby="lesson-prep-heading">
          <h2 id="lesson-prep-heading">Что приготовить</h2>
          <Materials items={lesson.materials} />
        </section>
        <section className="lesson-play" aria-labelledby="lesson-play-heading">
          <h2 id="lesson-play-heading">Ход занятия</h2>
          <Steps items={lesson.steps} />
        </section>
      </div>

      <details className="lesson-disclosure lesson-hints">
        <summary>Подсказки взрослому</summary>
        <dl className="lesson-notes lesson-disclosure-body">
          <div>
            <dt>Что заметить на занятии</dt>
            <dd>{lesson.observe}</dd>
          </div>
          <div>
            <dt>Проще</dt>
            <dd>{week.easier}</dd>
          </div>
          <div>
            <dt>Сложнее</dt>
            <dd>{week.harder}</dd>
          </div>
          <div>
            <dt>В другой ситуации</dt>
            <dd>{week.transfer}</dd>
          </div>
        </dl>
      </details>

      <LessonJournal lessonId={lessonId} />

      <nav className="lesson-navigation" aria-label="Переход между занятиями">
        {previous ? (
          <Link to="/lesson/$lessonId" params={{ lessonId: lessonIdFor(week.number, index - 1) }}>
            <small>← Предыдущее занятие</small>
            <span>{previous.title}</span>
          </Link>
        ) : (
          <Link to="/week/$weekId" params={weekParams}>
            <span>← К занятиям недели</span>
          </Link>
        )}
        {next ? (
          <Link to="/lesson/$lessonId" params={{ lessonId: lessonIdFor(week.number, index + 1) }}>
            <small>Следующее занятие →</small>
            <span>{next.title}</span>
          </Link>
        ) : (
          <Link to="/week/$weekId" params={weekParams}>
            <small>Неделя {week.number} →</small>
            <span>Все занятия и проект</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
