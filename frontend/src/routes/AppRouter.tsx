import { Routes, Route } from "react-router-dom";

import TeamRoomPage from "../pages/TeamRoom";

export function AppRouter() {
  return (
    <Routes>
      {/* <Route path="/" element={<Sala />} /> */}
      <Route path="/equipos/:equipoId" element={<TeamRoomPage />} />
    </Routes>
  );
}