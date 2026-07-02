const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(bodyParser.json());
// ---------------- MONGODB ----------------

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("✅ MongoDB Connected");
})
.catch((err) => {
    console.log("❌ MongoDB Error");
    console.log(err);
});

// ---------------- DATA ----------------

let latestData = {

  transmitter: "SYS_01",

  weight: 0,

  relay: "OFF",

  status: "SAFE",

  motor: "AUTO",

  buzzer: "AUTO"

};
// ---------------- MONGODB PATIENT MODEL ----------------

const PatientSchema = new mongoose.Schema({

  transmitter: String,

  patientName: String,

  doctor: String,

  ward: String,

  bed: String,

  age: Number,

  gender: String,

  bloodGroup: String,

  admittedAt: {
    type: Date,
    default: Date.now
  },

  dischargedAt: {
    type: Date,
    default: null
  }

});

const Patient = mongoose.model("Patient", PatientSchema);

// ---------------- HOME ----------------

app.get("/", (req, res) => {

  res.send("SafeDrip Backend Running");

});

// ---------------- GET DATA ----------------

app.get("/api/data", (req, res) => {

  res.json(latestData);

});

// ---------------- UPDATE DATA ----------------

app.post("/api/update", (req, res) => {

  latestData.transmitter = req.body.transmitter;
  latestData.weight = req.body.weight;
  latestData.relay = req.body.relay;
  latestData.status = req.body.status;

  console.log(latestData);

  res.json({
    success: true
  });

});

// ---------------- GET CONTROL ----------------

app.get("/api/control", (req, res) => {

  res.json({

    motor: latestData.motor,

    buzzer: latestData.buzzer

  });

});

// ---------------- CHANGE CONTROL ----------------

app.post("/api/control", (req, res) => {

  if(req.body.motor)
    latestData.motor = req.body.motor;

  if(req.body.buzzer)
    latestData.buzzer = req.body.buzzer;

  console.log("Motor :",latestData.motor);

  console.log("Buzzer :",latestData.buzzer);

  res.json({
    success:true
  });

});

// ---------------- SERVER ----------------

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{

  console.log("Server Running");

});
