import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "./InputField";
import "./Register.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, go to welcome
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch("http://localhost:4000/api/me", {
          credentials: "include",
        });
        if (r.ok && mounted) navigate("/Welcome", { replace: true });
      } catch (e) {}
    })();
    return () => (mounted = false);
  }, [navigate]);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const b = await res.json();
        setErr(b.error || "Login failed");
      } else {
        navigate("/Welcome", { replace: true });
      }
    } catch (e) {
      console.error(e);
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-box" role="region" aria-label="Login form">
        <h2 className="title">Sign in</h2>
        <form onSubmit={submit} noValidate>
          <InputField
            id="login-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            placeholder="you@example.com"
          />
          <InputField
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            placeholder="Password"
          />
          {err && <div className="error">{err}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 12, textAlign: "center" }}>
          <small>
            Don't have an account?{" "}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              Register
            </a>
          </small>
        </div>
      </div>
    </div>
  );
}
