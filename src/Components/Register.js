import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "./InputField";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE ||
    `${window.location.protocol}//${window.location.hostname}:4000`; // Replace with YOUR IP

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/me`, {
          credentials: "include",
        });
        if (res.ok) {
          navigate("/Welcome", { replace: true });
        }
      } catch {}
    })();
  }, [navigate, API_BASE]);

  function change(e) {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!data.name || !data.email || !data.password) {
      setError("Please fill required fields.");
      return;
    }
    if (data.password !== data.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      // Handle non-JSON (404) safely
      const text = await res.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        console.error("Invalid backend response:", text);
        throw new Error("Invalid server response");
      }

      if (res.ok) {
        navigate("/Login", { replace: true });
      } else {
        setError(body.error || body.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register failed", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-container">
      <div className="register-box" role="region" aria-label="Register form">
        <h2 className="title">Create an account</h2>
        <form onSubmit={submit} noValidate>
          <InputField
            id="name"
            label="Name"
            value={data.name}
            onChange={change}
            name="name"
            placeholder="Enter your name"
          />
          <InputField
            id="email"
            label="Email"
            type="email"
            value={data.email}
            onChange={change}
            name="email"
            placeholder="Enter your email"
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={data.password}
            onChange={change}
            name="password"
            placeholder="Choose a password"
          />
          <InputField
            id="confirm"
            label="Confirm"
            type="password"
            value={data.confirm}
            onChange={change}
            name="confirm"
            placeholder="Confirm your password"
          />
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <small>
            Already have an account?{" "}
            <a
              href="/Login"
              onClick={(e) => {
                e.preventDefault();
                navigate("/Login");
              }}
            >
              Sign in
            </a>
          </small>
        </div>
      </div>
    </div>
  );
}
