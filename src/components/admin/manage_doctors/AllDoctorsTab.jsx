import React, { useState, useEffect, useMemo } from "react";
import AddDoctorForm from "./AddDoctorForm";
import { API_BASE, buildAuthHeaders, safeMessage } from "../../../utils";
import "../../../styles/AddDoctor.css";
import Swal from "sweetalert2";
import { MdDeleteForever } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";

function DoctorsTab() {
  const [doctors, setDoctors] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchDoctors = async () => {
    setLoading(true);
    setListError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/doctors`, {
        headers: buildAuthHeaders(),
      });
      if (!res.ok) {
        const msg = await safeMessage(res);
        throw new Error(msg || `Failed to fetch doctors (${res.status})`);
      }
      const json = await res.json();
      setDoctors(json);
    } catch (e) {
      setListError(e.message || "Unable to load doctors.");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    const q = doctorSearch.toLowerCase();
    return doctors.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.user?.email ?? d.email).toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      d.specialization.toLowerCase().includes(q)
    );
  }, [doctors, doctorSearch]);

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDoctors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDoctors, currentPage]);

  const editDoctor = (d) => setEditingDoctor(d);

  const deleteDoctor = async (doctorId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This doctor will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setSubmitError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/admin/delete/doctor/${doctorId}`, {
        method: "DELETE",
        headers: buildAuthHeaders(),
      });
      if (!res.ok) {
        const msg = await safeMessage(res);
        throw new Error(msg || `Failed to delete doctor (${res.status})`);
      }

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Doctor deleted successfully.",
        timer: 2000,
        showConfirmButton: false
      });

      fetchDoctors();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: e.message || "Error deleting doctor."
      });
      setSubmitError(e.message || "Error deleting doctor.");
    } finally {
      setLoading(false);
    }
  };

  if (editingDoctor) {
    return <AddDoctorForm doctor={editingDoctor} setEditingDoctor={setEditingDoctor} refreshDoctors={fetchDoctors} />;
  }

  return (
    <div className="doctors">
      {(listError || submitError || successMsg) && (
        <div>
          {listError && <div>{listError}</div>}
          {submitError && <div>{submitError}</div>}
          {successMsg && <div>{successMsg}</div>}
        </div>
      )}

      <input
        type="text"
        placeholder="Search doctors..."
        value={doctorSearch}
        onChange={(e) => { setDoctorSearch(e.target.value); setCurrentPage(1); }}
        className="search-input"
      />

      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="empty">Loading...</td></tr>
            ) : paginatedDoctors.length > 0 ? (
              paginatedDoctors.map((d) => (
                <tr key={d.id || `${d.name}-${d.phone}`}>
                  <td>{d.name}</td>
                  <td>{d.dob}</td>
                  <td>{d.gender}</td>
                  <td>{d.phone}</td>
                  <td>{d.user?.email ?? d.email}</td>
                  <td>{d.specialization}</td>
                  <td>
                    <button className="btn small" onClick={() => editDoctor(d)}><FaUserEdit/></button>
                    <button className="btn small danger" onClick={() => deleteDoctor(d.id)}><MdDeleteForever/></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="empty">No doctors found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            Previous
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default DoctorsTab;


