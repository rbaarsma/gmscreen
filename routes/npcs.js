var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var NPC = require('../models/npc.js');

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
    console.log(req.body);
    NPC.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        console.log(err);
        if (err) return next(err);
        console.log(post);
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
    STATNAMES = ['STR','DEX','CON','INT','WIS','CHA'];

    // randomize stats
    var stats = [];
    for (var j=0; j<6; j++) {
        var rolls = [];
        for (var i=0; i<4; i++) {
            rolls[i] = Math.floor(Math.random() * 6) + 1;
        }
        var lowest = 0;
        for (var i=1; i<4; i++) {
            if (rolls[i] < rolls[lowest]) {
                lowest = i;
            }
        }
        rolls.splice(lowest, 1);

        var stat = 0;
        for (var i=0; i<3; i++) {
            stat += rolls[i]
        }

        stats.push({
            'name': STATNAMES[j],
            'stat': stat,
            'mod': Math.floor(stat/2)-5
        });
    }

    NPC.findOneAndUpdate({'_id': req.params.id}, {'stats': stats}, function (err, npc) {
        if (err) return next(err);

        console.log('test');
        console.log(err);
        console.log(npc);

        res.json(npc);
    });
});


module.exports = router;
