var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var NPC = require('../models/npc.js');
var DND = require('../models/dnd.js');

function recalculate(npc) {

}

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
    var npc = NPC.findById(req.params.id, function (err, npc) {
        if (err) return next(err);

        npc.classes = req.body.classes;
        npc.race = req.body.race;
        npc.calc('config');

        switch (req.query.type) {
            case 'all':
                npc.randomizeAll();
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
                npc.randomizeBackground();
                break;
        }
        npc.recalculate();
        console.log(npc.race);
        npc.save();
        console.log(npc.race);
        res.json(npc);
    });
});


module.exports = router;
