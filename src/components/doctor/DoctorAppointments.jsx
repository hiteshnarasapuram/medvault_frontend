import React, { useState, useEffect } from "react";
import "../../styles/DoctorAppointments.css";
import Swal from "sweetalert2";
import {API_BASE, buildAuthHeaders} from "../../utils";

function DoctorAppointments() {
  const [activeTab, setActiveTab] = useState("booked");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotInterval, setSlotInterval] = useState(30);
  const [message, setMessage] = useState("");
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination states
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [slotPage, setSlotPage] = useState(1);
  const itemsPerPage = 8;

  //const API_BASE = "http://localhost:8080";
  //const token = localStorage.getItem("token");

  // Format date & time
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Fetch booked appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/api/doctor/appointments`;
     if (appointmentDate) url += `?date=${appointmentDate}`;
      const res = await fetch(url, {
        method: "GET",
        headers: buildAuthHeaders
      });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      data.sort((a, b) => {
        if (a.slotDate !== b.slotDate)
          return a.slotDate.localeCompare(b.slotDate);
        return a.slotTime.localeCompare(b.slotTime);
      });
      setAppointments(data);
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

  // Fetch slots
  const fetchSlots = async (date = "") => {
    try {
      setLoading(true);
      let url = `${API_BASE}/api/doctor/slots`;
      if (date) url += `?date=${date}`;
      const res = await fetch(url, {
        method: "GET",
        headers: buildAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch slots");
      const data = await res.json();
      setSlots(data);
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

  useEffect(() => {
    if (activeTab === "booked") fetchAppointments();
    else if (activeTab === "manage") fetchSlots(slotDate);
  }, [activeTab, slotDate,appointmentDate]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Create slots
  const handleCreateSlots = async (e) => {
    e.preventDefault();
    try {
      const body = {
        slotDate,
        startTime,
        endTime,
        slotIntervalMinutes: parseInt(slotInterval),
      };
      const res = await fetch(`${API_BASE}/api/doctor/create-slots`, {
        method: "POST",
        headers: buildAuthHeaders(),
        body: JSON.stringify(body),
      });
      const msg = await res.text();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: msg,
        timer: 2000,
        showConfirmButton: false,
      });
      setSlotDate("");
      setStartTime("");
      setEndTime("");
      setSlotInterval(30);
      fetchSlots();
      setActiveTab("manage");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong",
      });
    }
  };

  const toggleSlotStatus = async (slotId, currentStatus) => {
    const action =
      currentStatus === "ACTIVE" ? "set this slot INACTIVE" : "set this slot ACTIVE";
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${action}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/doctor/slots/${slotId}/status`, {
        method: "PUT",
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          status: currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        }),
      });
      if (!res.ok) throw new Error("Failed to update slot status");
      const msg = await res.text();
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: msg,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchSlots(slotDate);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong",
      });
    }
  };

  const deleteSlot = async (slotId) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this slot?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!confirmResult.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/api/doctor/slots/${slotId}`, {
        method: "DELETE",
        headers: buildAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete slot");
      const msg = await res.text();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: msg,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchSlots(slotDate);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong",
      });
    }
  };


  const updateStatus = async (appointmentId, newStatus, cancelReason = "") => {
  try {
    const res = await fetch(
      `${API_BASE}/api/doctor/appointments/${appointmentId}/status`,
      {
        method: "PUT",
        headers: buildAuthHeaders(),
        body: JSON.stringify({
          status: newStatus,
          cancelReason,
        }),
      }
    );
    const msg = await res.text();
    Swal.fire({
      icon: "success",
      title: "Status Updated",
      text: msg,
      timer: 1500,
      showConfirmButton: false,
    });
    fetchAppointments();
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error updating status: " + err.message,
    });
  }
};


  // Filters
  const filteredAppointments = appointments.filter((appt) => {
    const matchesName = appt.patientName
      .toLowerCase()
      .includes(searchKeyword.toLowerCase());
    const matchesDate = appointmentDate ? appt.slotDate === appointmentDate : true;
    const matchesStatus = filterStatus ? appt.status === filterStatus : true;
    return matchesName && matchesDate && matchesStatus;
  });

  const filteredSlots = slotDate
    ? slots.filter((slot) => slot.slotDate === slotDate)
    : slots;

  // Pagination logic
  const indexOfLastAppointment = appointmentPage * itemsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );

  const indexOfLastSlot = slotPage * itemsPerPage;
  const indexOfFirstSlot = indexOfLastSlot - itemsPerPage;
  const currentSlots = filteredSlots.slice(indexOfFirstSlot, indexOfLastSlot);

  return (
    <div className="appointments-page">
      <div className="appointments-container">
        <h2>Doctor Appointments Management</h2>

        {/* Tabs */}
        <div style={{ marginBottom: "20px" }}>
          <button
            className={`btn ${activeTab === "booked" ? "primary" : ""}`}
            onClick={() => setActiveTab("booked")}
          >
            Booked Appointments
          </button>
          <button
            className={`btn ${activeTab === "manage" ? "primary" : ""}`}
            style={{ marginLeft: "10px" }}
            onClick={() => {setActiveTab("manage");
              setSlotDate("");

            }
          }
          >
            Manage Slots
          </button>
          <button
            className={`btn ${activeTab === "create" ? "primary" : ""}`}
            style={{ marginLeft: "10px" }}
            onClick={() => {setActiveTab("create");
              setSlotDate("");
            }
          }
          >
            Create Slots
          </button>
        </div>

        {message && <p className="message">{message}</p>}

        {/* Search + Filters */}
        {activeTab === "booked" && (
          <div>
            <input
              type="text"
              placeholder="🔍 Search by patient name..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ marginRight: "10px", padding: "5px", width: "250px" }}
            />
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              style={{ padding: "5px" }}
            />
            <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            marginLeft: "10px",
            padding: "6px 12px",
            fontSize: "14px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            backgroundColor: "#f8f9fa",
            color: "#333",
            cursor: "pointer",
            transition: "all 0.2s ease",
            outline: "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#0077b6";
            e.target.style.boxShadow = "0 0 5px rgba(0, 119, 182, 0.4)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#ccc";
            e.target.style.boxShadow = "none";
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#e9f5ff")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#f8f9fa")}
        >
          <option style={{ backgroundColor: "#fff", color: "#333" }} value="">
            All Statuses
          </option>
          <option style={{ backgroundColor: "#fff", color: "#555" }} value="PENDING">
            Pending
          </option>
          <option style={{ backgroundColor: "#fff", color: "#0077b6" }} value="CONFIRMED">
            Confirmed
          </option>
          <option style={{ backgroundColor: "#fff", color: "#28a745" }} value="COMPLETED">
            Completed
          </option>
          <option style={{ backgroundColor: "#fff", color: "#d62828" }} value="CANCELLED">
            Cancelled
          </option>
        </select>

          </div>
        )}

        {/* Booked Appointments */}
        {activeTab === "booked" && (
          <>
            {loading ? (
              <p>Loading appointments...</p>
            ) : filteredAppointments.length > 0 ? (
              <>
                <div className="appointments-list"
                style={{
                  display: "grid",
                  gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "repeat(2, 1fr)",
                  gap: "20px",
                  marginTop: "20px",
                }}>
                  {currentAppointments.map((appt) => (
                    <div
                      key={appt.appointmentId}
                      className="appointment-card"
                    >
                      <p>
                        <strong>Patient:</strong> {appt.patientName}
                      </p>
                      <p>
                        <strong>Date:</strong> {formatDate(appt.slotDate)}
                      </p>
                      <p>
                        <strong>Time:</strong> {formatTime(appt.slotTime)}
                      </p>
                      <p>
                        <strong>Reason:</strong> {appt.reason}
                      </p>
                      <p>
                        <strong>Status:</strong> {appt.status}
                      </p>

                      {appt.rescheduled && (
                        <p className="reschedule-info">
                          <strong>Rescheduled:</strong> Yes <br />
                          <strong>Reason:</strong>{" "}
                          {appt.rescheduleReason || "Not provided"}
                        </p>
                      )}

                      {appt.status !== "CANCELLED" &&
                        appt.status !== "COMPLETED" && (
                          <div className="status-control">
                        <strong>Change Status: </strong>

                        {appt.status === "PENDING" && (
                          <>
                            <button
                              className="btn small"
                              style={{ background: "#095a50ff", marginRight: "1px" }}
                              onClick={async () => {
                                await updateStatus(appt.appointmentId, "CONFIRMED");
                              }}
                            >
                              Confirm
                            </button>

                            <button
                              className="btn small danger"
                              style={{ background: "#bb4646ff",color: "white"}}
                              onClick={async () => {
                                const reason = prompt("Enter reason for cancellation/rejection:");
                                if (!reason) return alert("Cancel reason is required!");
                                await updateStatus(appt.appointmentId, "CANCELLED", reason);
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {appt.status === "CONFIRMED" && (
                          <>
                            <button
                              className="btn small"
                              style={{ background: "#198ab7ff", marginRight: "1px" }}
                              onClick={async () => {
                                await updateStatus(appt.appointmentId, "COMPLETED");
                              }}
                            >
                              Completed
                            </button>

                            <button
                              className="btn small danger"
                              style={{ background: "#bb4646ff",color: "white"}}
                              onClick={async () => {
                                const reason = prompt("Enter reason for cancellation:");
                                if (!reason) return alert("Cancel reason is required!");
                                await updateStatus(appt.appointmentId, "CANCELLED", reason);
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>

                        )}
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="pagination">
                  <button
                    disabled={appointmentPage === 1}
                    onClick={() =>
                      setAppointmentPage(appointmentPage - 1)
                    }
                  >
                    Previous
                  </button>

                  <span style={{ margin: "0 10px" }}>
                    Page {appointmentPage} of{" "}
                    {Math.ceil(
                      filteredAppointments.length / itemsPerPage
                    )}
                  </span>

                  <button
                    disabled={
                      appointmentPage >=
                      Math.ceil(
                        filteredAppointments.length / itemsPerPage
                      )
                    }
                    onClick={() =>
                      setAppointmentPage(appointmentPage + 1)
                    }
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p>No booked appointments.</p>
            )}
          </>
        )}

        {/* Manage Slots */}
        {activeTab === "manage" && (
          <>
            <div className="slot-filter">
              Filter by Date:{" "}
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
              />
            </div>

            <ul className="slots-list">
              {loading ? (
                <p>Loading slots...</p>
              ) : filteredSlots.length > 0 ? (
                currentSlots.map((slot) => (
                  <li key={slot.id}>
                    {formatDate(slot.slotDate)} —{" "}
                    {formatTime(slot.slotTime)} ({slot.status})
                    <button
                      style={{ marginLeft: "30%" }}
                      onClick={() =>
                        toggleSlotStatus(slot.id, slot.status)
                      }
                    >
                      {slot.status === "ACTIVE"
                        ? "Set Inactive"
                        : "Set Active"}
                    </button>
                    <button
                      style={{ marginRight: "20%" }}
                      onClick={() => deleteSlot(slot.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))
              ) : (
                <p>No slots found for this date.</p>
              )}
            </ul>

            {/* Pagination controls */}
            {filteredSlots.length > itemsPerPage && (
              <div className="pagination">
                <button
                  onClick={() => setSlotPage(slotPage - 1)}
                  disabled={slotPage === 1}
                >
                  Prev
                </button>
                <span>
                  Page {slotPage} of{" "}
                  {Math.ceil(filteredSlots.length / itemsPerPage)}
                </span>
                <button
                  onClick={() => setSlotPage(slotPage + 1)}
                  disabled={
                    slotPage ===
                    Math.ceil(filteredSlots.length / itemsPerPage)
                  }
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Slots */}
        {activeTab === "create" && (
          <>
            <form onSubmit={handleCreateSlots} className="slot-form">
              <label>
                Date:
                <input
                  type="date"
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </label>
              <label>
                Start Time:
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </label>
              <label>
                End Time:
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </label>
              <label>
                Slot Interval (minutes):
                <input
                  type="number"
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(e.target.value)}
                  min="1"
                  required
                />
              </label>
              <button type="submit">Create Slots</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default DoctorAppointments;

