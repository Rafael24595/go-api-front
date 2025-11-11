import { Routes, Route } from "react-router-dom";
import ClientPage from "../pages/ClientPage";
import LogPage from "../pages/LogPage";
import CmdPage from "../pages/CmdPage";
import MockPage from "../pages/MockPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ClientPage />} />
      <Route path="/log" element={<LogPage />} />
      <Route path="/cmd" element={<CmdPage />} />
      <Route path="/client" element={<ClientPage />} />
      <Route path="/mock" element={<MockPage />} />
    </Routes>
  );
}
