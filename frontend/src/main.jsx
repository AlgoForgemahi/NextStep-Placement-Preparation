import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
} from "react-router-dom";
import { AuthProvider } from "./context/Auth";
import { useAuth } from "./context/authContext";
import { Loading, ErrorBoundary } from "./components/UI";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import "./styles/app.css";
const Dashboard = lazy(() => import("./pages/Dashboard")),
  Practice = lazy(() => import("./pages/Practice")),
  Coding = lazy(() => import("./pages/Coding")),
  Resume = lazy(() => import("./pages/Resume")),
  Interview = lazy(() => import("./pages/Interview")),
  Profile = lazy(() => import("./pages/Profile"));
function Protected() {
  const { user, loading } = useAuth();
  return loading ? (
    <Loading />
  ) : user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route element={<Protected />}>
                <Route element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route
                    path="aptitude"
                    element={<Practice key="aptitude" kind="aptitude" />}
                  />
                  <Route
                    path="technical"
                    element={<Practice key="technical" kind="technical" />}
                  />
                  <Route path="coding" element={<Coding />} />
                  <Route path="resume" element={<Resume />} />
                  <Route path="interview" element={<Interview />} />
                  <Route path="progress" element={<Dashboard analytics />} />
                  <Route path="profile" element={<Profile />} />
                  <Route
                    path="*"
                    element={
                      <div className="empty">
                        <h1>Page not found</h1>
                        <Link to="/">Back to overview</Link>
                      </div>
                    }
                  />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
createRoot(document.getElementById("root")).render(<App />);
