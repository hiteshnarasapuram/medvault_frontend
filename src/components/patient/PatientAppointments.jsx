import React, { useEffect, useState } from "react";
import "../../styles/PatientAppointments.css";
import Swal from "sweetalert2";
import {API_BASE, buildAuthHeaders } from "../../utils";

function PatientAppointments() {
  const [view, setView] = useState("book"); 
  const [doctors, setDoctors] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10; // number of doctors per page
  //const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/patient/search-doctors`, {
        headers: buildAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch doctors");
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Error fetching doctors: " + err.message });
    }
  };

  const fetchSlots = async (doctorId) => {
    try {
      const res = await fetch(`${API_BASE}/api/patient/doctor/${doctorId}/slots`, {
        headers: buildAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch slots");
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Error fetching slots: " + err.message });
    }
  };

  const bookAppointment = async () => {
    if (!selectedSlot || !reason) {
      return Swal.fire({ icon: "warning", title: "Missing Details", text: "Please select a slot and enter a reason." });
    }
    try {
      const res = await fetch(
        `${API_BASE}/api/patient/book-appointment/${selectedSlot.id}?reason=${encodeURIComponent(reason)}`,
        { method: "POST", headers: buildAuthHeaders() }
      );

      const data = await res.text();
      if (!res.ok) return Swal.fire({ icon: "error", title: "Booking Failed", text: data });

      Swal.fire({ icon: "success", title: "Appointment Booked", text: data });
      setSelectedDoctor(null);
      setSlots([]);
      setSelectedSlot(null);
      setReason("");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Error booking appointment: " + err.message });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-GB", options);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const filteredDoctors = doctors.filter((doc) => {
    const keyword = searchKeyword.toLowerCase();
    return (
      doc.name.toLowerCase().includes(keyword) ||
      doc.specialization.toLowerCase().includes(keyword) ||
      doc.hospital.toLowerCase().includes(keyword)
    );
  });

  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

  // Pagination logic
  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

  const goToPage = (pageNum) => setCurrentPage(pageNum);

  return (
    <div className="patient-appointments">
      <h2>Book Appointment</h2>
      <input
        type="text"
        placeholder="Search by name, specialization, or hospital"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        className="search-input1"
      />
      {view === "book" && (
        <>
          <div className="doctor-list">
            {currentDoctors.map((doc) => (
              <div key={doc.id} className="doctor-card">

                <div className="doctor-header">
                  <div className="doctor-left">
                  <div className="doctor-icon">
                    <img src="/image1.png" alt="Doctor Icon" />
                  </div>

                  <div className="doctor-info">
                    <div><b>Dr. {doc.name.toUpperCase()}</b></div>
                    <div><strong>Specialization:</strong> {capitalize(doc.specialization)}</div>
                    <div><strong>Hospital:</strong> {capitalize(doc.hospital)}</div>
                    <div className="doctor-rating">
                      {" "}
                      {doc.averageRating != null
                        ? (
                            <>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} style={{ color: "#FFD700", fontSize: "24px" }}>
                                  {i < Math.round(doc.averageRating) ? "★" : "☆"}
                                </span>
                              ))}
                              <span style={{ marginLeft: "6px", fontSize: "20px" }}>({doc.ratingCount})</span>
                            </>
                          )
                        : "No ratings yet"}
                    </div>
                  </div>
                </div>
                  <button
                    className="btn-ghost"
                    onClick={() => {
                      if (selectedDoctor?.id === doc.id) {
                        setSelectedDoctor(null);
                        setSlots([]);
                        setSelectedSlot(null);
                        setReason("");
                      } else {
                        setSelectedDoctor(doc);
                        fetchSlots(doc.id);
                        setSlots([]);
                        setSelectedSlot(null);
                        setReason("");
                      }
                    }}
                  >
                    {selectedDoctor?.id === doc.id ? "Hide Slots" : "View Slots"}
                  </button>
                </div>

                {/* {selectedDoctor?.id === doc.id && (
                  <div className="slot-section">
                    <h4>Available Slots</h4>
                    <div className="slots">
                      {slots.length > 0 ? (
                        slots.map((slot) => (
                          <button
                            key={slot.id}
                            className={`slot-chip ${selectedSlot?.id === slot.id ? "selected" : ""}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <div>{formatDate(slot.slotDate)}</div>
                            <div>{formatTime(slot.startTime)}</div>
                          </button>
                        ))
                      ) : (
                        <p className="empty">No slots available</p>
                      )}
                    </div>

                    {selectedSlot && (
                      <div className="selected-slot">
                        <p>Selected: {formatDate(selectedSlot.slotDate)} {formatTime(selectedSlot.startTime)}</p>
                        <textarea
                          placeholder="Reason for appointment"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                        <button className="btn-primary" onClick={bookAppointment} disabled={!selectedSlot || !reason.trim()}>
                          Book Appointment
                        </button>
                      </div>
                    )}
                  </div>
                )} */}
                {selectedDoctor?.id === doc.id && (
                <div className="slot-section">
                  <h4>Available Slots</h4>

                  <div className="slots-container">
                    <div className="slots">
                      {slots.length > 0 ? (
                        slots.map((slot) => (
                          <button
                            key={slot.id}
                            className={`slot-chip ${selectedSlot?.id === slot.id ? "selected" : ""}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <div>{formatDate(slot.slotDate)}</div>
                            <div>{formatTime(slot.startTime)}</div>
                          </button>
                        ))
                      ) : (
                        <p className="empty">No slots available</p>
                      )}
                    </div>
                  </div>

                  {selectedSlot && (
                    <div className="selected-slot">
                      <p>
                        Selected: {formatDate(selectedSlot.slotDate)} {formatTime(selectedSlot.startTime)}
                      </p>
                      <textarea
                        placeholder="Reason for appointment"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <button
                        className="btn-primary"
                        onClick={bookAppointment}
                        disabled={!selectedSlot || !reason.trim()}
                      >
                        Book Appointment
                      </button>
                    </div>
                  )}
                </div>
              )}

              </div>
            ))}
          </div>

          {/* Pagination Buttons */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => goToPage(i + 1)} disabled={currentPage === i + 1}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PatientAppointments;







