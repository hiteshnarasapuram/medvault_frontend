import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {API_BASE, buildAuthHeaders } from "../../utils";

function RescheduleAppointment({ appointment, onClose, onReschedule}) {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

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
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (!appointment || !appointment.doctorId) return;

    setLoading(true);
    setSlots([]);
    setSelectedSlot(null);

    fetch(`${API_BASE}/api/patient/doctor/${appointment.doctorId}/slots`, {
      headers: buildAuthHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 403)
            throw new Error("You are not authorized to fetch slots.");
          throw new Error(`Failed to fetch slots: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setSlots(data))
      .catch((err) => {
        console.error("Error fetching slots:", err);
        Swal.fire({
          title: "Error",
          text: err.message,
          icon: "error",
          confirmButtonText: "OK"
        });
      })
      .finally(() => setLoading(false));
  }, [appointment, apiBase]);

  const handleSubmit = () => {
    if (!selectedSlot) {
      return Swal.fire({
        title: "Select Slot",
        text: "Please select a slot to reschedule.",
        icon: "warning",
        confirmButtonText: "OK"
      });
    }
    if (!reason.trim()) {
      return Swal.fire({
        title: "Provide Reason",
        text: "Please enter a reason for rescheduling.",
        icon: "warning",
        confirmButtonText: "OK"
      });
    }

    fetch(
      `${API_BASE}/api/patient/appointments/${appointment.appointmentId}/reschedule?newSlotId=${selectedSlot.id}&reason=${encodeURIComponent(
        reason
      )}`,
      {
        method: "PUT",
        headers: buildAuthHeaders(),
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to reschedule");
        }
        return res.text();
      })
      .then((msg) => {
        Swal.fire({
          title: "Rescheduled!",
          text: msg || "Your appointment has been successfully rescheduled.",
          icon: "success",
          confirmButtonText: "OK"
        });
        onReschedule();
        onClose();
      })
      .catch((err) => {
      Swal.fire({
        title: "Error",
        text: "Failed to reschedule: " + err.message,
        icon: "error",
        confirmButtonText: "OK"
      });
    });
  };

  if (!appointment) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Reschedule Appointment with Dr. {appointment.doctorName}</h3>

        {loading ? (
          <p>Loading slots...</p>
        ) : (
          <div className="slots-container">
            {slots.length > 0 ? (
              slots.map((slot) => (
                <button
                  key={slot.id}
                  className={`slot-button ${
                    selectedSlot?.id === slot.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <div>{formatDate(slot.slotDate)}</div>
                  <div>{formatTime(slot.startTime)}</div>
                </button>
              ))
            ) : (
              <p>No available slots.</p>
            )}
          </div>
        )}

        <div >
          <label>
            Reason for Rescheduling:
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for reschedule"
             
            />
          </label>
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit} disabled={!selectedSlot || !reason}>Confirm</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default RescheduleAppointment;

