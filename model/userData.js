const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },    
    latitude: Number,
    longitude: Number,
    ph: Number,
    temperature: Number,
    turbidity: Number,
    electrical_conductivity: Number,
    hardness: Number,
    alkalinity: Number,
    dissolved_oxygen: Number,
    biological_oxygen_demand: Number,
    chemical_oxygen_demand: Number,
    ammonium: Number,
    nitrate: Number,
    nitrite: Number,
    phosphate: Number,
    fluoride: Number,
    water_quality_index: Number
});

const User = mongoose.model("User", userSchema);

module.exports = User;