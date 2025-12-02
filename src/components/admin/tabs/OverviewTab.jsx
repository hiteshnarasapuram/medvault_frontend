// src/components/admin/tabs/OverviewTab.jsx
import React, { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { API_BASE, buildAuthHeaders, safeMessage } from "../../../utils";
import Swal from "sweetalert2";
import "../../../styles/OverviewTab.css";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
);

function OverviewTab() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  // const [loadingPending, setLoadingPending] = useState(false);

  const safeJson = async (res) => {
  const text = await res.text();
  try {
      return text ? JSON.parse(text) : [];
  } catch {
      return [];
  }
  };

  const today = new Date().toISOString().split("T")[0]; 

  const totalAppointments = appointments.length;

  const todayAppointments = appointments.filter(
    (appt) => appt.slotDate === today
  ).length;

  const completedAppointments = appointments.filter(
    (appt) => appt.status === "COMPLETED"
  ).length;

  const futureAppointments = appointments.filter(
    (appt) => appt.slotDate > today
  ).length;

  // After your other state definitions
  const [apptByDate, setApptByDate] = useState({});

  // Compute appointments per day (this month)
  useEffect(() => {
    const today = new Date();
    const getAllDatesOfMonth = (year, month) => {
      const dates = [];
      const date = new Date(year, month, 1);
      while (date.getMonth() === month) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }
      return dates;
    };

    const monthDates = getAllDatesOfMonth(today.getFullYear(), today.getMonth());
    const counts = {};
    monthDates.forEach(d => {
      const formatted = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(d);
      counts[formatted] = 0;
    });

    appointments.forEach(appt => {
      const dateObj = new Date(appt.slotDate || appt.date);
      if (dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear()) {
        const formatted = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(dateObj);
        counts[formatted] = (counts[formatted] || 0) + 1;
      }
    });

    setApptByDate(counts);
  }, [appointments]);



  // const fetchData = async () => {
  //   try {
  //     // Patients
  //     const resPatients = await fetch(`${API_BASE}/api/admin/patients`, { headers: buildAuthHeaders() });
  //     const patientsData = await resPatients.json();
  //     setPatients(patientsData);

  //     // Doctors
  //     const resDoctors = await fetch(`${API_BASE}/api/admin/doctors`, { headers: buildAuthHeaders() });
  //     const doctorsData = await resDoctors.json();
  //     setDoctors(doctorsData);

  //     // Appointments
  //     const resAppointments = await fetch(`${API_BASE}/api/admin/appointments`, { headers: buildAuthHeaders() });
  //     const appointmentsData = await resAppointments.json();
  //     setAppointments(appointmentsData);

  //     // Pending Users
  //     const resPendingUsers = await fetch(`${API_BASE}/api/admin/pending`, { headers: buildAuthHeaders() });
  //     const usersData = await resPendingUsers.json();
  //     setPendingUsers(usersData);

  //     // Pending Doctors
  //     const resPendingDoctors = await fetch(`${API_BASE}/api/admin/doctors/pending`, { headers: buildAuthHeaders() });
  //     const doctorsPendingData = await resPendingDoctors.json();
  //     setPendingDoctors(doctorsPendingData);
  //   } catch (err) {
  //     console.error(err);
  //     Swal.fire({
  //       title: "Error",
  //       text: "Failed to load admin data: " + (err.message || ""),
  //       icon: "error",
  //       confirmButtonText: "OK",
  //     });
  //   }
  // };

  const fetchData = async () => {
  try {
    // Patients
    const resPatients = await fetch(`${API_BASE}/api/admin/patients`, { headers: buildAuthHeaders() });
    const patientsData = await safeJson(resPatients);
    setPatients(Array.isArray(patientsData) ? patientsData : []);

    // Doctors
    const resDoctors = await fetch(`${API_BASE}/api/admin/doctors`, { headers: buildAuthHeaders() });
    const doctorsData = await safeJson(resDoctors);
    setDoctors(Array.isArray(doctorsData) ? doctorsData : []);

    // Appointments
    const resAppointments = await fetch(`${API_BASE}/api/admin/appointments`, { headers: buildAuthHeaders() });
    const appointmentsData = await safeJson(resAppointments);
    setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);

    // Pending Users
    const resPendingUsers = await fetch(`${API_BASE}/api/admin/pending`, { headers: buildAuthHeaders() });
    const usersData = await safeJson(resPendingUsers);
    setPendingUsers(Array.isArray(usersData) ? usersData : []);

    // Pending Doctors
    const resPendingDoctors = await fetch(`${API_BASE}/api/admin/doctors/pending`, { headers: buildAuthHeaders() });
    const doctorsPendingData = await safeJson(resPendingDoctors);
    setPendingDoctors(Array.isArray(doctorsPendingData) ? doctorsPendingData : []);
    
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "Error",
      text: "Failed to load admin data: " + (err.message || ""),
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};


  useEffect(() => {
    fetchData();
  }, []);

  // Appointment Status Counts
  const appointmentStatusCounts = appointments.reduce((acc, appt) => {
    const status = appt.status || "UNKNOWN";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const appointmentLabels = Object.keys(appointmentStatusCounts);
  const appointmentData = Object.values(appointmentStatusCounts);

  const handleApprove = async (id, type) => {
    try {
      const url =
        type === "user"
          ? `${API_BASE}/api/admin/register/approve/${id}`
          : `${API_BASE}/api/admin/doctors/approve/${id}?message=Verified`;

      const res = await fetch(url, { method: "POST", headers: buildAuthHeaders() });
      if (!res.ok) throw new Error(await safeMessage(res) || "Failed to approve");

      Swal.fire({ title: "Approved!", text: "Request approved successfully.", icon: "success" });
      fetchData();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  };

  const handleReject = async (id, type) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Request",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter rejection reason...",
      inputAttributes: { "aria-label": "Enter rejection reason" },
      showCancelButton: true,
    });

    if (!reason) return;

    try {
      const url =
        type === "user"
          ? `${API_BASE}/api/admin/register/reject/${id}?message=${encodeURIComponent(reason)}`
          : `${API_BASE}/api/admin/doctors/reject/${id}?message=${encodeURIComponent(reason)}`;

      const res = await fetch(url, { method: type === "user" ? "DELETE" : "POST", headers: buildAuthHeaders() });
      if (!res.ok) throw new Error(await safeMessage(res) || "Failed to reject");

      Swal.fire({ title: "Rejected!", text: "Request rejected successfully.", icon: "success" });
      fetchData();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.message, icon: "error" });
    }
  };


  

  return (
    <div className="overview-tab">
      <h2>Admin Dashboard Overview</h2>

      {/* KPI Cards */}
      <div className="panel-grid">
        <div className="kpi-card">
          <div className="kpi-title">Total Patients</div>
          <div className="kpi-value">{patients.length || "-"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Total Doctors</div>
          <div className="kpi-value">{doctors.length || "-"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Pending User Requests</div>
          <div className="kpi-value">{pendingUsers.length || "-"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Pending Doctor Approvals</div>
          <div className="kpi-value">{pendingDoctors.length || "-"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Total Appointments</div>
          <div className="kpi-value">{totalAppointments || "-"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Today's Appointments</div>
          <div className="kpi-value">{todayAppointments || "-"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Completed Appointments</div>
          <div className="kpi-value">{completedAppointments || "-"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Future Appointments</div>
          <div className="kpi-value">{futureAppointments || "-"}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-container">
        <div className="chart-box">
          <h3>Patients vs Doctors</h3>
          <div className="chart-wrapper">
            <Pie
              data={{
                labels: ["Patients", "Doctors"],
                datasets: [
                  {
                    data: [patients.length, doctors.length],
                    backgroundColor: ["#117ac1ff", "#dc1717ff"],
                    hoverBackgroundColor: ["#2980b9", "#df2330ff"],
                  },
                ],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="chart-box full-width">
          <h3>Appointments Timeline (This Month)</h3>
          <div className="chart-wrapper" style={{ height: 300 }}>
            <Line
              data={{
                labels: Object.keys(apptByDate),
                datasets: [
                  {
                    label: "Appointments per Day",
                    data: Object.values(apptByDate),
                    borderColor: "#36A2EB",
                    backgroundColor: "#36A2EB",
                    fill: false,
                    tension: 0.3,
                    pointRadius: 5,
                  },
                ],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="chart-box">
          <h3>Appointments Status</h3>
          <div className="chart-wrapper">
            <Pie
              data={{
                labels: appointmentLabels,
                datasets: [
                  {
                    data: appointmentData,
                    backgroundColor: ["#28a745", "#ffc107", "#dc3545", "#6c757d"],
                    hoverBackgroundColor: ["#218838", "#e0a800", "#c82333", "#5a6268"],
                  },
                ],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div className="chart-box">
          <h3>Total Users (with Pending)</h3>
          <div className="chart-wrapper">
            <Bar
              data={{
                labels: ["Patients", "Doctors"],
                datasets: [
                  {
                    label: "Active",
                    data: [patients.length, doctors.length],
                    backgroundColor: "#156ba5ff",
                  },
                  {
                    label: "Pending",
                    data: [pendingUsers.length, pendingDoctors.length],
                    backgroundColor: "#f39c12",
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: { legend: { position: "top" }, tooltip: { mode: "index", intersect: false } },
                scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Pending Requests Preview */}
      <div>
        <h3>Recent Pending Requests</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role / Specialization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...pendingUsers].map((req) => (
              <tr key={req.id}>
                <td>{req.name}</td>
                <td>{req.role}</td>
                <td>
                  <button className="btn small" onClick={() => handleApprove(req.id, req.role ? "user" : "doctor")}>Approve</button>
                  <button className="btn small danger" style={{ marginLeft: "10px" }} onClick={() => handleReject(req.id, req.role ? "user" : "doctor")}>Reject</button>
                </td>
              </tr>
            ))}
            {[...pendingUsers].length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>No pending requests</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OverviewTab;


