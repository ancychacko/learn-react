import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Welcome from "./Components/Welcome";
import MainLayout from "./Layout/MainLayout";
import NotificationPage from "./Components/NotificationPage";

export default function App() {
  const API_BASE =
    process.env.REACT_APP_API_BASE ||
    `${window.location.protocol}//${window.location.hostname}:4000`;
  return (
    <BrowserRouter>
      <MainLayout API_BASE={API_BASE}></MainLayout>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Home" element={<Welcome API_BASE={API_BASE} />} />
        <Route
          path="/Notifications"
          element={<NotificationPage API_BASE={API_BASE} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
