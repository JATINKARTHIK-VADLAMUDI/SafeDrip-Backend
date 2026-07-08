const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ---------------- MONGODB ----------------

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

let db;
let liveDataCollection;
let assignmentsCollection;
let patientsCollection;

async function connectMongo(){

    await client.connect();

    db = client.db("SafeDripDB");

    liveDataCollection = db.collection("live_data");

    assignmentsCollection = db.collection("assignments");

    patientsCollection = db.collection("patients");

    console.log("MongoDB Connected");

}

connectMongo();



// ---------------- DATA ----------------

let latestData = {

  transmitter: "SYS_01",

  weight: 0,

  relay: "OFF",

  status: "SAFE",

  motor: "AUTO",

  buzzer: "AUTO"

};

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
