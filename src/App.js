// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Register from "./Components/Register";
// import Login from "./Components/Login";
// import Welcome from "./Components/Welcome";
// import "./App.css";
// //import './Components/Register.css';

// export default function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Register />} />
//       <Route path="/Register" element={<Register />} />
//       <Route path="/Login" element={<Login />} />
//       <Route path="/Welcome" element={<Welcome />} />
//     </Routes>
//   );
// }

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Components/Register";
import Login from "./Components/Login";
import Welcome from "./Components/Welcome";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  );
}
