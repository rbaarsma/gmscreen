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
        if (v instanceof RegExp) {
            if (this[i].match(v)) return true
        } else {
            if (this[i] === v) return true;
        }
    }
    return false;
};

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

Array.prototype.random = function () {
    var arr = this.splice(Math.floor(Math.random() * this.length), 1);
    return arr[0];
}

function dieaverage(input) {
    var dies = input.match(/[0-9]*d[0-9]+/ig);
    if (!dies || dies.length == 0)
        return input;

    for (var i=0; i<dies.length; i++) {
        var die = dies[i];
        if (die.length == 2)
            die = '1'+die;
        var parts = die.split('d');
        var average = Math.floor(parseInt(parts[0]) * (parseInt(parts[1])/2));
        input = input.replace(die, average);
    }
    if (input.match(/[0-9\+\- ]+/)) {
        eval("var t = " + input);
        return t;
    }
    return '';
}

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
    extra_dmg: String,
    no: Number,
    special: String,
    type: String
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
    props: [String]
});

var NPCSchema = new mongoose.Schema({
    _picture_id: mongoose.Schema.Types.ObjectId,
    _user_id: mongoose.Schema.Types.ObjectId,
    cr: Number,
    ac: Number,
    it: Number,
    hp: Number,
    size: String,
    speed: String,
    race: { name: String, spells: [String], spelldc: Number },
    background: { name: String, personality: String, flaw: String, bond: String, ideal: String, speciality: String },
    alignment: String,
    languages: [String],
    tags: [String],
    prof: Number, // proficiency bonus
    name: String,
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
    hands: [WeaponSchema],
    updated_at: { type: Date, default: Date.now },
    notes: String,
    unlocked: [String],
    spells_day: [Number],
    pactmagic_slots: Number,
    gender: String,
    // ui options
    closed_panels: [String],
    edit_panels: [String],
    in_panel: Boolean,
    editing: Boolean
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
        if (this.unlocked.contains(props[_i])) {
            continue;
        }

        switch (props[_i]) {
            case 'fighting_style':
                // just check wether to remove fighting style when the feature does not exist
                for (var i=0; i<this.classes.length; i++) {
                    var n = this.classes[i].name,
                        l = this.classes[i].level;
                    if (!(n == 'Fighter') && !(n=='Ranger'&&l>=2) && !(n=='Paladin'&&l>=2)) {
                        this.classes[i].fighting_style = '';
                        console.log(this.classes);
                    }
                }

                break;

            // randomize path if path is from another
            case 'path':
                var clsconfig = this.calced('config').classes;
                for (var i=0; i<this.classes.length; i++) {
                    if (!clsconfig[i].paths.contains(this.classes[i].path)) {
                        this.randomizePath();
                    }
                }
                break;

            case 'saves':
                this.saves = this.calced('config').classes[0].saves;
                break;

            case 'attacks':
                var features = this.calced('features');
                var attacks = [],
                    stats = this.calced('stats');

                // backwards compatible..
                if (!this.hands || this.hands.length == 0) {
                    this.randomizeEquipment();
                }

                var attack = {name: this.hands[0].name, no: 1, special: '',extra_dmg:''};

                //console.log('---- hands ----');
                //console.log(this.hands);
                //console.log('---- /hands ----');

                // determine attack bonus based on main hand
                // TODO: right now it is not possible to use a melee and ranged weapon together when dual wielding
                attack.bonus = this.calced('prof') + (this.hands[0].type == 'ranged' ? stats[1].mod : stats[0].mod);
                attack.type = this.hands[0].type;

                var martial_arts = false;
                for (var i=0; i<this.classes.length; i++) {
                    if (this.classes[i].name == 'Monk') {
                        martial_arts = true;
                    }
                }

                if (martial_arts) {
                    // for multiclass purposes we check if the weapon used is a monk weapon.
                    var found = false;
                    for (var i=0;i<DND.CLASSES[5].weapons.length; i++) {
                        if (DND.CLASSES[5].weapons[i].name == this.hands[0].name) {
                            found = true;
                            break;
                        }
                    }

                    // for monk weapons either dex or str can be used, whichever is higher.
                    if (found) {
                        var dex_or_str = (stats[1].mod > stats[0].mod ? stats[1].mod : stats[0].mod);
                    } else {
                        var dex_or_str = (this.hands[0].props.contains('Finesse') ? stats[1].mod : stats[0].mod);
                    }
                } else {
                    var dex_or_str = (this.hands[0].props.contains('Finesse') ? stats[1].mod : stats[0].mod);
                }
                if (this.hands[0].type == 'ranged' && !this.hands[0].props.contains('Finesse')) {
                    dex_or_str = 0;
                }


                // calculate main attack based on how the 'hands' are filled
                if (this.hands.length == 1 || this.hands[1].name == 'Shield') {
                    attack.damage = this.hands[0].damage+'+'+dex_or_str;
                } else if (this.hands.length == 2) {
                    attack.damage = this.hands[0].damage+'+'+dex_or_str;
                    attack.extra_dmg += '+'+this.hands[1].damage;
                    attack.name +=' + '+this.hands[1].name;
                }


                // add Extra Attacks
                for (var i=0; i<features.length; i++) {
                    var matches = features[i].match(/Extra Attack \(([0-9])\)/);
                    if (matches) {
                        attack.no += parseInt(matches[1]);
                    }
                }

                // add fighting style bonusses
                for (var j = 0; j < this.classes.length; j++) {
                    var cls = this.classes[j];
                    switch (cls.fighting_style) {
                        case 'Great Weapon Fighting':
                            // increase average damage..
                            break;
                        case 'Archery':
                            attack.bonus += 2;
                            break;
                        case 'Duelling':
                            attack.damage += '+2';
                            break;
                        case 'Two-Weapon Fighting':
                            attack.extra_dmg += '+'+dex_or_str;
                            break;
                    }
                }


                for (var j = 0; j < this.classes.length; j++) {
                    var cls = this.classes[j];

                    if (cls.name == 'Monk') {
                        var die = DND.CLASSES[5].martial_arts[cls.level-1];
                        attack.extra_dmg +=  '+1d' + die + '+' + dex_or_str;
                        attack.name += ' + Martial Arts';
                    } else if (cls.name == 'Rogue') {
                        // add sneak attack die
                        attack.extra_dmg += '+'+Math.floor(cls.level / 2) + 'd6';
                        attack.name += ' + Sneak Attack';
                    } else if (cls.name == 'Barbarian') {
                        var rage_dmg = DND.CLASSES[0].rage_damage[cls.level-1];
                        attack.damage += '+' + (stats[0].mod + rage_dmg); // barb gets bonus to damage
                        attack.name += ' + Rage';
                    }
                    // paladin divine smite...?
                }

                this.attacks = [];
                this.attacks.push(attack);

                var backup_weapon = this.weapons[this.weapons.length-1];
                var dex_or_str = (backup_weapon.props.contains('Finesse') ? stats[1].mod : stats[0].mod);
                if (backup_weapon.type == 'ranged' || !backup_weapon.props.contains('Finesse')) {
                    dex_or_str = 0;
                }

                this.attacks.push({
                    name: backup_weapon.name,
                    bonus: this.calced('prof')+(backup_weapon.type == 'ranged' ? stats[1].mod : stats[0].mod),
                    damage: backup_weapon.damage+(dex_or_str ? '+'+dex_or_str : ''),
                    no: attack.no,
                    type: backup_weapon.type,
                    special: ''
                });
                break;
            case 'features':
                var unarmored_def = 0;
                var features = [];
                var found = {};
                var class_config = this.calced('config').classes;
                for (var i = 0; i < this.classes.length; i++) {
                    var clsconfig = class_config[i];
                    for (var j = 0; j < this.classes[i].level; j++) {
                        for (var k = 0; k < clsconfig.features[j].length; k++) {
                            var feature = clsconfig.features[j][k];

                            if (feature.match(/^Unarmored Defense/)) {
                                unarmored_def++;
                                if (unarmored_def>1) {
                                    continue;
                                }
                            }

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

            // calculated CR based on hp, avg. damage and AC
            case 'cr':
                // get defensive CR
                var defcr;
                if (this.hp <= 6) {
                    defcr = 0;
                } else if (this.hp <= 35) {
                    defcr = 1/8;
                } else if (this.hp <= 49) {
                    defcr = 1/4
                } else if (this.hp <= 70) {
                    defcr = 1/2;
                } else if (this.hp <= 355) {
                    defcr = Math.floor((this.hp-71) / 15) + 1;
                } else {
                    defcr = Math.floor((this.hp-356) / 45) + 20;
                }

                // adjust defensive cr by ac for every 2 points of difference
                var cr_ac= [13,13,13,13,14,15,15,15,16,16,17,17,17,18,18,18,19];
                var defcr_ac = defcr < cr_ac.length ? cr_ac[Math.floor(defcr)] : 19;
                var diff = defcr_ac-this.ac;
                diff = diff < 0 ? -(Math.floor(-diff/2)) : Math.floor(diff/2);
                defcr -= diff;

                if (!this.attacks || !this.attacks[0]) {
                    this.calc('attacks');
                }


                // get offensive CR
                // first get attack with highest damage output
                var dmg = 0,
                    atk = this.attacks[0];
                console.log(atk);

                console.log(atk.damage);
                console.log(atk.extra_dmg);

                for (var i=0; i<this.attacks.length; i++) {
                    var tmp_atk = this.attacks[i];
                    tmp_atk.avgdmg = 0;
                    for (var j=0; j<tmp_atk.no; j++) {
                        tmp_atk.avgdmg += dieaverage(tmp_atk.damage);
                    }
                    if (tmp_atk.extra_dmg) {
                        tmp_atk.avgdmg += dieaverage(tmp_atk.extra_dmg);
                    }
                    if (tmp_atk.avgdmg > atk.avgdmg) {
                        atk = tmp_atk;
                    } else if (tmp_atk.avgdmg*.9 > atk.avgdmg && tmp_atk.bonus > atk.bonus) {
                        atk = tmp_atk;
                    }
                }
                delete tmp_atk;

                console.log(atk.avgdmg);

                var offcr = 0;
                if (atk.avgdmg <= 1) {
                    offcr = 0;
                } else if (atk.avgdmg <= 3) {
                    offcr = 1/8;
                } else if (atk.avgdmg <= 5) {
                    offcr = 1/4
                } else if (atk.avgdmg <= 8) {
                    offcr = 1/2;
                } else if (atk.avgdmg <= 122) {
                    console.log('test');
                    offcr = Math.floor((atk.avgdmg-9) / 6) + 1;
                } else {
                    offcr = Math.floor((atk.avgdmg-123) / 18) + 20;
                }

                console.log(offcr);

                // TODO: for a monk 1 / sorcerer 15, this would still determine it is a melee class..
                var caster_levels = 0,
                    highest_dc = 0;
                for (var i=0; i<this.classes.length; i++) {
                    var n = this.classes[i].name;
                    if (n == 'Bard' || n == 'Cleric' || n == 'Druid' || n == 'Sorcerer' || n == 'Wizard' || n == 'Warlock') {
                        caster_levels +=this.classes[i].level;

                        var tmp_highest_dc = this.classes[i].spelldc;
                        if (n == 'Warlock') {
                            tmp_highest_dc += this.calced('config').classes[i].spell_max_level[this.classes[i].level];
                        } else {
                            tmp_highest_dc += this.spells_day.length
                        }

                        if (tmp_highest_dc > highest_dc) {
                            highest_dc = tmp_highest_dc;
                        }

                    }
                }

                // determine spellcaster by having at least 3 times the amount of levels in spellcaster classes.
                if (caster_levels / 3 >= this.calced('level')-caster_levels) {
                    // adjust offensive CR for casters by spell DC

                    ;  // dcs from class are always without spell, so add the highest spell level

                    var cr_dc = [13,13,13,13,14,15,15,15,16,16,16,17,17,18,18,18,18,19,19,19,19,20,20,20,21,21,21,22,22,22,23];
                    console.log(Math.floor(offcr));
                    console.log(cr_dc[0]);
                    var offcr_dc = cr_dc[Math.floor(offcr)];
                    console.log(highest_dc);
                    console.log(offcr_dc);
                    var diff = Math.floor((offcr_dc - highest_dc) / 2);

                    console.log(diff);
                    // non-rules addition: highest spell level also determines cr
                    var offcr_spellcr = (this.spells_day.length * 2) - 1; // so level 5 spells is cr 9
                    diff -= Math.floor((offcr_spellcr - offcr)/2);
                    console.log(diff);

                } else {
                    // adjust offensive CR for non-casters by attack bonus
                    var cr_atk = [3, 3, 3, 4, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 8, 8, 9, 10, 10, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 13, 14];
                    var offcr_atk = cr_atk[Math.floor(offcr)];
                    var diff = (offcr_atk - atk.bonus);
                    diff = diff < 0 ? -(Math.floor(-diff/2)) : Math.floor(diff/2);
                }
                offcr -= diff;

                console.log(defcr);
                console.log(offcr);

                // now determine average cr;
                this.cr = ((defcr+offcr)/2);

                // for cr's of 1/2, 1/4 and 1/8 make sure the average is also one of these or 0.
                if (this.cr < 1) {
                    var tmpcr = Math.round(this.cr * 8);
                    if (tmpcr > 6) {
                        this.cr = 1;
                    } else if (tmpcr >= 3) {
                        this.cr = 1/2;
                    } else if (tmpcr >= 2) {
                        this.cr = 1/4;
                    } else if (tmpcr >= 1) {
                        this.cr = 1/8
                    } else {
                        this.cr = 0;
                    }

                } else {
                    this.cr = Math.round(this.cr);
                }
                console.log(this.cr);
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
                this.speed = this.config.race.speed + ' ft';
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
                    dexmod = this.stats[1].mod,
                    features = this.calced('features');
                ac += this.shield.ac;
                ac += this.armor.ac;

                // unarmored defense feature
                if (ac == 10 && (features.contains('Unarmored Defense (CON)') || features.contains('Unarmored Defense (WIS)'))) {
                    if (features.contains('Unarmored Defense (CON)')) {
                        ac += this.stats[2].mod;
                    } else if (features.contains('Unarmored Defense (WIS)')) {
                        ac += this.stats[4].mod;
                    }
                }

                // fighting style Defense gives extra AC
                for (var i =0; i<this.classes.length; i++) {
                    if (this.classes[i].fight_style == 'Defense') {
                        ac += 1;
                    }
                }

                ac += this.armor.maxdex > 0 && dexmod > this.armor.maxdex ? this.armor.maxdex : dexmod;
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
    console.log('recalculate');
    // define properties for performance reasons (instead of iterating all)
    var b = {
        'ac': this.ac,
        'hp': this.hp,
        'it': this.it,
        'cr': this.cr,
        'classes': this.classes.slice(),
        'prof': this.prof,
        'features': this.features.slice(),
        'saves': this.saves.slice() // copy array
    };
    this.calc(['ac', 'path', 'hp','it','cr','prof','saves', 'features', 'fighting_style']);

    // remove properties that haven't changed
    // TODO: doesn't show changed classes...
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
            } else {
                b[prop] = this[prop];
            }
        } else if (b[prop] == this[prop]) {
            delete b[prop];
        } else {
            b[prop] = this[prop];
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

NPCSchema.methods.randomizeLanguages = function () {
    var self = this,
        langs = DND.LANGUAGES.slice(),
        config = this.calced('config'); // copy array
    self.languages = [];

    function addLanguages(input) {
        for (var i = 0; i < input.length; i++) {
            if (input[i] == '*') {
                self.languages.push(langs.random());
            } else {
                var index = langs.indexOf(input[i]);
                if (index > -1) {
                    self.languages.push(langs.splice(index, 1));
                }
            }
        }
    }

    // class language
    for (var i = 0; i < config.classes.length; i++) {
        addLanguages(config.classes[i].languages || []);
    }

    // race language
    addLanguages(config.race.languages || []);

    // background language
    addLanguages(config.background.languages || []);
}

NPCSchema.methods.randomizeName = function () {
    var config = this.calced('config');
    var names = config.race.names,
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
    if (typeof config.race.spells != 'undefined') {
        racespells = JSON.parse(JSON.stringify(config.race.spells));
        if (racespells.length > 1) {
            racespells.splice(Math.floor(this.level / 2) + 2);
        }
        for (var j = 0; j < racespells.length; j++) {
            for (var k = 0; k < racespells[j].length; k++) {
                if (racespells[j][k] == '*wizard*') {
                    var choices = DND.CLASSES[11].spells[0];
                    var random = Math.floor(Math.random() * choices.length);
                    console.log(choices[random]);
                    racespells[j][k] = choices[random];
                }
                this.race.spells.push(racespells[j][k]);
            }
        }
        this.race.spelldc = stats[this.config.race.spellstat].mod + 8;
    }

    // init some class stuff
    for (var i=0; i<this.classes.length; i++) {
        var n = this.classes[i].name,
            p = this.classes[i].path,
            clsconfig = config.classes[i];
        if (n == 'Warlock' || n == 'Bard' || n == 'Cleric' || n == 'Druid' || n == 'Sorcerer' || n == 'Wizard' || n == 'Paladin' || n == 'Ranger' || (n == 'Fighter' && p == 'Eldritch Knight') || (n == 'Rogue' && p == 'Arcane Trickster')) {
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
        var n = this.classes[caster_cls_key].name,
            p = this.classes[caster_cls_key].path,
            lvl = this.classes[caster_cls_key].level;
        if (n == 'Bard' || n == 'Cleric' || n == 'Druid' || n == 'Sorcerer' || n == 'Wizard') {
            this.spells_day = DND.spells_day_full[lvl-1];
        }
        if ((n == 'Paladin' && lvl > 1)|| (n == 'Ranger' && lvl > 1) || (n == 'Fighter' && p == 'Eldritch Knight' && lvl > 2) || (n == 'Rogue' && p == 'Arcane Trickster' && lvl > 2)) {
            this.spells_day = DND.spells_day_half[lvl-1];
        }
        if (n == 'Warlock') {
            this.pactmagic_slots = config.classes[caster_cls_key].spell_slots[lvl];
        }

    } else {
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
            if (n == 'Warlock') {
                this.pactmagic_slots = config.classes[i].spell_slots[lvl];
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
            spells_day = DND.spells_day_full[lvl-1];
            maxhighest = lvl/2 == Math.floor(lvl/2) ? 4 : 2;
            total_spells = stats[clsconfig.spellstat].mod + lvl;
        } else if ((n == 'Paladin' && lvl > 1)|| (n == 'Ranger' && lvl > 1) || (n == 'Fighter' && p == 'Eldritch Knight' && lvl > 2) || (n == 'Rogue' && p == 'Arcane Trickster' && lvl > 2)) {
            maxhighest = 2 + (((lvl - 1) % 4) * 2);
            total_spells = stats[clsconfig.spellstat].mod + Math.floor(lvl / 2);
            spells_day = DND.spells_day_half[lvl-1];
        } else if (n == 'Warlock') {
            maxhighest = lvl/2 == Math.floor(lvl/2) ? 4 : 2; // we could go higher.. but 4 is already ALL level 5 spells..
        } else {
            continue;
        }

        // overwrite total_spells (prepared) by spells known for spontaneous casters
        if (clsconfig.spells_known && clsconfig.spells_known.length > 0) {
            total_spells = clsconfig.spells_known[lvl];
        }

        if (total_spells < 1)
            total_spells = 1;

        var choices = JSON.parse(JSON.stringify(clsconfig.spells)); // note: using JSON trick to deep-copy array.
        choices = choices.splice(1); // remove cantrips

        var highest_spell_level = n=='Warlock' ? clsconfig.spell_slots[lvl] : spells_day.length;

        for (var j=0; j<total_spells; j++) {
            // warlock is the only caster that has a different system

            //console.log(choices);
            if (j < maxhighest) {
                var choice = choices[highest_spell_level-1].splice(Math.floor(Math.random() * choices[highest_spell_level-1].length), 1);
                this.classes[i].spells.push(choice);
            } else {
                var max = highest_spell_level - 2;
                if (max < 0) { max = 0; }
                var splvl = Math.floor(Math.random() * max);
                // try again in case we already chose ALL spells from this level
                while (true) {
                    if (choices[splvl].length > 0) {
                        break;
                    }
                    splvl = Math.floor(Math.random() * max);
                }
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

    if (!level) {
        console.log('randomizing level');
        level = Math.floor((Math.random() * Math.random()) * 20) + 1;
    } else if (level[1] == '-') {
        level = Math.floor((Math.random()) * (level[2]-level[0])) + parseInt(level[0]);
    } // else level=level

    var index = class_names.indexOf(name);
    if (index > -1) {
        this.classes[0].level = level;
        return;
    }

    this.classes = [];
    var classes = multiclass ? 1 : (1 + Math.round(Math.random()*Math.random()) + Math.round(Math.random()*Math.random())); // 1, 2 or 3
    for (var i=classes; i>0; i--) {
        var random = Math.floor(Math.random()*class_names.length);
        var clslvl = i==1 ? level : Math.floor((Math.random())*(level-i))+1;
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
            styles = clsconfig.fighting_styles,
            p = Math.floor(Math.random()*paths.length);
        this.classes[i].path = paths[p];
        if (typeof styles != 'undefined' && styles.length > 0) {
            var f =  Math.floor(Math.random()*styles.length);
            this.classes[i].fighting_style = styles[f];
        }
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
    this.race = {name: subraces.length > 0 ? subraces[Math.floor(Math.random() * subraces.length)].name : DND.RACES[r].name};
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

NPCSchema.methods.randomizeBackgroundStuff = function (part) {

    for (var k = 0; k < DND.BACKGROUNDS.length; k++) {
        if (DND.BACKGROUNDS[k].name == this.background.name) {
            break;
        }
    }

    var
        rand = {
            s: DND.BACKGROUNDS[k].specialities.length > 0 ? Math.floor(Math.random() * DND.BACKGROUNDS[k].specialities.length) : null,
            p: Math.floor(Math.random() * DND.BACKGROUNDS[k].personalities.length),
            i: Math.floor(Math.random() * DND.BACKGROUNDS[k].ideals.length),
            b: Math.floor(Math.random() * DND.BACKGROUNDS[k].bonds.length),
            f: Math.floor(Math.random() * DND.BACKGROUNDS[k].flaws.length)
        }

    if (part) {
        var bgArrKey = part.substr(-1) == 'y' ? part.substr(0,part.length-1)+'ies' : part + 's';
        this.background[part] = DND.BACKGROUNDS[k][bgArrKey][rand[part[0]]];
        return;
    }

    this.background = {
        key: k,
        name: DND.BACKGROUNDS[k].name,
        speciality: rand.s !== null ? DND.BACKGROUNDS[k].specialities[rand.s] : null,
        personality: DND.BACKGROUNDS[k].personalities[rand.p],
        ideal: DND.BACKGROUNDS[k].ideals[rand.i],
        bond: DND.BACKGROUNDS[k].bonds[rand.b],
        flaw: DND.BACKGROUNDS[k].flaws[rand.f]
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

    //console.log('------ stats -------')
    //console.log(this.stats);
    //console.log('------ /stats -------')
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

    // 3. add random skill from class list
    var skills = config.classes[0].skills.slice(); // copy array

    // remove skills that are already chosen
    removeExistingSkills(skills);

    // actually choose class skills
    for (var i=0; i < this.config.classes[0].skillsno; i++) {
        var random = Math.floor(Math.random() * skills.length);
        addSkill(skills[random]);
        skills.splice(random, 1);
    }

    // 4. add additional random skill for multiclass rogue/ranger/bard
    for (var i = 1; i < this.classes.length; i++) {
        if (this.classes[i].name == 'Rogue' || this.classes[i].name == 'Bard' || this.classes[i].name == 'Ranger') {
            var skills = config.classes[i].skills;
            removeExistingSkills(skills);
            if (skills.length == 0)
                return;

            var random = Math.floor(Math.random() * skills.length);
            addSkill(skills[random]);
        }
    }

    //console.log('------ skills ------');
    //console.log(this.skills);
    //console.log('------ /skills ------');
}

NPCSchema.methods.randomizeEquipment = function () {
    this.weapons = [];
    var config = this.calced('config'),
        stats = this.calced('stats'),
        armors = config.armors.slice(),
        weapons = config.weapons.slice(),
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
        if (Math.random() < .3) {
            this.shield = DND.ARMORS[armors[index]];
        }
        armors.splice(index, 1);
    }

    var npcarmor = {name: '-', ac: 0, maxdex: -1, minstr: 0};
    var dexmod = stats[1].mod;

    // barbarian with enough con doesn't need armor
    if (features.contains('Unarmored Defense (CON)') && stats[2].mod >= 3) {
        // although at higher levels chances are bigger he does have an armor
        if (Math.random() > (this.level/10 >(10-stats[2].mod)/10 ?(10-stats[2].mod)/10 : this.level/10)) {
            armors = []; // reset armors to skip and simply keep unarmored
        }
    }

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
    this.armor = npcarmor;

    // prepare choices in grouped arrays
    var s1hmelee = [], s2hmelee = [], m1hmelee = [], m2hmelee = [], s1hranged = [], s2hranged = [], m1hranged = [], m2hranged = [];
    for (var i = 0; i < weapons.length; i++) {
        var wep = DND.WEAPONS[weapons[i]];
        if (wep.type == 'melee') {
            if (wep.complexity == 'simple') {
                if (wep.hands == 1) {
                    for (var j = 0; j < wep.pickchance; j++) {
                        s1hmelee.push(weapons[i]);
                    }
                }
                if (wep.hands == 2 || wep.props.contains(/^Versatile/)) {
                    for (var j = 0; j < wep.pickchance; j++) {
                        s2hmelee.push(weapons[i]);
                    }
                }
            } else {
                if (wep.hands == 1) {
                    for (var j = 0; j < wep.pickchance; j++) {
                        m1hmelee.push(weapons[i]);
                    }
                }
                if (wep.hands == 2 || wep.props.contains(/^Versatile/)) {
                    for (var j = 0; j < wep.pickchance; j++) {
                        m2hmelee.push(weapons[i]);
                    }
                }
            }
        } else {
            if (wep.complexity == 'simple') {
                if (wep.hands == 1) {
                    for (var j = 0; j < wep.pickchance; j++) {
                        s1hranged.push(weapons[i]);
                    }
                } else {
                    for (var j = 0; j < wep.pickchance; j++) {
                        s2hranged.push(weapons[i]);
                    }
                }
            } else {
                if (wep.hands == 1) {
                    for (var j = 0; j < wep.pickchance; j++) {
                        m1hranged.push(weapons[i]);
                    }
                } else {
                    for (var j = 0; j < wep.pickchance; j++) {
                        m2hranged.push(weapons[i]);
                    }
                }
            }
        }
    }
    /*
    console.log('-------- weapons --------');
    console.log(s2hmelee);
    console.log(s1hmelee);
    console.log(m2hmelee);
    console.log(m1hmelee);
    console.log(s2hranged);
    console.log(s1hranged);
    console.log(m2hranged);
    console.log(m1hranged);
    console.log('-------- /weapons --------');
    */

    var fighting_style = null;
    var martial_arts = false;
    for (var i=0; i<this.classes.length; i++) {
        if (this.classes[i].name == 'Monk') {
            martial_arts = true;
        }
        if (this.classes[i].fighting_style != '') {
            fighting_style = this.classes[i].fighting_style;
            console.log(fighting_style);
            break;
        }
    }

    // even for non-fighting-style chars, choose a fighting style for their main weapon usage
    // also weapon-style Defense doesn't tell us much, so choose something else as far as weapons are concerned.
    if (fighting_style == null || fighting_style == 'Defense') {
        if (this.shield.ac > 0) {
            fighting_style = 'Protection';
        } else {
            // Duelling is actually not really a 'strong' choice, but even so many casters choose it..
            var choices = ['Dueling'];

            // add great weapon fighting when str >= dex
            if (stats[0].mod >= stats[1].mod) {
                choices.push('Great Weapon Fighting');
            }

            // add archery when dex >= str
            if (stats[1].mod >= stats[0].mod) {
                choices.push('Archery');
                choices.push('Two-Weapon Fighting');
            }
            if (martial_arts) {
                choices.push('Unarmed');
            }

            fighting_style = choices.random();

        }
    }

    console.log('fighting_style: ');
    console.log(fighting_style);

    var finesse_weapons = [];
    for (var j=0; j<m1hmelee.length; j++) {
        if (DND.WEAPONS[m1hmelee[j]].props.contains('Finesse')) {
            finesse_weapons.push(m1hmelee[j]);
        }
    }
    if (finesse_weapons.length == 0) {
        for (var j=0; j<s1hmelee.length; j++) {
            if (DND.WEAPONS[s1hmelee[j]].props.contains('Finesse')) {
                finesse_weapons.push(s1hmelee[j]);
            }
        }
    }

    var non_finesse = [];
    for (var j=0; j<m1hmelee.length; j++) {
        if (!finesse_weapons.contains(m1hmelee[j])) {
            non_finesse.push(m1hmelee[j]);
        }
    }
    if (non_finesse.length == 0) {
        for (var j=0; j<s1hmelee.length; j++) {
            if (!finesse_weapons.contains(s1hmelee[j])) {
                non_finesse.push(s1hmelee[j]);
            }
        }
    }

    this.hands = [];
    switch (fighting_style) {
        case 'Great Weapon Fighting':
            this.shield = {name: '-', ac: 0}; // reset shield
            if (m2hmelee.length > 0) {
                var index = m2hmelee.random();
            } else {
                var index = s2hmelee.random();
            }

            var weapon = DND.WEAPONS[index];
            this.hands.push(weapon);
            this.weapons.push(DND.WEAPONS[index])
            break;
        case 'Archery':
            this.shield = {name: '-', ac: 0}; // reset shield

            if (m2hranged.length > 0) {
                var index = m2hranged.random();
            } else if (s2hranged.length > 0) {
                var index = s2hranged.random();
            } else if (m1hranged.length > 0) {
                var index = m1hranged.random();
            } else {
                var index = s1hranged.random();
            }
            this.hands.push(DND.WEAPONS[index]);
            this.weapons.push(DND.WEAPONS[index])
            break;
        case 'Dueling':
            this.shield = {name: '-', ac: 0}; // reset shield

            if (stats[0].mod >= stats[1].mod) {
                var index = non_finesse.random();
            } else {
                var index = finesse_weapons.random();
            }

            var weapon = DND.WEAPONS[index];
            this.hands.push(weapon);
            this.weapons.push(weapon)
            break;
        case 'Protection':
            if (stats[0].mod >= stats[1].mod) {
                var index = non_finesse.random();
            } else {
                var index = finesse_weapons.random();
            }

            this.hands.push(DND.WEAPONS[index]);
            //this.hands.push({'name': 'Shield','props':[]});
            this.weapons.push(DND.WEAPONS[index]);
            // add shield if none
            if (this.shield.ac == 0) {
                var index = config.armors.indexOf(12),
                    armors = this.calced('config').armors;
                if (index > -1) {
                    this.shield = DND.ARMORS[armors[index]];
                }
            }
            break;
        case 'Two-Weapon Fighting':
            this.shield = {name: '-', ac: 0}; // reset shield

            if (stats[1].mod >= stats[0].mod) {
                // 10% chance on dual-wielding two hand crossbows
                if (Math.random() < .1) {
                    this.weapons.push(DND.WEAPONS[34]);
                    this.hands.push(DND.WEAPONS[34]);
                    this.weapons.push(DND.WEAPONS[34]);
                    this.hands.push(DND.WEAPONS[34]);
                    break;
                }

                weaps = finesse_weapons;
            } else {
                weaps = non_finesse;
            }

            console.log(weaps);

            var light_weapons = [];
            for (var j=0; j<weaps.length; j++) {
                if (DND.WEAPONS[weaps[j]].props.contains('Light')) {
                    light_weapons.push(weaps[j]);
                }
            }
            console.log(light_weapons);

            var index = weaps.random();
            this.weapons.push(DND.WEAPONS[index]);
            this.hands.push(DND.WEAPONS[index]);
            if (Math.random() < .3 && light_weapons.length > 0) { // 30% chance to have the same weapon in both hands
                var index = light_weapons.random();
            }
            this.weapons.push(DND.WEAPONS[index]);
            this.hands.push(DND.WEAPONS[index]);
            break;
        case 'Unarmed':
            for (var i=0; i<this.classes.length; i++) {
                if (this.classes[i].name == 'Monk') {
                    var die = DND.CLASSES[5].martial_arts[this.classes[i].level-1];
                    break;
                }
            }
            var weapon = {name: 'Unarmed strike', 'damage': '1d'+die, 'type':'melee','props':[]};
            this.weapons.push(weapon);
            this.hands.push(weapon);

            break;
        default:
            throw Error('Fighting style: '+fighting_style+' not found');
    }

    if (this.hands.length == 0) {
        throw Error('Hands can not be empty..?');
    }

    // add backup weapon
    if (fighting_style == 'Archery') {
        if (m2hmelee.length > 0) {
            var index = m2hmelee.random();
        } else if (s2hmelee.length > 0) {
            var index = s2hmelee.random();
        } else if (m1hmelee.length > 0) {
            var index = m1hmelee.random();
        } else {
            var index = s1hmelee.random();
        }
        this.weapons.push(DND.WEAPONS[index]);
    } else {
        if (m2hranged.length > 0) {
            var index = m2hranged.random();
        } else if (s2hranged.length > 0) {
            var index = s2hranged.random();
        } else if (m1hranged.length > 0) {
            var index = m1hranged.random();
        } else {
            var index = s1hranged.random();
        }
        this.weapons.push(DND.WEAPONS[index]);
    }

    console.log(this.weapons);
}

module.exports = mongoose.model('NPC', NPCSchema);