// src/components/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ForgotPassword.css";
import { FaTimes } from "react-icons/fa";
import {API_BASE, buildAuthHeaders } from "../utils";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1=send OTP, 2=verify OTP, 3=reset password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setMessage("");
    setError("");
  };

  const sendOTP = async () => {
    resetMessages();
    setLoading(true);
    try {
      console.log("Sending OTP for email:", email);
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      console.log("OTP response:", data);
      setMessage("OTP sent to your email!");
      setStep(2);
    } catch (e) {
      console.error("Error sending OTP:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    resetMessages();
    setLoading(true);
    try {
      console.log("Verifying OTP:", otp, "for email:", email);
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");

      console.log("OTP verification response:", data);
      setMessage("OTP verified!");
      setStep(3);
    } catch (e) {
      console.error("Error verifying OTP:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    resetMessages();
    setLoading(true);
    try {
      console.log("Resetting password for:", email, "with OTP:", otp, "newPassword:", newPassword);

      if (!email || !otp || !newPassword) {
        throw new Error("Email, OTP, and new password are required.");
      }

      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      console.log("Password reset response:", data);
      setMessage("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (e) {
      console.error("Error resetting password:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-form">
      <div className="forgot-password-card">
      <h2>Forgot Password</h2>
      {error && <div className="error"  >{error}</div>}
      {message && <div className="success" >{message}</div>}
      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
           <div className="button-group">
            <button className="forgot-close-button" onClick={() => navigate("/")}>
              Close
            </button>
            <button className="sendotp" onClick={sendOTP} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <div className="button-group">
            <button className="forgot-close-button" onClick={() => navigate("/")}>
              Close
            </button>
            <button className="veriftyotp"onClick={verifyOTP} disabled={loading}>
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="button-group">
            <button className="forgot-close-button" onClick={() => navigate("/")}>
              Close
            </button>
            <button className="resetpassword"onClick={resetPassword} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </>
      )}
    </div>
    </div>
  );
}

export default ForgotPassword;
