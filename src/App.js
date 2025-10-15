import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Components/Login';
import Welcome from './Components/Welcome';

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1> Login </h1>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Welcome" element={<Welcome />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
