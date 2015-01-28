var mongoose = require('mongoose');

var NPCSchema = new mongoose.Schema({
    name: String,
    stats: Array,
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NPC', NPCSchema);