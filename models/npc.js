var mongoose = require('mongoose');
var DND = require('./dnd.js');

// TODO: should be in it's own require
Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

var StatSchema = new mongoose.Schema({
    name: String,
    stat:  { type: Number, min: 1, max: 30 },
    mod: { type: Number },
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
    damage: String,
    type: String,
});

var NPCSchema = new mongoose.Schema({
    ac: Number,
    it: Number,
    hp: Number,
    race: Object,
    background: Object,
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

/**
 * Calculate specific non-db property, such as level or proficency bonus
 *
 * @param prop
 * @returns {*}
 */
NPCSchema.methods.calc = function (props) {
    if (typeof props == 'string')
        props = [props];

    for (var _i=0; _i<props.length; _i++) {
        switch (props[_i]) {
            // calculate Proficiency Bonus based on level
            case 'prof':
                this.prof = Math.floor(this.calced('level') / 5) + 2;
                break;

            // get all the class stuff at once
            case 'level':
            case 'config':
                if (!this.race || this.classes.length == 0)
                    throw Error('No race and/or classes');

                this.level = 0;
                this.config = {
                    armors: [],
                    weapons: [],
                    languages: [],
                    skills: []
                };

                // get stuff from class config
                for (var i = 0; i < this.classes.length; i++) {
                    for (var j = 0; j < DND.CLASSES.length; j++) {
                        if (DND.CLASSES[j].name == this.classes[i].name) {
                            var class_config = DND.CLASSES[j]
                            this.classes[i].key = j;
                            this.classes[i].hd = class_config.hd; // actually a bit hidden here.. maybe shouldn't be here
                            this.level += this.classes[i].level;
                            this.config.armors = this.config.armors.concat(class_config.armors);
                            this.config.weapons = this.config.weapons.concat(class_config.weapons);
                            this.config.languages = this.config.languages.concat(class_config.languages);
                            this.config.skills = this.config.skills.concat(class_config.skills);

                            if (i == 0) {
                                this.config.skillsno = class_config.skillsno;
                            }
                        }
                    }
                }

                // get stuff from race config
                /*
                // TODO: this.race.name should be subrace name
                for (var j = 0; j < DND.RACES.length; j++) {
                    if (DND.RACES[j].name == this.race.name) {
                        var race_config = DND.RACES[j]
                        this.race.key = j;
                        this.speed = this.race.speed;
                        this.config.armors = this.config.armors.concat(race_config.armors);
                        this.config.weapons = this.config.weapons.concat(race_config.weapons);
                        this.config.languages = this.config.languages.concat(race_config.languages);
                        this.config.skills = this.config.skills.concat(race_config.skills);
                    }
                }
                */

                this.config.skills = this.config.skills.unique();
                this.config.armors = this.config.armors.unique();
                this.config.weapons = this.config.weapons.unique();
                this.config.languages = this.config.languages.unique();
                break;

            case 'ac':
                var ac = 10,
                    maxeddex = this.stats[1].mod;
                for (var i = 0; i<this.calced('armors').length; i++) {
                    ac += this.armors[i].ac;
                    if (this.armors[i].maxdex > -1 && maxeddex > this.armors[i].maxdex) {
                        maxeddex = this.armors[i].maxdex;
                    }
                }
                this.ac = ac + maxeddex;
                break;

            case 'it':
                this.it = this.stats[1].mod;
                break;

            case 'hp':
                this.calc(['level']);
                this.hp = 0;
                for (var i=0; i<this.classes.length; i++) {
                    var cls = this.classes[i],
                        hpplvl = Math.floor(cls.hd / 2) + 1;
                    this.hp += i == 0 ? cls.hd + (hpplvl * (this.level - 1)) : hpplvl * this.level;
                    this.hp += this.stats[2].mod * this.level;
                }
                break;


            // should only be used for defined properties.
            default:
                throw Error('Could not calculate property: ' + props[_i]);
        }
    }
}

/**
 * Get calculated value of a non-db property.
 *
 * @param prop
 * @param type
 * @returns {*}
 */
NPCSchema.methods.calced = function (prop) {
    if (!this[prop]) {
        this.calc(prop);
    }
    return this[prop];
}

NPCSchema.methods.recalculate = function () {
    this.calc(['ac','hp','it']);
}

NPCSchema.methods.randomizeAll = function () {
    this.randomizeBackground();
    this.randomizeStats();
    this.randomizeSkills();
    this.randomizeEquipment();
}

NPCSchema.methods.randomizeBackground = function () {
    var k = Math.floor(Math.random() * DND.BACKGROUNDS.length),
        s = DND.BACKGROUNDS[k].specialities.length > 0 ? Math.floor(Math.random() * DND.BACKGROUNDS[k].specialities.length) : null,
        p = Math.floor(Math.random() * DND.BACKGROUNDS[k].personalities.length),
        i = Math.floor(Math.random() * DND.BACKGROUNDS[k].ideals.length),
        b = Math.floor(Math.random() * DND.BACKGROUNDS[k].bonds.length),
        f = Math.floor(Math.random() * DND.BACKGROUNDS[k].flaws.length);

    console.log([k,s,p,i,b,f]);

    this.background = {
        key: k,
        name: DND.BACKGROUNDS[k].name,
        speciality: s !== null ? DND.BACKGROUNDS[k].specialities[s] : null,
        personality: DND.BACKGROUNDS[k].personalities[p],
        ideal: DND.BACKGROUNDS[k].ideals[i],
        bond: DND.BACKGROUNDS[k].bonds[b],
        flaw: DND.BACKGROUNDS[k].flaws[f],
    };
}

NPCSchema.methods.randomizeStats = function () {
    // randomize stats
    var stats = [];
    for (var j=0; j<6; j++) {
        var rolls = [];
        for (var i = 0; i < 4; i++) {
            rolls[i] = Math.floor(Math.random() * 6) + 1;
        }
        var lowest = 0;
        for (var i = 1; i < 4; i++) {
            if (rolls[i] < rolls[lowest]) {
                lowest = i;
            }
        }
        rolls.splice(lowest, 1);

        var stat = 0;
        for (var i = 0; i < 3; i++) {
            stat += rolls[i]
        }

        stats.push({
            'name': DND.STATNAMES[j],
            'stat': stat,
            'mod': Math.floor(stat / 2) - 5
        });
    }

    this.stats = stats;
}


NPCSchema.methods.randomizeSkills = function () {
    // randomize skills
    this.skills = [];

    var skills = this.calced('config').skills.slice();
    for (var i = 0; i < this.config.skillsno; i++) {
        var random = Math.floor(Math.random() * skills.length),
            key = skills[random],
            skill = DND.SKILLS[key];
        skill.key = key;
        skill.mod = this.calced('stats')[skill.stat].mod + this.calced('prof');
        this.skills.push(skill);
        skills.splice(random, 1);
    }
}

NPCSchema.methods.randomizeEquipment = function () {
    this.weapons = [];
    var armors = this.calced('config').armors,
        weapons = this.calced('config').weapons;

    armors.sort(function (a,b) {return a-b;});
    weapons.sort(function (a,b) {return a-b;});

    var index = armors.indexOf(12);
    this.armors = [];
    if (index) {
        // add shield?
        if (Math.random() > .5)
            this.armors.push(DND.ARMORS[armors[index]]);
        armors.splice(index, 1);
    }

    var npcarmor = null;
    var dexmod = this.calced('stats')[1].mod;
    this.calc(['level']);

    // search for suitable armor, prefer best
    for (i=armors.length-1; i>0; i--) {
        var armor = DND.ARMORS[armors[i]];
        if (this.level == 1 && armor.cost > 50) {
            continue;
        }
        if (this.level == 2 && armor.cost > 200) {
            continue;
        }
        if (this.level == 3 && armor.cost > 1000) {
            continue;
        }
        if (armor.maxdex > -1 && dexmod > 0 && dexmod - armor.maxdex >= 2) {
            continue;
        }
        if (armor.minstr == -1 || armor.minstr <= this.stats[0].stat) {
            // 20% chance to not have the best
            if (Math.random() > .8)
                continue;

            npcarmor = armor;
            break;
        }
    }
    if (npcarmor !== null)
        this.armors.push(npcarmor);

    var melee = null, ranged = null;
    while (melee == null || ranged == null) {
        var i = Math.floor(Math.random() * weapons.length);

        var k = weapons[i];
        if (weapons.length > 14 && k < 15) {
            weapons.splice(i,1);
            continue;
        }

        var w = DND.WEAPONS[k];
        if (this.armors[0].name == 'Shield') {
            if (w.hands > 1) {
                weapons.splice(i,1);
                continue;
            }
        }

        if (w.type == 'melee'){
            if (melee) {
                weapons.splice(i,1);
                continue;
            } else {
                melee = w;
            }
        }
        if (w.type == 'ranged'){
            if (ranged) {
                weapons.splice(i,1);
                continue;
            } else {
                ranged = w;
            }
        }
    }
    this.weapons = [melee, ranged];
}

module.exports = mongoose.model('NPC', NPCSchema);

