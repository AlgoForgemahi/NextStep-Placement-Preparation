import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../context/authContext";
import { Button, ErrorBox } from "../components/UI";
export default function Auth() {
  const [register, setRegister] = useState(false),
    [showPassword, setShowPassword] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { setUser } = useAuth(),
    navigate = useNavigate();
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(
        "/auth/" + (register ? "register" : "login"),
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      setUser(data);
      navigate("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <main className="signin-card" aria-labelledby="signin-title">
        <div className="signin-brand"><span><GraduationCap size={27} /></span>NextStep</div>
        <span className="signin-kicker">YOUR NEXT CHAPTER STARTS HERE</span>
        <h1 id="signin-title">{register ? "Make your next move." : "Welcome back."}</h1>
        <p className="signin-description">{register ? "One workspace for your skills, practice and progress." : "Sign in to keep building the future you want."}</p>
        <form onSubmit={submit}>
          {register && (
            <label>
              Full name
              <input
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="you@college.edu"
            />
          </label>
          <label htmlFor="signin-password">Password</label>
          <div className="signin-password">
            <input
              id="signin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              maxLength={72}
              autoComplete={register ? "new-password" : "current-password"}
              placeholder="At least 8 characters"
            />
            <button type="button" className="signin-reveal" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
          </div>
          <ErrorBox message={error} />
          <Button busy={busy} className="signin-submit">
            {register ? "Create your account" : "Sign in to your workspace"}
            <ArrowRight size={17} />
          </Button>
        </form>
        <p className="auth-switch">
          {register ? "Already have an account?" : "New to NextStep?"}{" "}
          <button
            className="text-button"
            onClick={() => {
              setRegister(!register);
              setShowPassword(false);
              setError("");
            }}
          >
            {register ? "Sign in" : "Create an account"}
          </button>
        </p>
        <div className="secure-note">
          <ShieldCheck size={16} /> Your preparation stays private to your
          account.
        </div>
      </main>
      <p className="signin-footer">A little practice today. More possibilities tomorrow.</p>
    </div>
  );
}
