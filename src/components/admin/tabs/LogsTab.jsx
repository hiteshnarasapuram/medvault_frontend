import React, { useEffect, useState, useMemo } from "react";
import { API_BASE, buildAuthHeaders } from "../../../utils";
import "../../../styles/LogsTab.css";
import Swal from "sweetalert2";



const safeJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : [];
  } catch {
    return [];
  }
};

const safeMessage = async (res) => {
  try {
    const text = await res.text();
    if (!text) return "";
    const j = JSON.parse(text);
    return j?.message || j?.error || text;
  } catch {
    return "";
  }
};

function LogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/logs`, {
        headers: buildAuthHeaders(),
      });
      if (!res.ok) {
        const msg = await safeMessage(res);
        throw new Error(msg || "Failed to fetch logs.");
      }
      const logsData = await safeJson(res);
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      setError(err.message || "Error fetching logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return logs.slice(startIndex, startIndex + itemsPerPage);
  }, [logs, currentPage]);

  const totalPages = Math.ceil(logs.length / itemsPerPage);

  return (
    <div className="logs-tab">
      {error && <div className="error">{error}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Action</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="empty">
                  Loading...
                </td>
              </tr>
            ) : paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.username}</td>
                  <td>{log.email}</td>
                  <td>{log.action}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="empty">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default LogsTab;








