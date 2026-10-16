
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimarySearchAppBar from "./components/Banner";
import { AppRouter } from "./routes/AppRouter";
import type { AuthenticatedUser, PublicUser } from "./types/user";

function App() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const navigate = useNavigate();

  const handleLogin = (authenticatedUser: AuthenticatedUser) => {
    const publicUser: PublicUser = {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      avatar: authenticatedUser.avatar,
      rank: authenticatedUser.rank,
    };

    setUser(publicUser);
    navigate("/");
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      <PrimarySearchAppBar
        user={user}
        onLogout={handleLogout}
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
