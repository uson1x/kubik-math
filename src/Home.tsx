import { Link } from "@tanstack/react-router";
import { BookOpen, Check, ChevronRight, Clock3, Flag, Layers, Play, Sprout } from "lucide-react";
import { durationFor, lessons, weeks } from "./course";
import { completedLessonIds } from "./journal-data";
import year from "./content/year.json";

const artUrl = (name: string) => `${import.meta.env.BASE_URL}art/${name}.webp`;

export function Homepage({ month }: { month?: number }) {
  const next = lessons.find((item) => !completedLessonIds.has(item.id));
  const currentMonth = month ?? (next ? Math.ceil(next.week.number / 4) : 1);
  const theme = year.months[currentMonth - 1];
  const count = completedLessonIds.size;
  return (
    <div className="home">
      <header className="home-heading">
        <div>
          <h1>Математическая мастерская</h1>
          <p>Домашний курс для детей 5 лет. Играем с конструктором и открываем математику.</p>
        </div>
        <Link
          className="progress-link"
          to="/journal"
          aria-label={`Журнал. Проведено ${count} занятий из ${lessons.length}`}
        >
          <span className="progress-label">
            <Sprout size={17} /> Наш прогресс
          </span>
          <span className="progress-count">
            {count} из {lessons.length} занятий
          </span>
          <span className="progress-track">
            <span style={{ width: `${(100 * count) / lessons.length}%` }} />
          </span>
        </Link>
      </header>

      <section className="hero" aria-labelledby="next-lesson">
        <div className="hero-content">
          <span className="hero-tag">
            <span className="sun-dot" />
            {next ? "Ближайшее занятие" : "Первые 12 недель пройдены"}
          </span>
          <h2 id="next-lesson">{next?.lesson.title ?? "Что построим дальше?"}</h2>
          <p>
            {next?.id === "01-a"
              ? "Откроем склад и соберём для машинки заказ ровно из шести деталей."
              : (next?.lesson.goal ??
                "Выберите тему на следующий месяц или вернитесь к любимой игре.")}
          </p>
          <div className="hero-bottom">
            {next ? (
              <Link className="play-button" to="/lesson/$lessonId" params={{ lessonId: next.id }}>
                <Play size={16} fill="currentColor" />
                Открыть занятие
              </Link>
            ) : (
              <Link className="play-button" to="/year">
                <Flag size={16} />
                Открыть план года
              </Link>
            )}
            {next && (
              <span className="hero-duration">
                <Clock3 size={17} />
                {durationFor(next.week.number)}
              </span>
            )}
          </div>
          {next?.id === "01-a" && (
            <div className="hero-followup">
              Уже собирали заказы?{" "}
              <Link to="/lesson/$lessonId" params={{ lessonId: "01-b" }}>
                Игра «Делаем поровну»
              </Link>
            </div>
          )}
        </div>
        <div className="hero-art">
          <img src={artUrl("workshop")} alt="" width="1752" height="897" fetchPriority="high" />
        </div>
      </section>

      <section className="program" aria-labelledby="program-title">
        <div className="program-heading">
          <div>
            <h2 id="program-title">Занятия по неделям</h2>
            <p>
              Месяц {currentMonth} · {theme.title}
            </p>
          </div>
          <nav className="month-switcher" aria-label="Выбор месяца">
            {[1, 2, 3].map((m) => (
              <Link
                key={m}
                to="/"
                search={{ month: m }}
                resetScroll={false}
                className={m === currentMonth ? "selected" : ""}
                aria-current={m === currentMonth ? "true" : undefined}
              >
                Месяц {m}
              </Link>
            ))}
          </nav>
        </div>
        <div className="week-grid">
          {weeks
            .filter((week) => Math.ceil(week.number / 4) === currentMonth)
            .map((week) => {
              const completed = lessons.filter(
                (l) => l.week.number === week.number && completedLessonIds.has(l.id),
              ).length;
              return (
                <Link
                  key={week.number}
                  to="/week/$weekId"
                  params={{ weekId: String(week.number) }}
                  className={`week-card palette-${(week.number - 1) % 4}`}
                >
                  <div className="card-art">
                    <img src={artUrl(`week-${week.number}`)} alt="" width="768" height="512" />
                  </div>
                  <div className="card-main">
                    <span className="week-kicker">Неделя {week.number}</span>
                    <h3>{week.title}</h3>
                    <div className="card-foot">
                      <span>
                        {completed === 3 ? <Check size={15} /> : <Layers size={15} />}{" "}
                        {completed ? `${completed} из 3 занятий` : "3 занятия"}
                      </span>
                      <ChevronRight size={17} />
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>
      <Link className="year-strip" to="/year">
        <span className="strip-icon">
          <BookOpen size={24} />
        </span>
        <span>
          <strong>Весь курс на год</strong>
          <small>12 месяцев игр, построек и открытий</small>
        </span>
        <ChevronRight size={21} />
      </Link>
    </div>
  );
}
