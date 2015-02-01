var mongoose = require('mongoose');

var StatSchema = new mongoose.Schema({
    name: String,
    stat:  { type: Number, min: 0 },
    mod: { type: Number, min: 0 },
});

var ClassSchema = new mongoose.Schema({
    index: Number,
    name: String,
    level: { type: Number, min: 1, max: 20 },
});

var SkillSchema = new mongoose.Schema({
    name: String,
    mod: Number,
    stat: Number
});

var ArmorSchema = new mongoose.Schema({
    name: String,
    ac: Number,
    maxdex: Number,
    minstr: Number
});

var WeaponSchema = new mongoose.Schema({
    name: String,
    damage: Number,
    type: String,
});


var NPCSchema = new mongoose.Schema({
    prof: Number, // proficiency bonus
    name: String,
    in_panel: Boolean,
    stats: [StatSchema],
    classes: [ClassSchema],
    skills: [SkillSchema],
    armors: [ArmorSchema],
    weapons: [WeaponSchema],
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NPC', NPCSchema);