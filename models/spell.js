var mongoose = require('mongoose');

var SpellSchema = new mongoose.Schema({
    level: Number,
    name: String,
    school: String,
    casting_time: String,
    range: String,
    components: [String],
    duration: String,
    description: String,
    classes: [String]
});

module.exports = mongoose.model('Spell', SpellSchema);