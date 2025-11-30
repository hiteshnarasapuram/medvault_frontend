import React from "react";
import { useLocation } from "react-router-dom";
import "../styles/Header.css";

function Header() {
  const location = useLocation();

  // Decide title based on route
  let pageTitle = "";
  if (location.pathname.startsWith("/admin")) pageTitle = "Admin Dashboard";
  else if (location.pathname.startsWith("/doctor")) pageTitle = "Doctor Dashboard";
  else if (location.pathname.startsWith("/patient")) pageTitle = "Patient Dashboard";

  return (
    <header className="header">
      <h1 className="logo">
        MedVault {pageTitle && `| ${pageTitle}`}
      </h1>
    </header>
  );
}

export default Header;
