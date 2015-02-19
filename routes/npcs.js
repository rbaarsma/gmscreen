var express = require('express');
var router = express.Router();
var fs = require('fs');
var multiparty = require('multiparty');
var mongoose = require('mongoose');
var NPC = require('../models/npc.js');
var Picture = require('../models/picture.js');

function recalculate(npc) {

}

/* GET NPC listing. */
router.get('/', function(req, res, next) {
    NPC.find(function (err, npcs) {
        if (err) return next(err);

        /*
        for (var i=0; i<npcs.length; i++) {
            npcs[i].sections = [];
            npcs[i].calc(['sections']);
            npcs[i].save();
        }
        */

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
        npc.recalculate();
        npc.save();
        res.json(npc);
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

        npc.calc('config');
        switch (req.query.type) {
            case 'all':
                npc.randomizeAll();
                break;
            case 'base':
                npc.randomizeBase();
                break;
            case 'stats':
                npc.randomizeStats();
                break;
            case 'skills':
                npc.randomizeSkills();
                break;
            case 'equipment':
                npc.randomizeEquipment();
                break;
            case 'background':
                npc.randomizeBackgroundStuff();
                break;
            case 'features':
                npc.calc('features');
                break;
            case 'attacks':
                npc.calc('attacks');
                break;
        }
        npc.recalculate();
        console.log(npc.race);
        npc.save();
        console.log(npc.race);
        res.json(npc);
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
