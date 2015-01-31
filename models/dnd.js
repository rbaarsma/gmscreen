var DND = {
    STATNAMES: ['STR','DEX','CON','INT','WIS','CHA'],
    DAMAGE_TYPES: [
        /*  0 */ 'bludgeoning',
        /*  1 */ 'piercing',
        /*  2 */ 'slashing'
    ],
    WEAPONS: [
        /*  0 */ {type: 'melee', hands: 1, name: 'Club', cost: 0.1, damage: '1d4', dmgtype: 0, weight: 2, props: []},
        /*  1 */ {type: 'melee', hands: 1, name: 'Dagger', cost: 2, damage: '1d4', dmgtype: 1, weight: 1, props: []},
        /*  2 */ {type: 'melee', hands: 2, name: 'Greatclub', cost: 0.2, damage: '1d8', dmgtype: 0, weight: 10, props: []},
        /*  3 */ {type: 'melee', hands: 1, name: 'Handaxe', cost: 5, damage: '1d6', dmgtype: 2, weight: 2, props: []},
        /*  4 */ {type: 'melee', hands: 1, name: 'Javelin', cost: 0.5, damage: '1d6', dmgtype: 1, weight: 2, props: []},
        /*  5 */ {type: 'melee', hands: 1, name: 'Light hammer', cost: 2, damage: '1d4', dmgtype: 0, weight: 2, props: []},
        /*  6 */ {type: 'melee', hands: 1, name: 'Mace', cost: 5, damage: '1d6', dmgtype: 0, weight: 4, props: []},
        /*  7 */ {type: 'melee', hands: 2, name: 'Quarterstaff', cost: 0.2, damage: '1d6', dmgtype: 0, weight: 4, props: []},
        /*  8 */ {type: 'melee', hands: 1, name: 'Sickle', cost: 1, damage: '1d4', dmgtype: 2, weight: 2, props: []},
        /*  9 */ {type: 'melee', hands: 1, name: 'Spear', cost: 1, damage: '1d6', dmgtype: 1, weight: 3, props: []},
        /* 10 */ {type: 'melee', hands: 1, name: 'Unarmed strike', cost: 0, damage: '1', dmgtype: 0, weight: 0, props: []},

        /* 11 */ {type: 'ranged', hands: 2, name: 'Crossbow, light', cost: 25, damage: '1d8', dmgtype: 1, weight: 5, props: []},
        /* 12 */ {type: 'ranged', hands: 1, name: 'Dart', cost: 0.05, damage: '1d4', dmgtype: 1, weight: 0.25, props: []},
        /* 13 */ {type: 'ranged', hands: 2, name: 'Shortbow', cost: 25, damage: '1d6', dmgtype: 1, weight: 2, props: []},
        /* 14 */ {type: 'ranged', hands: 1, name: 'Sling', cost: 0.1, damage: '1d4', dmgtype: 0, weight: 0, props: []},

        /* 15 */ {type: 'melee', hands: 1, name: 'Battleaxe', cost: 10, damage: '1d8', dmgtype: 2, weight: 4, props: []},
        /* 16 */ {type: 'melee', hands: 1, name: 'Flail', cost: 10, damage: '1d8', dmgtype: 0, weight: 2, props: []},
        /* 17 */ {type: 'melee', hands: 2, name: 'Glaive', cost: 20, damage: '1d10', dmgtype: 2, weight: 6, props: []},
        /* 18 */ {type: 'melee', hands: 2, name: 'Greataxe', cost: 30, damage: '1d12', dmgtype: 2, weight: 7, props: []},
        /* 19 */ {type: 'melee', hands: 2, name: 'Greatsword', cost: 50, damage: '2d6', dmgtype: 2, weight: 6, props: []},
        /* 20 */ {type: 'melee', hands: 2, name: 'Halberd', cost: 20, damage: '1d10', dmgtype: 2, weight: 6, props: []},
        /* 21 */ {type: 'melee', hands: 2, name: 'Lance', cost: 10, damage: '1d12', dmgtype: 1, weight: 6, props: []},
        /* 22 */ {type: 'melee', hands: 1, name: 'Longsword', cost: 15, damage: '1d8', dmgtype: 2, weight: 3, props: []},
        /* 23 */ {type: 'melee', hands: 2, name: 'Maul', cost: 10, damage: '2d6', dmgtype: 0, weight: 10, props: []},
        /* 24 */ {type: 'melee', hands: 1, name: 'Morningstar', cost: 15, damage: '1d8', dmgtype: 1, weight: 4, props: []},
        /* 25 */ {type: 'melee', hands: 2, name: 'Pike', cost: 5, damage: '1d10', dmgtype: 1, weight: 18, props: []},
        /* 26 */ {type: 'melee', hands: 1, name: 'Rapier', cost: 25, damage: '1d8', dmgtype: 1, weight: 2, props: []},
        /* 27 */ {type: 'melee', hands: 1, name: 'Scimitar', cost: 25, damage: '1d6', dmgtype: 2, weight: 3, props: []},
        /* 28 */ {type: 'melee', hands: 1, name: 'Shortsword', cost: 10, damage: '1d6', dmgtype: 1, weight: 2, props: []},
        /* 29 */ {type: 'melee', hands: 1, name: 'Trident', cost: 5, damage: '1d6', dmgtype: 1, weight: 4, props: []},
        /* 30 */ {type: 'melee', hands: 1, name: 'War pick', cost: 5, damage: '1d8', dmgtype: 1, weight: 2, props: []},
        /* 31 */ {type: 'melee', hands: 1, name: 'Warhammer', cost: 15, damage: '1d8', dmgtype: 0, weight: 2, props: []},
        /* 32 */ {type: 'melee', hands: 1, name: 'Whip', cost: 2, damage: '1d4', dmgtype: 2, weight: 3, props: []},

        /* 33 */ {type: 'ranged', hands: 1, name: 'Blowgun', cost: 10, damage: '1', dmgtype: 1, weight: 2, props: []},
        /* 34 */ {type: 'ranged', hands: 1, name: 'Crossbow, hand', cost: 75, damage: '1d6', dmgtype: 1, weight: 0, props: []},
        /* 35 */ {type: 'ranged', hands: 2, name: 'Crossbow, heavy', cost: 50, damage: '1d10', dmgtype: 1, weight: 18, props: []},
        /* 36 */ {type: 'ranged', hands: 2, name: 'Longbow', cost: 50, damage: '1d8', dmgtype: 1, weight: 2, props: []},
        /* 37 */ {type: 'ranged', hands: 1, name: 'Net', cost: 1, damage: '-', dmgtype: -1, weight: 3, props: []},

    ],
    WEAPON_GROUPS: {
        'simple_melee': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        'simple_ranged': [11, 12, 13, 14],
        'martial_melee': [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
        'martial_ranged': [33, 34, 35, 36, 37],
        'simple': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        'martial': [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
        'all': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]
    },
    ARMORS: [
        /*  0 */ {name: 'Padded', maxdex: -1, cost: 5, ac: 1, minstr: -1, weight: 8},
        /*  1 */ {name: 'Leather', maxdex: -1, cost: 10, ac: 1, minstr: -1, weight: 10},
        /*  2 */ {name: 'Studded Leather', maxdex: -1, cost: 45, ac: 2, minstr: -1, weight: 13},

        /*  3 */ {name: 'Hide', maxdex: 2, cost: 10, ac: 2, minstr: -1, weight: 12},
        /*  4 */ {name: 'Chain shirt', maxdex: 2, cost: 50, ac: 3, minstr: -1, weight: 20},
        /*  5 */ {name: 'Scale mail', maxdex: 2, cost: 50, ac: 4, minstr: -1, weight: 45},
        /*  6 */ {name: 'Breastplate', maxdex: 2, cost: 400, ac: 4, minstr: -1, weight: 20},
        /*  7 */ {name: 'Half plate', maxdex: 2, cost: 750, ac: 5, minstr: -1, weight: 40},

        /*  8 */ {name: 'Ring mail', maxdex: 0, cost: 30, ac: 4, minstr: -1, weight: 40},
        /*  9 */ {name: 'Chain mail', maxdex: 0, cost: 75, ac: 6, minstr: 13, weight: 55},
        /* 10 */ {name: 'Splint', maxdex: 0, cost: 200, ac: 7, minstr: 15, weight: 60},
        /* 11 */ {name: 'Plate', maxdex: 0, cost: 1500, ac: 8, minstr: 15, weight: 65},

        /* 12 */ {name: 'Shield', maxdex: -1, cost: 10, ac: 2, minstr: -1, weight: 6},
        /* 13 */ {name: 'None', maxdex: -1, cost: 0, ac: 0, minstr: -1, weight: 0}

    ],
    ARMOR_GROUPS: {
        'light': [0, 1, 2],
        'medium': [3, 4, 5, 6, 7],
        'heavy': [8, 9, 10, 11],
        'shield': [12],
        'lightmedium': [0, 1, 2, 3, 4, 5, 6, 7],
        'lightmediumshield': [0, 1, 2, 3, 4, 5, 6, 7, 12],
        'all': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    SKILLS: [
        /*  0 */ { stat: 0, name: 'Athletics' },
        /*  1 */ { stat: 1, name: 'Acrobatics' },
        /*  2 */ { stat: 1, name: 'Sleight of Hand' },
        /*  3 */ { stat: 1, name: 'Stealth' },
        /*  4 */ { stat: 3, name: 'Arcana' },
        /*  5 */ { stat: 3, name: 'History' },
        /*  6 */ { stat: 3, name: 'Investigation' },
        /*  7 */ { stat: 3, name: 'Nature' },
        /*  8 */ { stat: 3, name: 'Religion' },
        /*  9 */ { stat: 4, name: 'Animal Handling' },
        /* 10 */ { stat: 4, name: 'Insight' },
        /* 11 */ { stat: 4, name: 'Medicine' },
        /* 12 */ { stat: 4, name: 'Perception' },
        /* 13 */ { stat: 4, name: 'Survival' },
        /* 14 */ { stat: 5, name: 'Deception' },
        /* 15 */ { stat: 5, name: 'Intimidation' },
        /* 16 */ { stat: 5, name: 'Performance' },
        /* 17 */ { stat: 5, name: 'Persuasion' }
    ],
    TOOLS: [
        /*  0 */ {name: 'Herbalism Kit'},
        /*  1 */ {name: "Thieves' Tools"}
    ]
};
DND.CLASSES = [
    {
        name: 'Barbarian',
        hd: 12,
        skills: [0,9,15,7,13,12],
        skillsno: 2,
        tools: [],
        weapons: DND.WEAPON_GROUPS.all,
        armors: DND.ARMOR_GROUPS.lightmediumshield,
        saves: [0,2]
    },
    {
        name: 'Bard',
        hd: 8,
        skills: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],
        skillsno: 3,
        tools: [],
        weapons: DND.WEAPON_GROUPS.simple.concat([34,22,26,28]),
        armors: DND.ARMOR_GROUPS.light,
        saves: [1,5]
    },
    {
        name: 'Cleric',
        hd: 8,
        skills: [5,10,11,17,8],
        skillsno: 2,
        tools: [],
        weapons: DND.WEAPON_GROUPS.simple,
        armors: DND.ARMOR_GROUPS.lightmediumshield,
        saves: [1,5]
    },
    {
        name: 'Druid',
        hd: 8,
        skills: [5,10,11,17,8],
        skillsno: 2,
        weapons: [0,1,4,12,6,7,8,9,14,27],
        languages: ['druidic'],
        tools: [0],
        armors: [0,1,2,3,12],
        saves: [3,4]
    },
    {
        name: 'Fighter',
        hd: 10,
        skills: [1,9,1,5,10,15,12,13],
        skillsno: 2,
        weapons: DND.WEAPON_GROUPS.all,
        languages: ['druidic'],
        tools: [0],
        armors: DND.ARMOR_GROUPS.all,
        saves: [0,2]
    },
    {
        name: 'Monk',
        hd: 8,
        skills: [0,1,5,10,8,3],
        skillsno: 2,
        weapons: DND.WEAPON_GROUPS.simple.push(28),
        languages: ['druidic'],
        tools: [], // 2 artistan tools
        armors: [],
        saves: [0,1]
    },
    {
        name: 'Paladin',
        hd: 10,
        skills: [0,6,10,15,11,17,8],
        skillsno: 2,
        weapons: DND.WEAPON_GROUPS.all,
        languages: [],
        tools: [],
        armors: DND.ARMOR_GROUPS.all,
        saves: [3,5]
    },
    {
        name: 'Ranger',
        hd: 10,
        skills: [1,9,6,10,3,7,12,13],
        skillsno: 3,
        weapons: DND.WEAPON_GROUPS.all,
        languages: [],
        tools: [],
        armors: DND.ARMOR_GROUPS.all,
        saves: [0,1]
    },
    {
        name: 'Rogue',
        hd: 8,
        skills: [0,1,2,3,6,10,12,14,15,16,17],
        skillsno: 4,
        weapons: DND.WEAPON_GROUPS.simple.concat([34,22,26,28]),
        languages: [],
        tools: [1],
        armors: DND.ARMOR_GROUPS.light,
        saves: [1,3]
    },
    {
        name: 'Sorcerer',
        hd: 6,
        skills: [4,10,14,15,17,8],
        skillsno: 2,
        weapons: [1,11,12,7],
        languages: [],
        tools: [],
        armors: [],
        saves: [2,5]
    },
    {
        name: 'Warlock',
        hd: 8,
        skills: [4,5,14,15,6,7,8],
        skillsno: 2,
        weapons: DND.WEAPON_GROUPS.simple,
        languages: [],
        tools: [],
        armors: DND.ARMOR_GROUPS.light,
        saves: [3,5]
    },
    {
        name: 'Wizard',
        hd: 6,
        skills: [4,5,10,11,6,8],
        skillsno: 2,
        weapons: [1,11,12,14,7],
        languages: [],
        tools: [],
        armors: [],
        saves: [3,4]
    },
];

module.exports = DND;