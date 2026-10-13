import React, { useEffect, useState } from "react";
import { api, resetCsrf } from "../services/api";
import { AuthContext } from "./authContext";
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/profile")
      .then((r) => setUser(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  async function signOut() {
    await api.post("/logout");
    try {
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith(`nextstep-quiz-${user.id}-`))
          sessionStorage.removeItem(key);
      }
    } catch {}
    resetCsrf();
    setUser(null);
  }
  return (
    <AuthContext.Provider value={{ user, setUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
