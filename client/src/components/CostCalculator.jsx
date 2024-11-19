import React, { useState } from "react";
import { Oval } from 'react-loader-spinner';


function CostCalculator({ onCostChange }) {
  const [loading, setLoading] = useState(false);
  const [show_calc, setShowCalc] = useState(false);
  const [costs, setCosts] = useState(false);
  const [users, setUsers] = useState();
  const [instanceCapacity, setInstanceCapacity] = useState();

  const handleSubmit = async (e) => {
    setLoading(true);
    setShowCalc(false);
    e.preventDefault();

    if (!users || !instanceCapacity) {
      alert("Please enter API calls and Instance Capacity.");
      return;
    }

    const baseUrl = process.env.REACT_APP_BASE_URL;
    const url = `${baseUrl}/costs/compiled?users=${users}&instance_capacity=${instanceCapacity}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setCosts(data);

        setShowCalc(true);
        setLoading(false);
    } catch (error) {
        alert("Failed to fetch costs. Please try again.");
        setShowCalc(false);
        setLoading(false);
    }
  };

  return (
    <div className="cost-calculator">
      <h2 style={{ marginTop: '50px', fontFamily: "'Roboto', sans-serif", color: '#333' }}>Client Cost Calculator</h2>

      <div style={{ margin: '30px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>Enter the expected API calls and Instance capacity:</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center'}}>
                <input
                type="text"
                value={users}
                onChange={(e) => setUsers(e.target.value)}
                placeholder="API Calls"
                style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    outline: 'none',
                    width: '200px',
                }}
                />
                <input
                type="text"
                value={instanceCapacity}
                onChange={(e) => setInstanceCapacity(e.target.value)}
                placeholder="Instance Capacity"
                style={{
                    padding: '8px',
                    fontSize: '14px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    outline: 'none',
                    width: '200px',
                }}
                />
                <button
                type="submit"
                style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#3b5998',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
                >
                Calculate
                </button>
            </form>
        </div>

        {loading && (
            <div className="loader-container">
            <Oval
                height={50}
                width={50}
                color="#007bff"
                ariaLabel="loading"
            />
            <p>Processing your request...</p>
            </div>
        )}

        {show_calc && (
            <div className="cloud-economics">
                <h1>Your Cloud Economics</h1>
                <div className="summary">
                    <div className="summary-item">
                        <strong>Total Instances Required:</strong>
                        <span>{costs?.instances_needed || '-'}</span>
                    </div>
                </div>
            
                <h2>AWS Services Cost Breakdown</h2>
                <div className="costs-breakdown">
                    <div className="cost-item">
                        <strong>EC2 Instances:</strong> 
                        <span>{costs?.breakdown?.EC2 || '-'}</span>
                    </div>
                    <div className="cost-item">
                        <strong>RDS Databases:</strong> 
                        <span>{costs?.breakdown?.RDS || '-'}</span>
                    </div>
                    <div className="cost-item">
                        <strong>NAT Gateway:</strong> 
                        <span>{costs?.breakdown?.['NAT Gateway'] || '-'}</span>
                    </div>
                    <div className="cost-item">
                        <strong>Load Balancer:</strong> 
                        <span>{costs?.breakdown?.['Load Balancer'] || '-'}</span>
                    </div>
                    <div className="cost-item">
                        <strong>AWS Shield:</strong> 
                        <span>{costs?.breakdown?.['AWS Shield'] || '-'}</span>
                    </div>
                    <div className="cost-item">
                        <strong>S3 Bucket:</strong> 
                        <span>{costs?.breakdown?.['S3 Bucket'] || '-'}</span>
                    </div>
                    <div className="cost-item">
                        <strong>Elastic IPs:</strong> 
                        <span>{costs?.breakdown?.['Elastic IPs'] || '-'}</span>
                    </div>
                    <div className="cost-item">
                        <strong>Auto Scaling Groups:</strong> 
                        <span>{costs?.breakdown?.['Auto Scaling Groups'] || '-'}</span>
                    </div>
                    <div className="cost-item">
                        <strong>Launch Templates:</strong> 
                        <span>{costs?.breakdown?.['Launch Templates'] || '-'}</span>
                    </div>
                </div>
            
                <h2>AWS Cloud Costing Summary</h2>
                <div className="summary">
                    <div className="summary-item">
                        <strong>AWS Cloud Costing:</strong>
                        <span>{costs?.cloud_cloud_total_cost || '-'}</span>
                    </div>
                    <div className="summary-item">
                        <strong>Client Charged:</strong>
                        <span>{costs?.client_total_cost || '-'}</span>
                    </div>
                </div>
                <div className="summary-item profit-highlight">
                    <strong>Company's Profit:</strong>
                    <span>{costs?.profit_to_company || '-'}</span>
                </div>
            </div>    
        )}
    </div>
  );
}

export default CostCalculator;
