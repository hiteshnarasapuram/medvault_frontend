import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorProfile from "./DoctorProfile";
import DoctorHome from "./DoctorHome";
import SetPassword from "../SetPassword";
import DoctorAppointments from "./DoctorAppointments";
import DoctorFeedback from "./DoctorFeedback";
import DoctorPatients from "./DoctorPatients";
import DoctorEmergencyList from "./DoctorEmergencyList";

import {API_BASE,buildAuthHeaders} from "../../utils";

import "../../styles/DoctorDashboard.css";

function DoctorDashboard() {
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();
  //const API_BASE = "http://localhost:8080";
  //const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setMessage("Not logged in!");
      return;
    }

    fetch(`${API_BASE}/api/doctor/dashboard`, {
      method: "GET",
      headers: buildAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.firstLogin) {
          setIsFirstLogin(true);
          setMessage(data.message);
        } else {
          setIsFirstLogin(false);
          setMessage(data.message);
          setDoctor(data.doctor);
        }
      })
      .catch((err) => setMessage("Error: " + err.message));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

const handleAppointmentsClick = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/doctor/check-profile-completion`, {
      method: "GET",
      headers: buildAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to check profile completion");

    const result = await res.json(); 

    switch (result.status) {
      case "APPROVED":
        setActiveTab("appointments");
        break;
      case "INCOMPLETE":
        alert("Profile is incomplete. Please update all required fields.");
        setActiveTab("profile");
        break;
      case "PENDING":
        alert("Your profile is under verification by the admin.");
        setActiveTab("profile");
        break;
      case "REJECTED":
        alert(
          `Your profile was rejected. ${result.adminMessage ? "Reason: " + result.adminMessage : ""}`
        );
        setActiveTab("profile");
        break;
      default:
        alert("Unexpected response. Please try again.");
        setActiveTab("profile");
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
};


  if (isFirstLogin) {
    return <SetPassword apiUrl={`${API_BASE}/api/doctor/set-password`} />;
  }

  return (
    <div className="doctor-dashboard">
    <div className="dashboard-wrapper">
       <div className="sidebar">
          <ul>
            <li className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>
              Home
            </li>
            <li className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
              Profile
            </li>
            <li className={activeTab === "appointments" ? "active" : ""} onClick={handleAppointmentsClick}>
              Appointments
            </li>
            <li  className={activeTab === "patients" ? "active" : ""}  onClick={() => setActiveTab("patients")}>
              Patients Info
            </li>
            <li  className={activeTab === "feedback" ? "active" : ""}  onClick={() => setActiveTab("feedback")}>
              Feedback
            </li>
            <li  className={activeTab === "emergencies" ? "active" : ""}  onClick={() => setActiveTab("emergencies")}>
              Emergencies
            </li>
            <li className="logout"onClick={handleLogout}>Logout</li>
          </ul>
        </div>
        <div className="main-content">
        {activeTab === "home" && <DoctorHome doctor={doctor} />}
        {activeTab === "profile" && <DoctorProfile doctor={doctor} />}
        {activeTab === "appointments" && <DoctorAppointments />}
        {activeTab === "patients" && <DoctorPatients />}
        {activeTab === "feedback" && <DoctorFeedback />}
        {activeTab === "emergencies" && <DoctorEmergencyList apiBase={API_BASE} />}
       </div> 

    </div>
    </div>
  );
}

export default DoctorDashboard;







