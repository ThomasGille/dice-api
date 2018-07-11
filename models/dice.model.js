// Get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Dice', new Schema({
    name: String,
    number: Number,
    type: Number,
    bonus: Number,
    objective : Number,
}));