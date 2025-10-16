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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/me", {
          credentials: "include",
        });
        if (res.ok) {
          if (mounted) navigate("/Welcome", { replace: true });
        }
      } catch (e) {}
    })();
    return () => (mounted = false);
  }, [navigate]);

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
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });
      const body = await res.json();
      if (res.status === 201 || res.ok) {
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
            placeholder="Your name (e.g., John)"
          />
          <InputField
            id="email"
            label="Email"
            type="email"
            value={data.email}
            onChange={change}
            name="email"
            placeholder="you@example.com"
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
            placeholder="Repeat your password"
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
