import React, { useState } from "react";
import { useAuth } from "../context/authContext";
import { api } from "../services/api";
import { roles } from "../modules/topics";
import { Heading, Button, ErrorBox } from "../components/UI";
export default function Profile() {
  const { user, setUser, signOut } = useAuth(),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false),
    [busy, setBusy] = useState(false);
  return (
    <>
      <Heading
        eyebrow="MAKE THIS WORKSPACE YOURS"
        title="Your profile & learning preferences."
        description="Set a realistic daily goal and keep your career direction in focus."
      />
      <form
        className="card profile-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          setSaved(false);
          const fields = Object.fromEntries(new FormData(e.currentTarget));
          try {
            const { data } = await api.put("/profile", {
              ...fields,
              dailyGoal: Number(fields.dailyGoal),
            });
            setUser(data);
            setSaved(true);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Full name
          <input
            name="name"
            defaultValue={user.name}
            required
            maxLength={100}
          />
        </label>
        <label>
          Email
          <input value={user.email} disabled />
        </label>
        <label>
          Department
          <input
            name="department"
            defaultValue={user.department}
            maxLength={100}
          />
        </label>
        <label>
          Target role
          <select name="targetRole" defaultValue={user.targetRole}>
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          Daily question goal
          <input
            name="dailyGoal"
            type="number"
            min={1}
            max={100}
            defaultValue={user.dailyGoal}
            required
          />
        </label>
        <ErrorBox message={error} />
        {saved && (
          <p className="success-message" role="status">
            Your preferences have been saved.
          </p>
        )}
        <Button busy={busy}>Save preferences</Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => signOut().catch((e) => setError(e.message))}
        >
          Sign out
        </Button>
      </form>
    </>
  );
}
