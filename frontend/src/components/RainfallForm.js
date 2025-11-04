// RainfallForm.js
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
} from "recharts";
import "./RainfallForm.css";

const RainfallForm = () => {
  const [numReadings, setNumReadings] = useState(0);
  const [inputs, setInputs] = useState([]);
  const [results, setResults] = useState([]);
  const [sortedResults, setSortedResults] = useState([]);
  const [prediction, setPrediction] = useState("");
  const [error, setError] = useState("");

  // Handle number of readings
  const handleNumChange = (e) => {
    const n = parseInt(e.target.value, 10);
    if (isNaN(n) || n < 1 || n > 10) {
      setError("Please enter a number between 1 and 10.");
      return;
    }
    setError("");
    setNumReadings(n);
    setInputs(Array(n).fill({ airTemp: "", dewPoint: "" }));
  };

  // Handle input change
  const handleInputChange = (index, field, value) => {
    const updated = [...inputs];
    updated[index] = { ...updated[index], [field]: value };
    setInputs(updated);
  };

  // Predict rainfall
  const handlePredict = () => {
    let valid = true;
    let humidityData = [];

    for (let i = 0; i < inputs.length; i++) {
      const { airTemp, dewPoint } = inputs[i];
      const T = parseFloat(airTemp);
      const Td = parseFloat(dewPoint);

      if (
        isNaN(T) ||
        isNaN(Td) ||
        T < 23 ||
        T > 28 ||
        Td < 7 ||
        Td > 16
      ) {
        setError(
          `Invalid input at Reading ${i + 1}. Air Temp must be 23–28°C and Dew Point 7–16°C.`
        );
        valid = false;
        break;
      }

      const rh = 100 * Math.pow(Math.E, (17.625 * Td) / (243.04 + Td) - (17.625 * T) / (243.04 + T));
      humidityData.push({ reading: i + 1, airTemp: T, dewPoint: Td, humidity: rh });
    }

    if (!valid) return;
    setError("");

    // Prediction logic
    const avgHumidity = humidityData.reduce((a, b) => a + b.humidity, 0) / humidityData.length;
    setPrediction(avgHumidity > 70 ? "High chance of rainfall ☔" : "Low chance of rainfall 🌤️");

    // Sort humidity values
    const sorted = [...humidityData].sort((a, b) => a.humidity - b.humidity);
    setResults(humidityData);
    setSortedResults(sorted);
  };

  const highestHumidity = results.length ? Math.max(...results.map((r) => r.humidity)) : null;

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #ffecd2, #fcb69f)",
        paddingTop: "40px",
        margin: "0",
      }}
    >
      <h2 style={{ textAlign: "center", fontWeight: "bold" }}>🌦️ Rainfall Prediction</h2>

      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <label>Enter number of readings (1–10): </label>
        <input
          type="number"
          min="1"
          max="10"
          value={numReadings || ""}
          onChange={handleNumChange}
          style={{ width: "50px", textAlign: "center", marginLeft: "5px" }}
        />
      </div>

      {error && (
        <div
          style={{
            textAlign: "center",
            color: "#721c24",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            padding: "10px",
            borderRadius: "8px",
            margin: "10px auto",
            width: "fit-content",
            fontWeight: "bold",
          }}
        >
          {error}
        </div>
      )}

      {inputs.map((_, i) => (
        <div key={i} style={{ textAlign: "center", marginBottom: "10px" }}>
          <h4>Reading {i + 1}</h4>
          <input
            type="number"
            placeholder="Air Temp (°C)"
            value={inputs[i].airTemp}
            onChange={(e) => handleInputChange(i, "airTemp", e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <input
            type="number"
            placeholder="Dew Point (°C)"
            value={inputs[i].dewPoint}
            onChange={(e) => handleInputChange(i, "dewPoint", e.target.value)}
          />
        </div>
      ))}

      {numReadings > 0 && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={handlePredict}
            style={{
              padding: "6px 14px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Predict
          </button>
        </div>
      )}

      {results.length > 0 && (
        <>
          <h3 style={{ textAlign: "center", marginTop: "30px" }}>📊 Results</h3>
          <p style={{ textAlign: "center", fontWeight: "bold" }}>Prediction: {prediction}</p>

          {/* Data Table */}
          <table
            style={{
              width: "70%",
              margin: "20px auto",
              borderCollapse: "collapse",
              backgroundColor: "rgba(255,255,255,0.6)",
            }}
          >
            <thead style={{ backgroundColor: "#b6f3c1" }}>
              <tr>
                <th>Reading</th>
                <th>Air Temp (°C)</th>
                <th>Dew Point (°C)</th>
                <th>Relative Humidity (%)</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor:
                      r.humidity === highestHumidity ? "rgba(255,255,153,0.8)" : "transparent",
                  }}
                >
                  <td>{r.reading}</td>
                  <td>{r.airTemp}</td>
                  <td>{r.dewPoint}</td>
                  <td>{r.humidity.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Humidity Chart */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                width: "70%",
                backgroundColor: "rgba(255,255,255,0.4)",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 0 15px rgba(0,0,0,0.1)",
              }}
            >
              <h4 style={{ textAlign: "center", marginBottom: "10px" }}>
                🌦️ Relative Humidity Chart
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={results}
                  margin={{ top: 20, right: 40, bottom: 40, left: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="reading">
                    <Label
                      value="Reading"
                      offset={-10}
                      position="insideBottom"
                      style={{ textAnchor: "middle", fontWeight: "bold" }}
                    />
                  </XAxis>
                  <YAxis domain={[0, 120]}>
                    <Label
                      value="Humidity (%)"
                      angle={-90}
                      position="insideLeft"
                      style={{ textAnchor: "middle", fontWeight: "bold" }}
                    />
                  </YAxis>
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#007bff"
                    strokeWidth={2.5}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sorted Results */}
          <div
            style={{
              width: "fit-content",
              margin: "30px auto",
              backgroundColor: "rgba(255,255,255,0.8)",
              borderRadius: "15px",
              padding: "15px 25px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <h4>📈 Sorted Relative Humidity (Ascending)</h4>
            {sortedResults.map((r, i) => (
              <p key={i}>
                RH: {r.humidity.toFixed(2)}% | Air Temp: {r.airTemp}°C | Dew Point: {r.dewPoint}°C
              </p>
            ))}
          </div>

          <p style={{ textAlign: "center", marginBottom: "30px" }}>
            💡 Tip: {prediction.includes("High") ? "High humidity – keep an umbrella handy!" : "Low humidity – enjoy your day!"}
          </p>
        </>
      )}
    </div>
  );
};

export default RainfallForm;
