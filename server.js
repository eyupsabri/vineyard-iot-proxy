const express = require("express");
const axios = require("axios");
const app = express();

// 👇 Prevent automatic HTTPS redirect (very important!)
app.enable("trust proxy");
app.use((req, res, next) => {
  // If the request is HTTP, continue (don't redirect)
  if (!req.secure) return next();
  next();
});

app.get("/poll", async (req, res) => {
  const id = req.query.deviceIdentifier;
  if (!id) return res.status(400).send("Missing deviceIdentifier");

  try {
    const response = await axios.get(
      `http://vineyardappdemo-abamb9dxeycfffgn.polandcentral-01.azurewebsites.net/api/IoTDevice/GetDesiredDeviceStatus?deviceIdentifier=${id}`,
      {
        headers: {
          "Host": "vineyardappdemo-abamb9dxeycfffgn.polandcentral-01.azurewebsites.net",
          "User-Agent": "SIM808/1.0",
          "Accept": "*/*",
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Azure error:", err.response?.status, err.response?.data);
    res
      .status(err.response?.status || 500)
      .send("Azure forwarding failed");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Proxy running on port", PORT);
});
