import React from "react";
import { LoaderCircle, ArrowUpRight, Inbox } from "lucide-react";
export function Button({
  children,
  variant = "",
  busy,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      className={"button " + variant + " " + className}
      disabled={busy || props.disabled}
      aria-busy={busy || undefined}
    >
      {busy ? <LoaderCircle size={16} className="spin" /> : null}
      {children}
    </button>
  );
}
export function Heading({ eyebrow, title, description, children }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function Loading() {
  return (
    <div className="skeleton-grid" aria-label="Loading" role="status">
      {[1, 2, 3, 4].map((x) => (
        <div className="skeleton" key={x} />
      ))}
    </div>
  );
}
export function ErrorBox({ message }) {
  return message ? (
    <div className="error" role="alert">
      {message}
    </div>
  ) : null;
}
export function Empty({ title = "Your next step starts here", children }) {
  return (
    <div className="empty">
      <Inbox size={28} />
      <h3>{title}</h3>
      <p>
        {children || "Complete a practice session to see your progress here."}
      </p>
    </div>
  );
}
export function Stat({ label, value, detail, icon: Icon }) {
  return (
    <div className="stat card">
      <div>
        <span>{label}</span>
        {Icon && <Icon size={18} />}
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
export class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="empty">
        <h2>Something went wrong.</h2>
        <Button onClick={() => location.reload()}>Reload workspace</Button>
      </div>
    ) : (
      this.props.children
    );
  }
}
