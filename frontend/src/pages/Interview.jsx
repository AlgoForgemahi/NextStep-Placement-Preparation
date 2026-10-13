import React, { useEffect, useState, useRef } from "react";
import { Clock, ArrowRight, MessagesSquare, Check } from "lucide-react";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { roles } from "../modules/topics";
import { Heading, Button, ErrorBox, Empty } from "../components/UI";
export default function Interview() {
  const history = useResource("/interviews"),
    [session, setSession] = useState(null),
    [role, setRole] = useState(roles[0]),
    [category, setCategory] = useState("Mixed"),
    [count, setCount] = useState(3),
    [minutes, setMinutes] = useState(15),
    [answer, setAnswer] = useState(""),
    [rating, setRating] = useState(3),
    [remaining, setRemaining] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const ending = useRef(false);
  const questions = session ? JSON.parse(session.questions) : [],
    answers = session ? JSON.parse(session.answers) : [];
  useEffect(() => {
    if (!session || session.status !== "IN_PROGRESS") return;
    const end =
      new Date(session.createdAt).getTime() + session.durationSeconds * 1000;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(left);
      if (!left && !ending.current) {
        ending.current = true;
        api
          .post(`/interviews/${session.id}/finish`)
          .then((r) => {
            setSession(r.data);
            history.reload();
          })
          .catch((e) => setError(e.message));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);
  async function start(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/interviews", {
        role,
        category,
        count: Number(count),
        durationSeconds: Number(minutes) * 60,
      });
      ending.current = false;
      setSession(data);
      setAnswer("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/interviews/${session.id}/answers`, {
        answer,
        selfRating: Number(rating),
      });
      setSession(data);
      setAnswer("");
      history.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow="CONFIDENCE / THROUGH PRACTICE"
        title="Find the words. Own your story."
        description="Text-based mock interviews with model answers, self-assessment and transparent keyword feedback."
      />
      <ErrorBox message={error || history.error} />
      {session?.status === "IN_PROGRESS" ? (
        <div className="interview-layout">
          <section className="card">
            <div className="section-title">
              <span className="badge">
                {session.category} · {session.role}
              </span>
              <span className="timer">
                <Clock size={16} />
                {Math.floor(remaining / 60)}:
                {String(remaining % 60).padStart(2, "0")}
              </span>
            </div>
            <span className="eyebrow">
              QUESTION {answers.length + 1} OF {questions.length}
            </span>
            <h2>{questions[answers.length]?.prompt}</h2>
            <progress max={questions.length} value={answers.length} />
            <label>
              Your answer
              <textarea
                rows={12}
                value={answer}
                maxLength={20000}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Describe the situation, your approach, and the result…"
              />
            </label>
            <label>
              Self-assessment: {rating}/5
              <input
                type="range"
                min={0}
                max={5}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </label>
            <div className="quiz-controls">
              <Button busy={busy} disabled={!answer.trim()} onClick={save}>
                Save & continue
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  api
                    .post(`/interviews/${session.id}/finish`)
                    .then((r) => {
                      setSession(r.data);
                      history.reload();
                    })
                    .catch((e) => setError(e.message))
                }
              >
                Finish session
              </Button>
            </div>
          </section>
          <section className="card">
            <MessagesSquare size={26} />
            <h3>A framework for clarity</h3>
            <p>
              Use a specific example, explain your contribution, and finish with
              what changed.
            </p>
            <h4>Self-evaluation checklist</h4>
            {[
              "I answered the actual question",
              "I used a concrete example",
              "I explained my own actions",
              "I described an outcome",
              "I kept the answer focused",
            ].map((item) => (
              <label className="check-label" key={item}>
                <input type="checkbox" />
                {item}
              </label>
            ))}
            <p className="muted">
              The self-rating is saved with your answer. Checklist ticks are a
              practice aid for this screen.
            </p>
          </section>
        </div>
      ) : session ? (
        <>
          <section className="card">
            <div className="section-title">
              <h2>Session reflection</h2>
              <span className="badge">
                {session.score}% keyword practice score
              </span>
            </div>
            <p className="muted">
              This rule-based score rewards answer length and recognized key
              points. It does not measure hiring suitability or represent AI
              feedback.
            </p>
            <p>
              {answers.length} answers saved ·{" "}
              {Math.round(session.elapsedSeconds / 60)} minutes
            </p>
            <Button onClick={() => setSession(null)}>
              Start another session
            </Button>
          </section>
          {answers.map((a, i) => (
            <section className="card" key={i}>
              <h3>{a.question}</h3>
              <p className="answer-text">{a.answer}</p>
              <p>
                <strong>Self-rating:</strong> {a.selfRating}/5
              </p>
              <p className="explanation">{a.feedback}</p>
              <details>
                <summary>Model answer & key ideas</summary>
                <p>{a.modelAnswer}</p>
              </details>
            </section>
          ))}
        </>
      ) : (
        <div className="interview-layout">
          <form className="card" onSubmit={start}>
            <span className="eyebrow">YOUR PRACTICE, YOUR PACE</span>
            <h2>Set up your mock interview</h2>
            <div className="form-grid">
              <label>
                Target role
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label>
                Interview mode
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {["Mixed", "HR", "Technical", "Behavioral"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label>
                Questions
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                />
              </label>
              <label>
                Duration (minutes)
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                />
              </label>
            </div>
            <Button busy={busy}>
              Begin interview
              <ArrowRight size={16} />
            </Button>
          </form>
          <section className="card interview-intro">
            <div className="large-icon">
              <MessagesSquare size={38} />
            </div>
            <h2>Practice before it matters.</h2>
            <p>
              Get a random set of role-relevant questions. Answer in your own
              words, reflect honestly, and learn from model responses.
            </p>
            <span className="badge">Text mode · No microphone required</span>
          </section>
        </div>
      )}
      <section className="card">
        <h3>Previous sessions</h3>
        {history.data?.length ? (
          history.data.map((s) => (
            <button
              className="history-row"
              key={s.id}
              onClick={() => {
                setSession(s);
                ending.current = false;
              }}
            >
              <div>
                <b>
                  {s.role} · {s.category}
                </b>
                <small>{new Date(s.createdAt).toLocaleString()}</small>
              </div>
              <span className="badge">
                {s.status === "IN_PROGRESS"
                  ? "Resume session"
                  : s.score + "% practice score"}
              </span>
            </button>
          ))
        ) : (
          <Empty />
        )}
      </section>
    </>
  );
}
