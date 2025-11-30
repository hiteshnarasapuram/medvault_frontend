import React, { useState } from "react";
import PatientHistory from "./PatientHistory";
import PatientMedicalRecords from "./PatientMedicalRecords";
import "../../styles/MedicalHistoryPage.css";
import {API_BASE, buildAuthHeaders } from "../../utils";
import Swal from "sweetalert2";

function MedicalHistoryPage() {
  const [activeTab, setActiveTab] = useState("history"); 

  return (
    <div className="medical-history-page">
      {/* <h2>Medical History</h2> */}

      <div className="tab-buttons">
        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          Patient History
        </button>
        <button
          className={activeTab === "records" ? "active" : ""}
          onClick={() => setActiveTab("records")}
        >
          Patient Reports
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "history" && <PatientHistory apiBase={apiBase} />}
        {activeTab === "records" && <PatientMedicalRecords apiBase={apiBase} />}
      </div>
    </div>
  );
}

export default MedicalHistoryPage;
