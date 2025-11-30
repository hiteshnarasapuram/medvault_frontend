import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Landing from "./components/LandingPage";
import Login from "./components/Login";
import PatientDashboard from "./components/patient/PatientDashboard";
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import ForgotPassword from "./components/ForgotPassword"; 
import Register from "./components/Register";

function App() {
  return (
    <div >
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> 
        <Route path="/register" element={<Register />} />
        <Route path="/patient/*" element={<PatientDashboard />} />
        <Route path="/doctor/*" element={<DoctorDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
