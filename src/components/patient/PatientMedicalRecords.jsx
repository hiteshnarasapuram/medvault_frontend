import React, { useEffect, useState, useRef} from "react";
import Swal from "sweetalert2";
import {API_BASE, buildAuthHeaders } from "../../utils";
import "../../styles/PatientMedicalRecords.css";

function PatientMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUrl, setModalUrl] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const fileInputRef = useRef(null);



  const fetchRecords = () => {
    fetch(`${API_BASE}/api/patient/records`, {
      headers: buildAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => setRecords(data))
      .catch((err) => console.error("Error fetching records:", err));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUpload = () => {
    if (!file || !name) {
      // alert("Please provide a file and name");
      Swal.fire({
        title: "Missing Information",
        text: "Please provide a file and name",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    setLoading(true);
    fetch(`${API_BASE}/api/patient/records`, {
      method: "POST",
      headers: buildAuthHeaders(),
      body: formData,
    })
      .then((res) => res.text())
      .then(() => {
        setFile(null);
        setName("");
        if (fileInputRef.current) fileInputRef.current.value = null;
        fetchRecords();
      })
      .catch((err) => {
        Swal.fire({
          title: "Upload Failed",
          text: "Error uploading file: " + err.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      })
      // .catch((err) => console.error("Error uploading:", err))
      .finally(() => setLoading(false));
  };

  const handleDelete = (recordId) => {
    // if (!window.confirm("Are you sure you want to delete this record?")) return;
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to delete this record?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${API_BASE}/api/patient/records/${recordId}`, {
          method: "DELETE",
          headers: buildAuthHeaders(),
        })
        .then((res) => res.text())
        .then(() => {
        fetchRecords();
          Swal.fire({
            title: 'Deleted!',
            text: 'Record has been deleted.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        })
        .catch((err) => {
          Swal.fire({
          title: "Error",
          text: "Error deleting record: " + err.message,
          icon: "error",
          confirmButtonText: "OK",
        });
        });
      }
    });
      // .catch((err) => console.error("Error deleting record:", err));
  };

  const openRecordModal = async (record) => {
    try {
      const res = await fetch(`${API_BASE}/api/patient/records/${record.id}/view`, {
        headers: buildAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch record");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setModalTitle(record.name);
      setModalUrl(url);
      setModalOpen(true);
    } catch (err) {
      console.error("Error opening record:", err);
     Swal.fire({
      title: 'Error',
      text: 'Unable to open record',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    }
  };

  return (
   <div className="records-container">
  <h2>Medical Records</h2>

  <div className="upload-section">
    <input
      type="text"
      placeholder="Record Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />
    <input
      type="file"
      accept="application/pdf"
      onChange={(e) => setFile(e.target.files[0])}
      ref={fileInputRef}
    />
    <button onClick={handleUpload} disabled={loading}>
      {loading ? "Uploading..." : "Upload"}
    </button>
  </div>

  <ul className="records-list">
    {records.map((record) => (
      <li key={record.id}>
        <span>{record.name}</span>
        <div>
          <button onClick={() => openRecordModal(record)}>View</button>{"   "}
          <button className="delete-btn"  onClick={() => handleDelete(record.id)}>Delete</button>
        </div>
      </li>
    ))}
  </ul>

  {modalOpen && (
    <div className="modal-overlay" onClick={() => setModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={() => setModalOpen(false)}>X</button>
        <h3>{modalTitle}</h3>
        {/* <iframe src={modalUrl} title={modalTitle} /> */}
        <iframe 
          src={`${modalUrl}#zoom=150&toolbar=0&navpanes=0&scrollbar=0`} 
          title={modalTitle}
        />
      </div>
    </div>
  )}
</div>

  );
}

export default PatientMedicalRecords;
