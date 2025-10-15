// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // reuse same styles for card

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        credentials: 'include', // important so server-set cookie is stored
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
      } else {
        // Login OK -> go to welcome page
        navigate('/welcome');
      }
    } catch (err) {
      console.error('Login error', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-box" role="region" aria-label="Login form">
        <h2 className="title">Sign in</h2>

        <form onSubmit={handleSubmit} noValidate>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
  <small>Don't have an account? <a href="/register" onClick={(e)=>{ e.preventDefault(); navigate('/register'); }}>Register</a></small>
</div>
      </div>
    </div>
  );
}
