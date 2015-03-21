var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    openId: {type: String, required: true, index: {unique: true}},
    /*
    username: { type: String, required: true, index: { unique: true } },
    email: { type: String, required: true },
    password: { type: String, required: true },
    */
    side_collapsed: Boolean,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);