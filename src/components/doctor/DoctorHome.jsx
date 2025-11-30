import React, { useEffect, useState } from "react";
import { Pie, Line, Bar} from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js";
import Swal from "sweetalert2";
import "../../styles/DoctorHome.css";
import { API_BASE,buildAuthHeaders } from "../../utils";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);


function DoctorHome() {
  const [appointments, setAppointments] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [appointmentsByDate, setAppointmentsByDate] = useState({});
  const token = localStorage.getItem("token");
  // const API_BASE = "http://localhost:8080";

  const statusColors = {
    PENDING: "#36A2EB",
    CONFIRMED: "#4CAF50",
    COMPLETED: "#FFCE56",
    CANCELLED: "#FF6384",
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
  };

  const formatTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getAllDatesOfMonth = (year, month) => {
    const dates = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const refreshAppointments = () => {
    fetch(`${API_BASE}/api/doctor/appointments`, {
      headers: buildAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data);

        // Count statuses
        const counts = data.reduce((acc, appt) => {
          acc[appt.status] = (acc[appt.status] || 0) + 1;
          return acc;
        }, {});
        setStatusCounts(counts);

        // Appointments per day (current month)
        const today = new Date();
        const monthDates = getAllDatesOfMonth(today.getFullYear(), today.getMonth());
        const apptCounts = {};
        monthDates.forEach((d) => {
          const formatted = formatDate(d);
          apptCounts[formatted] = 0;
        });
        data.forEach((appt) => {
          const apptDate = new Date(appt.slotDate);
          if (apptDate.getMonth() === today.getMonth() && apptDate.getFullYear() === today.getFullYear()) {
            const formatted = formatDate(appt.slotDate);
            apptCounts[formatted] = (apptCounts[formatted] || 0) + 1;
          }
        });
        setAppointmentsByDate(apptCounts);
      })
      .catch((err) =>
        Swal.fire({
          title: "Error",
          text: "Could not load appointments: " + err.message,
          icon: "error",
          confirmButtonText: "OK",
        })
      );
  };

  useEffect(() => {
    refreshAppointments();
  }, []);

  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Appointments by Status",
        data: Object.values(statusCounts),
        backgroundColor: Object.keys(statusCounts).map(
          (status) => statusColors[status] || "#999999"
        ),
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: Object.keys(appointmentsByDate),
    datasets: [
      {
        label: "Appointments per Date (This Month)",
        data: Object.values(appointmentsByDate),
        borderColor: "#36A2EB",
        backgroundColor: "#36A2EB",
        fill: false,
        tension: 0.3,
        pointRadius: 5,
      },
    ],
  };

  return (
    <div className="doctor-home">
      {/* <h2>Welcome to your Dashboard!</h2>
      <p>You can manage your profile, appointments, and patients from here.</p> */}

      <div className="charts-container">
        <div className="chart-box">
          <h3>Status Overview</h3>
          <div style={{ width: "100%", height: "300px" }}>
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="chart-box">
          <h3>Appointments Timeline (This Month)</h3>
          <div style={{ width: "100%", height: "300px" }}>
            <Line data={lineData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      {/* <div className="appointments-list">
        {appointments.length > 0 ? (
          appointments
            .filter(
              (appt) =>
                new Date(appt.slotDate).toDateString() ===
                new Date().toDateString()
            )
            .map((appt) => (
              <div key={appt.appointmentId} className="appointment-card">
                <p><strong>Patient:</strong> {appt.patientName}</p>
                <p><strong>Time:</strong> {formatTime(appt.slotTime)}</p>
                <p><strong>Status:</strong> {appt.status}</p>
              </div>
            ))
        ) : (
          <p>No appointments for today.</p>
        )}
      </div> */}
      <h3>Today's Appointments</h3>
      <div className="appointments-list">
        {appointments
          .filter((appt) => {
            const today = new Date();
            const apptDate = new Date(appt.slotDate || appt.date); // fallback if your API uses `slotDate`
            return (
              apptDate.getDate() === today.getDate() &&
              apptDate.getMonth() === today.getMonth() &&
              apptDate.getFullYear() === today.getFullYear()
            );
          })
          .map((appt) => (
            <div key={appt.appointmentId} className="appointment-card">
              <h3>{appt.patientName}</h3>
              <p><strong>Date:</strong> {formatDate(appt.slotDate || appt.date)}</p>
              <p><strong>Time:</strong> {formatTime(appt.slotTime || appt.time)}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status ${appt.status.toLowerCase()}`}>{appt.status}</span>
              </p>

              {appt.status === "PENDING" && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE}/api/doctor/appointments/${appt.appointmentId}/status`, {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ status: "CONFIRMED" }),
                      });
                      if (!res.ok) throw new Error("Failed to confirm appointment");
                      Swal.fire({
                        icon: "success",
                        title: "Confirmed",
                        text: "Appointment confirmed!",
                        timer: 2000,
                        showConfirmButton: false,
                      });

                      refreshAppointments();
                    } catch (err) {
                      Swal.fire({
                      icon: "error",
                      title: "Error",
                      text: err.message || "Something went wrong",
                    });
                    }
                  }}
                >
                  Confirm
                </button>
              )}

              {appt.status === "CONFIRMED" && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_BASE}/api/doctor/appointments/${appt.appointmentId}/status`, {
                        method: "PUT",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ status: "COMPLETED" }),
                      });
                      if (!res.ok) throw new Error("Failed to mark as completed");
                      Swal.fire({
                        icon: "success",
                        title: "Completed",
                        text: "Appointment marked as completed!",
                        timer: 2000,
                        showConfirmButton: false,
                      });
                      refreshAppointments();
                    } catch (err) {
                      Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: err.message || "Something went wrong",
                      });
                    }
                  }}
                >
                  Completed
                </button>
              )}
            </div>
          ))}
      </div>

    </div>
  );
}

export default DoctorHome;
