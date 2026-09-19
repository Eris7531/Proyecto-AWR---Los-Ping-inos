import { AppRouter } from "./routes/AppRouter";
import {useState} from "react";
import PrimarySearchAppBar from "./components/Banner";
import Login from "./components/Login";
import Register from "./components/Register";
import type { AuthenticatedUser, PubilcUser } from "./types/user";

function App() {
  const [user, setUser] = useState<PubilcUser | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  
  const handleLogin = (authenticatedUser: AuthenticatedUser) => {
    const publicUser: PubilcUser = {
      id: authenticatedUser.id,
      name: authenticatedUser.name,
      avatar: authenticatedUser.avatar,
      rank: authenticatedUser.rank,
    };
    setUser(publicUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <>
      <PrimarySearchAppBar 
        user={user}
        onLogout={handleLogout}
      />
      {user ? (
        <main>
          <h1>Bienvenido, {user.name}</h1>
        </main>
      ): showRegister ? (
        <Register
          onRegister={handleLogin}
          onGoToLogin={() => setShowRegister(false)}
        />
      ) : (
        <Login 
          onLogin={handleLogin}
          onGoToRegister={() => setShowRegister(true)}
        />
      )}
      <AppRouter />
    </>
  );
}

export default App;