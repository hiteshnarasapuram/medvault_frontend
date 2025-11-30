
import React, { useState, useEffect } from "react";
import { API_BASE, buildAuthHeaders, safeMessage } from "../../../utils";
import "../../../styles/AddPatient.css";
import Swal from "sweetalert2";

function AddPatientForm({ patient = null, setEditingPatient = null, refreshPatients }) {
  const [patientData, setPatientData] = useState({
    name: "",
    dob: "",
    gender: "",
    phone: "",
    user: { email: "", password: "patient@123" },
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (patient) {
      setPatientData({
        id: patient.id,
        name: patient.name,
        dob: patient.dob,
        gender: patient.gender,
        phone: patient.phone,
        user: { email: patient.user?.email ?? patient.email, password: "" },
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" || name === "password") {
      setPatientData((prev) => ({ ...prev, user: { ...prev.user, [name]: value } }));
    } else {
      setPatientData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetMessages = () => {
    setSubmitError("");
    setSuccessMsg("");
  };

  const submitPatient = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const payload = {
        name: patientData.name.trim(),
        dob: patientData.dob,
        gender: (patientData.gender || "").toUpperCase(),
        phone: patientData.phone.trim(),
        user: {
          email: (patientData.user.email || "").trim(),
          password: patientData.user.password || undefined,
        },
      };

      if (!patientData.id) {
        payload.user.password = patientData.user.password || "patient@123";
      } else if (!patientData.user.password) {
        delete payload.user.password;
      }

      let url = `${API_BASE}/api/admin/add/patient`;
      let method = "POST";
      if (patientData.id) {
        url = `${API_BASE}/api/admin/update/patient/${patientData.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: buildAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await safeMessage(res);
        throw new Error(msg || `Failed to ${method === "POST" ? "add" : "update"} patient`);
      }

      // setSuccessMsg(`Patient ${method === "POST" ? "added" : "updated"} successfully.`);
      Swal.fire({
      title: "Success",
      text: `Patient ${method === "POST" ? "added" : "updated"} successfully.`,
      icon: "success",
      confirmButtonText: "OK",
    });
      setPatientData({
        name: "",
        dob: "",
        gender: "",
        phone: "",
        user: { email: "", password: "patient@123" },
      });

      if (refreshPatients) {
        refreshPatients();
      }

      if (setEditingPatient) setEditingPatient(null); // back to PatientsTab

    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e.message || "Error submitting patient.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addPatient">
    <form className="form" onSubmit={submitPatient}>
      {(submitError || successMsg) && (
        <div >
          {submitError && <div >{submitError}</div>}
          {successMsg && <div >{successMsg}</div>}
        </div>
      )}

      <div className="grid-2">
        <label>
          Name
          <input type="text" name="name" value={patientData.name} onChange={handleChange} required />
        </label>
        <label>
          DOB
          <input type="date" name="dob" value={patientData.dob} onChange={handleChange} required />
        </label>
        <label>
          Gender
          <select name="gender" value={patientData.gender} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label>
          Phone
          <input type="text" name="phone" value={patientData.phone} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={patientData.user.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="text" name="password" value={patientData.user.password} onChange={handleChange} />
          <div className="hint">Default: patient@123</div>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? "Saving..." : patientData.id ? "Update Patient" : "Add Patient"}
        </button>
      </div>
    </form>
    </div>
  );
}

export default AddPatientForm;
