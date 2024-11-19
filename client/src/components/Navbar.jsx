import React from "react";
import "../styles/styles.css";
import logo from "../utils/aws-logo.webp"

function Navbar() {
  return (
    <nav className="navbar">
      <img src={logo} alt="Logo" className="logo" />   
      <h1>Cloud Economics</h1>
    </nav>
  );
}

export default Navbar;
