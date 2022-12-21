const mongoose = require("mongoose");

// Creating a Schema for uploaded files
const UserSchema = new mongoose.Schema({

    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number },
    mark1: { type: Number },
    mark2: { type: Number },
    mark3: { type: Number },
    average:{type:parseFloat(Number),},
    status:{type:String},

},{timestamps:true});

// Creating a Model from that Schema
module.exports=mongoose.model("User", UserSchema);