const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ---------------- DATA ----------------

let latestData = {
  transmitter: "SYS_01",
  weight: 0,
  relay: "OFF",
  status: "SAFE",
  mode: "AUTO"
};

// ---------------- HOME ----------------

app.get("/", (req, res) => {

  res.send("SafeDrip Backend Running");

});

// ---------------- GET SENSOR DATA ----------------

app.get("/api/data", (req, res) => {

  res.json(latestData);

});

// ---------------- UPDATE SENSOR DATA ----------------

app.post("/api/update", (req, res) => {

  latestData = req.body;

  console.log("New Data Received");
  console.log(latestData);

  res.json({
    success: true
  });

});

// ---------------- GET CONTROL MODE ----------------

app.get("/api/control", (req, res) => {

  res.json({
    mode: latestData.mode
  });

});

// ---------------- CHANGE CONTROL MODE ----------------

app.post("/api/control", (req, res) => {

  latestData.mode = req.body.mode;

  console.log("Mode Changed :", latestData.mode);

  res.json({
    success: true
  });

});

// ---------------- SERVER ----------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("SafeDrip Server Running On Port", PORT);

});
