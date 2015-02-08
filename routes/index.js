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
        RACES: [],
        BACKGROUNDS: [],
        ALIGNMENTS: DND.ALIGNMENTS
    };

    for (var i=0; i<DND.CLASSES.length; i++)
        config.CLASSES.push({name: DND.CLASSES[i].name, hd: DND.CLASSES[i].hd});
    for (var i=0; i<DND.SKILLS.length; i++)
        config.SKILLS.push({name: DND.SKILLS[i].name, stat: DND.SKILLS[i].stat});
    for (var i=0; i<DND.BACKGROUNDS.length; i++)
        config.BACKGROUNDS.push({name: DND.BACKGROUNDS[i].name});
    for (var i=0; i<DND.RACES.length; i++) {
        for (var j=0; j<DND.RACES[i].subraces.length; j++) {
            config.RACES.push({'name': DND.RACES[i].subraces[j].name, 'race': DND.RACES[i].name});
        }
        if (DND.RACES[i].subraces.length === 0)
            config.RACES.push({'name': DND.RACES[i].name, 'race': DND.RACES[i].name});
    }


    res.json(config);
});

console.log('test');

module.exports = router;
