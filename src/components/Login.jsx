import React, { useState } from "react";
import { FaUserMd, FaUserShield, FaUser, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {API_BASE, buildAuthHeaders } from "../utils";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      switch (data.role.toLowerCase()) {
        case "admin":
          navigate("/admin");
          break;
        case "doctor":
          navigate("/doctor");
          break;
        case "patient":
          navigate("/patient");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(" Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button 
          className="cancel-btn"
          onClick={() => navigate("/")}
        >
          <FaTimes />
        </button>

        <FaUser className="login-icon"/>

        <h2 className="login-title">Welcome Back</h2>
        <p className="subtitle">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn">Login</button>
        </form>

        {error && <p className="error-msg">{error}</p>}

        <p className="extra-text">
          <a href="/register">Don’t have an account?</a>  |{" "}
          <a href="/forgot-password">Forgot Password?</a>
        </p>
      </div>
    </div>
  );
}

export default Login;

