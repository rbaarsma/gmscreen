var express = require('express');
var router = express.Router();
var DND = require('../models/dnd.js');
var User = require('../models/user.js');

function checkAuth (req, res, next) {
    if (!req.user || !req.user._id)
        res.redirect('/login');
    else
        next();
}

/* GET home page. */
router.get('/', checkAuth, function(req, res, next) {
    res.render('index');
});

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.get('/config', function(req, res, next) {
    var config = {
        CLASSES: [],
        SKILLS: [],
        RACES: [],
        LANGUAGES: DND.LANGUAGES,
        BACKGROUNDS: [],
        ALIGNMENTS: DND.ALIGNMENTS
    };

    for (var i=0; i<DND.CLASSES.length; i++) {
        var spells = [];
        if (typeof DND.CLASSES[i].spells != 'undefined' && DND.CLASSES[i].spells.length > 0) {
            for (var j=1;j<DND.CLASSES[i].spells.length; j++) {
                for (var k=0; k<DND.CLASSES[i].spells[j].length; k++) {
                    spells.push({lvl: j, name: DND.CLASSES[i].spells[j][k]});
                }
            }
        }

        config.CLASSES.push({
            name: DND.CLASSES[i].name,
            hd: DND.CLASSES[i].hd,
            paths: DND.CLASSES[i].paths,
            cantrips: spells.length>0 ? DND.CLASSES[i].spells[0] : [],
            spells: spells.length>0 ? spells : [],
            fighting_styles: DND.CLASSES[i].fighting_styles ? DND.CLASSES[i].fighting_styles : []
        });
    }
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

router.get('/me', function(req, res, next) {
    res.json(req.user);
});


console.log('test');

module.exports = router;
