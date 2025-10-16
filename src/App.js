import React from "react";
import { Routes, Route } from "react-router-dom";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Welcome from "./Components/Welcome";
import "./App.css";
//import './Components/Register.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/Register" element={<Register />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Welcome" element={<Welcome />} />
    </Routes>
  );
}
