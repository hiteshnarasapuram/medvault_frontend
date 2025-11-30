import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientProfile from "./PatientProfile";
import PatientHome from "./PatientHome";
import SetPassword from "../SetPassword"; 
import PatientAppointments from "./PatientAppointments"; 
import PatientMedicalRecords from "./PatientMedicalRecords"; 
import AccessManagement from "./AccessManagement";
import SendEmergencyRequest from "./SendEmergencyRequest";
import PatientHistory from "./PatientHistory";
import MedicalHistoryPage from "./MedicalHistoryPage"; 
import {API_BASE, buildAuthHeaders } from "../../utils";
import Swal from "sweetalert2";
import "../../styles/PatientDashboard.css";
import ChatBot from "./ChatBot"; 
import FloatingChatBot from "./FloatingChatBot";


function PatientDashboard() {
  const [message, setMessage] = useState("");
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); 
  const navigate = useNavigate();
  //const API_BASE = "http://localhost:8080";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not logged in!");
      return;
    }

    fetch(`${API_BASE}/api/patient/dashboard`, {
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
          setPatient(data.patient);
        }
      })
      .catch((err) => setMessage("Error: " + err.message));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (isFirstLogin) {
    return <SetPassword apiUrl={`${API_BASE}/api/patient/set-password`} />;
  }

  return (
    <div className="patient-dashboard">
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <ul>
          <li className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>Home</li>
          <li className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Profile</li>
          <li className={activeTab === "appointments" ? "active" : ""} onClick={() => setActiveTab("appointments")}>Appointments</li>
          <li className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>Medical Info</li>
          {/* <li className={activeTab === "history" ? "active" : ""} onClick={() => setActiveTab("history")}>History</li>
          <li className={activeTab === "records" ? "active" : ""} onClick={() => setActiveTab("records")}>Medical Records</li> */}
          <li className={activeTab === "access" ? "active" : ""} onClick={() => setActiveTab("access")}>Manage Access</li>
          <li className={activeTab === "emergency" ? "active" : ""} onClick={() => setActiveTab("emergency")}>Emergency</li>
          {/* <li className={activeTab === "chatbot" ? "active" : ""} onClick={() => setActiveTab("chatbot")}>Medical ChatBot</li> */}

          <li className="logout" onClick={handleLogout}>Logout</li>
        </ul>

      </div>
      <div className="main-content">
        {activeTab === "home" && <PatientHome patient={patient} />}
        {activeTab === "profile" && <PatientProfile patient={patient} />}
        {activeTab === "appointments" && <PatientAppointments apiBase={API_BASE} />}
        {activeTab === "history" && <MedicalHistoryPage apiBase={API_BASE} />}
        {/* {activeTab === "history" && <PatientHistory apiBase={API_BASE} />}
        {activeTab === "records" && <PatientMedicalRecords apiBase={API_BASE} />} */}
        {activeTab === "access" && <AccessManagement apiBase={API_BASE} />}
        {activeTab === "emergency" && <SendEmergencyRequest apiBase={API_BASE} />}
        {/* {activeTab === "chatbot" && <ChatBot />} */}


      </div>
    </div>
    <FloatingChatBot />
    </div>
  );
}

export default PatientDashboard;


