import React, { useEffect, useState } from "react";
import "../../styles/PatientProfile.css";
import Swal from "sweetalert2";
import {API_BASE, buildAuthHeaders } from "../../utils";

function PatientProfile() {
  const [patient, setPatient] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [identityDocument, setIdentityDocument] = useState(null);


  useEffect(() => {
    //const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/patient/profile`, {
      method: "GET",
      headers: buildAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => setPatient(data))
      .catch((err) => console.error(err));
  }, []);

    const handleEdit = () => setIsEditing(true);

    const handleUpdate = () => {
    const formData = new FormData();
    formData.append("name", patient.name);
    formData.append("dob", patient.dob);
    formData.append("gender", patient.gender);
    formData.append("phone", patient.phone);
    formData.append("address", patient.address);
    formData.append("emergencyContactPhone", patient.emergencyContactPhone);
    
   
    if (identityDocument) formData.append("governmentId", identityDocument);

    //const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/patient/update-profile`, {
      method: "PUT",
      headers: buildAuthHeaders(), 
      body: formData,
    })
      .then((res) => {
      if (!res.ok) {
          throw new Error("Failed to update profile");
        }
        return res.text(); // or res.json() depending on backend
      })
      .then((msg) => {
        Swal.fire({
          title: "Success!",
          text: msg,
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        setIsEditing(false);
      })
      .catch((err) => {
        Swal.fire({
          title: "Error!",
          text: "Failed to update profile. Try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      });
  };


  return (
    <div className="patient-profile">
      <h2>Profile</h2>

      <label>Name:</label>
      <input
        type="text"
        value={patient.name || ""}
        disabled={!isEditing}
        onChange={(e) => setPatient({ ...patient, name: e.target.value })}
      />

      <label>DOB:</label>
      <input
        type="date"
        value={patient.dob || ""}
        disabled={!isEditing}
        onChange={(e) => setPatient({ ...patient, dob: e.target.value })}
      />

       <label>Gender:</label>
      <select
        value={patient.gender || ""}
        disabled={!isEditing}
        onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <label>Phone:</label>
      <input
        type="text"
        value={patient.phone || ""}
        disabled={!isEditing}
        onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
      />

      <label>Address:</label>
      <input
        type="text"
        value={patient.address || ""}
        disabled={!isEditing}
        onChange={(e) => setPatient({ ...patient, address: e.target.value })}
      />

      <label>Emergency Contact No</label>
      <input
        type="text"
        value={patient.emergencyContactPhone || ""}
        disabled={!isEditing}
        onChange={(e) => setPatient({ ...patient, emergencyContactPhone: e.target.value })}
      />


      {isEditing && (
        <>
          <label>Identity Document (PDF):</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setIdentityDocument(e.target.files[0])}
          />
        </>
      )}

      {!isEditing && <button onClick={handleEdit}>Edit</button>}
      {isEditing && (
        <>
          <button onClick={handleUpdate}>Update</button> {"  "}
          <button onClick={() => setIsEditing(false)}>Close</button> {/* <-- Close button */}
        </>
      )}
    </div>
  );
}

export default PatientProfile;
