// Get an instance of mongoose and mongoose.Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Game', new Schema({
    name: String,
    _monsters: [{
        type: Schema.Types.ObjectId,
        ref: 'Monster',
    }],
    _dices: [{
        type: Schema.Types.ObjectId,
        ref: 'Dice',
    }],
}));