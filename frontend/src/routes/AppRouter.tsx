import { Routes, Route } from "react-router-dom";

import Sala from "../pages/Sala";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Sala />} />
    </Routes>
  );
}