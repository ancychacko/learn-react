// src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Basic frontend validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill all required fields.');
      return;
    }
    if (formData.password !== formData.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // allow cookies (not required for register redirect but consistent)
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.status === 201 || res.ok) {
        // Tell user and redirect to login page
        alert('Registration successful. Please sign in.');
        navigate('/login');
      } else {
        // Show server-provided error if available
        setError(data.error || data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Register request failed', err);
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-box" role="region" aria-label="Register form">
        <h2 className="title">Create an account</h2>

        <form onSubmit={handleSubmit} noValidate>
          <input
            id="name"
            name="name"
            placeholder="Your name (e.g., John)"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Choose a password"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="Repeat your password"
            value={formData.confirm}
            onChange={handleChange}
          />

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <small>Already have an account? <a href="/" onClick={(e)=>{ e.preventDefault(); navigate('/'); }}>Sign in</a></small>
        </div>
        
        </form>
      </div>
    </div>
  );
}
