const express = require("express");
const User = require("./model/userData");
// const mongoose = require("mongoose");
const expresslayouts = require("express-ejs-layouts");
const path = require("path");
const calculate_wqi = require("./controller/wqi_formula");
const calculate_hazard_index = require("./controller/hazardIndex_formula");
const calculate_sar = require("./controller/sar");
const { google } = require("googleapis");
const calculate_sodiumpercentage = require("./controller/sodiumpercentage");
const ejs = require('ejs');

const port = process.env.PORT || 3000;
let userdata;

const app = express();

function restructure(obj) {
  let item = {};
  let array = [];
  let item1 = {};
  let obj1 = {};
  let i = 0;

  for (var key in obj) {
    array.push(key.charAt(key.length - 1));
  }
  array.forEach((ele) => {
    item[ele] = (item[ele] || 0) + 1;
  });
  for (var key in obj) {
    if (key.slice(0, -1) === "latitude") {
      item1 = {};
      i = 0;
    }
    item1[key.slice(0, -1)] = obj[key];
    if (item[key.charAt(key.length - 1)] - 1 === i) {
      obj1[key.charAt(key.length - 1)] = item1;
    }
    i++;
  }
  return obj1;
}

function emailVarification(email) {
  return (
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ &&
    /[A-Za-z._]{4,15}[0-9]{0,5}@[A-Za-z]{5,10}[.]{1}[A-Za-z.]{2,6}/.test(email)
  );
}


//EJS
app.use(expresslayouts);
app.set("view engine", "ejs");

//BodyParser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Static_Files Middleware
app.use(express.static(path.join(__dirname, "public")));

//routes
app.get("/", (req, res) => res.render("home"));
app.get("/user", (req, res) => res.render("user"));
app.get("/piper", (req, res) => res.render("piper"));
app.get("/wilcox", (req, res) => res.render("wilcox"));
app.get("/test", (req, res) => res.render("test"));


app.post("/input", (req, res) => {
  userdata = req.body;
  const { name, email, country, phone } = req.body;
  let errors = [];

  if (!name || !email || !country) {
    errors.push({ msg: "Please fill in all fields" });
  } else {
    if (name.length < 4) {
      errors.push({ msg: "Name should be at least 4 characters" });
    }

    if (!emailVarification(email)) {
      errors.push({ msg: "Email is invalid" });
    }
  }

  if (errors.length > 0) {
    res.render("user", {
      errors,
      name,
      email,
      country,
      phone,
    });
  } else {
    const newUser = new User({
      name,
      email,
      country,
      phone,
    });
    console.log(req.body);
    console.log(JSON.stringify(req.body))
    res.render("input", { userdata: JSON.stringify(req.body) });
  }
});

// Define a route for the root path of the application
app.get('/output1',async (req, res) => {

  //Google sheet as database
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });
  const client =  auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetsID = "1sAVZkd4xaaDIdiutBRzq51k3GGlcNUv_ZDfxq-JllW0";

  const range = 'Sheet5!A:AD';

  // Retrieve the last five rows of the Google Sheet
  await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId: spreadsheetsID,
    range: range,
   
  }, (err, result) => {
    if (err) {
      console.log(err);
      res.send('Error retrieving data from Google Sheets');
      return;
    }

    const rows = result.data.values;
    // Render the rows using EJS and send the HTML as the response
    res.render('output1', { rows });
  });
});


app.post("/output", async (req, res) => {
  let err = [];
  let obj = restructure(req.body);
  let objwqi=restructure(req.body);
  let rows;
  //error handling
  for (var key in obj) {
    if (Object.keys(obj[key]).length <= 6) {
      err.push({ msg: "Number of parameters should be more than 3" });
    }
  }
  if (err.length > 0) {
    res.render("input", {
      err,
    });
  } else {
    for (var key in obj) {
      //SAR calculation
      obj[key]["sar"] = calculate_sar([
        parseFloat(obj[key]["sodiumion"]),
        parseFloat(obj[key]["calciumion"]),
        parseFloat(obj[key]["magnesiumion"]),
      ]);

      //sodium percentage calculation
      obj[key]["Na_per"] = calculate_sodiumpercentage([
        parseFloat(obj[key]["sodiumion"]),
        parseFloat(obj[key]["calciumion"]),
        parseFloat(obj[key]["magnesiumion"]),
        parseFloat(obj[key]["potassiumion"]),
      ]);

      //water quality index calculation
      let lat = obj[key]["latitude"];
      let lng = obj[key]["longitude"];
      let date = obj[key]["date"];
      obj[key]["water_quality_index"] = calculate_wqi(objwqi[key]);
      obj[key]["latitude"] = lat;
      obj[key]["longitude"] = lng;
      obj[key]["date"] = date;

      //hazard index calculation
      obj[key]["hazard_index"] = calculate_hazard_index([
        parseFloat(obj[key]["nitrate"]),
        parseFloat(obj[key]["nitrite"]),
        parseFloat(obj[key]["fluoride"]),
        parseFloat(obj[key]["ammonium"]),
        parseFloat(obj[key]["phosphate"]),
      ]);

      const datee = Date(Date.now()).toString();
      //Google sheet as database
      const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });
      const client = await auth.getClient();
      const googleSheets = google.sheets({ version: "v4", auth: client });
      const spreadsheetsID = "1sAVZkd4xaaDIdiutBRzq51k3GGlcNUv_ZDfxq-JllW0";
  
      await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId: spreadsheetsID,
        range: "Sheet4!A:U",
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [
            [
              Date(Date.now()).toString(),
              userdata.name,
              userdata.email,
              userdata.country,
              userdata.phone,
              date,
              lat,
              lng,
              obj[key].ph,
              obj[key].temperature,
              obj[key].turbidity,
              obj[key].electrical_conductivity,
              obj[key].hardness,
              obj[key].alkalinity,
              obj[key].dissolved_oxygen,
              obj[key].biological_oxygen_demand,
              obj[key].chemical_oxygen_demand,
              obj[key].ammonium,
              obj[key].nitrate,
              obj[key].nitrite,
              obj[key].phosphate,
              obj[key].sodiumion,
              obj[key].calciumion,
              obj[key].magnesiumion,
              obj[key].water_quality_index,
              obj[key].hazard_index.male,
              obj[key].hazard_index.female,
              obj[key].hazard_index.child,
              obj[key].sar,
              obj[key].Na_per
            ],

          ],
        },
      },(err, res) => {
        if (err) return console.log(`The API returned an error: ${err}`);
    });
    const range = 'Sheet4!A:AD';

  // Retrieve the last five rows of the Google Sheet
  await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId: spreadsheetsID,
    range: range,
   
  }, (err, result) => {
    if (err) {
      console.log(err);
      res.send('Error retrieving data from Google Sheets');
      return;
    }

    const rows1 = result.data.values;
    rows=rows1;
    });
   
res.render("output", { rows,data: JSON.stringify(obj)});

  }
}
});



app.listen(port, () => {
  console.log(`TTT Running at http://localhost:${port}`);
});
