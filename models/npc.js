var mongoose = require('mongoose');

var NPCSchema = new mongoose.Schema({
    name: String,
    in_panel: Boolean,
    stats: Array,
    classes: Array,
    skills: Array,
    armor: Object,
    shield: Object,
    weapons: Array,
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NPC', NPCSchema);