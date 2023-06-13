const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String , unique:true},
    password:String
},{timestamps:true});



const Usermodel = mongoose.model('user-details', UserSchema);

module.exports = Usermodel;