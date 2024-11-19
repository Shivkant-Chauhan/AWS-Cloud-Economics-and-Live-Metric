import React, { useState } from "react";
import Chart from 'react-apexcharts';
import { Oval } from 'react-loader-spinner';

function MetricsChart({ metrics }) {
  const [loading, setLoading] = useState(false);
  const [instanceId, setInstanceId] = useState('');
  const [show_charts, setShowCharts] = useState(false);
  const [cpu_x_axis, setCPUX] = useState([]);
  const [cpu_y_axis, setCPUY] = useState([]);
  const [mem_x_axis, setMEMX] = useState([]);
  const [mem_y_axis, setMEMY] = useState([]);
  const [nin_x_axis, setNINX] = useState([]);
  const [nin_y_axis, setNINY] = useState([]);
  const [nout_x_axis, setNOUTX] = useState([]);
  const [nout_y_axis, setNOUTY] = useState([]);

  const handleSubmit = async (e) => {
    setLoading(true);
    setShowCharts(false);
    e.preventDefault();

    if (!instanceId) {
      alert("Please enter an Instance ID.");
      return;
    }

    const baseUrl = process.env.REACT_APP_BASE_URL;
    const url = `${baseUrl}/metrics/compiled-metrics?instance_id=${instanceId}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();

      const cpu_utilization = data?.metrics?.cpu_utilization || [];
      const cpu_x_axis = cpu_utilization.map(item => item.time);
      const cpu_y_axis = cpu_utilization.map(item => parseFloat(item.value.toFixed(3)));
      setCPUX(cpu_x_axis);
      setCPUY(cpu_y_axis);

      const memory_utilization = data?.metrics?.memory_utilization || [];
      const mem_x_axis = memory_utilization.map(item => item.time);
      const mem_y_axis = memory_utilization.map(item => parseFloat(item.value.toFixed(3)));
      setMEMX(mem_x_axis);
      setMEMY(mem_y_axis);

      const network_in = data?.metrics?.network_in || [];
      const nin_x_axis = network_in.map(item => item.time);
      const nin_y_axis = network_in.map(item => parseFloat(item.value.toFixed(3)));
      setNINX(nin_x_axis);
      setNINY(nin_y_axis);

      const network_out = data?.metrics?.network_out || [];
      const nout_x_axis = network_out.map(item => item.time);
      const nout_y_axis = network_out.map(item => parseFloat(item.value.toFixed(3)));
      setNOUTX(nout_x_axis);
      setNOUTY(nout_y_axis);

      setShowCharts(true);
      setLoading(false);
    } catch (error) {
      alert("Failed to fetch metrics. Please try again.");
      setShowCharts(false);
      setLoading(false);
    }
  };

  const cpu_options = {
    chart: {
      id: 'apexchart-example',
    },
    title: {
        text: 'CPU Utilization (%)',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
    },
    xaxis: {
        categories: cpu_x_axis,
        title: {
          text: 'Time (UTC)',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
    },
    yaxis: {
        title: {
          text: 'Percent',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
    },
    stroke: {
        width: 1,
    },
  };
  const cpu_series = [
    {
      name: 'CPU Utilization',
      data: cpu_y_axis,
    },
  ];

  const mem_options = {
    chart: {
      id: 'apexchart-example',
    },
    title: {
        text: 'Memory Utilization (%)',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
    },
    xaxis: {
        categories: mem_x_axis,
        title: {
          text: 'Time (UTC)',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
    },
    yaxis: {
        title: {
          text: 'Percent',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
    },
    stroke: {
        width: 1,
    },
  };
  const mem_series = [
    {
      name: 'Memory Utilization',
      data: mem_y_axis,
    },
  ];

  const nin_options = {
    chart: {
      id: 'apexchart-example',
    },
    title: {
        text: 'Network IN (Bytes)',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
    },
    xaxis: {
        categories: nin_x_axis,
        title: {
          text: 'Time (UTC)',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
    },
    yaxis: {
        title: {
          text: 'Bytes',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
    },
    stroke: {
        width: 1,
    },
  };
  const nin_series = [
    {
      name: 'Network IN',
      data: nin_y_axis,
    },
  ];

  const nout_options = {
    chart: {
      id: 'apexchart-example',
    },
    title: {
        text: 'Network OUT (Bytes)',
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
    },
    xaxis: {
        categories: nout_x_axis,
        title: {
          text: 'Time (UTC)',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
    },
    yaxis: {
        title: {
          text: 'Bytes',
          style: {
            fontSize: '14px',
            fontWeight: 'bold',
          },
        },
    },
    stroke: {
        width: 1,
    },
  };
  const nout_series = [
    {
      name: 'Network IN',
      data: nout_y_axis,
    },
  ];

  return (
    <div className="metrics-chart">
        <h2 style={{ marginTop: '100px', fontFamily: "'Roboto', sans-serif", color: '#333' }}>Metrics for the particular Instances</h2>
        <div style={{ margin: '30px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>Enter the Instance ID:</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center'}}>
                <input
                type="text"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                placeholder="Enter Instance ID"
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
                Submit
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

        {show_charts && (
            <div>
                <p style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#555',
                    marginTop: '10px',
                    marginBottom: '20px'
                }}>
                    AWS Live Metrics for Instance: <span style={{ fontWeight: 'bold', color: '#3b5998' }}>{instanceId}</span>
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '50px', marginTop: '50px' }}>
                    <Chart options={cpu_options} series={cpu_series} type="line" width={500} height={320} />
                    <Chart options={mem_options} series={mem_series} type="line" width={500} height={320} />
                    <Chart options={nin_options} series={nin_series} type="line" width={500} height={320} />
                    <Chart options={nout_options} series={nout_series} type="line" width={500} height={320} />
                </div>
            </div>
        )}
    </div>
  );
}

export default MetricsChart;
