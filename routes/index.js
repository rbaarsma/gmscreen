var express = require('express');
var router = express.Router();
var DND = require('../models/dnd.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/config', function(req, res, next) {
    var config = {
        CLASSES: [],
        SKILLS: [],
        RACES: []
    };

    for (var i=0; i<DND.CLASSES.length; i++)
        config.CLASSES.push({name: DND.CLASSES[i].name, hd: DND.CLASSES[i].hd});
    for (var i=0; i<DND.SKILLS.length; i++)
        config.SKILLS.push({name: DND.SKILLS[i].name, stat: DND.SKILLS[i].stat});
    for (var i=0; i<DND.RACES.length; i++)
        config.RACES.push({name: DND.RACES[i].name});

    res.json(config);
});

console.log('test');

module.exports = router;
