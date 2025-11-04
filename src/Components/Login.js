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
  const API_BASE_URL = "http://192.168.2.77:4000";

  // 🔹 Check user session on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          credentials: "include",
        });
        if (res.ok) {
          navigate("/Welcome", { replace: true });
        }
      } catch (e) {
        console.warn("Session check failed:", e);
      }
    })();
  }, [navigate, API_BASE_URL]);

  // 🔹 Handle login submit
  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      // 404 fix — check if backend returns JSON
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        throw new Error("Server returned invalid response.");
      }

      if (res.ok) {
        navigate("/Welcome", { replace: true });
      } else {
        setErr(data.error || data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setErr("Network or server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-box" role="region" aria-label="Login form">
        <h2 className="title">Sign in</h2>

        <form onSubmit={handleSubmit} noValidate>
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
            Don’t have an account?{" "}
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
