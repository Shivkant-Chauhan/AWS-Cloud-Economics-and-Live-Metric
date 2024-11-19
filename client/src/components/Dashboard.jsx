import React, { useState, useEffect } from "react";
import CostCalculator from "./CostCalculator";
import MetricsChart from "./MetricsChart";
import { fetchData } from "../utils/api";

function Dashboard() {
  return (
    <div className="dashboard">
    <h1 style={{
        textAlign: 'left',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 'bold',
        fontSize: '32px',
        color: '#333',
        marginBottom: '20px'
    }}>
        Cloud Economics Dashboard
    </h1>

      <CostCalculator />
      <MetricsChart />
    </div>
  );
}

export default Dashboard;
