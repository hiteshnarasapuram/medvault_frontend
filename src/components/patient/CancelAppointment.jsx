import React, { useState } from "react";
import Swal from "sweetalert2";
import {API_BASE, buildAuthHeaders } from "../../utils";

function CancelAppointment({ appointment, onClose, onCancel }) {
  const [reason, setReason] = useState("");

  const handleCancel = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/patient/appointments/${appointment.appointmentId}/cancel?reason=${encodeURIComponent(reason)}`,
        {
          method: "PUT",
          headers: buildAuthHeaders(),
        }
      );

      if (!res.ok) throw new Error("Failed to cancel appointment");
      Swal.fire({
        title: "Cancelled!",
        text: "Your appointment has been cancelled.",
        icon: "success",
        confirmButtonText: "OK",
      });
      onCancel(); 
      onClose();  
    } catch (err) {
      console.error("Cancel error:", err);
      Swal.fire({
        title: "Error",
        text: "Error cancelling appointment: " + err.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Cancel Appointment with Dr. {appointment.doctorName}</h3>
        <textarea
          placeholder="Enter reason for cancellation"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={handleCancel} disabled={!reason}>
            Confirm Cancel
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default CancelAppointment;
