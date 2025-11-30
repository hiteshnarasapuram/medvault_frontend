import React from "react";

function Sidebar({ activeTab, setActiveTab, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">MedVault</div>

      <div className="nav">
        <button
          className={`nav-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <div className="nav-section-label">Patients</div>
        <button
          className={`nav-btn ${activeTab === "allPatients" ? "active" : ""}`}
          onClick={() => setActiveTab("allPatients")}
        >
          All Patients
        </button>

        <button
          className={`nav-btn ${activeTab === "addPatient" ? "active" : ""}`}
          onClick={() => setActiveTab("addPatient")}
        >
          Add Patient
        </button>

        <div className="nav-section-label">Doctors</div>

        <button
          className={`nav-btn ${activeTab === "allDoctors" ? "active" : ""}`}
          onClick={() => setActiveTab("allDoctors")}
        >
          All Doctors
        </button>
        
        <button
          className={`nav-btn ${activeTab === "addDoctor" ? "active" : ""}`}
          onClick={() => setActiveTab("addDoctor")}
        >
          Add Doctor
        </button>

        <div className="nav-section-label">Other</div>
        <button
          className={`nav-btn ${activeTab === "pendingRequests" ? "active" : ""}`}
          onClick={() => setActiveTab("pendingRequests")}
        >
          Pending Requests
        </button>
        <button
          className={`nav-btn ${activeTab === "logs" ? "active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          Logs
        </button>

        <div className="spacer" />
        <button className="nav-btn danger" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
