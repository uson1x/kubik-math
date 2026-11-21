import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import guide from "./content/guide.json";
import year from "./content/year.json";
import "./reference.css";

function ReferenceHeading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header className="ref-header">
      <Link className="ref-back" to="/">
        ← К занятиям
      </Link>
      <h1>{title}</h1>
      <p>{children}</p>
    </header>
  );
}

function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="ref-disclosure">
      <summary>{title}</summary>
      <div className="ref-disclosure-body">{children}</div>
    </details>
  );
}

function MonthCard({ month }: { month: (typeof year.months)[number] }) {
  const firstWeek = (month.number - 1) * 4 + 1;

  return (
    <article className="ref-month">
      <div className="ref-month-heading">
        <span className="ref-month-label">Месяц {month.number}</span>
        <h3>{month.title}</h3>
        <p>{month.goal}</p>
      </div>
      {month.number <= 3 ? (
        <div className="ref-month-body">
          <ul className="ref-week-links">
            {month.weeks.map((title, index) => {
              const weekId = String(firstWeek + index);
              return (
                <li key={title}>
                  <Link to="/week/$weekId" params={{ weekId }}>
                    <span className="ref-week-number">Неделя {weekId}</span>
                    <span>{title}</span>
                    <span className="ref-week-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="ref-tip">{month.tip}</p>
        </div>
      ) : (
        <details className="ref-month-disclosure">
          <summary>
            План на недели {firstWeek}–{firstWeek + 3}
          </summary>
          <div className="ref-month-body">
            <ol className="ref-later-weeks" start={firstWeek}>
              {month.weeks.map((week) => (
                <li key={week}>{week}</li>
              ))}
            </ol>
            <p className="ref-tip">{month.tip}</p>
          </div>
        </details>
      )}
    </article>
  );
}

export function YearPage() {
  return (
    <div className="ref-page">
      <ReferenceHeading title="План года">{year.intro}</ReferenceHeading>

      <section className="ref-section" aria-labelledby="ref-months-title">
        <h2 id="ref-months-title">Месяцы и недели</h2>
        <div className="ref-months">
          {year.months.map((month) => (
            <MonthCard key={month.number} month={month} />
          ))}
        </div>
      </section>

      <section className="ref-section" aria-labelledby="ref-review-title">
        <h2 id="ref-review-title">Как двигаться дальше</h2>
        <div className="ref-disclosures">
          <Disclosure title="Ориентиры по ходу года">
            <dl className="ref-milestones">
              {year.milestones.map(({ when, goal, example }) => (
                <div key={when}>
                  <dt>{when}</dt>
                  <dd>
                    {goal}
                    <p className="ref-tip">{example}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </Disclosure>
          <Disclosure title="Ритм обратной связи">
            <ul className="ref-bullets">
              {year.review.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Disclosure>
          <Disclosure title="Три варианта продолжения">
            <ul className="ref-bullets">
              {year.paths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Disclosure>
        </div>
      </section>
    </div>
  );
}

function GuideItem({ item }: { item: string }) {
  const parts = item.split(/(\[\d+\])/g);

  return (
    <li>
      {parts.map((part, index) => {
        const match = /^\[(\d+)\]$/.exec(part);
        const source = match ? guide.sources[Number(match[1]) - 1] : undefined;

        return source ? (
          <a key={index} className="ref-citation" href={source.url} aria-label={source.title}>
            {part}
          </a>
        ) : (
          part
        );
      })}
    </li>
  );
}

export function GuidePage() {
  return (
    <div className="ref-page">
      <ReferenceHeading title="Для родителей">
        Как начать занятия, подобрать посильную задачу и заметить, что ребёнок уже умеет.
      </ReferenceHeading>

      <div className="ref-disclosures">
        {guide.sections.map(({ title, items }) => (
          <Disclosure key={title} title={title}>
            <ul className="ref-bullets">
              {items.map((item) => (
                <GuideItem key={item} item={item} />
              ))}
            </ul>
          </Disclosure>
        ))}
        <Disclosure title="Источники">
          <ul className="ref-sources">
            {guide.sources.map(({ title, url, note }) => (
              <li key={url}>
                <a href={url}>{title}</a>
                <p>{note}</p>
              </li>
            ))}
          </ul>
        </Disclosure>
      </div>
    </div>
  );
}
