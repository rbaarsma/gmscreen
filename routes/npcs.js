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
router.post('/', function (req, res, next) {
    NPC.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE NPC by id */
router.delete('/:id', function(req, res, next) {
    NPC.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

module.exports = router;
