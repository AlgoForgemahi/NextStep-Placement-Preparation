import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Download,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { api, download } from "../services/api";
import { useResource } from "../hooks/useResource";
import { roles } from "../modules/topics";
import { Heading, Button, ErrorBox, Empty } from "../components/UI";
export default function Resume() {
  const history = useResource("/resumes"),
    [file, setFile] = useState(null),
    [role, setRole] = useState(roles[0]),
    [job, setJob] = useState(""),
    [review, setReview] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [upload, setUpload] = useState(0),
    input = useRef();
  function select(f) {
    if (!f) return;
    if (!/\.(pdf|docx)$/i.test(f.name) || f.size > 5 * 1024 * 1024) {
      setError("Choose a PDF or DOCX file smaller than 5 MB.");
      return;
    }
    setFile(f);
    setError("");
  }
  async function analyze(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData();
    data.append("file", file);
    data.append("targetRole", role);
    data.append("jobDescription", job);
    try {
      const r = await api.post("/resumes", data, {
        onUploadProgress: (e) =>
          setUpload(Math.round((e.loaded / (e.total || e.loaded)) * 100)),
      });
      setReview(r.data);
      history.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const report = review ? JSON.parse(review.report) : null;
  return (
    <>
      <Heading
        eyebrow="YOUR STORY / CLEARER"
        title="Give your experience a stronger voice."
        description="A transparent, rule-based resume review. Helpful checks, without inflated claims."
      />
      <ErrorBox message={error || history.error} />
      <div className="resume-layout">
        <form className="card" onSubmit={analyze}>
          <div className="section-title">
            <h3>Review your resume</h3>
            <FileText size={19} />
          </div>
          <button
            type="button"
            className="dropzone"
            onClick={() => input.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              select(e.dataTransfer.files[0]);
            }}
          >
            <UploadCloud size={32} />
            <strong>{file ? file.name : "Drop your resume here"}</strong>
            <span>or click to browse · PDF or DOCX · up to 5 MB</span>
          </button>
          <input
            hidden
            ref={input}
            type="file"
            accept=".pdf,.docx"
            aria-label="Resume file"
            onChange={(e) => select(e.target.files[0])}
          />
          <label>
            Target role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            Job description <span className="muted">(optional)</span>
            <textarea
              rows={6}
              maxLength={20000}
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="Paste a job description to compare recognized skill keywords…"
            />
          </label>
          {busy && (
            <div role="status">
              <progress max={100} value={upload} />
              <small>
                {upload < 100 ? "Uploading…" : "Analyzing document text…"}
              </small>
            </div>
          )}
          <Button busy={busy} disabled={!file}>
            Analyze resume
          </Button>
          <p className="muted fine">
            The uploaded file is processed in memory. Only the extracted
            analysis report is stored in your private history.
          </p>
        </form>
        <section className="card">
          {report ? (
            <>
              <div className="section-title">
                <div>
                  <span className="eyebrow">COMPLETENESS CHECKLIST</span>
                  <h2>
                    {report.score}% <small>of checks found</small>
                  </h2>
                </div>
                <Button
                  variant="secondary"
                  onClick={() =>
                    download("resume-review.json", { ...review, report })
                  }
                >
                  <Download size={16} />
                  Report
                </Button>
              </div>
              <p className="notice-text">{report.method}</p>
              <div className="check-grid">
                {Object.entries(report.checks).map(([label, found]) => (
                  <div key={label}>
                    {found ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <h4>Recognized skills</h4>
              <div className="tags">
                {report.skills.map((s) => (
                  <span className="badge" key={s}>
                    {s}
                  </span>
                ))}
              </div>
              <h4>Skill keyword match: {report.matchPercent}%</h4>
              <p className="muted">
                Missing recognized keywords:{" "}
                {report.missingSkills.join(", ") ||
                  "None in the comparison list"}
              </p>
              <h4>Actionable suggestions</h4>
              <ul className="suggestions">
                {report.suggestions.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          ) : (
            <Empty title="A clearer view of your resume">
              Upload a document to inspect its sections, skill keywords and
              opportunities for improvement.
            </Empty>
          )}
        </section>
      </div>
      <section className="card">
        <div className="section-title">
          <h3>Review history</h3>
          <span className="muted">Compare completeness and target roles</span>
        </div>
        {history.data?.length ? (
          history.data.map((r) => (
            <button
              className="history-row"
              key={r.id}
              onClick={() => setReview(r)}
            >
              <div>
                <b>{r.filename}</b>
                <small>
                  {r.targetRole} · {new Date(r.createdAt).toLocaleDateString()}
                </small>
              </div>
              <span className="badge">{r.score}% completeness</span>
              <span>View →</span>
            </button>
          ))
        ) : (
          <Empty />
        )}
      </section>
    </>
  );
}
