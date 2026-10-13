import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { Play, Send, Terminal, ArrowLeft } from "lucide-react";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { Heading, Loading, ErrorBox, Button, Empty } from "../components/UI";
export default function Coding() {
  const resource = useResource("/coding"),
    [params, setParams] = useSearchParams();
  const [id, setId] = useState(params.get("problem") || ""),
    [problem, setProblem] = useState(null),
    [language, setLanguage] = useState("Python"),
    [code, setCode] = useState(""),
    [editorTheme, setEditorTheme] = useState("dark"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState(null),
    [difficulty, setDifficulty] = useState(""),
    [search, setSearch] = useState("");
  useEffect(() => {
    setId(params.get("problem") || "");
  }, [params]);
  useEffect(() => {
    if (!id) {
      setProblem(null);
      return;
    }
    let active = true;
    api
      .get("/coding/" + id)
      .then((r) => {
        if (active) {
          setProblem(r.data);
          setResult(null);
          setCode("");
        }
      })
      .catch((e) => setError(e.message));
    return () => {
      active = false;
    };
  }, [id]);
  async function execute(action) {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/coding/${id}/${action}`, {
        language,
        code,
      });
      setResult(data);
      resource.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (resource.loading && !resource.data) return <Loading />;
  return (
    <>
      <Heading
        eyebrow="CODE / LEARN / REPEAT"
        title="Ideas into working solutions."
        description="Build problem-solving confidence in a focused coding workspace."
      />
      <ErrorBox message={error || resource.error} />
      {!resource.data?.configured && (
        <div className="notice">
          <Terminal size={18} />
          <div>
            <strong>Execution service is not configured.</strong>
            <p>
              Run reports this limitation. Submit saves your code as ungraded;
              no accepted result or solved count is invented.
            </p>
          </div>
        </div>
      )}
      {!problem ? (
        <>
          <div className="filters card">
            <label>
              Search problems
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Arrays, graphs, palindrome…"
              />
            </label>
            <label>
              Difficulty
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="">All levels</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </label>
          </div>
          <div className="problem-list">
            {resource.data?.problems
              .filter(
                (p) =>
                  (!difficulty || p.difficulty === difficulty) &&
                  (p.title + " " + p.topic)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((p) => {
                const submissions = resource.data.submissions.filter(
                  (s) => s.problemId === p.id,
                );
                return (
                  <button
                    className="card problem-row"
                    key={p.id}
                    onClick={() => setParams({ problem: p.id })}
                  >
                    <span className="problem-number">
                      {String(p.id).padStart(2, "0")}
                    </span>
                    <div>
                      <h3>{p.title}</h3>
                      <small>{p.topic}</small>
                    </div>
                    <span className={"badge " + p.difficulty.toLowerCase()}>
                      {p.difficulty}
                    </span>
                    <span className="muted">
                      {submissions.some((s) => s.status === "ACCEPTED")
                        ? "Solved"
                        : submissions.length
                          ? "Attempted"
                          : "Unsolved"}{" "}
                      →
                    </span>
                  </button>
                );
              })}
          </div>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={() => setParams({})}>
            <ArrowLeft size={16} />
            All problems
          </Button>
          <div className="coding-layout">
            <section className="card problem-pane">
              <span className="badge">
                {problem.topic} · {problem.difficulty}
              </span>
              <h2>{problem.title}</h2>
              <p>{problem.description}</p>
              <h4>Constraints</h4>
              <p className="muted">{problem.constraints}</p>
              <h4>Sample input</h4>
              <pre>{problem.sample.input}</pre>
              <h4>Expected output</h4>
              <pre>{problem.sample.output}</pre>
              {problem.hints.map((h, i) => (
                <details key={i}>
                  <summary>Hint {i + 1}</summary>
                  <p>{h}</p>
                </details>
              ))}
              <details>
                <summary>Solution approach & complexity</summary>
                <p>{problem.solution}</p>
                <p>{problem.complexity}</p>
              </details>
            </section>
            <section className="card editor-pane">
              <div className="editor-toolbar">
                <select
                  aria-label="Programming language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {["Python", "Java", "C", "C++"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
                <select
                  aria-label="Editor theme"
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value)}
                >
                  <option value="dark">Dark editor</option>
                  <option value="light">Light editor</option>
                </select>
                <span className="muted">stdin → stdout</span>
              </div>
              <CodeMirror
                value={code}
                height="420px"
                theme={editorTheme}
                extensions={[
                  language === "Python"
                    ? python()
                    : language === "Java"
                      ? java()
                      : cpp(),
                ]}
                onChange={setCode}
                aria-label="Source code editor"
              />
              <div className="editor-toolbar">
                <Button
                  variant="secondary"
                  busy={busy}
                  disabled={!code.trim()}
                  onClick={() => execute("run")}
                >
                  <Play size={15} />
                  Run sample
                </Button>
                <Button
                  busy={busy}
                  disabled={!code.trim()}
                  onClick={() => execute("submit")}
                >
                  <Send size={15} />
                  Submit code
                </Button>
              </div>
              {result && (
                <div className="execution-result" role="status">
                  <span className="badge">{result.status}</span>
                  <p>{result.message}</p>
                  {result.tests?.map((t, i) => (
                    <details open key={i}>
                      <summary>
                        Test {i + 1}: {t.status}
                      </summary>
                      <pre>
                        {t.stdout ||
                          t.stderr ||
                          t.compile_output ||
                          "No output"}
                      </pre>
                    </details>
                  ))}
                </div>
              )}
            </section>
          </div>
          <section className="card">
            <h3>Your submissions for this problem</h3>
            {resource.data?.submissions
              .filter((s) => s.problemId === Number(id))
              .map((s) => (
                <details key={s.id}>
                  <summary>
                    {new Date(s.createdAt).toLocaleString()} · {s.language} ·{" "}
                    {s.status}
                  </summary>
                  <pre>{s.code}</pre>
                </details>
              ))}
          </section>
        </>
      )}
    </>
  );
}
