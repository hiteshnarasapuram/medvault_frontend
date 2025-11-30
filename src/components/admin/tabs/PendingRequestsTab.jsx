import React, { useEffect, useState } from "react";
import { API_BASE, buildAuthHeaders, safeMessage } from "../../../utils";
import "../../../styles/PendingRequests.css";
import Swal from "sweetalert2";

function PendingRequestsTab() {
  const [view, setView] = useState("account");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectMessage, setRejectMessage] = useState("");

  // Certificate modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUrl, setModalUrl] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const url =
        view === "account"
          ? `${API_BASE}/api/admin/pending`
          : `${API_BASE}/api/admin/doctors/pending`;

      const res = await fetch(url, { 
        headers: buildAuthHeaders() 
      });
      if (!res.ok)
        throw new Error((await safeMessage(res)) || "Failed to fetch pending data");

      const data = await res.json();
      setPendingRequests(data);
    } catch (e) {
      // setError(e.message || "Error loading data");
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e.message || "Error loading data",
    });
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [view]);

  useEffect(() => {
    if (error || successMsg) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMsg("");
      }, 2000); 
      return () => clearTimeout(timer);
    }
  }, [error, successMsg]);


  const handleApprove = async (id) => {
    try {
      const url =
        view === "account"
          ? `${API_BASE}/api/admin/register/approve/${id}`
          : `${API_BASE}/api/admin/doctors/approve/${id}?message=Verified`;

      const res = await fetch(url, { method: "POST", headers: buildAuthHeaders() });
      if (!res.ok) throw new Error((await safeMessage(res)) || "Failed to approve");

      Swal.fire("Approved!", "Request has been approved.", "success");
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      // setError(e.message || "Error approving");
      Swal.fire("Error", e.message || "Error approving", "error");
    }
  };

  const confirmReject = async () => {
    if (!rejectMessage.trim()) {
      setError("Please enter a rejection reason.");
      return;
    }
    // const { value: reason } = await Swal.fire({
    //   title: "Reject Request",
    //   input: "textarea",
    //   inputLabel: "Reason for rejection",
    //   inputPlaceholder: "Enter rejection reason",
    //   showCancelButton: true,
    // });

    // if (!reason) return;

    try {
      const url =
        view === "account"
          ? `${API_BASE}/api/admin/register/reject/${rejectId}?message=${encodeURIComponent(rejectMessage)}`
          : `${API_BASE}/api/admin/doctors/reject/${rejectId}?message=${encodeURIComponent(rejectMessage)}`;

      const res = await fetch(url, {
        method: view === "account" ? "DELETE" : "POST",
        headers: buildAuthHeaders(),
      });
      if (!res.ok) throw new Error((await safeMessage(res)) || "Failed to reject");

      // setSuccessMsg("Rejected successfully.");
      Swal.fire("Rejected!", "Request has been rejected.", "success");
      setPendingRequests((prev) => prev.filter((r) => r.id !== rejectId));
      setRejectModalOpen(false);
      setRejectMessage("");
    } catch (e) {
      // setError(e.message || "Error rejecting");
      Swal.fire("Error", e.message || "Error rejecting", "error");
    }
  };

  const openCertificateModal = async (doctorId, type, title) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/doctors/certificate/view/${doctorId}/${type}`,
        { headers: buildAuthHeaders() }
      );
      if (!res.ok) throw new Error((await safeMessage(res)) || "Failed to fetch document");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setModalTitle(title);
      setModalUrl(url);
      setModalOpen(true);
    } catch (e) {
      // setError(e.message || "Error opening document");
    Swal.fire({
      icon: "error",
      title: "Error",
      text: e.message || "Error opening document",
    });
    }
  };

  return (
    <div className="pending-requests">
      {/* Toggle Buttons */}
      <div style={{ marginBottom: "15px" }}>
        <button
          className={`btn ${view === "account" ? "primary" : ""}`}
          style={{ transition: "none" }}
          onClick={() => setView("account")}
        >
          Approve User
        </button>

        <button
          className={`btn ${view === "doctor" ? "primary" : ""}`}
          style={{ transition: "none", marginLeft: "10px" }}
          onClick={() => setView("doctor")}
        >
          Verify Doctor Identity
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      {successMsg && <div style={{ color: "green", marginBottom: "10px" }}>{successMsg}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Phone</th>
              {view === "doctor" && (
                <>
                  <th>Specialization</th>
                  <th>Certificates</th>
                </>
              )}
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="empty">Loading...</td>
              </tr>
            ) : pendingRequests.length > 0 ? (
              pendingRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.name}</td>
                  <td>{req.dob}</td>
                  <td>{req.gender}</td>
                  <td>{req.phone}</td>
                  {view === "doctor" && (
                    <>
                      <td>{req.specialization}</td>
                      <td>
                        <span
                          style={{
                            color: "#007bff",
                            cursor: "pointer",
                            fontSize: "0.9rem"
                          }}
                          onClick={() => openCertificateModal(req.id, "doctor_certificate", "Medical License")}
                        >
                          Medical License<br/>
                        </span>{" "}
                        <span
                          style={{
                            color: "#007bff",
                            cursor: "pointer",
                            fontSize: "0.9rem"
                          }}
                          onClick={() => openCertificateModal(req.id, "government_id", "ID Proof")}
                        >
                          ID Proof
                        </span>
                      </td>
                    </>
                  )}
                  <td>{view === "account" ? req.role : "DOCTOR"}</td>
                  <td>
                    <button className="btn small" onClick={() => handleApprove(req.id)}>Approve</button>
                    <button
                      className="btn small danger"
                      onClick={() => {
                        setRejectId(req.id);
                        setRejectModalOpen(true);
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty">No pending requests</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setRejectModalOpen(false)}
        >
          <div
            style={{
              width: "400px",
              background: "#fff",
              padding: "20px",
              borderRadius: "4px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Reject Request</h3>
            <textarea
              rows="4"
              style={{ width: "100%", marginBottom: "10px" }}
              placeholder="Enter rejection reason..."
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
            />
            <div style={{ textAlign: "right" }}>
              <button
                className="btn small"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn small danger"
                style={{ marginLeft: "10px" }}
                onClick={confirmReject}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              width: "60%",
              height: "75%",
              background: "#fff",
              borderRadius: "2px",
              padding: "1px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: "absolute",
                color: "white",
                fontSize: "20px",
                top: 10,
                right: 10,
                backgroundColor: "#0c0c0cff",
                cursor: "pointer"
              }}
              onClick={() => setModalOpen(false)}
            >
              X
            </button>
            <h3 style={{ textAlign: "center" }}>{modalTitle}</h3>
            <iframe
              src={modalUrl}
              title={modalTitle}
              style={{ width: "100%", height: "90%", border: "none" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingRequestsTab;







