import React, { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Check,
  RotateCcw,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/authContext";
import { useResource } from "../hooks/useResource";
import { Heading, Button, ErrorBox, Loading, Empty } from "../components/UI";
import * as topics from "../modules/topics";
export default function Practice({ kind }) {
  const { user } = useAuth();
  const recoveryKey = `nextstep-quiz-${user.id}-${kind}`;
  const [recovered, setRecovered] = useState(false);
  const [topic, setTopic] = useState(""),
    [difficulty, setDifficulty] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(0),
    [count, setCount] = useState(10),
    [minutes, setMinutes] = useState(10),
    [session, setSession] = useState(null),
    [answers, setAnswers] = useState({}),
    [flags, setFlags] = useState({}),
    [index, setIndex] = useState(0),
    [remaining, setRemaining] = useState(null),
    [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [savedOnly, setSavedOnly] = useState(false),
    [revisionOnly, setRevisionOnly] = useState(false);
  const submitted = useRef(false),
    latest = useRef({});
  latest.current = answers;
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(recoveryKey) || "null");
      if (
        saved?.session?.id &&
        Array.isArray(saved.session.questions) &&
        saved.session.questions.length
      ) {
        setSession(saved.session);
        setAnswers(saved.answers || {});
        setFlags(saved.flags || {});
        setIndex(
          Math.max(
            0,
            Math.min(saved.index || 0, saved.session.questions.length - 1),
          ),
        );
      }
    } catch {
      /* An invalid or unavailable browser cache must not prevent practice. */
    }
    setRecovered(true);
  }, [recoveryKey]);
  useEffect(() => {
    if (!recovered) return;
    try {
      if (session && !result)
        sessionStorage.setItem(
          recoveryKey,
          JSON.stringify({ session, answers, flags, index }),
        );
      else sessionStorage.removeItem(recoveryKey);
    } catch {
      /* Practice remains available when browser storage is disabled. */
    }
  }, [recovered, recoveryKey, session, result, answers, flags, index]);
  const bank = useResource(
      `/questions?kind=${kind}&topic=${encodeURIComponent(topic)}&difficulty=${difficulty}&search=${encodeURIComponent(search)}&page=${page}`,
    ),
    bookmarks = useResource("/bookmarks"),
    history = useResource("/quizzes");
  useEffect(() => {
    setPage(0);
  }, [topic, difficulty, search]);
  useEffect(() => {
    if (!session || !session.durationSeconds || result) return;
    const end =
      new Date(session.startedAt).getTime() + session.durationSeconds * 1000;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !submitted.current) finish(latest.current);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session, result]);
  async function start() {
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/quizzes", {
        kind,
        topic,
        difficulty,
        count: Number(count),
        durationSeconds: Number(minutes) * 60,
      });
      submitted.current = false;
      setSession(data);
      setResult(null);
      setAnswers({});
      setFlags({});
      setIndex(0);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function finish(selected = answers) {
    if (submitted.current) return;
    submitted.current = true;
    setBusy(true);
    try {
      const { data } = await api.post(`/quizzes/${session.id}/submit`, {
        answers: selected,
      });
      setResult(data);
      try {
        sessionStorage.removeItem(recoveryKey);
      } catch {}
      history.reload();
    } catch (e) {
      setError(e.message);
      submitted.current = false;
      // A response can be lost after the server has saved the result.
      try {
        const { data } = await api.get("/quizzes");
        const completed = data.find((attempt) => attempt.id === session.id);
        if (completed) {
          setResult(completed);
          setError("");
          submitted.current = true;
        }
      } catch {
        /* Keep the original error and allow a retry. */
      }
    } finally {
      setBusy(false);
    }
  }
  async function bookmark(id) {
    try {
      await api.post("/bookmarks/" + id);
      bookmarks.reload();
    } catch (e) {
      setError(e.message);
    }
  }
  const incorrect = new Set(
    (history.data || []).flatMap((a) =>
      JSON.parse(a.details || "[]")
        .filter((q) => !q.correct)
        .map((q) => q.id),
    ),
  );
  if (session && !result) {
    const q = session.questions[index];
    return (
      <div className="quiz-workspace">
        <Heading
          eyebrow={kind.toUpperCase() + " / EXAM MODE"}
          title="One question. One step forward."
          description="Answers are scored by the server when you finish."
        >
          <Button
            variant="secondary"
            onClick={() => {
              if (document.fullscreenElement) document.exitFullscreen?.();
              else
                document.documentElement
                  .requestFullscreen?.()
                  .catch(() =>
                    setError(
                      "Full-screen mode is not supported in this browser.",
                    ),
                  );
            }}
          >
            <Maximize size={16} />
            Focus
          </Button>
          <span className="timer">
            <Clock size={17} />
            {session.durationSeconds
              ? `${Math.floor((remaining ?? session.durationSeconds) / 60)}:${String((remaining ?? session.durationSeconds) % 60).padStart(2, "0")}`
              : "Untimed"}
          </span>
        </Heading>
        <ErrorBox message={error} />
        <div className="quiz-layout">
          <section className="card question-card">
            <div className="section-title">
              <span className="badge">
                {q.topic} · {q.difficulty}
              </span>
              <span className="muted">
                Question {index + 1} of {session.questions.length}
              </span>
            </div>
            <h2>{q.prompt}</h2>
            <div className="answer-options">
              {q.options.map((option, i) => (
                <label
                  className={answers[q.id] === i ? "selected" : ""}
                  key={i}
                >
                  <input
                    type="radio"
                    name={"answer-" + q.id}
                    checked={answers[q.id] === i}
                    onChange={() => setAnswers({ ...answers, [q.id]: i })}
                  />
                  <span>{String.fromCharCode(65 + i)}</span>
                  {option}
                </label>
              ))}
            </div>
            <div className="quiz-controls">
              <Button
                variant="secondary"
                disabled={index === 0}
                onClick={() => setIndex(index - 1)}
              >
                <ArrowLeft size={16} />
                Previous
              </Button>
              <Button
                variant="ghost"
                onClick={() => setFlags({ ...flags, [q.id]: !flags[q.id] })}
              >
                <Flag size={16} />
                {flags[q.id] ? "Unflag" : "Flag for review"}
              </Button>
              <Button
                disabled={index === session.questions.length - 1}
                onClick={() => setIndex(index + 1)}
              >
                Next
                <ArrowRight size={16} />
              </Button>
            </div>
          </section>
          <section className="card palette">
            <h3>Your question map</h3>
            <p className="muted">
              {Object.keys(answers).length} answered ·{" "}
              {Object.values(flags).filter(Boolean).length} flagged
            </p>
            <div>
              {session.questions.map((q, i) => (
                <button
                  aria-label={`Question ${i + 1}${answers[q.id] !== undefined ? ", answered" : ""}${flags[q.id] ? ", flagged" : ""}`}
                  className={`${answers[q.id] !== undefined ? "answered" : ""} ${flags[q.id] ? "flagged" : ""} ${i === index ? "current" : ""}`}
                  key={q.id}
                  onClick={() => setIndex(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button busy={busy} onClick={() => finish()}>
              Submit assessment
            </Button>
            <p className="muted">
              Unanswered questions score zero. Timed quizzes submit
              automatically. Answers are recovered after a refresh in this tab.
            </p>
          </section>
        </div>
      </div>
    );
  }
  if (result) {
    const review = JSON.parse(result.details);
    return (
      <>
        <Heading
          eyebrow="ASSESSMENT COMPLETE"
          title={`${result.score} of ${result.total} correct.`}
          description={`${Math.round((result.score / result.total) * 100)}% accuracy · ${result.elapsedSeconds}s elapsed · ${Math.round(result.elapsedSeconds / result.total)}s per question${result.status === "EXPIRED" ? " · Submitted outside the allowed time window." : ""}`}
        >
          <Button
            onClick={() => {
              setSession(null);
              setResult(null);
            }}
          >
            Back to practice
          </Button>
        </Heading>
        {review.map((q) => (
          <section className="card review-question" key={q.id}>
            <span className={"badge " + (q.correct ? "success" : "warning")}>
              {q.correct
                ? "Correct"
                : q.selected == null
                  ? "Unanswered"
                  : "Needs revision"}
            </span>
            <h3>{q.prompt}</h3>
            <p>
              Your answer: {q.selected == null ? "—" : q.options[q.selected]}
            </p>
            <p>
              <strong>Correct answer:</strong> {q.options[q.answer]}
            </p>
            <p className="explanation">{q.explanation}</p>
            <Button variant="ghost" onClick={() => bookmark(q.id)}>
              <Bookmark size={15} />
              {bookmarks.data?.includes(q.id)
                ? "Remove bookmark"
                : "Save for revision"}
            </Button>
          </section>
        ))}
      </>
    );
  }
  const visible =
    bank.data?.items.filter(
      (q) =>
        (!savedOnly || bookmarks.data?.includes(q.id)) &&
        (!revisionOnly || incorrect.has(q.id)),
    ) || [];
  return (
    <>
      <Heading
        eyebrow="PREPARE / PRACTICE / IMPROVE"
        title={
          kind === "aptitude"
            ? "Build your problem-solving edge."
            : "Make your fundamentals second nature."
        }
        description="Explore explained questions or test yourself in a randomized assessment."
      />
      <ErrorBox message={error || bank.error} />
      <div className="practice-setup card">
        <div className="filters">
          <label>
            Topic
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="">All topics</option>
              {topics[kind].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">All levels</option>
              {["Easy", "Medium", "Hard"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Questions
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </label>
          <label>
            Minutes (0 = untimed)
            <input
              type="number"
              min={0}
              max={180}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>
          <Button
            busy={busy}
            disabled={count < 1 || count > 50 || minutes < 0 || minutes > 180}
            onClick={start}
          >
            Start quiz
            <ArrowRight size={16} />
          </Button>
        </div>
        <p className="muted">
          If fewer questions match, the quiz uses all available matches.
          Question order is randomized.
        </p>
      </div>
      <div className="section-title">
        <h2>
          Question library{" "}
          <span className="badge">{bank.data?.total || 0}</span>
        </h2>
        <div className="inline-controls">
          <input
            type="search"
            aria-label="Search questions"
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant={savedOnly ? "" : "secondary"}
            onClick={() => setSavedOnly(!savedOnly)}
          >
            <Bookmark size={16} />
            Saved
          </Button>
          <Button
            variant={revisionOnly ? "" : "secondary"}
            onClick={() => setRevisionOnly(!revisionOnly)}
          >
            <RotateCcw size={16} />
            Incorrect
          </Button>
        </div>
      </div>
      {bank.loading ? (
        <Loading />
      ) : visible.length ? (
        visible.map((q) => (
          <section className="card library-question" key={q.id}>
            <div className="section-title">
              <span className="badge">
                {q.topic} · {q.difficulty}
              </span>
              <button
                className="icon-button"
                aria-label={
                  bookmarks.data?.includes(q.id)
                    ? "Remove bookmark"
                    : "Bookmark question"
                }
                onClick={() => bookmark(q.id)}
              >
                <Bookmark
                  size={18}
                  fill={
                    bookmarks.data?.includes(q.id) ? "currentColor" : "none"
                  }
                />
              </button>
            </div>
            <h3>{q.prompt}</h3>
            <details>
              <summary>Study answer & explanation</summary>
              <p>
                <strong>{q.options[q.answer]}</strong>
              </p>
              <p>{q.explanation}</p>
            </details>
          </section>
        ))
      ) : (
        <Empty title="No questions match this view">
          Saved and incorrect filters apply to the current library page. Adjust
          your filters or move to another page.
        </Empty>
      )}
      <div className="pagination">
        <Button
          variant="secondary"
          disabled={!page}
          onClick={() => setPage(page - 1)}
        >
          Previous page
        </Button>
        <span>
          Page {page + 1} of {Math.max(1, bank.data?.pages || 1)}
        </span>
        <Button
          variant="secondary"
          disabled={page + 1 >= (bank.data?.pages || 1)}
          onClick={() => setPage(page + 1)}
        >
          Next page
        </Button>
      </div>
      <section className="card">
        <h3>Your assessment history</h3>
        {history.data?.filter((a) => a.kind === kind).length ? (
          history.data
            .filter((a) => a.kind === kind)
            .slice(0, 15)
            .map((a) => (
              <button
                className="history-row"
                key={a.id}
                onClick={() => setResult(a)}
              >
                <span>{new Date(a.createdAt).toLocaleString()}</span>
                <b>
                  {a.score}/{a.total}
                </b>
                <span>Review →</span>
              </button>
            ))
        ) : (
          <Empty />
        )}
      </section>
    </>
  );
}
