import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Welcome from "./Components/Welcome";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Register" replace />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Home" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}
