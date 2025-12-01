import React, { useEffect, useState } from "react";
import "../../styles/DoctorEmergencyList.css";
import Swal from "sweetalert2";
import {API_BASE, buildAuthHeaders } from "../../utils";

function DoctorEmergencyList() {
  const [emergencies, setEmergencies] = useState([]);
  const [acceptedEmergencies, setAcceptedEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/doctor/emergencies`, {
          headers: buildAuthHeaders(),
        });

        if (!res.ok) throw new Error("Failed to fetch emergency alerts");

        const data = await res.json();
        setEmergencies(data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Something went wrong",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchAcceptedEmergencies = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/doctor/emergencies/accepted`, {
          headers: buildAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch accepted emergencies");
        const data = await res.json();
        setAcceptedEmergencies(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEmergencies();
    fetchAcceptedEmergencies();
  }, [token]);

  const handleAccept = async (emergencyId) => {
    try {
      const res = await fetch(`${API_BASE}/api/doctor/emergency/accept/${emergencyId}`, {
        method: "POST",
        headers: buildAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to accept emergency");

      Swal.fire({
        icon: "success",
        title: "Accepted",
        text: "Emergency accepted and patient notified!",
        timer: 2000,
        showConfirmButton: false,
      });
      setEmergencies(emergencies.filter((e) => e.id !== emergencyId));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong",
      });
    }
  };



  if (loading) return <p>Loading emergencies...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!emergencies.length) return <p>No emergency alerts at the moment.</p>;

  return (
    <div className="doctor-emergency-list">
      <h2>Emergency </h2>
      <ul>
        {emergencies.map((emergency) => (
          <li key={emergency.id} style={{ marginBottom: "15px" }}>
            <strong>Patient:</strong> {emergency.patientName}<br />
            <strong>Problem:</strong> {emergency.problem}<br />
            <strong>Intensity:</strong> {emergency.intensity}<br />
            {emergency.message && <><strong>Message:</strong> {emergency.message}<br /></>}
            {emergency.location && <><strong>Location:</strong> {emergency.location}<br /></>}
            <button onClick={() => handleAccept(emergency.id)}>Accept</button>
          </li>
        ))}
      </ul>
      <h2>Accepted Emergencies</h2>
      {acceptedEmergencies.length ? (
        <ul>
          {acceptedEmergencies.map((emergency) => (
            <li key={emergency.id} style={{ marginBottom: "15px" }}>
              <strong>Patient:</strong> {emergency.patientName}<br />
              <strong>Problem:</strong> {emergency.problem}<br />
              <strong>Intensity:</strong> {emergency.intensity}<br />
              {emergency.message && <><strong>Message:</strong> {emergency.message}<br /></>}
              {emergency.location && <><strong>Location:</strong> {emergency.location}<br /></>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No accepted emergencies yet.</p>
      )}
    </div>
  );
}

export default DoctorEmergencyList;
