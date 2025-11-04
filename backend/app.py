from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import os

app = Flask(__name__)
CORS(app)

def calculate_relative_humidity(air_temp, dew_point):
    specific_humidity = 6.11 * (10 ** ((7.5 * dew_point) / (237.3 + dew_point)))
    saturation_point = 6.11 * (10 ** ((7.5 * air_temp) / (237.3 + air_temp)))
    relative_humidity = (specific_humidity / saturation_point) * 100
    return relative_humidity

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    readings = data.get("readings", [])

    if not readings:
        return jsonify({"error": "No readings provided"}), 400

    results = []
    for r in readings:
        air_temp = float(r.get("air"))
        dew_point = float(r.get("dew"))
        rh = calculate_relative_humidity(air_temp, dew_point)
        results.append({
            "air_temp": air_temp,
            "dew_point": dew_point,
            "relative_humidity": round(rh, 2)
        })

    # Sort readings by relative humidity (increasing order)
    sorted_results = sorted(results, key=lambda x: x["relative_humidity"])
    highest = max(results, key=lambda x: x["relative_humidity"])

    # ✅ Prediction Logic — Based exactly on the problem statement:
    # High rainfall chance IF humidity is high AND temperature is dropping
    is_temp_dropping = readings[-1]["air"] < readings[0]["air"]
    is_high_humidity = highest["relative_humidity"] > 60  # threshold can be adjusted slightly

    if is_high_humidity and is_temp_dropping:
        prediction = "High chance of rainfall 🌧️"
    else:
        prediction = "Low chance of rainfall ☀️"

    return jsonify({
        "sorted_results": sorted_results,
        "highest": highest,
        "prediction": prediction
    })


@app.route('/')
def home():
    return jsonify({"message": "Raincast Predictor backend is live!"})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
