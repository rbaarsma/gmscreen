var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var NPC = require('../models/npc.js');
var DND = require('../models/dnd.js');

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

/* GET NPC listing. */
router.get('/', function(req, res, next) {
    NPC.find(function (err, npcs) {
        if (err) return next(err);
        res.json(npcs);
    })
});

/* POST new NPC */
router.post('/', function (req, res, next) {
    NPC.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET NPC by id */
router.get('/:id', function(req, res, next) {
    NPC.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* POST edit NPC by id */
router.patch('/:id', function (req, res, next) {
    NPC.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE by id */
router.delete('/:id', function(req, res, next) {
    NPC.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* generate by id */
router.post('/:id/generate', function(req, res, next) {
    var npc = req.body;

    npc.lvl = 0;

    // save shortcut to class config, to prevent this loop every time
    for (var i=0; i<npc.classes.length; i++) {
        for (var j=0; j<DND.CLASSES.length; j++) {
            if (DND.CLASSES[j].name == npc.classes[i].name) {
                npc.classes[i].key = j;
                npc.classes[i].hd = DND.CLASSES[j].hd;
                npc.lvl = npc.lvl + npc.classes[i].level;
            }
        }
    }

    npc.prof = Math.floor(npc.lvl/5) + 2;

    // randomize stats
    npc.stats = [];
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

        npc.stats.push({
            'name': DND.STATNAMES[j],
            'stat': stat,
            'mod': Math.floor(stat / 2) - 5
        });
    }

    var dexmod = npc.stats[1].mod;

    // randomize skills
    npc.skills = [];
    var class_config = DND.CLASSES[npc.classes[0].key],
        skills = class_config.skills.slice(); // copy array
    for (var i = 0; i < class_config.skillsno; i++) {
        var random = Math.floor(Math.random()*skills.length),
            key = skills[random],
            skill = DND.SKILLS[key];
        skill.key = key;
        skill.mod = npc.stats[skill.stat].mod + npc.prof;
        npc.skills.push(skill);
        skills.splice(random, 1);
    }

    // randomize armor & weapons
    npc.weapons = [];
    var armors = [],
        weapons = [];

    for (var i=0; i<npc.classes.length; i++) {
        var class_config = DND.CLASSES[npc.classes[i].key];
        armors = armors.concat(class_config.armors);
        weapons = weapons.concat(class_config.weapons);

    }
    armors = armors.unique();
    weapons = weapons.unique();
    armors.sort(function (a,b) {return a-b;});
    weapons.sort(function (a,b) {return a-b;});

    // contains shield?
    var index = armors.indexOf(12);
    npc.armors = [];
    if (index) {
        // add shield?
        if (Math.random() > .5)
            npc.armors.push(DND.ARMORS[armors[index]]);
        armors.splice(index, 1);
    }

    var npcarmor = null
    // search for suitable armor, prefer best
    for (i=armors.length-1; i>0; i--) {
        var armor = DND.ARMORS[armors[i]];
        if (npc.lvl == 1 && armor.cost > 50) {
            continue;
        }
        if (npc.lvl == 2 && armor.cost > 200) {
            continue;
        }
        if (npc.lvl == 3 && armor.cost > 1000) {
            continue;
        }
        if (armor.maxdex > -1 && dexmod > 0 && dexmod - armor.maxdex >= 2) {
            continue;
        }
        if (armor.minstr == -1 || armor.minstr <= npc.stats[0].stat) {
            // 20% chance to not have the best
            if (Math.random() > .8)
                continue;

            npcarmor = armor;
            break;
        }
    }
    if (npcarmor !== null)
        npc.armors.push(npcarmor);

    var melee = null, ranged = null;
    while (melee == null || ranged == null) {
        var i = Math.floor(Math.random() * weapons.length);

        var k = weapons[i];
        if (weapons.length > 14 && k < 15) {
            weapons.splice(i,1);
            continue;
        }

        var w = DND.WEAPONS[k];
        if (npc.armors[0].name == 'Shield') {
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
    npc.weapons = [melee, ranged];

    NPC.findOneAndUpdate({'_id': req.params.id}, npc, function (err, npc) {
        if (err) return next(err);
        res.json(npc);
    });
});


module.exports = router;
