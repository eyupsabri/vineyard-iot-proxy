const express = require("express");
const axios = require("axios");
const app = express();

app.get("/poll", async (req, res) => {
  const id = req.query.deviceIdentifier;
  if (!id) return res.status(400).send("Missing deviceIdentifier");

  try {
    const response = await axios.get(
      `https://vineyardappdemo-abamb9dxeycfffgn.polandcentral-01.azurewebsites.net/api/IoTDevice/GetDesiredDeviceStatus?deviceIdentifier=${id}`
    );

    const body = `desiredState=${response.data.desiredState};manual=${response.data.isManualOverride}`;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Length", Buffer.byteLength(body));
    res.setHeader("Connection", "close");
    res.status(200).end(body); // ✅ only body here, no HTTP line manually
  } catch (err) {
    console.error("Azure error:", err.response?.status, err.response?.data);
    res.status(500).send("Azure forwarding failed");
  }
});

app.get("/update", async (req, res) => {
  const { deviceIdentifier, actualState, triggeredBy } = req.query;

  if (!deviceIdentifier || actualState === undefined || triggeredBy === undefined) {
    return res.status(400).send("Missing one or more required query parameters.");
  }

  try {
    const payload = {
      deviceIdentifier,
      actualState: actualState === "true",
      triggeredBy: parseInt(triggeredBy)
    };

    const response = await axios.post(
      "https://vineyardappdemo-abamb9dxeycfffgn.polandcentral-01.azurewebsites.net/api/IoTDevice/UpdateIoTDeviceStatus",
      payload,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const body = `updated=${response.data.updated}`;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Length", Buffer.byteLength(body));
    res.setHeader("Connection", "close");
    res.status(200).end(body); // ✅ no manual HTTP line
  } catch (err) {
    console.error("Azure POST error:", err.response?.status, err.response?.data);
    res.status(500).send("Azure POST forwarding failed");
  }
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Proxy running on port", port);
});