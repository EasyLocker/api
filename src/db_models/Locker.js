const db = require('mongoose');

const lockerSchema = new db.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
    width: Number,
    height: Number,
    depth: Number,
    userId: db.Schema.Types.ObjectId,
    bookedAt: String
});

module.exports = db.model('Lockers', lockerSchema);