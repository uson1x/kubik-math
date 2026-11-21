import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  createRootRoute,
  createRoute,
  createRouter,
  createHashHistory,
  Link,
  Outlet,
  RouterProvider,
  useRouterState,
} from "@tanstack/react-router";
import { BookOpen, House, Map, NotebookPen } from "lucide-react";
import "@fontsource-variable/nunito";
import "./style.css";
import { Homepage } from "./Home";
import { WeekPage, LessonPage } from "./LessonPages";
import { YearPage, GuidePage } from "./ReferencePages";
import { JournalPage } from "./Journal";
import { findLesson, weeks } from "./course";

const nav = [
  { to: "/", label: "Мастерская", Icon: House },
  { to: "/year", label: "План года", Icon: Map },
  { to: "/journal", label: "Журнал", Icon: NotebookPen },
  { to: "/guide", label: "Родителям", Icon: BookOpen },
] as const;

function PageFrame() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const section = nav.find((item) => item.to === pathname);
  useEffect(() => {
    const lesson = pathname.startsWith("/lesson/") && findLesson(pathname.split("/")[2]);
    const week =
      pathname.startsWith("/week/") &&
      weeks.find((item) => String(item.number) === pathname.split("/")[2]);
    document.title = `${lesson ? lesson.lesson.title : week ? week.title : (section?.label ?? "Страница")} · Кубик`;
  }, [pathname, section]);

  return (
    <>
      <a
        className="skip"
        href="#content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("content")?.focus();
        }}
      >
        К содержанию
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" search={{}} className="brand" aria-label="Кубик — на главную">
            <img src={`${import.meta.env.BASE_URL}kubik.svg`} width="39" height="39" alt="" />
            Кубик
          </Link>
          <nav className="main-nav" aria-label="Главное меню">
            {nav.map(({ to, label, Icon }) => {
              const active = pathname === to || (to === "/" && /^\/(week|lesson)\//.test(pathname));
              return (
                <Link
                  to={to}
                  search={{}}
                  className={`nav-item${active ? " chosen" : ""}`}
                  aria-current={active ? "page" : undefined}
                  key={to}
                >
                  <Icon size={18} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="page" id="content" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}

function Missing() {
  return (
    <section className="missing">
      <h1>Страница не найдена</h1>
      <Link to="/">Вернуться в мастерскую</Link>
    </section>
  );
}
const root = createRootRoute({ component: PageFrame, notFoundComponent: Missing });
const home = createRoute({
  getParentRoute: () => root,
  path: "/",
  validateSearch: (search: Record<string, unknown>): { month?: number } => {
    const value = Number(search.month);
    return [1, 2, 3].includes(value) ? { month: value } : {};
  },
  component: () => <Homepage month={home.useSearch().month} />,
});
const week = createRoute({
  getParentRoute: () => root,
  path: "week/$weekId",
  component: () => <WeekPage key={week.useParams().weekId} weekId={week.useParams().weekId} />,
});
const lesson = createRoute({
  getParentRoute: () => root,
  path: "lesson/$lessonId",
  component: () => (
    <LessonPage key={lesson.useParams().lessonId} lessonId={lesson.useParams().lessonId} />
  ),
});
const year = createRoute({ getParentRoute: () => root, path: "year", component: YearPage });
const journal = createRoute({
  getParentRoute: () => root,
  path: "journal",
  component: JournalPage,
});
const guide = createRoute({ getParentRoute: () => root, path: "guide", component: GuidePage });

const router = createRouter({
  routeTree: root.addChildren([home, week, lesson, year, journal, guide]),
  history: createHashHistory(),
  scrollRestoration: true,
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
