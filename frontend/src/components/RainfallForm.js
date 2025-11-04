import React, { useState } from "react";
import "./RainfallForm.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

const RainfallForm = () => {
  const [numReadings, setNumReadings] = useState("");
  const [readings, setReadings] = useState([]);
  const [results, setResults] = useState([]);
  const [highest, setHighest] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [error, setError] = useState("");

  const handleNumChange = (e) => {
    const n = parseInt(e.target.value, 10);
    setNumReadings(e.target.value);
    if (!isNaN(n) && n > 0) {
      const temp = Array.from({ length: n }, () => ({ air: "", dew: "" }));
      setReadings(temp);
    } else {
      setReadings([]);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...readings];
    updated[index][field] = value;
    setReadings(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (readings.some((r) => !r.air || !r.dew)) {
      setError("Please fill in all temperature values.");
      return;
    }

    for (let r of readings) {
      const air = parseFloat(r.air);
      const dew = parseFloat(r.dew);
      if (air < 23 || air > 28) {
        setError("Air temperature must be between 23°C and 28°C.");
        return;
      }
      if (dew < 7 || dew > 16) {
        setError("Dew point must be between 7°C and 16°C.");
        return;
      }
    }

    setError("");

    try {
      const response = await fetch("https://rainfall-backend-kh6f.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readings }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      setResults(data.sorted_results);
      setHighest(data.highest);
      setPrediction(data.prediction);
    } catch (err) {
      console.error(err);
      setError("Error connecting to the backend. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">🌦️ Rainfall Prediction Dashboard</h1>

      <form onSubmit={handleSubmit}>
        <div className="input-section">
          <label>Enter Number of Readings (N):</label>
          <input
            type="number"
            min="1"
            value={numReadings}
            onChange={handleNumChange}
            placeholder="e.g., 3"
          />
        </div>

        {readings.map((reading, index) => (
          <div key={index} className="reading-row">
            <h3>Reading {index + 1}</h3>
            <input
              type="number"
              placeholder="Air Temp (°C)"
              value={reading.air}
              onChange={(e) => handleInputChange(index, "air", e.target.value)}
            />
            <input
              type="number"
              placeholder="Dew Point (°C)"
              value={reading.dew}
              onChange={(e) => handleInputChange(index, "dew", e.target.value)}
            />
          </div>
        ))}

        {error && <p className="error">{error}</p>}

        {readings.length > 0 && (
          <button type="submit" className="submit-btn">
            Predict Rainfall
          </button>
        )}
      </form>

      {results.length > 0 && (
        <div className="result-section">
          <h2>{prediction}</h2>
          <h3>Sorted Relative Humidity Readings</h3>
          <table>
            <thead>
              <tr>
                <th>Reading</th>
                <th>Air Temp (°C)</th>
                <th>Dew Point (°C)</th>
                <th>Relative Humidity (%)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, index) => (
                <tr
                  key={index}
                  className={
                    highest &&
                    r.relative_humidity === highest.relative_humidity
                      ? "highlight"
                      : ""
                  }
                >
                  <td>{index + 1}</td>
                  <td>{r.air_temp}</td>
                  <td>{r.dew_point}</td>
                  <td>{r.relative_humidity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Chart Section */}
          <div className="chart-container">
            <h3 className="chart-title">Relative Humidity Chart</h3>
            <ResponsiveContainer width="95%" height={350}>
              <LineChart
                data={results.map((r, i) => ({
                  ...r,
                  reading: i + 1,
                }))}
                margin={{ top: 40, right: 40, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="reading">
                  <Label
                    value="Reading"
                    offset={-20}
                    position="insideBottom"
                    style={{
                      textAnchor: "middle",
                      fontSize: 14,
                      fill: "#333",
                    }}
                  />
                </XAxis>
                <YAxis>
                  <Label
                    value="Humidity (%)"
                    angle={-90}
                    position="insideLeft"
                    style={{
                      textAnchor: "middle",
                      fontSize: 14,
                      fill: "#333",
                    }}
                  />
                </YAxis>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                  }}
                />
                <Line
                  data={{
                    labels: sortedResults.map((_, i) => `Reading ${i + 1}`),
                    datasets: [
                      {
                        label: "Relative Humidity (%)",
                        data: sortedResults.map(r => r.relative_humidity),
                        borderColor: "rgba(0, 123, 255, 1)",
                        backgroundColor: "rgba(0, 123, 255, 0.2)", // transparent points
                        tension: 0.4,
                        pointBackgroundColor: "rgba(0, 123, 255, 1)",
                        fill: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        labels: { color: "#000", font: { size: 14 } },
                      },
                      title: {
                        display: true,
                        text: "Relative Humidity Chart",
                        color: "#007bff",
                        font: { size: 18, weight: "bold" },
                        align: "center",
                      },
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: "Reading",
                          color: "#000",
                          font: { size: 14, weight: "bold" },
                        },
                        grid: { display: false },
                      },
                      y: {
                        title: {
                          display: true,
                          text: "Humidity (%)",
                          color: "#000",
                          font: { size: 14, weight: "bold" },
                        },
                        grid: { color: "rgba(0,0,0,0.1)" },
                      },
                    },
                    backgroundColor: "transparent", // <-- ensures chart area transparent
                  }}
                  style={{
                    height: "300px",
                    background: "transparent", // <-- ensures transparent card area too
                  }}
                />

              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default RainfallForm;
