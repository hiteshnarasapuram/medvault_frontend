import React, { useState, useEffect } from "react";
import "../../styles/DoctorFeedback.css";
import {API_BASE, buildAuthHeaders } from "../../utils";

function DoctorFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  //const token = localStorage.getItem("token");

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/doctor/appointments/feedback`, {
        method: "GET",
        headers: buildAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch feedbacks");
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      setMessage("Error fetching feedback: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

    return (
    <div className="doctor-feedback-container">
      <h2>Patient Feedback</h2>

      {message && <p className="message">{message}</p>}

      {loading ? (
        <p>Loading feedbacks...</p>
      ) : feedbacks.length > 0 ? (
        <div className="feedback-list">
          {feedbacks.map((f) => (
            <div key={f.appointmentId} className="feedback-card">
              <div className="feedback-header">
                <strong>{f.patientName}</strong>
                <span className="feedback-rating">
                  {"⭐".repeat(f.rating)}{" "}
                  <span className="rating-number">({f.rating})</span>
                </span>
              </div>
              <p className="feedback-text">{f.feedback}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No feedback available.</p>
      )}
    </div>
  );
}

export default DoctorFeedback;
