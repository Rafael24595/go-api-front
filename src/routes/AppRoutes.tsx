import { Routes, Route } from "react-router-dom";
import ClientPage from "../pages/ClientPage";
import LogPage from "../pages/LogPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ClientPage />} />
      <Route path="/client" element={<ClientPage />} />
      <Route path="/log" element={<LogPage />} />
    </Routes>
  );
}
