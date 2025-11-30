import React, { useEffect, useState } from "react";
import '../../styles/DoctorPatients.css';
import Swal from "sweetalert2";
import { MdHistory } from "react-icons/md";
import { MdClose } from "react-icons/md";
import { FaNotesMedical } from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import { GiHealthPotion } from "react-icons/gi";
import { API_BASE, buildAuthHeaders} from "../../utils";

function DoctorPatients() {
  //const token = localStorage.getItem("token");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [recordsMap, setRecordsMap] = useState({});
  const [historiesMap, setHistoriesMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 6;

  useEffect(() => {
    fetchConfirmedPatients();
  }, []);

  const fetchConfirmedPatients = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/doctor/appointments?status=CONFIRMED`, {
        method: "GET",
        headers: buildAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch confirmed appointments");

      const data = await res.json();
      const uniquePatients = [];
      const map = new Map();

      data.forEach((appt) => {
        const id = appt.patientId || appt.patient?.id;
        const name = appt.patientName || appt.patient?.name;
        if (!id) return;
        if (!map.has(id)) {
          map.set(id, true);
          uniquePatients.push({ id, name });
        }
      });

      setPatients(uniquePatients);

      for (let patient of uniquePatients) {
        await fetchApprovedRecords(patient.id);
      }

      setLoading(false);
    } catch (err) {
      setMessage("Error: " + err.message);
      setLoading(false);
    }
  };

  const fetchApprovedRecords = async (patientId) => {
    if (!patientId) return;
    try {
      const res = await fetch(`${API_BASE}/api/doctor/patients/${patientId}/medical-records`, {
        method: "GET",
        headers: buildAuthHeaders(),
      });
      if (!res.ok) {
        setRecordsMap((prev) => ({ ...prev, [patientId]: [] }));
        return;
      }
      const data = await res.json();
      setRecordsMap((prev) => ({ ...prev, [patientId]: data }));
    } catch (err) {
      console.error("Error fetching records for patient", patientId, err);
      setRecordsMap((prev) => ({ ...prev, [patientId]: [] }));
    }
  };

const fetchHistories = async (patientId) => {
  try {
    const res = await fetch(`${API_BASE}/api/doctor/patients/${patientId}/histories`, {
      headers: buildAuthHeaders(),
    });

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "You don’t have permission to view this patient’s history.",
      });
      return;
    }

    const data = await res.json();
    setHistoriesMap((prev) => ({ ...prev, [patientId]: data }));

    setModalTitle("🩺 Patient Medical History");
    setModalContent(
      <div
      className="hide-scroll"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          padding: "10px",
          backgroundColor: "#f9fafc",
          maxHeight: "70vh",
          overflowY: "auto", 
        }}
      >
        {data.map((h, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            {/* <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FaNotesMedical style={{ color: "#0077b6" }} />
              <h3 style={{ margin: 0, color: "#1e293b", fontSize: "16px", whiteSpace: "pre-line"}}>{h.problem}</h3>
            </div> */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                overflow: "hidden",         
                whiteSpace: "nowrap",       
                textOverflow: "ellipsis",   
              }}
            >
              <FaNotesMedical style={{ color: "#0077b6", flexShrink: 0 }} />
              <h3
                style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: "16px",
                  whiteSpace: "pre-line",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {h.problem}
              </h3>
            </div>


            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#475569",
                fontSize: "14px",
                overflow: "hidden",  
                whiteSpace: "nowrap", 
                textOverflow: "ellipsis"
              }}
            >
              <GiHealthPotion style={{ color: "#10b981" }} />
              <span>
                <strong>Intensity: </strong>
                <span
                  style={{
                    backgroundColor:
                      h.intensity === "High"
                        ? "#ef4444"
                        : h.intensity === "Medium"
                        ? "#f59e0b"
                        : "#22c55e",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                >
                  {h.intensity}
                </span>
              </span>
            </div>

            <p
              style={{
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
                padding: "8px",
                fontSize: "13px",
                color: "#334155",
                minHeight: "50px",
              }}
            >
              {h.notes || "No additional notes"}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                color: "#475569",
              }}
            >
              <MdDateRange style={{ color: "#3b82f6" }} />
              <span>{new Date(h.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    );

    setModalOpen(true);
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error fetching history: " + err.message,
    });
  }
};



  const requestAccess = async (patientId) => {
    if (!patientId) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/doctor/patients/${patientId}/medical-records/request?accessDays=7`,
        {
          method: "POST",
          headers: buildAuthHeaders(),
        }
      );
      if (!res.ok) {
        const data = await res.json()
        Swal.fire({
          icon: "error",
          title: "Request Failed",
          text: data.message || "Failed to request access",
        });
        return;
      }
      const data = await res.json();
      Swal.fire({
        icon: "success",
        title: "Access Granted",
        text: data.message,
      });
      await fetchApprovedRecords(patientId);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error: " + err.message,
      });
    }
  };

  const openPdfModal = async (record) => {
  try {
    const res = await fetch(`${API_BASE}/api/doctor/medical-records/${record.recordId}/view`, {
      headers: buildAuthHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch record");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // Hide default toolbar (print/download)
    const viewerUrl = `${url}#toolbar=0&navpanes=0&scrollbar=0`;

    setModalTitle(record.name);
    setModalContent(
      <div
        style={{
          width: "100%",
          height: "95%",
          backgroundColor: "#f8fafc",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <iframe
          src={viewerUrl}
          title={record.name}
          width="100%"
          height="99%"
          style={{
            border: "none",
            pointerEvents: "auto",
          }}
        ></iframe>
      </div>
    );

    setModalOpen(true);
  } catch (err) {
    console.error("Error opening record:", err);
    Swal.fire({
      title: "Error",
      text: "Unable to open record",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};


const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const displayedPatients = filteredPatients.slice(
    (currentPage - 1) * patientsPerPage,
    currentPage * patientsPerPage
  );


  if (loading) return <p>Loading patients...</p>;
  if (message) return <p>{message}</p>;

  return (
    <div className="doctor-patients-container">
      <h2>Patients with Confirmed Appointments</h2>

      <input
        type="text"
        placeholder="🔍 Search patient by name..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="search-bar"
      />

      {patients.length === 0 && <p>No confirmed appointments.</p>}
      <ul>
        {displayedPatients.map((patient) => {
          const approvedRecords = recordsMap[patient.id] || [];
          const hasAccess = approvedRecords.length > 0

          return (
            <li key={patient.id} style={{ marginBottom: "1rem" }}>
              <strong>{patient.name}</strong>{" "}
              {/* {!hasAccess && ( */}
                <button onClick={() => requestAccess(patient.id)}>Send Request</button>
              {/* )} */}
              {hasAccess && (
                <ul style={{ marginTop: "0.5rem" }}>
                  {approvedRecords.map((rec) => (
                    <li key={rec.recordId}>
                      {rec.name} {""}
                      {rec.expiry ? <>  Expires at: {new Date(rec.expiry).toLocaleString()}</> : null}
                      {"   "}
                      <button onClick={() => openPdfModal(rec)}>View PDF</button>
                    </li>
                  ))}
                  <li>
                    <button onClick={() => fetchHistories(patient.id)}>View History</button>
                  </li>
                </ul>
              )}
              {!hasAccess && (
                <button onClick={() => fetchHistories(patient.id)} style={{ marginLeft: "0.5rem" }}>
                  View History
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* {!searchTerm && totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            ⬅ Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next ➡
          </button>
        </div>
      )} */}

      {!searchTerm && totalPages > 1 && (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
      marginTop: "20px",
      padding: "12px",
    }}
  >
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((p) => p - 1)}
      style={{
        background: "#e2e8f0",
        color: "#1e293b",
        padding: "8px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: currentPage === 1 ? "not-allowed" : "pointer",
        fontWeight: 500,
        opacity: currentPage === 1 ? 0.6 : 1,
        transition: "background 0.3s ease, transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (currentPage !== 1) e.target.style.background = "#cbd5e1";
      }}
      onMouseLeave={(e) => {
        if (currentPage !== 1) e.target.style.background = "#e2e8f0";
      }}
    >
      ⬅ Prev
    </button>

    <span style={{ color: "#334155", fontSize: "14px", fontWeight: 500 }}>
      Page {currentPage} of {totalPages}
    </span>

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((p) => p + 1)}
      style={{
        background: "#e2e8f0",
        color: "#1e293b",
        padding: "8px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        fontWeight: 500,
        opacity: currentPage === totalPages ? 0.6 : 1,
        transition: "background 0.3s ease, transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        if (currentPage !== totalPages) e.target.style.background = "#cbd5e1";
      }}
      onMouseLeave={(e) => {
        if (currentPage !== totalPages) e.target.style.background = "#e2e8f0";
      }}
    >
      Next ➡
    </button>
  </div>
)}


      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              style={{
                alignSelf: "flex-end",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: "#333",
                position: "absolute",
                top: "10px",
                right: "10px",
                padding: "5px",
                transition: "color 0.2s ease"
              }}
              onMouseEnter={(e) => (e.target.style.color = "#ff4d4d")}
              onMouseLeave={(e) => (e.target.style.color = "#333")}
            >
              <MdClose />
            </button>

            <h3>{modalTitle}</h3>
            <div style={{ flex: 1, overflow: "auto" }}>{modalContent}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorPatients;

