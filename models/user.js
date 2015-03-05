var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    side_collapsed: Boolean,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);