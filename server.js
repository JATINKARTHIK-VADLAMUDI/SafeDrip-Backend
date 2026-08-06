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
let bedsCollection;
let transmittersCollection;

async function connectMongo(){

    await client.connect();

    db = client.db("SafeDripDB");

    liveDataCollection = db.collection("live_data");
    assignmentsCollection = db.collection("assignments");
    patientsCollection = db.collection("patients");
    bedsCollection = db.collection("beds");
    transmittersCollection = db.collection("transmitters");

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

// ---------------- GET BED DATA ----------------

app.get("/api/bed-data", async (req, res) => {

  try {

    const bed = req.query.bed;

    if (!bed) {
      return res.status(400).json({
        error: "Bed number required"
      });
    }

    const assignment = await assignmentsCollection.findOne({
      bed: bed
    });

    if (!assignment) {
      return res.status(404).json({
        error: "No transmitter assigned"
      });
    }

    const data = await liveDataCollection.findOne({
      transmitter: assignment.transmitter
    });

    if (!data) {
      return res.status(404).json({
        error: "No live data found"
      });
    }

    res.json(data);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Server Error"
    });

  }

});

// ---------------- UPDATE DATA ----------------

app.post("/api/update", async (req, res) => {

  latestData.transmitter = req.body.transmitter;
  latestData.weight = req.body.weight;
  latestData.relay = req.body.relay;
  latestData.status = req.body.status;

  try {

    await liveDataCollection.updateOne(

      {
        transmitter: latestData.transmitter
      },

      {
        $set: {
          transmitter: latestData.transmitter,
          weight: latestData.weight,
          relay: latestData.relay,
          status: latestData.status,
          updatedAt: new Date()
        }
      },

      {
        upsert: true
      }

    );

    console.log("Saved to MongoDB");

  } catch (err) {

    console.log(err);

  }

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

// ---------------- LOGIN ----------------

app.post("/api/login", async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await db.collection("users").findOne({
            username: username,
            password: password
        });

        if (!user) {

            return res.json({
                success: false,
                message: "Invalid Username or Password"
            });

        }

        res.json({
            success: true,
            role: user.role,
            name: user.name
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});

// ---------------- ADD PATIENT ----------------

app.post("/api/patients", async (req, res) => {

    try {

        await patientsCollection.insertOne(req.body);

        res.json({
            success: true,
            message: "Patient Saved Successfully"
        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            message:"Unable to Save Patient"
        });

    }

});

// ---------------- GET ALL PATIENTS ----------------

app.get("/api/patients", async (req, res) => {

    try {

        const patients = await patientsCollection.find().toArray();

        res.json(patients);

    }

    catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            message:"Unable to Fetch Patients"
        });

    }

});

// ---------------- GET ONE PATIENT ----------------

app.get("/api/patients/:id", async (req, res) => {

    try{

        const { ObjectId } = require("mongodb");

        const patient = await patientsCollection.findOne({
            _id: new ObjectId(req.params.id)
        });

        res.json(patient);

    }

    catch(err){

        console.log(err);

        res.status(500).json({
            success:false,
            message:"Unable to Fetch Patient"
        });

    }

});

// ---------------- UPDATE PATIENT ----------------

app.put("/api/patients/:id", async (req, res) => {

    try{

        const { ObjectId } = require("mongodb");

        await patientsCollection.updateOne(

            { _id: new ObjectId(req.params.id) },

            { $set: req.body }

        );

        res.json({

            success:true,

            message:"Patient Updated Successfully"

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:"Unable to Update Patient"

        });

    }

});

// ---------------- DELETE PATIENT ----------------

app.delete("/api/patients/:id", async (req,res)=>{

    try{

        const { ObjectId } = require("mongodb");

        await patientsCollection.deleteOne({

            _id:new ObjectId(req.params.id)

        });

        res.json({

            success:true,

            message:"Patient Deleted Successfully"

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:"Unable to Delete Patient"

        });

    }

});

// ---------------- ADD BED ----------------

app.post("/api/beds", async (req, res) => {

    try{

        await bedsCollection.insertOne(req.body);

        res.json({

            success:true,

            message:"Bed Saved Successfully"

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:"Unable to Save Bed"

        });

    }

});

// ---------------- GET ALL BEDS ----------------

app.get("/api/beds", async (req, res) => {

    try {

        const beds = await bedsCollection.find().toArray();

        res.json(beds);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: "Unable to Fetch Beds"

        });

    }

});

// ---------------- UPDATE BED ----------------

app.put("/api/beds/:id", async (req,res)=>{

    try{

        const { ObjectId } = require("mongodb");

        await bedsCollection.updateOne(

            { _id:new ObjectId(req.params.id) },

            { $set:req.body }

        );

        res.json({

            success:true,

            message:"Bed Updated Successfully"

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:"Unable to Update Bed"

        });

    }

});

// ---------------- DELETE BED ----------------

app.delete("/api/beds/:id", async (req,res)=>{

    try{

        const { ObjectId } = require("mongodb");

        await bedsCollection.deleteOne({

            _id:new ObjectId(req.params.id)

        });

        res.json({

            success:true,

            message:"Bed Deleted Successfully"

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false,

            message:"Unable to Delete Bed"

        });

    }

});

// ---------------- DASHBOARD ----------------

app.get("/api/dashboard", async (req, res) => {

    try{

        const totalPatients =
            await patientsCollection.countDocuments();

        const occupiedBeds =
            await patientsCollection.countDocuments();

        const now = new Date();

        const activeTransmitters =
            await liveDataCollection.countDocuments({

                updatedAt: {

                    $gte: new Date(now.getTime() - 15000)

                }

            });

        const criticalAlerts =
            await liveDataCollection.countDocuments({

                status: "DANGER"

            });

        res.json({

            totalPatients,

            occupiedBeds,

            activeTransmitters,

            criticalAlerts

        });

    }

    catch(err){

        console.log(err);

        res.status(500).json({

            success:false

        });

    }

});

// ---------------- SERVER ----------------

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{

  console.log("Server Running");

});
 
