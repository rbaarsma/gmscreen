var DND = {
    STATNAMES: ['STR','DEX','CON','INT','WIS','CHA'],
    DAMAGE_TYPES: [
        /*  0 */ 'bludgeoning',
        /*  1 */ 'piercing',
        /*  2 */ 'slashing',
        /*  3 */ "Acid",
        /*  4 */ "Cold",
        /*  5 */ "Fire",
        /*  6 */ "Force",
        /*  7 */ "Lightning",
        /*  8 */ "Necrotic",
        /*  9 */ "Poison",
        /* 10 */ "Psychic",
        /* 11 */ "Radiant",
        /* 12 */ "Thunder"
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
    ],
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
        saves: [1,5],
        spells: [
            ["Blade Ward","Dancing Lights","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Prestidigitation","True Strike","Vicious Mockery"],
            ["Animal Friendship","Bane","Charm Person","Comprehend Languages","Cure Wounds","Detect Magic","Disguise Self","Dissonant Whispers","Faerie Fire","Feather Fall","Healing Word","Heroism","Identify","Illusory Script","Longstrider","Silent Image","Sleep","Speak with Animals","Tasha's Hideous Laughter","Thunderwave","Unseen Servant"],
            ["Animal Messenger","Blindness/Deafness","Calm Emotions","Cloud of Daggers","Crown of Madness","Detect Thoughts","Enhance Ability","Enthrall","Heat Metal","Hold Person","Invisibility","Knock","Lesser Restoration","Locate Animals or Plants","Locate Object","Magic Mouth","Phantasmal Force","See Invisibility","Shatter","Silence","Suggestion","Zone of Truth"],
            ["Bestow Curse","Clairvoyance","Dispel Magic","Fear","Feign Death","Glyph of Warding","Hypnotic Pattern","Leomundâ€™s Tiny Hut","Major Image","Nondetection","Plant Growth","Sending","Speak with Dead","Speak with Plants","Stinking Cloud","Tongues"],
            ["Compulsion","Confusion","Dimension Door","Freedom of Movement","Greater Invisibility","Hallucinatory Terrain","Locate Creature","Polymorph"],
            ["Animate Objects","Awaken","Dominate Person","Dream","Geas","Greater Restoration","Hold Monster","Legend Lore","Mass Cure Wounds","Mislead","Modify Memory","Planar Binding","Raise Dead","Scrying","Seeming","Teleportation Circle"]
        ]
    },
    {
        name: 'Cleric',
        hd: 8,
        skills: [5,10,11,17,8],
        skillsno: 2,
        tools: [],
        weapons: DND.WEAPON_GROUPS.simple,
        armors: DND.ARMOR_GROUPS.lightmediumshield,
        saves: [1,5],
        spells: [
            ["Guidance","Light","Mending","Resistance","Sacred Flame","Spare the Dying","Thaumaturgy"],
            ["Bane","Bless","Command","Create or Destroy Water","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Guiding Bolt","Healing Word","Inflict Wounds","Protection from Evil and Good","Purify Food and Drink","Sanctuary","Shield of Faith"],
            ["Aid","Augury","Blindness/Deafness","Calm Emotions","Continual Flame","Enhance Ability","Find Traps","Gentle Repose","Hold Person","Lesser Restoration","Locate Object","Prayer of Healing","Protection from Poison","Silence","Spiritual Weapon","Warding Bond","Zone of Truth"],
            ["Animate Dead","Beacon of Hope","Bestow Curse","Clairvoyance","Create Food and Water","Daylight","Dispel Magic","Feign Death","Glyph of Warding","Magic Circle","Mass Healing Word","Meld into Stone","Protection from Energy","Remove Curse","Revivify","Sending","Speak with Dead","Spirit Guardians","Tongues","Water Walk"],
            ["Banishment","Control Water","Death Ward","Divination","Freedom of Movement","Guardian of Faith","Locate Creature","Stone Shape"],
            ["Commune","Contagion","Dispel Evil and Good","Flame Strike","Geas","Greater Restoration","Hallow","Insect Plague","Legend Lore","Mass Cure Wounds","Planar Binding","Raise Dead","Scrying"]
        ]
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
        saves: [3,4],
        spells: [
            ["Druidcraft","Guidance","Mending","Poison Spray","Produce Flame","Resistance","Shillelagh","Thorn Whip"],
            ["Animal Friendship","Charm Person","Create or Destroy Water","Cure Wounds","Detect Magic","Detect Poison and Disease","Entangle","Faerie Fire","Fog Cloud","Goodberry","Healing Word","Jump","Longstrider","Purify Food and Drink","Speak with Animals","Thunderwave"],
            ["Animal Messenger","Barkskin","Beast Sense", "Darkvision", "Enhance Ability", "Find Traps", "Flame Blade", "Flaming Sphere", "Gust of Wind", "Heat Metal", "Hold Person","Lesser Restoration","Locate Object", "Moonbeam", "Pass without Trace", "Protection from Poison","Spike Growth"],
            ["Call Lightning","Conjure Animals","Daylight","Dispel Magic","Feign Death","Meld into Stone","Plant Growth","Protection from Energy","Sleet Storm","Speak with Plants","Water Breathing","Water Walk","Wind Wall"],
            ["Blight","Confusion","Conjure Minor Elementals","Conjure Woodland Beings","Control Water","Dominate Beast","Freedom of Movement","Giant Insect","Grasping Vine","Hallucinatory Terrain","Ice Storm","Locate Creature","Polymorph","Stone Shape","Stoneskin","Wall of Fire"],
            ["Antilife Shell","Awaken","Commune with Nature","Conjure Elemental","Contagion","Geas","Greater Restoration","Insect Plague","Mass Cure Wounds","Planar Binding","Reincarnate","Scrying","Tree Stride","Wall of Stone"]
        ]
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
        saves: [3,5],
        spells: [
            ["Bless","Command","Compelled Duel","Cure Wounds","Detect Evil and Good","Detect Magic","Detect Poison and Disease","Divine Favor","Heroism","Protection from Evil and Good","Purify Food and Drink","Searing Smite","Shield of Faith","Thunderous Smite","Wrathful Smite"],
            ["Aid","Branding Smite","Find Steed","Lesser Restoration","Locate Object","Magic Weapon","Protection from Poison","Zone of Truth"],
            ["Aura of Vitality","Blinding Smite","Create Food and Water","Crusader's Mantle","Daylight","Dispel Magic","Elemental Weapon"]
        ]
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
        saves: [0,1],
        spells: [
            ["Alarm","Animal Friendship","Cure Wounds","Detect Magic","Detect Poison and Disease","Ensnaring Strike","Fog Cloud","Goodberry","Hail of Thorns","Hunter's Mark","Jump","Longstrider","Speak with Animals"],
            ["Animal Messenger","Barkskin","Beast Sense","Cordon of Arrows","Darkvision","Find Traps","Lesser Restoration","Locate Animals or Plants","Locate Object","Pass without Trace","Protection from Poison","Silence","Spike Growth"],
            ["Conjure Animals","Conjure Barrage","Daylight","Lightning Arrow","Nondetection","Plant Growth","Protection from Energy","Speak with Plants","Water Breathing","Water Walk","Wind Wall"]
        ]
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
        saves: [2,5],
        spells: [
            ["Acid Splash","Blade Ward","Chill Touch","Dancing Lights","Fire Bolt","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","True Strike"],
            ["Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Fog Cloud","Jump","Mage Armor","Ray of Sickness","Shield","Silent Image","Sleep","Thunderwave","Witch Bolt"],
            ["Alter Self","Blindness/Deafness","Blur","Cloud of Daggers","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Enhance Ability","Enlarge/Reduce","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Mirror Image","Misty Step","Phantasmal Force","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],
            ["Blink","Clairvoyance","Counterspell","Daylight","Dispel Magic","Fear","Fireball","Fly","Gaseous Form","Haste","Hypnotic Pattern","Lightning Bolt","Major Image","Protection from Energy","Sleet Storm","Slow","Stinking Cloud","Tongues","Water Breathing","Water Walk"],
            ["Banishment","Blight","Confusion","Dimension Door","Dominate Beast","Greater Invisibility","Ice Storm","Polymorph","Stoneskin","Wall of Fire"],
            ["Animate Objects","Cloudkill","Cone of Cold","Creation","Dominate Person","Hold Monster","Insect Plague","Seeming","Telekinesis","Teleportation Circle","Wall of Stone"]
        ]
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
        saves: [3,5],
        spells: [
            ["Blade Ward","Chill Touch","Eldritch Blast","Friends","Mage Hand","Minor Illusion","Poison Spray","Prestidigitation","True Strike"],
            ["Armor of Agathys","Arms of Hadar","Charm Person","Comprehend Languages","Expeditious Retreat","Hellish Rebuke","Hex","Illusory Script","Protection from Good and Evil","Unseen Servant","Witch Bolt"],
            ["Cloud of Daggers","Crown of Madness","Darkness","Enthrall","Hold Person","Invisibility","Mirror Image","Misty Step","Ray of Enfeeblement","Shatter","Spider Climb","Suggestion"],
            ["Counterspell","Dispel Magic","Fear","Fly","Gaseous Form","Hunger of Hadar","Hypnotic Pattern","Magic Circle","Major Image","Remove Curse","Tongues","Vampiric Touch"],
            ["Banishment","Blight","Dimension Door","Hallucinatory Terrain"],
            ["Contact Other Plane","Dream","Hold Monster","Scrying"]
        ],
        rituals: ["Illusory Script","Identify","Identify","Identify","Find Familiar","Detect Disease and Poison","Detect Magic","Detect Magic","Detect Magic","Comprehend Languages","Unseen Servant","Tenser's Floating Disk","Speak with Animals","Speak with Animals","Purify Food and Drink","Alarm","Alarm"]
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
        saves: [3,4],
        spells: [
            ["Acid Splash","Blade Ward","Chill Touch","Dancing Lights","Fire Bolt","Friends","Light","Mage Hand","Mending","Message","Minor Illusion","Poison Spray","Prestidigitation","Ray of Frost","Shocking Grasp","True Strike"],
            ["Alarm","Burning Hands","Charm Person","Chromatic Orb","Color Spray","Comprehend Languages","Detect Magic","Disguise Self","Expeditious Retreat","False Life","Feather Fall","Find Familiar","Find Familiar","Fog Cloud","Grease","Identify","Illusory Script","Jump","Longstrider","Mage Armor","Magic Missile","Protection from Good and Evil","Ray of Sickness","Shield","Silent Image","Sleep","Tasha's Hideous Laughter","Tenser's Floating Disk","Thunderwave","Unseen Servant","Witch Bolt"],
            ["Alter Self","Arcane Lock","Blindness/Deafness","Blur","Cloud of Daggers","Continual Flame","Crown of Madness","Darkness","Darkvision","Detect Thoughts","Enlarge/Reduce","Flaming Sphere","Gentle Repose","Gust of Wind","Hold Person","Invisibility","Knock","Levitate","Locate Object","Magic Mouth","Magic Weapon","Melf's Acid Arrow","Mirror Image","Misty Step","Nystul's Magic Aura","Phantasmal Force","Ray of Enfeeblement","Rope Trick","Scorching Ray","See Invisibility","Shatter","Spider Climb","Suggestion","Web"],
            ["Animate Dead","Bestow Curse","Blink","Clairvoyance","Counterspell","Dispel Magic","Fear","Feign Death","Fireball","Fly","Gaseous Form","Glyph of Warding","Haste","Hypnotic Pattern","Leomundâ€™s Tiny Hut","Lightning Bolt","Magic Circle","Major Image","Nondetection","Phantom Steed","Protection from Energy","Remove Curse","Sending","Sleet Storm","Slow","Stinking Cloud","Tongues","Vampiric Touch","Water Breathing"],
            ["Arcane Eye","Banishment","Blight","Confusion","Conjure Minor Elementals","Control Water","Dimension Door","Evard's Black Tentacles","Fabricate","Fire Shield","Greater Invisibility","Hallucinatory Terrain","Ice Storm","Leomundâ€™s Secret Chest","Locate Creature","Mordenkainenâ€™s Faithful Hound","Mordenkainenâ€™s Private Sanctum","Otilukeâ€™s Resilient Sphere","Phantasmal Killer","Polymorph","Stone Shape","Stoneskin","Wall of Fire"],
            ["Animate Objects","Bigbyâ€™s Hand","CloudkilI","Cone of Cold","Conjure Elemental","Contact Other Plane","Creation","Dominate Person","Dream","Geas","Hold Monster","Legend Lore","Mislead","Modify Memory","Passwall","Planar Binding","Raryâ€™s Telepathic Bond","Scrying","Seeming","Telekinesis","Teleportation Circle","Wall of Force","Wall of Stone"]
        ]
    }
];
DND.RACES = [
    {
        name: 'Gnome',
        size: 'Small',
        speed: 25,
        stats: [{index: 3, bonus: 2}],
        alignments: ['G'],
        abils: ['Darkvision', 'Gnome Cunning'],
        languages: ['Common', 'Gnomish'],
        subraces: [
            {'name': 'Forest Gnome', stats: [{index: 1, bonus: 1}], spells: [['Minor Illusion']], abils: ['Natural Illusionist','Speak with Small Beasts']},
            {'name': 'Rock Gnome', abils: ["Artificer's Lore",'Tinker']}
        ],
        names: {
            male: ["Alston","Alvyn","Boddynock","Brocc","Burgell","Dimble","Eldon","Erky","Fonkin","Frug","Gerbo","Gimble","Glim","Jebeddo","Kellen","Namfoodle","Orryn","Roondar","Seebo","Sindri","Warryn","Wrenn","Zook"],
            female: ["Bimpnottin","Breena","Caramip","Carlin","Donella","Duvamil","Ella","Ellyjobell","Ellywick","Lilli","Loopmottin","Lorilla","Mardnab","Nissa","Nyx","Oda","Orla","Roywyn","Shamil","Tana","Waywocket","Zanna"],
            last: ["Beren","Daergel","Folkor","Garrick","Nackle","Murnig","Ningel","Raulnor","Scheppen","Timbers","Turen"],
            nick: ["Aleslosh","Ashhearth","Badger","Cloak","Doublelock","Filchbatter","Fnipper","Ku","Nim","Oneshoe","Pock","Sparklegem","Stumbleduck"]
        }
    },
    {
        name: 'Half-Orc',
        size: 'Medium',
        speed: 30,
        stats: [{index: 0, bonus: 2}, {index: 2, bonus: 1}],
        alignments: ['C','N','E'],
        abils: ['Darkvision','Menacing','Relentless Endurance','Savage Attacks'],
        skills: [15],
        languages: ['Common', 'Orc'],
        subraces: [],
        names: {
            male: ["Dench","Feng","Gell","Henk","Holg","Imsh","Keth","Krusk","Mhurren","Ront","Shump","Thokk"],
            female: ["Baggi","Emen","Engong","Kansif","Myev","Neega","Ovak","Ownka","Shautha","Sutha","Vola","Volen","Yevelda"]
        }
    },
    {
        name: 'Tiefling',
        size: 'Medium',
        speed: 30,
        stats: [{index: 3, bonus: 2}, {index: 5, bonus: 1}],
        alignments: ['E'],
        abils: ['Darkvision','Hellish Resistance','Infernal Legacy'],
        spells: [['Thaumaturgy'],[],['Hellish Rebuke'],['Darkness']],
        languages: ['Common', 'Infernal'],
        subraces: [],
        names: {
            male: ["Akmenos","Amnon","Barakas","Damakos","Ekemon","Iados","Kairon","Leucis","Melech","Mordai","Morthos","Pelaios","Skamos","Therai"],
            female: ["Akta","Anakis","Bryseis","Criella","Damaia","Ea","Kallista","Lerissa","Makaria","Nemeia","Orianna","Phelaia","Rieta"],
            last: ["Art","Carrion","Chant","Creed","Despair","Excellence","Fear","Glory","Hope","Ideal","Music","Nowhere","Open","Poetry","Quest","Random","Reverence","Sorrow","Temerity","Torment","Weary"]
        }
    },
    {
        name: 'Half-Elf',
        size: 'Medium',
        speed: 30,
        stats: [{index: 5, bonus: 2}, {index: '*', bonus: 1}, {index: '*', bonus: 1}],
        alignments: ['C'],
        abils: ['Darkvision','Fey Ancestry','Skill Versality'],
        skills: ['*','*'],
        languages: ['Common', 'Elvish','*'],
        subraces: [],
        names: {
            male: ["Ander","Blath","Bran","Frath","Geth","Lander","Luth","Malcer","Stor","Taman","Urth","Aseir","Bardeid","Haseid","Khemed","Mehmen","Sudeiman","Zasheir","Bor","Fodel","Glar","Grigor","Igan","Ivor","Kosef","Mival","Orel","Pavel","Sergor"],
            female: ["Amafrey","Betha","Cefrey","Kethra","Mara","Olga","Silifrey","Westra","Atala","Ceidil","Hama","Jasmal","Meilil","Seipora","Yasheira","Zasheida","Alethra","Kara","Katernin","Mara","Natali","Olma","Tana","Zora"],
            last: ["Brightwood","Helder","Hornraven","Lackman","Stormwind","Windrivver","Basha","Dumein","Jassan","Khalid","Mostana","Pashar","Rein","Bersk","Chernin","Dotsk","Kulenov","Marsk","Nemetsk","Shemov","Starag"]
        }
    },
    {
        name: 'Dragonborn',
        size: 'Medium',
        speed: 30,
        stats: [{index: 0, bonus: 2}],
        alignments: ['L','G','C','E'],
        abils: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'],
        languages: ['Common', 'Draconic'],
        subraces: [],
        names: {
            male: ["Arjhan","Balasar","Bharash","Donaar","Ghesh","Heskan","Kriv","Medrash","Mehen","Nadarr","Pandjed","Patrin","Rhogar","Shamash","Shedinn","Tarhun","Torinn"],
            female: ["Akra","Biri","Daar","Farideh","Harann","Flavilar","Jheri","Kava","Korinn","Mishann","Nala","Perra","Raiann","Sora","Surina","Thava","Uadjit"],
            last: ["Clethtinthiallor","Daardendrian","Delmirev","Drachedandion","Fenkenkabradon","Kepeshkmolik","Kerrhylon","Kimbatuul","inxakasendalor","Myastan","Nemmonis","Norixius","Ophinshtalajiir","Prexijandilin","Shestendeliath","Turnuroth","Verthisathurgiesh","Yarjerit"]
        }
    },
    {
        name: 'Human',
        size: 'Medium',
        speed: 30,
        stats: [{index: 0, bonus: 1},{index: 1, bonus: 1},{index: 2, bonus: 1},{index: 3, bonus: 1},{index: 4, bonus: 1},{index: 5, bonus: 1}],
        alignments: [],
        languages: ['Common','*'],
        subraces: [],
        names: {
            male: ["Ander","Blath","Bran","Frath","Geth","Lander","Luth","Malcer","Stor","Taman","Urth","Aseir","Bardeid","Haseid","Khemed","Mehmen","Sudeiman","Zasheir","Bor","Fodel","Glar","Grigor","Igan","Ivor","Kosef","Mival","Orel","Pavel","Sergor"],
            female: ["Amafrey","Betha","Cefrey","Kethra","Mara","Olga","Silifrey","Westra","Atala","Ceidil","Hama","Jasmal","Meilil","Seipora","Yasheira","Zasheida","Alethra","Kara","Katernin","Mara","Natali","Olma","Tana","Zora"],
            last: ["Brightwood","Helder","Hornraven","Lackman","Stormwind","Windrivver","Basha","Dumein","Jassan","Khalid","Mostana","Pashar","Rein","Bersk","Chernin","Dotsk","Kulenov","Marsk","Nemetsk","Shemov","Starag"]
        }
    },
    {
        name: 'Halfling',
        size: 'Small',
        speed: 25,
        stats: [{index: 1, bonus: 2}],
        alignments: ['LG'],
        abils: ['Lucky','Brave','Halfing Nimbleness'],
        languages: ['Common', 'Halfling'],
        subraces: [
            {name: 'Lightfoot', stats: [{index: 5, bonus: 1}], abils: ['Naturally Stealthy'] },
            {name: 'Stout', stats: [{index: 2, bonus: 1}], abils: ['Stout Resilience'] },
        ],
        names: {
            male: ["Alton","Ander","Cade","Corrin","Eldon","Errich","Finnan","Garret","Lindal","Lyle","Merric","Milo","Osborn","Perrin","Reed","Roscoe","Wellby"],
            female: ["Andry","Bree","Callie","Cora","Euphemia","Jillian","Kithri","Lavinia","Lidda","Merla","Nedda","Paela","Portia","Seraphina","Shaena","Trym","Vani","Verna"],
            last: ["Brushgather","Goodbarrel","Greenbottle","High-hill","Hilltopple","Leagallow","Tealeaf","Thorngage","Tosscobble","Underbough"]
        }
    },
    {
        name: 'Elf',
        size: 'Medium',
        speed: 30,
        stats: [{index: 1, bonus: 2}],
        alignments: ['G', 'C'],
        abils: ['Darkvision','Fey Ancestry','Keen Senses', 'Trance'],
        skills: [12],
        languages: ['Common', 'Elvish'],
        subraces: [
            {name: 'High Elf', stats: [{index: 4, bonus: 1}], abils: ['Elf Weapon Training','Cantrip', 'Extra Language'], weapons: [13,28,26,36], spells: [DND.CLASSES[11].spells[0]], languages: ['*']},
            {name: 'Wood Elf', stats: [{index: 3, bonus: 1}], abils: ['Elf Weapon Trianing', 'Mask of the Wild'], weapons: [13,28,26,36], speed: 35},
            {name: 'Drow', stats: [{index: 5, bonus: 1}], abils: ['Superior Darkvision', 'Sunlight Sensitivity', 'Drow Magic', 'Drow Weapon Training'], weapons: [26,28,34]}

        ],
        names: {
            male: ["Adran","Aelar","Aramil","Arannis","Aust","Beiro","Berrian","Carric","Enialis","Erdan","Erevan","Galinndan","Hadarai","Heian","Himo","Immeral","Ivellios","Laucian","Mindartis","Paelias","Peren","Quarion","Riardon","Rolen","Soveliss","Thamior","Tharivol","Theren","Varis"],
            female: ["Adrie","Althaea","Anastrianna","Andraste","Antinua","Bethrynna","Birel","Caelynn","Drusilia","Enna","Felosial","Ielenia","Jelenneth","Keyleth","Leshanna","Lia","Meriele","Mialee","Naivara","Quelenna","Quillathe","Sariel","Shanairra","Shava","Silaqui","Theirastra","Thia","Vadania","Valanthe","Xanaphia"],
            last: ["Amakiir (Gemflower)","Amastacia (Starflower)","Galanodel (Moonwhisper)","Holimion (Diamonddew)","Ilphelkiir (Gemblossom)","Liadon (Silverfrond)","Meliamne (Oakenheel)","Nai'lo (Nightbreeze)","Siannodel (Moonbrook)","Xiloscient (Goldpetal)"]
        }
    },
    {
        name: 'Dwarf',
        size: 'Medium',
        speed: 25,
        weapons: [3,15,31,5],
        stats: [{index: 2, bonus: 2}],
        subraces: [
            { name: 'Hill Dwarf', stats: [{index: 3, bonus: 1}], abils: ['Dwarven Toughness'] },
            { name: 'Moutain Dwarf', stats: [{index: 0, bonus: 2}], armors: DND.ARMOR_GROUPS.lightmedium, abils: ['Dwarven Armor Training'] }
        ],
        alignments: ['L','G'],
        abils: ['Darkvision','Dwarven Resilience', 'Dwarven Combat Training'],
        languages: ['Common', 'Dwarven'],
        names: {
            male: ["Adrik","Alberich","Baern","Barendd","Brottor","Bruenor","Dain","Darrak","Delg","Eberk","Einkil","Fargrim","Flint","Gardain","Harbek","Kildrak","Morgran","Orsik","Oskar","Rangrim","Rurik","Taklinn","Thoradin","Thorin","Tordek","Traubon","Travok","Ulfgar","Veit","Vondal"],
            female: ["Amber","Artin","Audhild","Bardryn","Dagnal","Diesa","Eldeth","Falkrunn","Finellen","Gunnloda","Gurdis","Helja","Hlin","Kathra","Kristryd","Ilde","Liftrasa","Mardred","Riswynn","Sannl","Torbera","Torgga","Vistra"],
            last: ["Balderk","Battlehammer","Brawnanvil","Dankil","Fireforge","Frostbeard","Gorunn","Holderhek","Ironfist","Loderr","Lutgehr","Rumnaheim","Strakeln","Torunn","Ungart"]
        }
    }
];

module.exports = DND;