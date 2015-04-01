var express = require('express');
var router = express.Router();
var fs = require('fs');
var multiparty = require('multiparty');
var mongoose = require('mongoose');
var passport = require('passport');

var User = require('../models/user.js');
var NPC = require('../models/npc.js');
var spell = require('../models/spell.js');
var Picture = require('../models/picture.js');

// TODO put somewhere in shared file
function checkAuth (req, res, next) {
    if (!req.user || !req.user._id) {
        res.statusCode(400);
        res.json({});
    } else {
        next();
    }
}

/* GET NPC listing. */
router.get('/', checkAuth, function(req, res, next) {
    NPC.find({_user_id: req.user._id}, function (err, npcs) {
        if (err) return next(err);

        for (var i=0; i<npcs.length; i++) {
            //npcs[i]._user_id = req.user._id;
            npcs[i].save();
        }

        res.json(npcs);
    })
});

/* POST new NPC */
router.post('/', checkAuth, function (req, res, next) {
    if (req.body.classes[0].level[1] == '-') {
        var level = req.body.classes[0].level;
        req.body.classes[0].level = 1;
    }

    NPC.create(req.body, function (err, npc) {
        if (err) return next(err);

        npc._user_id = req.user._id;

        if (!npc.race || !npc.race.name)
            npc.randomizeRace();
        if (!npc.classes[0].name || !npc.classes[0].level)
            npc.randomizeClasses(!!req.body.multiclass, npc.classes[0].name, level);
        if (!npc.background || !npc.background.name)
            npc.randomizeBackground();
        console.log(npc.gender);
        if (!npc.gender)
            npc.randomizeGender();
        console.log(npc.gender);
        if (!npc.name)
            npc.randomizeName();

        npc.randomizePath();
        npc.randomizeBackgroundStuff();

        if (!npc.alignment)
            npc.randomizeAlignment();

        npc.randomizeStats();
        npc.randomizeSkills();
        npc.randomizeEquipment();
        npc.randomizeSpells();
        npc.randomizeLanguages();

        npc.calc(['features', 'attacks']);

        npc.recalculate();

        npc.save();
        res.json(npc);
    });
});

/* GET NPC by id */
router.get('/:id', checkAuth, function(req, res, next) {
    NPC.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PATCH edit NPC by id */
router.patch('/:id', checkAuth, function (req, res, next) {
    NPC.findByIdAndUpdate(req.params.id, req.body, function (err, npc) {
        if (err) return next(err);

        var recalculate = false;
        for (var prop in req.body) {
            if (prop == 'stats' || prop == 'race' || prop == 'class' || prop == 'armor' || prop == 'shield' || prop == 'weapons') {
                recalculate = true;
                break;
            }
        }

        var changes = recalculate ? npc.recalculate() : {};
        npc.save();
        res.json(changes);
    });
});

/* DELETE by id */
router.delete('/:id', checkAuth, function(req, res, next) {
    NPC.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* generate by id */
router.post('/:id/randomize', checkAuth, function(req, res, next) {
    var npc = NPC.findByIdAndUpdate(req.params.id, req.body, function (err, npc) {
        if (err) return next(err);

        var recalculate = false;
        for (var prop in req.body) {
            if (prop == 'stats' || prop == 'race' || prop == 'class' || prop == 'armor' || prop == 'shield' || prop == 'weapons') {
                recalculate = true;
                break;
            }
        }

        var changed = recalculate ? npc.recalculate() : {};
        
        //npc.calc('config');
        switch (req.query.type) {
            case 'all':
                npc.randomizeAll();
                changed = npc;
                break;
            case 'calculated':
                changed = npc.recalculate();
                break;
            case 'base':
                console.log('randomize base');
                npc.randomizeBase();
                npc.calc('config');
                npc.randomizeSpells();
                npc.randomizeSkills();
                npc.calc(['features']);
                changed = npc.recalculate();
                changed.classes = npc.classes;
                changed.features = npc.features;
                changed.race = npc.race;
                changed.spells_day = npc.spells_day;
                changed.path = npc.path;
                changed.level = npc.level;
                break;
            case 'race':
                npc.randomizeRace();
                changed = {race: npc.race};
                break;
            case 'gender':
                npc.randomizeGender();
                changed = {gender: npc.gender};
                break;
            case 'name':
                npc.randomizeName();
                changed = {name: npc.name};
                break;
            case 'alignment':
                npc.randomizeAlignment();
                changed = {alignment: npc.alignment};
                break;
            case 'stats':
                npc.randomizeStats();
                var changed = npc.recalculate();
                changed.stats = npc.stats;
                break;
            case 'skills':
                npc.randomizeSkills();
                changed = {skills: npc.skills};
                break;
            case 'equipment':
                npc.randomizeEquipment();
                npc.calc('attacks');
                var changed = npc.recalculate();
                changed.armor = npc.armor;
                changed.shield = npc.shield;
                changed.weapons = npc.weapons;
                changed.attacks = npc.attacks;
                break;
            case 'background':
                npc.randomizeBackgroundStuff();
                changed = {background: npc.background};
                break;
            case 'bg-speciality':
            case 'bg-personality':
            case 'bg-ideal':
            case 'bg-bond':
            case 'bg-flaw':
                var part = req.query.type.substr(3);
                npc.randomizeBackgroundStuff(part);
                changed = {background: npc.background};
                console.log(changed);
                break;
            case 'languages':
                npc.randomizeLanguages();
                changed = {languages: npc.languages};
                break;
            case 'spells':
                npc.randomizeSpells();
                changed = {classes: npc.classes, race: npc.race, spells_day: npc.spells_day};
                break;
            case 'features':
                npc.calc('features');
                changed = {features: npc.features};
                break;
            case 'attacks':
                npc.calc('attacks');
                changed = {attacks: npc.attacks};
                break;
        }

        npc.save();
        res.json(changed);
    });
});

router.post('/:id/picture', function(req, res, next) {
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        var file = files.file[0];

        var pic = new Picture({
            'name': file.name,
            'data': fs.readFileSync(file.path),
            'content_type': file.headers['content-type']
        });
        pic.save();

        NPC.findByIdAndUpdate(req.params.id, {'_picture_id': pic._id}, function (err, npc) {
            if (err) return next(err);
            res.json({_picture_id: pic._id});
        });


    });
});

router.get('/:id/picture', checkAuth, function(req, res, next) {
    NPC.findById(req.params.id, '_picture_id', function (err, npc) {
        if (err) return next(err);
        Picture.findById(npc._picture_id, function (err, pic) {
            res.contentType(pic.content_type);
            res.send(pic.data);
        });
    });
});

module.exports = router;
