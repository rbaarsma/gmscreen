var mongoose = require('mongoose');
var DND = require('./dnd.js');
var extend = require('node.extend');

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
    stat:  { type: Number, min: 1 },
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

var WeaponSchema = new mongoose.Schema({
    name: String,
    damage: String,
    type: String,
});

var NPCSchema = new mongoose.Schema({
    _picture_id: mongoose.Schema.Types.ObjectId,
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
    shield: { name: String, ac: Number },
    armor: { name: String, ac: Number,  maxdex: Number,  minstr: Number },
    items: [],
    weapons: [WeaponSchema],
    updated_at: { type: Date, default: Date.now },
    notes: String,
    maximized: Boolean, // show maximized in view
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
                    classes: [],
                    race: {},
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

                            this.config.classes[i] = class_config;

                            this.classes[i].key = j;
                            this.classes[i].hd = class_config.hd; // actually a bit hidden here.. maybe shouldn't be here
                            this.level += this.classes[i].level;
                            this.config.armors = this.config.armors.concat(class_config.armors);
                            this.config.weapons = this.config.weapons.concat(class_config.weapons);
                            this.config.languages = this.config.languages.concat(class_config.languages);
                        }
                    }
                }

                // get stuff from race config
                race_loop:
                for (var j = 0; j < DND.RACES.length; j++) {
                    var race_config = DND.RACES[j];
                    if (race_config.subraces.length > 0) {
                        for (var k = 0; k< race_config.subraces.length; k++) {
                            if (race_config.subraces[k].name == this.race.name) {
                                this.config.race = extend(race_config, race_config.subraces[k]);
                                break race_loop;
                            }
                        }
                    } else {
                        if (race_config.name == this.race.name) {
                            this.config.race = race_config;
                            break race_loop;
                        }
                    }
                }

                // get background
                for (var j = 0; j < DND.BACKGROUNDS.length; j++) {
                    var background = DND.BACKGROUNDS[j];
                    if (background.name == this.background.name) {
                        this.config.background = background;
                        break;
                    }
                }

                this.size = this.config.race.size;
                this.speed = this.config.race.speed;
                if (this.config.race.armors)
                    this.config.armors = this.config.armors.concat(this.config.race.armors);
                if (this.config.race.weapons)
                    this.config.weapons = this.config.weapons.concat(this.config.race.weapons);
                if (this.config.race.languages)
                    this.config.languages = this.config.languages.concat(this.config.race.languages);

                // do something with languages '*' ==> choose a random language

                this.config.armors = this.config.armors.unique();
                this.config.weapons = this.config.weapons.unique();
                this.config.languages = this.config.languages.unique();

                console.log(' --------- config ---------');
                console.log(this.config);
                console.log(' --------- /config ---------');

                break;

            case 'ac':
                var ac = 10,
                    dexmod = this.stats[1].mod;
                console.log('ac');
                ac += this.shield.ac;
                console.log(ac);
                ac += this.armor.ac;
                console.log(ac);
                ac += this.armor.maxdex > 0 && dexmod > this.armor.maxdex ? this.armor.maxdex : dexmod;
                console.log(ac);
                this.ac = ac;
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
                    console.log(this.hp);
                    this.hp += i == 0 ? cls.hd + (hpplvl * (this.level - 1)) : hpplvl * this.level;
                    console.log(this.hp);
                    this.hp += this.stats[2].mod * this.level;
                    console.log(this.hp);
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
    this.calc(['ac','hp','it','prof']);
}

NPCSchema.methods.randomizeAll = function () {
    this.randomizeBase();
    this.randomizeBackground();
    this.randomizeStats();
    this.randomizeSkills();
    this.randomizeEquipment();
}

NPCSchema.methods.randomizeBase = function () {
    this.background = {
        name: DND.BACKGROUNDS[Math.floor(Math.random() * DND.BACKGROUNDS.length)].name
    };

    // pick race
    var r = Math.floor(Math.random() * DND.RACES.length),
        subraces = DND.RACES[r].subraces;
    this.race = {name: subraces.length > 0 ? subraces[Math.floor(Math.random() * subraces.length)].name : DND.RACES[r].name};

    // pick class(es)
    var class_names = []
    for (var i=0; i<DND.CLASSES.length; i++)
        class_names.push(DND.CLASSES[i].name);

    this.classes = [];
    var level = Math.floor((Math.random()*Math.random())*20)+1;
    var classes = 1 + Math.round(Math.random()*Math.random()) + Math.round(Math.random()*Math.random()); // 1, 2 or 3
    for (var i=classes; i>0; i--) {
        var random = Math.floor(Math.random()*class_names.length);
        var clslvl = i==0 ? level: Math.floor((Math.random())*(level-i))+1;
        if (clslvl < 1)
            clslvl = 1;
        this.classes.push({
            name: class_names[random],
            level: clslvl
        });
        level -= clslvl;
        class_names.splice(random, 1);
    }
    console.log(this.classes);
};

NPCSchema.methods.randomizeBackground = function () {

    for (var k = 0; k < DND.BACKGROUNDS.length; k++) {
        if (DND.BACKGROUNDS[k].name == this.background.name) {
            break;
        }
    }

    var s = DND.BACKGROUNDS[k].specialities.length > 0 ? Math.floor(Math.random() * DND.BACKGROUNDS[k].specialities.length) : null,
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

/**
 * According to the rules you get:
 *  1. skill proficiencies from your main class
 *  2. an additional skill for multiclass to rogue, ranger or bard from their skill list
 *  3. background skill proficiencies
 *  4. race skill proficiencies
 *
 *  TODO: currently skills may be chosen twice
 */
NPCSchema.methods.randomizeSkills = function () {
    var self = this,
        config = this.calced('config'),
        prof = this.calced('prof'),
        stats = this.calced('stats');
    this.skills = [];

    // helper function to add skill with correct key/mod
    var addSkill = function (key) {
        var skill = DND.SKILLS[key];
        skill.key = key;
        skill.mod = stats[skill.stat].mod + prof;
        self.skills.push(skill);
    }

    // 1. add random skill from class list
    var skills = config.classes[0].skills.slice(); // copy array
    for (var i = 0; i < this.config.classes[0].skillsno; i++) {
        var random = Math.floor(Math.random() * skills.length);
        addSkill(skills[random]);
        skills.splice(random, 1);
    }

    // 2. add additional random skill for rogue/ranger/bard
    for (var i = 1; i < this.classes.length; i++) {
        var skills = config.classes[i].skills,
            random = Math.floor(Math.random() * skills.length);
        addSkill(skills[random]);
    }

    // 3. add background skill proficiency
    var skills = config.background.skills;
    for (var i = 0; i < skills.length; i++) {
        addSkill(skills[i]);
    }

    // 4. add race skill proficiency
    var skills = config.race.skills || [];
    for (var i = 0; i < skills.length; i++) {
        addSkill(skills[i]);
    }
}

NPCSchema.methods.randomizeEquipment = function () {
    this.weapons = [];
    var armors = this.calced('config').armors,
        weapons = this.calced('config').weapons;

    armors.sort(function (a, b) {
        return a - b;
    });
    weapons.sort(function (a, b) {
        return a - b;
    });

    var index = armors.indexOf(12);
    this.shield = {name: '-', ac: 0};
    if (index > 0) {
        // add shield?
        if (Math.random() > .5)
            this.shield = DND.ARMORS[armors[index]];
        armors.splice(index, 1);
    }

    var npcarmor = {name: '-', ac: 0, maxdex: -1, minstr: 0};
    var dexmod = this.calced('stats')[1].mod;
    this.calc(['level']);

    // search for suitable armor, prefer best
    for (i = armors.length - 1; i > 0; i--) {
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
    console.log(npcarmor);
    this.armor = npcarmor;
    console.log(this.armor);

    // prepare choices in grouped arrays
    var s1hmelee = [], s2hmelee = [], m1hmelee = [], m2hmelee = [], sranged = [], mranged = [];
    for (var i = 0; i < weapons.length; i++) {
        var wep = DND.WEAPONS[weapons[i]];
        if (wep.type == 'melee') {
            if (wep.complexity == 'simple') {
                if (wep.hands == 1) {
                    for (var j = 0; j < wep.pickchance; j++) {
                        s1hmelee.push(weapons[i]);
                    }
                } else {
                    for (var j = 0; j < wep.pickchance; j++) {
                        s2hmelee.push(weapons[i]);
                    }
                }
            } else {
                if (wep.hands == 1) {
                    for (var j = 0; j < wep.pickchance; j++) {
                        m1hmelee.push(weapons[i]);
                    }
                } else {
                    for (var j = 0; j < wep.pickchance; j++) {
                        m2hmelee.push(weapons[i]);
                    }
                }
            }
        } else {
            if (wep.complexity == 'simple') {
                for (var j = 0; j < wep.pickchance; j++) {
                    sranged.push(weapons[i]);
                }
            } else {
                for (var j = 0; j < wep.pickchance; j++) {
                    mranged.push(weapons[i]);
                }
            }
        }
    }
    console.log('-------- weapons --------');
    console.log(s2hmelee);
    console.log(s1hmelee);
    console.log(m2hmelee);
    console.log(m1hmelee);
    console.log(sranged);
    console.log(mranged);
    console.log('-------- /weapons --------');

    // pick ranged
    var choices = mranged.length > 0 ? mranged : sranged;
    this.weapons.push(DND.WEAPONS[choices[Math.floor(Math.random() * choices.length)]]);

    // pick melee
    if (this.shield.ac == 0) {
        if (Math.random() > .7) {
            var choices = m2hmelee.length > 0 ? m2hmelee : s2hmelee;
        } else {
            var choices = m1hmelee.length > 0 ? m1hmelee : s1hmelee;
            this.weapons.push(DND.WEAPONS[choices[Math.floor(Math.random() * choices.length)]]);
            var choices = m1hmelee.length > 0 ? m1hmelee : s1hmelee;
        }
    } else {
        var choices = m1hmelee.length > 0 ? m1hmelee : s1hmelee;
    }
    this.weapons.push(DND.WEAPONS[choices[Math.floor(Math.random() * choices.length)]]);

}

module.exports = mongoose.model('NPC', NPCSchema);