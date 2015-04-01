var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Spell = require('../models/spell.js');

/* GET NPC listing. */
router.get('/', function(req, res, next) {
    Spell.find(function (err, spells) {
        if (err) return next(err);
        res.json(spells);
    })
});

router.get('/:name', function(req, res, next) {
    Spell.findOne({name: req.params.name}, function (err, spell) {
        if (err) return next(err);
        res.json(spell);
    })
});


module.exports = router;
