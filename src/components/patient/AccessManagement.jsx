import React, { useEffect, useState } from "react";
import "../../styles/AccessManagement.css";
import { API_BASE,buildAuthHeaders} from "../../utils";

function AccessManagement() {
  //const token = localStorage.getItem("token");
  const [recordRequests, setRecordRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("records"); // "records" or "history"

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const recordRes = await fetch(`${API_BASE}/api/patient/records/pending-access`, {
        headers: buildAuthHeaders(),
      });
      const records = recordRes.ok ? await recordRes.json() : [];

      const historyRes = await fetch(`${API_BASE}/api/patient/history/requests`, {
        headers: buildAuthHeaders(),
      });
      const histories = historyRes.ok ? await historyRes.json() : [];

      setRecordRequests(records);
      setHistoryRequests(histories);
    } catch (err) {
      setMessage("Failed to fetch access requests.");
    } finally {
      setLoading(false);
    }
  };

  const approveRecord = async (accessId) => {
    try {
      const res = await fetch(`${API_BASE}/api/patient/records/access/${accessId}/approve`, {
        method: "POST",
        headers: buildAuthHeaders(),
      });
      if (res.ok) {
        setMessage("Record access approved.");
        fetchRequests();
      }
    } catch {
      setMessage("Error approving record access.");
    }
  };

  const rejectRecord = async (accessId) => {
    try {
      const res = await fetch(`${API_BASE}/api/patient/records/access/${accessId}/reject`, {
        method: "POST",
        headers: buildAuthHeaders(),
      });
      if (res.ok) {
        setMessage("Record access rejected.");
        fetchRequests();
      }
    } catch {
      setMessage("Error rejecting record access.");
    }
  };


  const approveHistory = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE}/api/patient/history/requests/${requestId}/approve`, {
        method: "POST",
        headers: buildAuthHeaders(),
      });
      if (res.ok) {
        setMessage("History access approved.");
        fetchRequests();
      }
    } catch {
      setMessage("Error approving history access.");
    }
  };

  const rejectHistory = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE}/api/patient/history/requests/${requestId}/reject`, {
        method: "POST",
        headers: buildAuthHeaders(),
      });
      if (res.ok) {
        setMessage("History access rejected.");
        fetchRequests();
      }
    } catch {
      setMessage("Error rejecting history access.");
    }
  };

  useEffect(() => {
  if (message) {
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }
}, [message]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="access-container">
      <h2>Access Requests</h2>
      {message && <p className="message">{message}</p>}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "records" ? "active" : ""}
          onClick={() => setActiveTab("records")}
        >
          Record Requests
        </button>
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          History Requests
        </button>
      </div>

      {/* Tables */}
      {activeTab === "records" ? (
        recordRequests.length === 0 ? (
          <p>No pending record requests.</p>
        ) : (
          <table className="access-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Record Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recordRequests.map((req) => (
                <tr key={req.accessId}>
                  <td>{req.doctorName}</td>
                  <td>{req.recordName}</td>
                  <td>
                    <button className="action-btn approve" onClick={() => approveRecord(req.accessId)}>Approve</button>
                    <button className="action-btn reject" onClick={() => rejectRecord(req.accessId)}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : (
        historyRequests.length === 0 ? (
          <p>No pending history requests.</p>
        ) : (
          <table className="access-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyRequests.map((req) => (
                <tr key={req.requestId}>
                  <td>{req.doctorName}</td>
                  <td>
                    <button className="action-btn approve" onClick={() => approveHistory(req.requestId)}>Approve</button>
                    <button className="action-btn reject" onClick={() => rejectHistory(req.requestId)}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>

  );
}

export default AccessManagement;


