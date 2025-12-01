import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import {API_BASE, buildAuthHeaders } from "../../utils";
import "../../styles/PatientHistory.css";

function PatientHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newHistory, setNewHistory] = useState({
    problem: "",
    date: "",
    intensity: "LOW",
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
  if (!message) return; 
  const timer = setTimeout(() => {
    setMessage("");
  }, 3000); 
  return () => clearTimeout(timer); 
}, [message]);

  // Fetch history
  useEffect(() => {
    if (!token) {
      setMessage("Not logged in!");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/patient/history`, {
      method: "GET",
      headers: buildAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch history");
        return res.json();
      })
      .then((data) => {
        // Convert string dates to yyyy-MM-dd for input fields
        const formatted = data.map((h) => ({
          ...h,
          date: h.date ? h.date : "",
          intensity: h.intensity ? h.intensity : "LOW",
        }));
        setHistory(formatted);
        setLoading(false);
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Error fetching history",
          text: err.message,
        });
        setLoading(false);
      });
  }, [ token]);

  // Add history
  const handleAddHistory = () => {
  // Validate fields before sending
  if (!newHistory.problem || !newHistory.date) {
    setMessage("Problem and date are required!");
    return;
  }

  // Prepare payload exactly as backend expects
  const payload = {
    problem: newHistory.problem,
    date: newHistory.date,          
    intensity: newHistory.intensity, 
    notes: newHistory.notes,
  };

  fetch(`${API_BASE}/api/patient/history`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) return res.text().then((t) => { throw new Error(t || "Failed to add history") });
      return res.json();
    })
    .then((created) => {
      setHistory([created, ...history]);
      setNewHistory({ problem: "", date: "", intensity: "LOW", notes: "" });
      Swal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'History added successfully'
      });
    })
    .catch((err) => Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message
    }));
};

const handleUpdateHistory = (id) => {
  const historyItem = history.find((h) => h.id === id);
  if (!historyItem.problem || !historyItem.date) {
    setMessage("Problem and date are required!");
    return;
  }

  const payload = {
    problem: historyItem.problem,
    date: historyItem.date,
    intensity: historyItem.intensity,
    notes: historyItem.notes,
  };

  fetch(`${API_BASE}/api/patient/history/${id}`, {
    method: "PUT",
    headers: buildAuthHeaders(),
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok)
        return res.text().then((t) => {
          throw new Error(t || "Failed to update history");
        });
      return res.json();
    })
    .then((updated) => {
      setHistory((prev) =>
        prev.map((h) => (h.id === id ? updated : h))
      );
      setEditingId(null); // hide Save/Cancel buttons
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'History updated successfully'
      });
    })
    .catch((err) => Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message
    }));
};

  // Delete history
  const handleDeleteHistory = (id) => {
    
    fetch(`${API_BASE}/api/patient/history/${id}`, {
      method: "DELETE",
      headers: buildAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete history");
        return res.text();
      })
      .then(() => {
        setHistory(history.filter((h) => h.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'History deleted successfully'
        });
      })
      .catch((err) => Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message
      }));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="history-container">
      <h2>Patient History</h2>
      {message && <p>{message}</p>}

      {/* Add History Form */}
      <div className="add-history">
        {/* <h3>Add New History</h3> */}
        <input
          type="text"
          placeholder="Problem"
          value={newHistory.problem}
          onChange={(e) =>
            setNewHistory({ ...newHistory, problem: e.target.value })
          }
        />
        <input
          type="date"
          value={newHistory.date}
          onChange={(e) =>
            setNewHistory({ ...newHistory, date: e.target.value })
          }
        />
        <select
          value={newHistory.intensity}
          onChange={(e) =>
            setNewHistory({ ...newHistory, intensity: e.target.value })
          }
        >
          <option value="LOW">LOW</option>
          <option value="MODERATE">MODERATE</option>
          <option value="HIGH">HIGH</option>
        </select>
        <textarea
          placeholder="Notes"
          value={newHistory.notes}
          onChange={(e) =>
            setNewHistory({ ...newHistory, notes: e.target.value })
          }
        ></textarea>
        <button onClick={handleAddHistory}>Add</button>
      </div>

      {/* History List */}
      <div className="history-list">
        <h3>Your History Records</h3>
        {history.length === 0 ? (
          <p>No history found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Problem</th>
                <th>Date</th>
                <th>Intensity</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>
                    {editingId === h.id ? (
                      <input
                        value={h.problem}
                        onChange={(e) =>
                          setHistory(
                            history.map((item) =>
                              item.id === h.id
                                ? { ...item, problem: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    ) : (
                      h.problem
                    )}
                  </td>
                  <td>
                    {editingId === h.id ? (
                      <input
                        type="date"
                        value={h.date}
                        onChange={(e) =>
                          setHistory(
                            history.map((item) =>
                              item.id === h.id
                                ? { ...item, date: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    ) : (
                      h.date
                    )}
                  </td>
                  <td>{h.intensity}</td>
                  <td>
                    {editingId === h.id ? (
                      <textarea
                        value={h.notes}
                        onChange={(e) =>
                          setHistory(
                            history.map((item) =>
                              item.id === h.id
                                ? { ...item, notes: e.target.value }
                                : item
                            )
                          )
                        }
                      />
                    ) : (
                      h.notes
                    )}
                  </td>
                  <td>
                    {editingId === h.id ? (
                      <>
                        <button onClick={() => handleUpdateHistory(h.id)}>
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingId(h.id)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteHistory(h.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PatientHistory;
