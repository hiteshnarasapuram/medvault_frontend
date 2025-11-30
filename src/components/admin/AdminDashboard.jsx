
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminDashboard.css";

import Sidebar from "./Sidebar";
import OverviewTab from "./tabs/OverviewTab";
import PatientsTab from "./manage_patients/AllPatientsTab";
import AddPatientForm from "./manage_patients/AddPatientForm";
import DoctorsTab from "./manage_doctors/AllDoctorsTab";
import AddDoctorForm from "./manage_doctors/AddDoctorForm";
import PendingRequestsTab from "./tabs/PendingRequestsTab";
import LogsTab from "./tabs/LogsTab";

// Utils
import { API_BASE, buildAuthHeaders, safeMessage } from "../../utils";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch lists
  const fetchPatients = async () => {};
  const fetchDoctors = async () => {};
  const fetchPendingRequests = async () => {};
  const fetchLogs = async () => {};

  useEffect(() => {
    if (activeTab === "allPatients") fetchPatients();
    if (activeTab === "allDoctors") fetchDoctors();
    if (activeTab === "pendingRequests") fetchPendingRequests();
    if (activeTab === "logs") fetchLogs();
  }, [activeTab]);

  const title = useMemo(() => {
    switch (activeTab) {
      case "overview": return "Dashboard Overview";
      case "allPatients": return "All Patients";
      case "addPatient": return "Add Patient";
      case "allDoctors": return "All Doctors";
      case "addDoctor": return "Add Doctor";
      case "pendingRequests": return "Pending Requests";
      case "logs": return "Logs";
      default: return "Admin";
    }
  }, [activeTab]);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      <main className="main">
        <div className="panel">
          {activeTab === "overview" && <OverviewTab patients={patients} doctors={doctors} />}
          {activeTab === "allPatients" && <PatientsTab patients={patients} setActiveTab={setActiveTab} />}
          {activeTab === "addPatient" && <AddPatientForm setActiveTab={setActiveTab} />}
          {activeTab === "allDoctors" && <DoctorsTab doctors={doctors} setActiveTab={setActiveTab} />}
          {activeTab === "addDoctor" && <AddDoctorForm setActiveTab={setActiveTab} />}
          {activeTab === "pendingRequests" && <PendingRequestsTab />}
          {activeTab === "logs" && <LogsTab logs={logs} loading={loading} />}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;


