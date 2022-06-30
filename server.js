const express = require("express");
const User = require("./model/userData");
// const mongoose = require("mongoose");
const expresslayouts = require('express-ejs-layouts');
const path = require('path');
const calculate_wqi = require("./controller/wqi_formula");
const {google} = require('googleapis');
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
    array.forEach(ele => {
        item[ele] = (item[ele] || 0) + 1;
    })
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
    return (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) && (/[A-Za-z._]{4,15}[0-9]{0,5}@[A-Za-z]{5,10}[.]{1}[A-Za-z.]{2,6}/).test(email);
}

//DB config
// const db = require("./config/keys").mongoURI;

//Connect to Mongo
// mongoose.connect(db, { useNewUrlParser: true})
//     .then(() => console.log('Mongodb connected...'))
//     .catch(err => console.log(err));

//EJS
app.use(expresslayouts);
app.set("view engine", "ejs");

//BodyParser Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Static_Files Middleware
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.get("/", (req, res) => res.render('user'));

app.post("/input", (req, res) => {
    userdata =  req.body;
    // console.log(userdata.name);
    const { name, email, country, phone } = req.body;
    let errors = [];

    if(!name || !email || !country) {
        errors.push({msg: 'Please fill in all fields'});
    }
    else {
        if (name.length < 4) {
            errors.push({msg: 'Name should be at least 4 characters'});
        }

        if (!emailVarification(email)) {
            errors.push({msg: 'Email is invalid'});
        }
    }

    if (errors.length > 0) {
        res.render('user', {
            errors,
            name,
            email,
            country,
            phone
        });
    } else {
        const newUser = new User({
            name,
            email,
            country,
            phone
        });
        res.render("input");
    }
});

app.post("/output", async (req, res) => {
    let err = [];
    let obj = restructure(req.body);

    //error handling
    for (var key in obj) {
        if (Object.keys(obj[key]).length <= 6) {
            err.push({msg: 'Number of parameters should be more than 3'});
        }
    }
    if (err.length > 0) {
        res.render('input', {
            err
        });
    }
    else {
        
        for (var key in obj) {
            //water quality index calculation
            let lat = obj[key]["latitude"];
            let lng = obj[key]["longitude"];
            let date = obj[key]["date"];
            obj[key]["water_quality_index"] = calculate_wqi(obj[key]);
            obj[key]["latitude"] = lat;
            obj[key]["longitude"] = lng;
            obj[key]["date"] = date;
            
            //Google sheet as database
            const auth = new google.auth.GoogleAuth({
                keyFile: "credentials.json",
                scopes: "https://www.googleapis.com/auth/spreadsheets",
            });
            const client = await auth.getClient();
            const googleSheets = google.sheets({version: 'v4', auth: client});
            const spreadsheetsID = '1sAVZkd4xaaDIdiutBRzq51k3GGlcNUv_ZDfxq-JllW0';
            
            await googleSheets.spreadsheets.values.append({
                auth,
                spreadsheetId: spreadsheetsID,
                range: 'Sheet1!A:U',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [
                        [   userdata.name, 
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
                            obj[key].water_quality_index
                        ]
                    ]
                }
            });            
        }
        res.render("output", {data : JSON.stringify(obj)});
    }
});

app.listen(port, () => {
    console.log(`Running at http://localhost:${port}`);
});