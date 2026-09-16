import {useState} from "react";
import PrimarySearchAppBar from "./components/Banner";
import Login from "./components/Login";
import Register from "./components/Register";
import type {User} from "./types/data";


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  
  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
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
    </>
  );
}

export default App;