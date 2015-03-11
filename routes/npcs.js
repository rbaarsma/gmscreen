var express = require('express');
var router = express.Router();
var fs = require('fs');
var multiparty = require('multiparty');
var mongoose = require('mongoose');
var NPC = require('../models/npc.js');
var spell = require('../models/spell.js');
var Picture = require('../models/picture.js');

/* GET NPC listing. */
router.get('/', function(req, res, next) {
    NPC.find(function (err, npcs) {
        if (err) return next(err);

        for (var i=0; i<npcs.length; i++) {
            npcs[i].save();
        }

        res.json(npcs);
    })
});

/* POST new NPC */
router.post('/', function (req, res, next) {
    NPC.create(req.body, function (err, npc) {
        if (err) return next(err);

        if (!npc.race)
            npc.randomizeRace();
        if (!npc.classes[0].name || !npc.classes[0].level)
            npc.randomizeClasses(!!req.body.multiclass, npc.classes[0].name, npc.classes[0].level);
        if (!npc.background || !npc.background.name)
            npc.randomizeBackground();
        if (!npc.gender)
            npc.randomizeGender();
        if (!npc.name)
            npc.randomizeName();

        npc.randomizePath();
        npc.randomizeBackgroundStuff();
        npc.randomizeAlignment();
        npc.randomizeStats();
        npc.randomizeSkills();
        npc.randomizeEquipment();

        npc.calc(['features', 'attacks', 'sections']);

        npc.recalculate();

        npc.save();
        res.json(npc);
    });
});

/* GET NPC by id */
router.get('/:id', function(req, res, next) {
    NPC.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PATCH edit NPC by id */
router.patch('/:id', function (req, res, next) {
    NPC.findByIdAndUpdate(req.params.id, req.body, function (err, npc) {
        if (err) return next(err);
        var changes = npc.recalculate();
        npc.save();
        res.json(changes);
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
router.post('/:id/randomize', function(req, res, next) {
    var npc = NPC.findByIdAndUpdate(req.params.id, req.body, function (err, npc) {
        if (err) return next(err);

        var changed = {};
        //npc.calc('config');
        switch (req.query.type) {
            case 'all':
                npc.randomizeAll();
                changed = npc;
                break;
            case 'base':
                console.log('randomize base');
                npc.randomizeBase();
                npc.calc('config');
                npc.randomizeSpells();
                npc.randomizeSkills();
                npc.calc(['features']);
                var changed = npc.recalculate();
                changed.classes = npc.classes;
                changed.features = npc.features;
                changed.race = npc.race;
                changed.spells_day = npc.spells_day;
                changed.path = npc.path;
                changed.level = npc.level;
                break;
            case 'name':
                npc.randomizeName();
                npc.randomizeGender();
                // npc.randomizeAppearance
                changed = {name: npc.name, gender: npc.gender};
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
                var changed = npc.recalculate();
                changed.armor = npc.armor;
                changed.weapons = npc.weapons;
                npc.calc('attacks');
                changed.attacks = npc.attacks;
                break;
            case 'background':
                npc.randomizeBackgroundStuff();
                changed = {background: npc.background};
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

        console.log(changed);

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

router.get('/:id/picture', function(req, res, next) {
    NPC.findById(req.params.id, '_picture_id', function (err, npc) {
        if (err) return next(err);
        Picture.findById(npc._picture_id, function (err, pic) {
            res.contentType(pic.content_type);
            res.send(pic.data);
        });
    });
});

module.exports = router;
