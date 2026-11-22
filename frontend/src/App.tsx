
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrimarySearchAppBar from "./components/Banner";
import { AppRouter } from "./routes/AppRouter";
import { useUserStore } from "./stores/userStore";
import type { User } from "./types/user";

function App() {
  const user = useUserStore((state) => state.user);
  const loadingSession = useUserStore((state) => state.loadingSession);
  const setUser = useUserStore((state) => state.setUser);
  const setLoadingSession = useUserStore(
    (state) => state.setLoadingSession,
  );
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    setLoadingSession(true);

    const restoreSession = async () => {
      try {
        const response = await fetch("/api/login/me", {
          credentials: "include",
        });
        if (!response.ok) {
          if (active) setUser(null);
          return;
        }

        const csrfToken = response.headers.get("X-CSRF-Token");
        if (csrfToken) localStorage.setItem("csrfToken", csrfToken);

        const currentUser = (await response.json()) as User;
        if (active) setUser(currentUser);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoadingSession(false);
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, [setLoadingSession, setUser]);

  if (loadingSession) return null;
  
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    navigate("/");
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    await fetch("/api/login/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": localStorage.getItem("csrfToken") ?? "",
        },
      }).catch(() => undefined);
    localStorage.removeItem("csrfToken");
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      <PrimarySearchAppBar
        user={user}
        onLogout={() => void handleLogout()}
      />

      <AppRouter
        user={user}
        onLogin={handleLogin}
        onUserUpdated={handleUserUpdated}
        onGoToRegister={() => navigate("/register")}
        onGoToLogin={() => navigate("/login")}
      />
    </>
  );
}

export default App;