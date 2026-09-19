import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Sala from "../pages/Sala";
import Login from "../components/Login";
import Register from "../components/Register";
import type {
  AuthenticatedUser,
  PubilcUser,
} from "../types/user";


interface AppRouterProps {
  user: PubilcUser | null;
  onLogin: (user: AuthenticatedUser) => void;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
}

export function AppRouter({
  user,
  onLogin,
  onGoToRegister,
  onGoToLogin,
}: AppRouterProps) {
  return (
    <Routes>
      <Route path="/" element={<HomePage user={user} />} />

      <Route
        path="/login"
        element={
          <Login
            onLogin={onLogin}
            onGoToRegister={onGoToRegister}
          />
        }
      />

      <Route
        path="/register"
        element={
          <Register
            onRegister={onLogin}
            onGoToLogin={onGoToLogin}
          />
        }
      />

      <Route
        path="/sala"
        element={user ? <Sala /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/games/:gameId"
        element={
          <TypographyPlaceholder />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function TypographyPlaceholder() {
  return <div>Vista del juego pendiente de implementación.</div>;
}