var express = require('express');
var router = express.Router();
var DND = require('../models/dnd.js');
var USER = require('../models/user.js');

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

    for (var i=0; i<DND.CLASSES.length; i++) {
        config.CLASSES.push({
            name: DND.CLASSES[i].name,
            hd: DND.CLASSES[i].hd,
            paths: DND.CLASSES[i].paths,
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
    USER.findById(req.session.userid, function (err, post) {
        if (err) return next(err);

        // for now we don't have a registration, so we simply make an empty
        // user on the fly and store it in our session
        if (post === null) {
            USER.create({}, function (err, user) {
                if (err) return next(err);
                user.save();
                req.session.userid = user._id;
                res.json(user);
            });
        } else {
            res.json(post);
        }
    });
});

console.log('test');

module.exports = router;
