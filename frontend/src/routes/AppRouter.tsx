import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import GamePage from "../pages/GamePage";
import TeamRoomPage from "../pages/TeamRoom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import type {
  AuthenticatedUser,
  PublicUser,
} from "../types/user";

interface AppRouterProps {
  user: PublicUser | null;
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
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Login
              onLogin={onLogin}
              onGoToRegister={onGoToRegister}
            />
          )
        }
      />

      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <Register onGoToLogin={onGoToLogin} />
          )
        }
      />

      <Route
        path="/games/:gameId"
        element={
          user ? <GamePage /> : <Navigate to="/login" replace />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
      {/* <Route path="/" element={<Sala />} /> */}
      <Route
        path="/equipos/:equipoId"
        element={
          user ? <TeamRoomPage /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}