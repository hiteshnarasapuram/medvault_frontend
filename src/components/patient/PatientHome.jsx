import React, { useEffect, useState, useMemo } from "react";
import { Pie, Line } from "react-chartjs-2";
import RescheduleAppointment from "./RescheduleAppointment";
import CancelAppointment from "./CancelAppointment";
import Feedback from "./Feedback";
import Swal from "sweetalert2";
import {API_BASE, buildAuthHeaders } from "../../utils";
import "../../styles/PatientHome.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

function PatientHome({ setActivePage }) {
  const [appointments, setAppointments] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [appointmentsByDate, setAppointmentsByDate] = useState({});
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [feedbackAppointment, setFeedbackAppointment] = useState(null);
  const [cancelAppointment, setCancelAppointment] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Adjust as needed

  const refreshAppointments = () => {
    fetch(`${API_BASE}/api/patient/appointments`, {
      headers: buildAuthHeaders(),
    })
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => {
        Swal.fire({
          title: "Error",
          text: "Could not load appointments: " + err.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

  const statusColors = {
    PENDING: "#36A2EB",
    CONFIRMED: "#4CAF50",
    COMPLETED: "#FFCE56",
    CANCELLED: "#FF6384",
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
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

  const handleCancelSuccess = () => {
    refreshAppointments();
    Swal.fire({
      title: 'Cancelled!',
      text: 'Your appointment has been cancelled.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  };

  const handleRescheduleSuccess = () => {
    refreshAppointments();
    Swal.fire({
      title: 'Rescheduled!',
      text: 'Your appointment has been successfully rescheduled.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  };

  const handleFeedbackSuccess = () => {
    refreshAppointments();
    Swal.fire({
      title: 'Feedback Submitted!',
      text: 'Thank you for your feedback.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/patient/appointments`, {
      method: "GET",
      headers: buildAuthHeaders(),
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch appointments");
        return res.json();
      })
      .then((data) => {
        setAppointments(data);

        const counts = data.reduce((acc, appt) => {
          acc[appt.status] = (acc[appt.status] || 0) + 1;
          return acc;
        }, {});
        setStatusCounts(counts);

        const today = new Date();
        const monthDates = getAllDatesOfMonth(today.getFullYear(), today.getMonth());

        const apptCounts = {};
        monthDates.forEach((d) => {
          const formatted = formatDate(d);
          apptCounts[formatted] = 0;
        });

        data.forEach((appt) => {
          const apptDate = new Date(appt.date);
          if (apptDate.getMonth() === today.getMonth() && apptDate.getFullYear() === today.getFullYear()) {
            const formatted = formatDate(appt.date);
            apptCounts[formatted] = (apptCounts[formatted] || 0) + 1;
          }
        });

        setAppointmentsByDate(apptCounts);
      })
      .catch((err) =>
        Swal.fire({
          title: "Error",
          text: "Failed to fetch appointments: " + err.message,
          icon: "error",
          confirmButtonText: "OK",
        })
      );
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return appointments.slice(startIndex, startIndex + itemsPerPage);
  }, [appointments, currentPage]);

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
    <div className="patient-home">
      <div className="patient-dashboard">
        <h2>Your Appointments</h2>

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

        <div className="appointments-list">
          {paginatedAppointments.map((appt) => (
            <div key={appt.appointmentId} className="appointment-card">
              <h3>Dr. {appt.doctorName.toUpperCase()}</h3>
              <p><strong>Date:</strong> {formatDate(appt.date)}</p>
              <p><strong>Time:</strong> {formatTime(appt.time)}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status ${appt.status.toLowerCase()}`}>{appt.status}</span>
              </p>
              {appt.reasonForBooking && (
                <p><strong>Reason:</strong> {appt.reasonForBooking}</p>
              )}

              {(appt.status === "CONFIRMED" || appt.status === "PENDING") && (
                <button onClick={() => setRescheduleAppointment(appt)}>Reschedule</button>
              )}
              {appt.status === "PENDING" && (
                <button className="cancle-btn" onClick={() => setCancelAppointment(appt)}>
                  Cancel
                </button>
              )}
              {appt.status === "COMPLETED" && (
                <button onClick={() => setFeedbackAppointment(appt)}>Give Feedback</button>
              )}
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {rescheduleAppointment && (
          <RescheduleAppointment
            appointment={rescheduleAppointment}
            onClose={() => setRescheduleAppointment(null)}
            onReschedule={handleRescheduleSuccess}
          />
        )}
        {feedbackAppointment && (
          <Feedback
            appointment={feedbackAppointment}
            onClose={() => setFeedbackAppointment(null)}
            onSubmitted={refreshAppointments}
          />
        )}
        {cancelAppointment && (
          <CancelAppointment
            appointment={cancelAppointment}
            onClose={() => setCancelAppointment(null)}
            onCancel={handleCancelSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default PatientHome;



