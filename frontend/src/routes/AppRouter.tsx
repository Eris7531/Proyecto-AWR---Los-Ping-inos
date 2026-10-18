import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import GamePage from "../pages/GamePage";
import TeamRoomPage from "../pages/TeamRoom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import type {User} from "../types/user";
import UserProfile from "../pages/UserProfile";

interface AppRouterProps {
  user: User | null;
  onLogin: (user: User) => void;
  onUserUpdated: (user: User) => void;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
}

export function AppRouter({
  user,
  onLogin,
  onUserUpdated,
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

      <Route
        path="/usuarios/:userId"
        element={<UserProfile user={user} onUserUpdated={onUserUpdated} />}
      />
      {/* <Route path="/" element={<Sala />} /> */}
      <Route
        path="/equipos/:equipoId"
        element={
          user ? (
            <TeamRoomPage currentUserId={user.id} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}