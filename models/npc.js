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

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

var StatSchema = new mongoose.Schema({
    name: String,
    stat:  { type: Number, min: 1 },
    mod: { type: Number }
});

var AttackSchema = new mongoose.Schema({
    name: String,
    bonus: Number,
    damage: String,
    special: String
});

var ClassSchema = new mongoose.Schema({
    index: Number,
    name: String,
    path: String,
    fighting_style: String,
    level: { type: Number, min: 1, max: 20 },
    spells: [String],
    cantrips: [String],
    spelldc: Number
});

var SkillSchema = new mongoose.Schema({
    key: Number,
    name: String,
    mod: Number,
    stat: Number
});

var WeaponSchema = new mongoose.Schema({
    name: String,
    damage: String,
    type: String,
});

var SectionSchema = new mongoose.Schema({
    id: String,
    show: Boolean,
    edit: Boolean,
    group: Number
});

var NPCSchema = new mongoose.Schema({
    _picture_id: mongoose.Schema.Types.ObjectId,
    _user_id: mongoose.Schema.Types.ObjectId,
    ac: Number,
    it: Number,
    hp: Number,
    race: Object,
    background: Object,
    alignment: String,
    tags: [String],
    prof: Number, // proficiency bonus
    name: String,
    in_panel: Boolean,
    stats: [StatSchema],
    saves: [{ type:Number, min: 0, max: 5}],
    editing: [String],
    attacks: [AttackSchema],
    classes: [ClassSchema],
    skills: [SkillSchema],
    shield: { name: String, ac: Number },
    armor: { name: String, ac: Number,  maxdex: Number,  minstr: Number },
    items: [],
    features: [String],
    weapons: [WeaponSchema],
    updated_at: { type: Date, default: Date.now },
    notes: String,
    unlocked: [String],
    spells_day: [Number],
    // ui options
    closed_panels: [String]

});

// note the order is a bit strange because it is grouped with i % 4
var SECTIONS = ['image', 'base','equipment','background','stats','attacks','features','notes','abilities','skills','spells'];

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
        if (this.unlocked.contains(props[_i])) {
            console.log('skipped (re)calc for: '+props[_i]);
            continue;
        }

        switch (props[_i]) {
            case 'sections':
                /*
                for (var i=0; i<SECTIONS.length; i++) {
                    var found=false;
                    for (var j=0; j<this.panel.sections.length; j++) {
                        if (SECTIONS[i] == this.panel.sections[j].id) {
                            found=true;
                        }
                    }
                    if (found == false) {
                        this.panel.sections.push({
                            id: SECTIONS[i],
                            show: true,
                            edit: true,
                            group: i%4
                        });
                    }
                }
                break;
                */

            case 'saves':
                this.saves = this.calced('config').classes[0].saves;
                break;

            case 'attacks':
                console.log('attacks');
                var attacks = [],
                    stats = this.calced('stats');
                for (var i=0; i<this.weapons.length; i++) {
                    var weapon = this.weapons[i];
                    attacks.push({
                        name: weapon.name,
                        bonus: this.calced('prof')+(weapon.type == 'ranged' ? stats[1].mod : stats[0].mod),
                        damage: weapon.damage + (weapon.type == 'ranged' ? '' :  '+'+stats[0].mod),
                        special: ''
                    });
                }
                this.attacks = attacks;

                break;
            case 'features':
                var features = [];
                var found = {};
                var class_config = this.calced('config').classes;
                for (var i = 0; i < this.classes.length; i++) {
                    var clsconfig = class_config[i];
                    for (var j = 0; j < this.classes[i].level; j++) {
                        for (var k = 0; k < clsconfig.features[j].length; k++) {
                            var feature = clsconfig.features[j][k];

                            switch (feature) {
                                case 'Ability Score Improvement':
                                    // add stats?
                                    continue;
                                case 'Extra Attack':
                                    if (!found[feature])
                                        found[feature] = 0;
                                    found[feature]++;
                                    feature += ' ('+found[feature]+')';
                                    break;
                                case 'Path':
                                    feature = this.classes[i].name + ' Path';
                                    feature += ' ('+this.classes[i].path+')';
                                    break;
                            }

                            features.push(feature);
                        }
                    }
                }

                this.features = features.unique();
                break;

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

                            this.classes[i].index = j;
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

                //console.log(' --------- config ---------');
                //console.log(this.config);
                //console.log(' --------- /config ---------');

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
    // define properties for performance reasons (instead of iterating all)
    var b = {
        'ac': this.ac,
        'hp': this.hp,
        'it': this.it,
        'prof': this.prof,
        'saves': this.saves.slice()
    };
    this.calc(['ac','hp','it','prof','saves']);

    // remove properties that haven't changed
    for (var prop in b) {
        if (b[prop] instanceof Array) {
            var changed=false;
            for (var i=0; i<b[prop].length; i++) {
                if (b[prop][i] != this[prop][i]) {
                    changed=true;
                }
            }
            if (changed === false) {
                delete b[prop];
            }
        }

        if (b[prop] == this[prop]) {
            delete b[prop];
        }
    }

    return b;
}

NPCSchema.methods.randomizeAll = function () {
    this.randomizeBase();
    this.randomizeBackgroundStuff();
    this.randomizeAlignment();
    this.randomizeStats();
    this.randomizeSkills();
    this.randomizeSpells();
    this.randomizeEquipment();
    this.calc(['features', 'attacks']);
}

NPCSchema.methods.randomizeBase = function () {
    this.randomizeRace();
    this.randomizeClasses(true);
    //this.randomizeBackground();
    //this.randomizeGender();
    //this.randomizeName();
    this.randomizePath();
};

NPCSchema.methods.randomizeName = function () {
    var names = this.calced('config').race.names,
        firstnames = names[this.gender],
        lastnames = names.last || [];
    this.name = firstnames[Math.floor(Math.random() * firstnames.length)];
    if (lastnames.length > 0) {
        this.name += ' ' + lastnames[Math.floor(Math.random() * lastnames.length)];
    }
}

NPCSchema.methods.randomizeSpells = function () {
    var casting_classes = 0,
        caster_cls_key,
        config = this.calced('config'),
        stats = this.calced('stats');

    // add racial spells
    var racespells = [];
    this.race.spells = [];
    console.log(config.race.spells );
    if (typeof config.race.spells != 'undefined') {
        racespells = JSON.parse(JSON.stringify(config.race.spells));
        console.log(racespells);
        if (racespells.length > 1) {
            racespells.splice(Math.floor(this.level / 2) + 2);
        }
        console.log(racespells);
        for (var j = 0; j < racespells.length; j++) {
            for (var k = 0; k < racespells[j].length; k++) {
                if (racespells[j][k] == '*wizard*') {
                    var choices = DND.CLASSES[11].spells;
                    var random = Math.floor(Math.random() * choices.length - 1);
                    racespells[j][k] = choices[random];
                }
                console.log(racespells[j][k]);
                this.race.spells.push(racespells[j][k]);
            }
        }
        console.log(this.race.spells);
        this.race.spelldc = stats[this.config.race.spellstat].mod + 8;
    }

    // init some class stuff
    console.log(this.classes);
    for (var i=0; i<this.classes.length; i++) {
        var n = this.classes[i].name,
            p = this.classes[i].path,
            clsconfig = config.classes[i];
        if (n == 'Bard' || n == 'Cleric' || n == 'Druid' || n == 'Sorcerer' || n == 'Wizard' || n == 'Paladin' || n == 'Ranger' || (n == 'Fighter' && p == 'Eldritch Knight') || (n == 'Rogue' && p == 'Arcane Trickster')) {
            casting_classes++;
            caster_cls_key = i;
            this.classes[i].spelldc = 8+stats[clsconfig.spellstat].mod;
        }
        this.classes[i].spells = [];
    }

    this.spells_day = [];

    if (casting_classes == 0)
        return;

    // determine spells / day
    if (casting_classes == 1) {
        console.log('only 1 caster');
        var n = this.classes[caster_cls_key].name,
            p = this.classes[caster_cls_key].path,
            lvl = this.classes[caster_cls_key].level;
        console.log(n);
        if (n == 'Bard' || n == 'Cleric' || n == 'Druid' || n == 'Sorcerer' || n == 'Wizard') {
            this.spells_day = DND.spells_day_full[lvl-1];
        }
        if ((n == 'Paladin' && lvl > 1)|| (n == 'Ranger' && lvl > 1) || (n == 'Fighter' && p == 'Eldritch Knight' && lvl > 2) || (n == 'Rogue' && p == 'Arcane Trickster' && lvl > 2)) {
            this.spells_day = DND.spells_day_half[lvl-1];
        }
    } else {
        console.log('multiclass caster');
        var slvl = 0;
        for (var i=0; i<this.classes.length; i++) {
            var n = this.classes[i].name,
                p = this.classes[i].path,
                lvl = this.classes[i].level;
            if (n == 'Bard' || n == 'Cleric' || n == 'Druid' || n == 'Sorcerer' || n == 'Wizard') {
                slvl += lvl;
            }
            if (n == 'Paladin' || n == 'Ranger') {
                slvl += Math.floor(lvl / 2);
            }
            if ((n == 'Fighter' && p == 'Eldritch Knight') || (n == 'Rogue' && p == 'Arcane Trickster')) {
                slvl += Math.floor(lvl / 3);
            }
        }
        this.spells_day = DND.spells_day_full[slvl-1];
    }

    // determine spells known/prepared
    for (var i=0; i<this.classes.length; i++) {
        var n = this.classes[i].name,
            p = this.classes[i].path,
            lvl = this.classes[i].level,
            clsconfig = config.classes[i],
            total_spells,
            maxhighest,
            spells_day = [];

        if (n == 'Bard' || n == 'Cleric' || n == 'Druid' || n == 'Sorcerer' || n == 'Wizard') {
            spells_day = DND.spells_day_full[lvl];
            maxhighest = lvl/2 == Math.floor(lvl/2) ? 4 : 2;
            total_spells = stats[clsconfig.spellstat].mod + lvl;
        } else if ((n == 'Paladin' && lvl > 1)|| (n == 'Ranger' && lvl > 1) || (n == 'Fighter' && p == 'Eldritch Knight' && lvl > 2) || (n == 'Rogue' && p == 'Arcane Trickster' && lvl > 2)) {
            maxhighest = 2 + (((lvl-1) % 4) * 2);
            total_spells = stats[clsconfig.spellstat].mod + Math.floor(lvl/2);
            spells_day = DND.spells_day_half[lvl];
        } else {
            continue;
        }

        if (clsconfig.spells_known && clsconfig.spells_known.length > 0) {
            total_spells = clsconfig.spells_known[lvl];
        }

        if (total_spells < 1)
            total_spells = 1;

        var choices = JSON.parse(JSON.stringify(clsconfig.spells)); // note: using JSON trick to deep-copy array.
        choices = choices.splice(1); // remove cantrips
        //console.log(choices);

        for (var j=0; j<total_spells; j++) {
            //console.log(choices);
            if (j < maxhighest) {
                console.log(spells_day.length);
                this.classes[i].spells.push(choices[spells_day.length-1].splice(Math.floor(Math.random() * choices[spells_day.length-1].length), 1));
            } else {
                var max = spells_day.length - 2;
                console.log('max:'+max);
                if (max < 0) { max = 0; }
                var splvl = Math.floor(Math.random() * max);
                // try again in case we already chose ALL spells from this level
                console.log(splvl);
                while (true) {
                    if (choices[splvl].length > 0) {
                        break;
                    }
                    splvl = Math.floor(Math.random() * max);
                    console.log('in while');
                }
                /*
                while (choices[splvl].length == 0) {
                    var splvl = Math.floor(Math.random() * max);
                }
                */
                this.classes[i].spells.push(choices[splvl].splice(Math.floor(Math.random()*choices[splvl].length), 1));
            }
        }

        // choose cantrips
        this.classes[i].cantrips = [];
        if (clsconfig.cantrips.length > 0) {
            var total = clsconfig.cantrips[lvl];
            var choices = clsconfig.spells[0].slice(); // copy array
            for (var j=0; j<total; j++) {
                var random = Math.floor(Math.random() * choices.length-1);

                this.classes[i].cantrips.push( choices.splice(random, 1) );
            }
        }
    }
}

NPCSchema.methods.randomizeGender = function () {
    var genders = ['male','female'];
    this.gender = genders[Math.round(Math.random())];
}

NPCSchema.methods.randomizeClasses = function (multiclass, name, level) {
    var class_names = []
    for (var i=0; i<DND.CLASSES.length; i++)
        class_names.push(DND.CLASSES[i].name);

    console.log('level: '+level);
    if (!level) {
        console.log('randomizing level');
        level = Math.floor((Math.random() * Math.random()) * 20) + 1;
    } else if (level[1] == '-') {
        level = Math.floor((Math.random()) * (level[2]-level[0])) + parseInt(level[0]);
    } // else level=level
    console.log('level: '+level);


    var index = class_names.indexOf(name);
    if (index > -1) {
        this.classes[0].level = level;
        return;
    }

    this.classes = [];
    var classes = multiclass ? 1 : (1 + Math.round(Math.random()*Math.random()) + Math.round(Math.random()*Math.random())); // 1, 2 or 3
    for (var i=classes; i>0; i--) {
        console.log(i);
        var random = Math.floor(Math.random()*class_names.length);
        var clslvl = i==1 ? level : Math.floor((Math.random())*(level-i))+1;
        console.log(clslvl);
        if (clslvl < 1)
            clslvl = 1;
        this.classes.push({
            name: class_names[random],
            level: clslvl
        });
        level -= clslvl;
        class_names.splice(random, 1);
    }
};

NPCSchema.methods.randomizePath = function () {
    var features = this.calced('features'),
        config = this.calced('config');

    for (var i=0; i<this.classes.length; i++) {
        var clsconfig = config.classes[i],
            paths = clsconfig.paths,
            rand = Math.floor(Math.random()*paths.length);
        this.classes[i].path = paths[rand];
    }
};

NPCSchema.methods.randomizeBackground = function () {
    this.background = {
        name: DND.BACKGROUNDS[Math.floor(Math.random() * DND.BACKGROUNDS.length)].name
    };
};

NPCSchema.methods.randomizeRace = function () {
    var r = Math.floor(Math.random() * DND.RACES.length),
        subraces = DND.RACES[r].subraces;
    this.race = {name: subraces.length > 0 ? subraces[Math.floor(Math.random() * subraces.length)].name : DND.RACES[r].name, speed: DND.RACES[r].speed};

};

/**
 * 1. determine possible alignments
 *  - based on backstory
 * 2. determine preffered alignments
 *  - based on class
 *  - based on race
 */
NPCSchema.methods.randomizeAlignment = function () {
    var self = this,
        config = this.calced('config');

    if (this.config.backstory) {
        // see if there's something here
    }

    // concat race and class, non-unique
    var choices = config.classes[0].alignments.concat(config.race.alignments);

    // add random alignment, for the odd ones'
    var all = DND.ALIGNMENTS;
    choices.push( all[Math.floor(Math.random() * all.length)] );

    // pick random
    this.alignment = choices[Math.floor(Math.random() * choices.length)];
}

NPCSchema.methods.randomizeBackgroundStuff = function () {

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

        stats.push(stat);
    }

    // get primary stats
    var config = this.calced('config'),
        primary_stats = [];
    for (var i=0; i<this.classes.length; i++) {
        var clsconfig = config.classes[i];
        for (var j=0; j<clsconfig.primary_stats.length; j++) {
            primary_stats.push(clsconfig.primary_stats[j]);
        }
    }
    primary_stats = primary_stats.unique();

    // create full stat order
    var remaining = [0,1,2,3,4,5].diff(primary_stats);
    remaining = shuffle(remaining);
    var stat_order = primary_stats.concat(remaining);
    console.log(stat_order);



    // put correct order in randomized stats
    this.stats = [{}, {}, {}, {}, {}, {}];
    var k;
    stats.sort(function(a, b){return b-a}); // sort descending
    for (var i=0; i<stats.length; i++) {
        k = stat_order.shift();
        this.stats[k].name = DND.STATNAMES[k];
        this.stats[k].stat = stats[i];
        this.stats[k].mod = Math.floor(stats[i] / 2) - 5;
    }

    console.log('------ stats -------')
    console.log(this.stats);
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
    };

    var removeExistingSkills = function (skills) {
        for (var i=0; i<self.skills.length; i++) {
            var index = skills.indexOf(self.skills[i].key);
            if (index > -1) {
                skills.splice(index, 1);
            }
        }
    };

    // 1. add background skill proficiency
    var skills = config.background.skills;
    for (var i = 0; i < skills.length; i++) {
        addSkill(skills[i]);
    }

    console.log('first background');
    console.log(this.skills);

    // 2. add race skill proficiency
    var skills = config.race.skills || [];
    for (var i = 0; i < skills.length; i++) {
        if (skills[i] == '*') { // * means any
            var choices = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
            removeExistingSkills(choices);
            addSkill(choices[Math.floor(Math.random() * choices.length)]);
        } else {
            addSkill(skills[i]);
        }
    }

    console.log('then race background');
    console.log(this.skills);

    // 3. add random skill from class list
    var skills = config.classes[0].skills.slice(); // copy array
    console.log('class choices:');
    console.log(skills);

    // remove skills that are already chosen
    removeExistingSkills(skills);
    console.log('after removing:');
    console.log(skills);

    // actually choose class skills
    for (var i=0; i < this.config.classes[0].skillsno; i++) {
        var random = Math.floor(Math.random() * skills.length);
        addSkill(skills[random]);
        skills.splice(random, 1);
    }

    console.log('+ class');
    console.log(this.skills);

    // 4. add additional random skill for multiclass rogue/ranger/bard
    for (var i = 1; i < this.classes.length; i++) {
        if (this.classes[i].name == 'Rogue' || this.classes[i].name == 'Bard' || this.classes[i].name == 'Ranger') {
            console.log('adding additional skill');
            var skills = config.classes[i].skills;
            removeExistingSkills(skills);
            console.log('choices after removal: ');
            console.log(skills);
            if (skills.length == 0)
                return;

            var random = Math.floor(Math.random() * skills.length);
            addSkill(skills[random]);
        }
    }

    console.log('finally');
    console.log(this.skills);
}

NPCSchema.methods.randomizeEquipment = function () {
    this.weapons = [];
    var armors = this.calced('config').armors,
        weapons = this.calced('config').weapons,
        features = this.calced('features');

    var is_caster = features.contains('Spellcasting');

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
        if (Math.random() < .5)
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
    var choices = [];
    if (this.shield.ac == 0) {
        if (Math.random() > .7 && !is_caster) {
            choices = m2hmelee.length > 0 ? m2hmelee : s2hmelee;
        } else {
            choices = m1hmelee.length > 0 ? m1hmelee : s1hmelee;
            this.weapons.push(DND.WEAPONS[choices[Math.floor(Math.random() * choices.length)]]);
            choices = m1hmelee.length > 0 ? m1hmelee : s1hmelee;
        }
    } else {
        choices = m1hmelee.length > 0 ? m1hmelee : s1hmelee;
    }
    if (choices.length > 0) {
        this.weapons.push(DND.WEAPONS[choices[Math.floor(Math.random() * choices.length)]]);
    }
}

module.exports = mongoose.model('NPC', NPCSchema);