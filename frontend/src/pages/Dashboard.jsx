import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  Target,
  Flame,
  CheckCheck,
  Code2,
  ArrowUpRight,
  Download,
  Plus,
  Check,
} from "lucide-react";
import { useAuth } from "../context/authContext";
import { useResource } from "../hooks/useResource";
import { api, download } from "../services/api";
import {
  Heading,
  Stat,
  Loading,
  ErrorBox,
  Empty,
  Button,
} from "../components/UI";
import { nav } from "../modules/navigation";
export default function Dashboard({ analytics = false }) {
  const { user } = useAuth(),
    [days, setDays] = useState("30"),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const {
    data,
    loading,
    error: loadError,
    reload,
  } = useResource(
    "/progress?days=" +
      days +
      "&timezone=" +
      encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone),
  );
  if (loading && !data) return <Loading />;
  if (loadError) return <ErrorBox message={loadError} />;
  if (!data) return null;
  const weak = [...data.topics]
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);
  const done = data.goals.filter((g) => g.completed).length;
  const achievements = [
    ["First step", data.activities.length > 0],
    ["50 questions", data.attempted >= 50],
    ["Seven-day streak", data.streak >= 7],
    ["Goal getter", done > 0],
  ];
  async function addGoal(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(
        "/goals",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      e.target.reset();
      reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow={
          analytics
            ? "YOUR LEARNING, IN FOCUS"
            : "YOUR NEXT CHAPTER STARTS HERE"
        }
        title={
          analytics
            ? "Every step adds up."
            : `Let’s make progress, ${user.name.split(" ")[0]}.`
        }
        description={
          analytics
            ? "Understand your strengths. Give your next practice a purpose."
            : "Build your skills, one focused session at a time."
        }
      >
        <select
          aria-label="Date range"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        >
          <option value="1">Today</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="3650">All time</option>
        </select>
        {analytics && (
          <Button
            variant="secondary"
            onClick={() => download("nextstep-progress.json", data)}
          >
            <Download size={16} />
            Export
          </Button>
        )}
      </Heading>
      <ErrorBox message={error} />
      <div className="stats">
        <Stat
          label="Questions attempted"
          value={data.attempted}
          detail={`${data.correct} correct answers`}
          icon={CheckCheck}
        />
        <Stat
          label="Quiz accuracy"
          value={data.accuracy + "%"}
          detail="Weighted across your answers"
          icon={Target}
        />
        <Stat
          label="Coding problems solved"
          value={data.codingSolved}
          detail={`${data.codingAttempts} saved submissions`}
          icon={Code2}
        />
        <Stat
          label="Learning streak"
          value={`${data.streak} days`}
          detail="Consecutive days with saved activity"
          icon={Flame}
        />
      </div>
      {!analytics && (
        <div className="dashboard-hero">
          <div>
            <span className="eyebrow">
              A LITTLE PRACTICE. A LOT OF POSSIBILITY.
            </span>
            <h2>
              Your future is built
              <br />
              one good habit at a time.
            </h2>
            <p>Find your focus. Challenge yourself. Make today count.</p>
            <Link className="button" to="/aptitude">
              Start your daily practice <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="readiness">
            <div
              className="progress-ring"
              style={{ "--progress": data.coverage + "%" }}
            >
              <div>
                <strong>{data.coverage}%</strong>
                <span>QUESTION COVERAGE</span>
              </div>
            </div>
            <small>
              Unique questions practiced · all time
              <br />
              Coverage is not a hiring-readiness score.
            </small>
          </div>
        </div>
      )}
      <div className="dashboard-grid">
        <section className="card chart-card">
          <div className="section-title">
            <div>
              <span className="eyebrow">CONSISTENCY OVER TIME</span>
              <h3>Your learning rhythm</h3>
            </div>
            <span className="badge">
              {days === "3650" ? "Last 90 days" : days + " days"}
            </span>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline}>
                <defs>
                  <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7367f0" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7367f0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => d.slice(5)}
                  tick={{ fontSize: 10, fill: "var(--muted)" }}
                  minTickGap={30}
                />
                <YAxis
                  allowDecimals={false}
                  width={25}
                  tick={{ fontSize: 10, fill: "var(--muted)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="activities"
                  stroke="#7367f0"
                  strokeWidth={2.5}
                  fill="url(#chartFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {!data.activities.length && (
            <p className="muted">
              Your first completed activity will appear here.
            </p>
          )}
        </section>
        <section className="card daily-goal">
          <div className="section-title">
            <h3>Today’s focus</h3>
            <Target size={19} />
          </div>
          <strong>
            {data.todayQuestions}
            <small> / {data.dailyGoal} questions</small>
          </strong>
          <progress
            value={Math.min(data.todayQuestions, data.dailyGoal)}
            max={data.dailyGoal}
          />
          <p>
            {data.todayQuestions >= data.dailyGoal
              ? "Daily goal reached. Great consistency."
              : "A short practice session moves you closer."}
          </p>
          <Link to="/profile" className="text-link">
            Adjust your daily goal →
          </Link>
          <div className="goal-foot">
            <span>{Math.round(data.seconds / 60)} min practiced</span>
            <span>{data.interviews} interviews</span>
          </div>
        </section>
      </div>
      {!analytics && (
        <>
          <div className="section-title">
            <h2>Your preparation toolkit</h2>
            <span className="muted">Choose where to grow next</span>
          </div>
          <div className="toolkit">
            {nav.slice(1).map(([path, title, Icon], i) => (
              <Link className="card toolkit-card" key={path} to={path}>
                <div className={"module-icon color-" + i}>
                  <Icon size={22} />
                </div>
                <ArrowUpRight className="card-arrow" size={17} />
                <h3>{title}</h3>
                <p>
                  {
                    [
                      "Build speed and problem-solving confidence.",
                      "Strengthen the concepts behind your skills.",
                      "Turn an idea into a working solution.",
                      "Make your experience tell a clearer story.",
                      "Practice thoughtful, structured answers.",
                      "See the progress behind your practice.",
                    ][i]
                  }
                </p>
                <span>Open workspace →</span>
              </Link>
            ))}
          </div>
        </>
      )}
      <div className="dashboard-grid">
        <section className="card">
          <div className="section-title">
            <h3>{analytics ? "Topic accuracy" : "Recommended revision"}</h3>
            <span className="badge">From actual attempts</span>
          </div>
          {(analytics ? data.topics : weak).length ? (
            (analytics ? data.topics : weak).map((t) => (
              <div className="topic-row" key={t.topic}>
                <div>
                  <strong>{t.topic}</strong>
                  <small>
                    {t.correct} correct of {t.attempted}
                  </small>
                </div>
                <progress max={100} value={t.accuracy} />
                <b>{t.accuracy}%</b>
              </div>
            ))
          ) : (
            <Empty title="Discover your strengths">
              Complete a quiz to get recommendations grounded in your answers.
            </Empty>
          )}
        </section>
        <section className="card">
          <div className="section-title">
            <h3>Milestones & study plan</h3>
            <span className="badge">
              {done}/{data.goals.length} completed
            </span>
          </div>
          <div className="goals">
            {data.goals.map((g) => (
              <button
                key={g.id}
                className={"goal " + (g.completed ? "done" : "")}
                onClick={() =>
                  api
                    .post(`/goals/${g.id}/toggle`)
                    .then(reload)
                    .catch((e) => setError(e.message))
                }
              >
                <span className="checkbox">
                  {g.completed && <Check size={13} />}
                </span>
                <span>
                  {g.title}
                  <small>Due {g.dueDate}</small>
                </span>
              </button>
            ))}
          </div>
          <form className="goal-form" onSubmit={addGoal}>
            <label>
              New milestone
              <input
                name="title"
                required
                maxLength={200}
                placeholder="Revise SQL joins"
              />
            </label>
            <label>
              Target date
              <input name="dueDate" type="date" required />
            </label>
            <Button busy={saving} aria-label="Add milestone">
              <Plus size={17} />
            </Button>
          </form>
        </section>
      </div>
      {analytics && (
        <section className="card">
          <div className="section-title">
            <h3>Activity calendar</h3>
            <span className="muted">Each square is a day</span>
          </div>
          <div className="heatmap">
            {data.timeline.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.activities} activities`}
                tabIndex={0}
                aria-label={`${d.date}: ${d.activities} activities`}
                style={{
                  background: d.activities
                    ? "var(--accent)"
                    : "var(--surface-alt)",
                  opacity: d.activities
                    ? Math.min(1, 0.35 + d.activities * 0.15)
                    : 1,
                }}
              />
            ))}
          </div>
        </section>
      )}
      <section className="card">
        <div className="section-title">
          <h3>Achievements</h3>
          <span className="muted">Earned from your activity</span>
        </div>
        <div className="achievements">
          {achievements.map(([name, earned]) => (
            <div className={earned ? "earned" : ""} key={name}>
              <span>✦</span>
              <b>{name}</b>
              <small>{earned ? "Unlocked" : "Keep practicing"}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <div className="section-title">
          <h3>Recent activity</h3>
          <span className="muted">Up to 100 results in this range</span>
        </div>
        {data.activities.length ? (
          <div className="activity-list">
            {data.activities.slice(0, analytics ? 100 : 6).map((a, i) => (
              <div key={i}>
                <span className="activity-dot" />
                <div>
                  <b>{a.title}</b>
                  <small>{new Date(a.date).toLocaleString()}</small>
                </div>
                <span className="badge">{a.detail}</span>
              </div>
            ))}
          </div>
        ) : (
          <Empty />
        )}
      </section>
    </>
  );
}
