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
  const [sortedResults, setSortedResults] = useState([]);
  const [highest, setHighest] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // handle number of readings
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

  // handle input field updates
  const handleInputChange = (index, field, value) => {
    const updated = [...readings];
    updated[index][field] = value;
    setReadings(updated);
  };

  // submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (readings.some((r) => !r.air || !r.dew)) {
      setError("Please fill in all temperature values.");
      return;
    }

    // validation
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
    setLoading(true);

    try {
      const response = await fetch(
        "https://rainfall-backend-kh6f.onrender.com/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readings }),
        }
      );

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      setSortedResults(data.sorted_results || []);
      setHighest(data.highest || null);
      setPrediction(data.prediction || "");
    } catch (err) {
      console.error("Error:", err);
      setError("Error connecting to backend. Please try again.");
    } finally {
      setLoading(false);
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
              onChange={(e) =>
                handleInputChange(index, "air", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Dew Point (°C)"
              value={reading.dew}
              onChange={(e) =>
                handleInputChange(index, "dew", e.target.value)
              }
            />
          </div>
        ))}

        {error && <p className="error">{error}</p>}

        {readings.length > 0 && (
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Predicting..." : "Predict Rainfall"}
          </button>
        )}
      </form>

      {sortedResults.length > 0 && (
        <div className="result-section">
          <h2
            style={{
              textAlign: "center",
              color: prediction.includes("High") ? "blue" : "orange",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            {prediction}
          </h2>

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
              {sortedResults.map((r, index) => (
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
                  <td>{r.relative_humidity.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Transparent Chart Section */}
          <div
            className="chart-container"
            style={{
              background: "transparent",
              marginTop: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ResponsiveContainer width="90%" height={300}>
              <LineChart
                data={sortedResults.map((r, i) => ({
                  reading: i + 1,
                  relative_humidity: r.relative_humidity,
                }))}
                style={{ background: "transparent" }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.15)" />
                <XAxis dataKey="reading">
                  <Label
                    value="Reading"
                    offset={-5}
                    position="insideBottom"
                    style={{
                      textAnchor: "middle",
                      fontWeight: "bold",
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
                      fontWeight: "bold",
                      fill: "#333",
                    }}
                  />
                </YAxis>
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="relative_humidity"
                  stroke="#007bff"
                  strokeWidth={2}
                  dot={{ r: 4 }}
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
