import React, { useState, useEffect } from "react";
import "../../styles/SendEmergencyRequest.css";
import {API_BASE, buildAuthHeaders } from "../../utils";
import Swal from "sweetalert2";

function SendEmergencyRequest() {
  const [problem, setProblem] = useState("");
  const [intensity, setIntensity] = useState("LOW");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [emergencies, setEmergencies] = useState([]);
  const [loadingEmergencies, setLoadingEmergencies] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      setLoadingEmergencies(true);
      const res = await fetch(`${API_BASE}/api/patient/emergencies`, {
        headers: buildAuthHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setEmergencies(data);
      } else {
        setEmergencies([]);
      }
    } catch (err) {
      console.error("Failed to fetch emergencies", err);
      setEmergencies([]);
    } finally {
      setLoadingEmergencies(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResponseMessage("");

    if (!token) {
      setResponseMessage("You must be logged in to send an emergency!");
      return;
    }

    if (!problem.trim()) {
      setResponseMessage("Problem field is required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/patient/emergency`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify({ problem, intensity, message, location }),
      });

      if (res.ok) {
        // setResponseMessage("Emergency request sent successfully!");
        Swal.fire({
          title: "Success!",
          text: "Emergency request sent successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
        setProblem("");
        setIntensity("LOW");
        setMessage("");
        setLocation("");
        fetchEmergencies(); // refresh list
      } else {
        let errorText;
        try {
          const data = await res.json();
          errorText = data.message || JSON.stringify(data);
        } catch {
          errorText = await res.text();
        }
        setResponseMessage("Error sending emergency request: " + errorText);
      }
    } catch (err) {
      setResponseMessage("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emergency-request-container">
      <h2>Send Emergency Request</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Problem</label>
          <input
            type="text"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Intensity</label>
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
          >
            <option value="LOW">LOW</option>
            <option value="MODERATE">MODERATE</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
        <div>
          <label>Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div>
          <label>Location (optional)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Emergency"}
        </button>
      </form>
      {responseMessage && <p>{responseMessage}</p>}

      {/* Previous Emergencies */}
      <h3 style={{ marginTop: "2rem" }}>Previous Emergencies</h3>
      {loadingEmergencies ? (
      <p>Loading previous emergencies...</p>
      ) : emergencies.length === 0 ? (
        <p>No previous emergencies found.</p>
      ) : (
        <div className="emergency-list">
          {emergencies.map((e) => (
            <div className="emergency-card" key={e.id}>
              <h4>{e.problem}</h4>
              <p><strong>Intensity:</strong> {e.intensity}</p>
              {e.message && <p><strong>Message:</strong> {e.message}</p>}
              {e.location && <p><strong>Location:</strong> {e.location}</p>}
              <p><strong>Doctor:</strong> {e.doctorName}</p>
              <p className="date">
                <strong>Date:</strong> {new Date(e.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}

export default SendEmergencyRequest;










