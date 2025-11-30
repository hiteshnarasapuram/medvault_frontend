
import React, { useEffect, useState } from "react";
import "../../styles/DoctorProfile.css";
import Swal from "sweetalert2";
import { API_BASE, buildAuthHeaders} from "../../utils";

function DoctorProfile() {
  const [doctor, setDoctor] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [doctorCertificate, setDoctorCertificate] = useState(null);
  const [governmentId, setGovernmentId] = useState(null);

  useEffect(() => {
    //const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/doctor/profile`, {
      method: "GET",
      headers: buildAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => setDoctor(data))
      .catch((err) => console.error(err));
  }, []);

  const handleEdit = () => setIsEditing(true);

  const handleUpdate = () => {
    const formData = new FormData();
    formData.append("name", doctor.name || "");
    formData.append("dob", doctor.dob || "");
    formData.append("gender", doctor.gender || "");
    formData.append("phone", doctor.phone || "");
    formData.append("address", doctor.address || "");
    formData.append("specialization", doctor.specialization || "");
    formData.append("consultationFees", doctor.consultationFees || 0);
    formData.append("hospital", doctor.hospital || "");
    formData.append("experience", doctor.experience || 0);

    if (doctorCertificate) formData.append("doctorCertificate", doctorCertificate);
    if (governmentId) formData.append("governmentId", governmentId);

    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/doctor/update-profile`, {
      method: "PUT",
      headers: buildAuthHeaders(),
      body: formData,
    })
      .then((res) => res.text())
      .then((msg) => {
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: msg,
          timer: 2000,
          showConfirmButton: false,
        });
        setIsEditing(false);
      })
      .catch((err) => {
      Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Something went wrong",
        });
      });

  };

  return (
    <div className="doctor-profile">
      <h2>Profile</h2>

      <label>Name:</label>
      <input
        type="text"
        value={doctor.name || ""}
        disabled={!isEditing}
        onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
      />

      <label>DOB:</label>
      <input
        type="date"
        value={doctor.dob || ""}
        disabled={!isEditing}
        onChange={(e) => setDoctor({ ...doctor, dob: e.target.value })}
      />

      <label>Gender:</label>
      <input
        type="text"
        value={doctor.gender || ""}
        disabled={!isEditing}
        onChange={(e) => setDoctor({ ...doctor, gender: e.target.value })}
      />

      <label>Phone:</label>
      <input
        type="text"
        value={doctor.phone || ""}
        disabled={!isEditing}
        onChange={(e) => setDoctor({ ...doctor, phone: e.target.value })}
      />

      <label>Address:</label>
      <input
        type="text"
        value={doctor.address || ""}
        disabled={!isEditing}
        onChange={(e) => setDoctor({ ...doctor, address: e.target.value })}
      />

      <label>Specialization:</label>
      <input
        type="text"
        value={doctor.specialization || ""}
        disabled={!isEditing}
        onChange={(e) => setDoctor({ ...doctor, specialization: e.target.value })}
      />

      <label>Consultation Fees:</label>
      <input
        type="number"
        value={doctor.consultationFees || ""}
        disabled={!isEditing}
        onChange={(e) => setDoctor({ ...doctor, consultationFees: e.target.value })}
      />

      <label>Hospital:</label>
      <input
        type="text"
        value={doctor.hospital || ""}
        disabled={!isEditing}
        onChange={(e) => setDoctor({ ...doctor, hospital: e.target.value })}
      />

      <label>Experience (years):</label>
      <input
        type="number"
        value={doctor.experience || ""}
        disabled={!isEditing}
        onChange={(e) => setDoctor({ ...doctor, experience: e.target.value })}
      />

      {isEditing && (
        <>
          <label>Doctor Certificate (PDF):</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setDoctorCertificate(e.target.files[0])}
          />

          <label>Government ID (PDF):</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setGovernmentId(e.target.files[0])}
          />
        </>
      )}

      {/* {!isEditing && <button onClick={handleEdit}>Edit</button>}
      {isEditing && <button onClick={handleUpdate}>Update</button>} */}
      <div className="action-buttons">
      {!isEditing && <button className="update-btn" onClick={handleEdit}>Edit</button>}
        {isEditing && (
          <>
            <button className="update-btn" onClick={handleUpdate}>Update</button>
            <button className="update-btn" onClick={() => setIsEditing(false)}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}

export default DoctorProfile;
