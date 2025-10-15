import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from './InputField';

export default function Login() {
  // --- state variables ---
  const [name, setName] = useState('');           
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // basic email check
  function isValidEmail(value) {
    return /^\S+@\S+\.\S+$/.test(value);
  }

  
  function validate() {
    const e = {};
    if (!name) e.name = 'Name is required.';                 
    if (!email) e.email = 'Email is required.';
    else if (!isValidEmail(email)) e.email = 'Please enter a valid email address.';

    if (!password) e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length === 0) {
      setLoading(true);

      
      setTimeout(() => {
        setLoading(false);

        sessionStorage.setItem('authName', name);

        sessionStorage.setItem('authEmail', email);

        navigate('/welcome', { state: { name } });
      }, 900);
    }
  }

  return (
    <div className="login-card" role="region" aria-label="Login form">
      <form onSubmit={handleSubmit} noValidate>
       
        <InputField
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          error={errors.name}
        />

        <InputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={errors.email}
        />

        <div className="row" style={{ alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <InputField
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              error={errors.password}
            />
          </div>

          <div style={{ marginTop: 22 }}>
            <button type="button" className="ghost" onClick={() => setShowPassword(s => !s)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
