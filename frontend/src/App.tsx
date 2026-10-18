
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimarySearchAppBar from "./components/Banner";
import { AppRouter } from "./routes/AppRouter";
import type { User } from "./types/user";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const response = await fetch("/api/login/me", {
          credentials: "include",
        });
        if (!response.ok) return;

        const csrfToken = response.headers.get("X-CSRF-Token");
        if (csrfToken) sessionStorage.setItem("csrfToken", csrfToken);

        const currentUser = (await response.json()) as User;
        if (active) setUser(currentUser);
      } catch {
        if (active) setUser(null);
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    navigate("/");
  };

  const handleLogout = async () => {
    await fetch("/api/login/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": sessionStorage.getItem("csrfToken") ?? "",
        },
      }).catch(() => undefined);
    sessionStorage.removeItem("csrfToken");
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
        onGoToRegister={() => navigate("/register")}
        onGoToLogin={() => navigate("/login")}
      />
    </>
  );
}

export default App;