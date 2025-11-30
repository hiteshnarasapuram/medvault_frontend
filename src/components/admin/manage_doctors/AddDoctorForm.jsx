import React, { useState, useEffect } from "react";
import { API_BASE, buildAuthHeaders, safeMessage } from "../../../utils";
import "../../../styles/AddDoctor.css";
import Swal from "sweetalert2";

function AddDoctorForm({ doctor = null, setEditingDoctor = null,refreshDoctors }) {
  const [doctorData, setDoctorData] = useState({
    name: "",
    dob: "",
    gender: "",
    phone: "",
    specialization: "",
    user: { email: "", password: "doctor@123" },
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (doctor) {
      setDoctorData({
        id: doctor.id,
        name: doctor.name,
        dob: doctor.dob,
        gender: doctor.gender,
        phone: doctor.phone,
        specialization: doctor.specialization,
        user: { email: doctor.user?.email ?? doctor.email, password: "" },
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email" || name === "password") {
      setDoctorData((prev) => ({ ...prev, user: { ...prev.user, [name]: value } }));
    } else {
      setDoctorData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetMessages = () => {
    setSubmitError("");
    setSuccessMsg("");
  };

  const submitDoctor = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const payload = {
        name: doctorData.name.trim(),
        dob: doctorData.dob,
        gender: (doctorData.gender || "").toUpperCase(),
        phone: doctorData.phone.trim(),
        specialization: doctorData.specialization.trim(),
        user: {
          email: (doctorData.user.email || "").trim(),
        },
      };

      if (!doctorData.id) {
        payload.user.password = doctorData.user.password || "doctor@123";
      } else if (doctorData.user.password) {
        payload.user.password = doctorData.user.password;
      }

      let url = `${API_BASE}/api/admin/add/doctor`;
      let method = "POST";
      if (doctorData.id) {
        url = `${API_BASE}/api/admin/update/doctor/${doctorData.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: buildAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await safeMessage(res);
        throw new Error(msg || `Failed to ${method === "POST" ? "add" : "update"} doctor`);
      }

      // setSuccessMsg(`Doctor ${method === "POST" ? "added" : "updated"} successfully.`);
      await Swal.fire({
        title: "Success",
        text: `Doctor ${method === "POST" ? "added" : "updated"} successfully.`,
        icon: "success",
        confirmButtonText: "OK",
      });

      setDoctorData({
        name: "",
        dob: "",
        gender: "",
        phone: "",
        specialization: "",
        user: { email: "", password: "doctor@123" },
      });

      if (refreshDoctors) {
        refreshDoctors();
      }
      if (setEditingDoctor) setEditingDoctor(null); 

    } catch (e) {
      // setSubmitError(e.message || "Error submitting doctor.");
      Swal.fire({
        title: "Error",
        text: e.message || "Error submitting doctor.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addDoctor">
    <form className="form" onSubmit={submitDoctor}>
      {(submitError || successMsg) && (
        <div >
          {submitError && <div >{submitError}</div>}
          {successMsg && <div >{successMsg}</div>}
        </div>
      )}

      <div className="grid-2">
        <label>
          Name
          <input type="text" name="name" value={doctorData.name} onChange={handleChange} required />
        </label>
        <label>
          DOB
          <input type="date" name="dob" value={doctorData.dob} onChange={handleChange} required />
        </label>
        <label>
          Gender
          <select name="gender" value={doctorData.gender} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label>
          Phone
          <input type="text" name="phone" value={doctorData.phone} onChange={handleChange} required />
        </label>
        <label>
          Specialization
          <input type="text" name="specialization" value={doctorData.specialization} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input type="email" name="email" value={doctorData.user.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input type="text" name="password" value={doctorData.user.password} onChange={handleChange} />
          <div className="hint">Default: doctor@123</div>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? "Saving..." : doctorData.id ? "Update Doctor" : "Add Doctor"}
        </button>
      </div>
    </form>
    </div>
  );
}

export default AddDoctorForm;
