import React, { useEffect, useState, useMemo } from "react"; 
import { API_BASE, buildAuthHeaders, safeMessage } from "../../../utils";
import AddPatientForm from "./AddPatientForm";
import "../../../styles/AddPatient.css";
import Swal from "sweetalert2";
import { MdDeleteForever } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";

function PatientsTab() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [editingPatient, setEditingPatient] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchPatients = async () => {
    setLoading(true);
    setListError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/patients`, {
        headers: buildAuthHeaders(),
      });
      if (!res.ok) {
        const msg = await safeMessage(res);
        throw new Error(msg || `Failed to fetch patients (${res.status})`);
      }
      const json = await res.json();
      setPatients(json);
    } catch (e) {
      setListError(e.message || "Unable to load patients.");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    if (!patientSearch) return patients;
    return patients.filter(p =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.phone.includes(patientSearch) ||
      (p.user?.email ?? p.email).toLowerCase().includes(patientSearch.toLowerCase())
    );
  }, [patientSearch, patients]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPatients, currentPage]);

  const editPatient = (p) => setEditingPatient(p);

  const deletePatient = async (patientId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This patient will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/delete/patient/${patientId}`, {
        method: "DELETE",
        headers: buildAuthHeaders(),
      });
      if (!res.ok) {
        const msg = await safeMessage(res);
        throw new Error(msg || `Failed to delete patient (${res.status})`);
      }
      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Patient deleted successfully.",
        timer: 2000,
        showConfirmButton: false
      });
      await fetchPatients();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: e.message || "Error deleting patient."
      });
    } finally {
      setLoading(false);
    }
  };

  if (editingPatient) {
    return <AddPatientForm patient={editingPatient} setEditingPatient={setEditingPatient} refreshPatients={fetchPatients} />;
  }

  return (
    <div className="patient">
      {listError && <div>{listError}</div>}
      {submitError && <div>{submitError}</div>}
      {successMsg && <div>{successMsg}</div>}

      <input
        type="text"
        placeholder="Search patients..."
        value={patientSearch}
        onChange={(e) => { setPatientSearch(e.target.value); setCurrentPage(1); }}
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="empty">Loading...</td></tr>
            ) : paginatedPatients.length > 0 ? (
              paginatedPatients.map(p => (
                <tr key={p.id || `${p.name}-${p.phone}`}>
                  <td>{p.name}</td>
                  <td>{p.dob}</td>
                  <td>{p.gender}</td>
                  <td>{p.phone}</td>
                  <td>{p.user?.email ?? p.email}</td>
                  <td>
                    <button className="btn small" onClick={() => editPatient(p)}><FaUserEdit/></button>
                    <button className="btn small danger" onClick={() => deletePatient(p.id)}><MdDeleteForever/></button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" className="empty">No patients found</td></tr>
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

export default PatientsTab;



