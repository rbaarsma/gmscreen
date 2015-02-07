var mongoose = require('mongoose');

var PictureSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    content_type: String,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Picture', PictureSchema);