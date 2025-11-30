import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {API_BASE, buildAuthHeaders } from "../utils";
import "../styles/SetPassword.css";

function SetPassword({ apiUrl }) {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSetPassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ newPassword }),
      });


      const data = res.headers.get("content-type")?.includes("application/json")
        ? await res.json()
        : await res.text();

      const msg = data.message || data; 
      setMessage(msg);


      setTimeout(() => {
        localStorage.removeItem("token");
        navigate("/login");
      }, 2000);

    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div className="password-container">
      <div className="password-card">
        <h2>Set Your Password</h2>
        <form onSubmit={handleSetPassword}>
          <label>
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Set Password</button>
        </form>
        {message && <p className="success-message">{message}</p>}
      </div>
    </div>
  );
}

export default SetPassword;
