import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Search,
  Bell,
  LogOut,
  ArrowUpRight,
  Settings,
  X,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/authContext";
import { api } from "../services/api";
import { nav } from "../modules/navigation";
const read = (key, fallback) => {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};
export default function Layout() {
  const { user, signOut } = useAuth(),
    location = useLocation();
  const [theme, setTheme] = useState(() => read("nextstep-theme", "light")),
    [collapsed, setCollapsed] = useState(
      () => read("nextstep-sidebar", "expanded") === "collapsed",
    ),
    [query, setQuery] = useState(""),
    [results, setResults] = useState([]),
    [notice, setNotice] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(
        "nextstep-sidebar",
        collapsed ? "collapsed" : "expanded",
      );
    } catch {}
  }, [collapsed]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("nextstep-theme", theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    setQuery("");
    setResults([]);
    document.title =
      (nav.find((n) => n[0] === location.pathname)?.[1] || "Profile") +
      " · NextStep";
  }, [location.pathname]);
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    const id = setTimeout(
      () =>
        api
          .get("/search?q=" + encodeURIComponent(query))
          .then((r) => {
            if (active) setResults(r.data);
          })
          .catch((e) => {
            if (active) setError(e.message);
          }),
      300,
    );
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [query]);
  return (
    <div className={"app " + (collapsed ? "collapsed" : "")}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span>
            <GraduationCap size={23} />
          </span>
          <b>
            NextStep<i>CAREER WORKSPACE</i>
          </b>
        </Link>
        <div className="nav-caption">PREPARE FOR WHAT’S NEXT</div>
        <nav>
          {nav.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} end={path === "/"} title={label}>
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-tip">
          <span className="tiny-icon">✦</span>
          <h4>Consistency compounds.</h4>
          <p>A small step today is a stronger start tomorrow.</p>
          <Link to="/aptitude">
            Start a practice <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="sidebar-user">
          <span className="avatar">{user.name[0]}</span>
          <div>
            <b>{user.name}</b>
            <small>{user.targetRole || "Placement candidate"}</small>
          </div>
          <button
            title="Sign out"
            aria-label="Sign out"
            onClick={() => signOut().catch((e) => setError(e.message))}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="header-left">
            <button
              className="icon-button collapse-control"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <PanelLeftOpen size={19} />
              ) : (
                <PanelLeftClose size={19} />
              )}
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span>{" "}
              <b>
                {nav.find((n) => n[0] === location.pathname)?.[1] || "Profile"}
              </b>
            </span>
          </div>
          <div className="header-right">
            <div className="global-search">
              <Search size={16} />
              <input
                aria-label="Search questions and problems"
                placeholder="Search your next skill…"
                value={query}
                maxLength={100}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query.length >= 2 && (
                <div className="search-results">
                  {results.length ? (
                    results.map((r, i) => (
                      <Link key={i} to={r.path} onClick={() => setQuery("")}>
                        <b>{r.title}</b>
                        <small>{r.topic}</small>
                      </Link>
                    ))
                  ) : (
                    <p>No matching questions or problems.</p>
                  )}
                </div>
              )}
            </div>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setNotice(!notice)}
            >
              <Bell size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link to="/profile" className="avatar" aria-label="Your profile">
              {user.name[0]}
            </Link>
          </div>
          {notice && (
            <div className="notification card">
              <div className="section-title">
                <h3>Your practice reminder</h3>
                <button
                  className="icon-button"
                  aria-label="Close notifications"
                  onClick={() => setNotice(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <p>
                Your daily goal is {user.dailyGoal} quiz questions. Check
                today’s progress and upcoming milestones.
              </p>
              <Link to="/progress" onClick={() => setNotice(false)}>
                Open My Progress →
              </Link>
            </div>
          )}
        </header>
        <main id="main" tabIndex={-1}>
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          <Outlet />
        </main>
        <footer>
          NextStep <span>Progress is a practice, not a destination.</span>
          <Link to="/profile">Learning preferences</Link>
        </footer>
      </div>
    </div>
  );
}
