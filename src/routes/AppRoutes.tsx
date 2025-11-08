import { Routes, Route } from "react-router-dom";
import ClientPage from "../pages/Client";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ClientPage />} />
      <Route path="/client" element={<ClientPage />} />
    </Routes>
  );
}
