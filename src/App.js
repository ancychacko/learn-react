import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Welcome from "./Components/Welcome";
import MainLayout from "./Layout/MainLayout";
import NotificationPage from "./Components/NotificationPage";
import PostView from "./Components/PostView";
import Messaging from "./Pages/Messaging";
import Job from "./Components/Jobs/Job";
import MyNetwork from "./Components/Network/MyNetwork";

export default function App() {
  const API_BASE =
    process.env.REACT_APP_API_BASE ||
    `${window.location.protocol}//${window.location.hostname}:4000`;

  const [currentUser, setCurrentUser] = useState(null);

  // ⭐ Fetch logged-in user details
  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch(`${API_BASE}/api/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }

    loadMe();
  }, [API_BASE]);
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES - NO MAINLAYOUT */}
        <Route path="/" element={<Register />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />

        {/* PRIVATE ROUTES WITH LAYOUT */}
        <Route element={<MainLayout API_BASE={API_BASE} user={currentUser} />}>
          <Route path="/Home" element={<Welcome API_BASE={API_BASE} />} />
          <Route 
          path="/MyNetwork" 
          element={<MyNetwork API_BASE={API_BASE} />}
          />
          <Route
            path="/Jobs"
            element={<Job API_BASE={API_BASE} currentUser={currentUser} />}
          />
          <Route
            path="/Notifications"
            element={<NotificationPage API_BASE={API_BASE} />}
          />
          <Route
            path="/Messaging"
            element={
              <Messaging API_BASE={API_BASE} currentUser={currentUser} />
            }
          />
          <Route path="/Post/:id" element={<PostView API_BASE={API_BASE} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
