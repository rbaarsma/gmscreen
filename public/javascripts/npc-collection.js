/**
 * Keeps track of a global npcs object
 *
 * @param $http
 * @param self
 * @constructor
 */

var NPCManager = function ($http) {
    var self = this;

    self.npcs = [];
    self.timeout = null;
    self.changed = {};
    self.to_patch = {};

    // on unload do synchronious ajax to save last changes.
    $(window).unload(function () {
        console.log('onunload');
        for (id in self.to_patch) {
            // use plain old ajax to be able to make async: false request.
            $.ajax('/npcs/' + id, {
                'method': 'PATCH',
                // unlike JSON.stringify, this also removes the angular stuff that otherwise
                // bothers MongoDB in the backend
                'data': angular.toJson(self.to_patch[id]),
                'contentType': 'application/json',
                'async': false // otherwise doesn't work on unload
            })
        }
    })

    // helper function that always handles errors the same way
    this.request = function (url, method, data) {
        return $http({
            'method': method,
            'url': url,
            'data': data
        }).error(function (data, status) {
            // TODO: show error flash or something
            console.log(data, status);
        });
    };

    this.get = function () {
        this.request('/npcs', 'GET')
            .success(function (data) {
                // funny enough when simply doing self.npcs=data, the scope doens't get updated
                // but when updated with a proper push, it does.
                for (var i=0; i<data.length; i++) {
                    self.npcs.push(data[i]);
                }

                // sort alphabetically
                self.npcs.sort(function(a, b){
                    if(a.name < b.name) return -1;
                    if(a.name > b.name) return 1;
                    return 0;
                })
            })
        ;

        // note first returns empty npcs array that gets loaded asynchroniously
        return self.npcs;
    },

    // update single NPC after 1000 ms. Refresh timer on new update.
    this.update = function (npc) {
        return; // no longer used
    };

    this.patch = function (npc, key) {
        console.log('to patch: ' + npc._id + ' key: ' + key);
        self.to_patch[npc._id] = self.to_patch[npc._id] || {};
        self.to_patch[npc._id][key] = npc[key];

        if (self.timeout != null)
            window.clearTimeout(self.timeout);

        self.timeout = window.setTimeout(function () {
            console.log('patching');
            console.log(self.to_patch);
            for (id in self.to_patch) {
                self.request('/npcs/' + npc._id, 'PATCH', self.to_patch[npc._id])
                    .success(function (data) {
                        for (var i = 0; i < self.npcs.length; i++) {
                            if (self.npcs[i]._id == npc._id) {
                                angular.extend(self.npcs[i], data);
                                //jQuery.extend(true, self.npcs[i], data);
                            }
                        }
                        delete self.to_patch[npc._id];
                    })
                ;
            }
        }, 5000);
    };

    // create new single NPC
    this.create = function (data) {
        data.loading = true;
        var index = self.npcs.push(data);
        return this.request('/npcs', 'POST', data)
            .success(function (data) {
                data.loading = false;
                self.npcs[index - 1] = data;
                console.log('npc added');
            })
            ;
    };

    // remove single NPC
    this.remove = function (index) {
        self.npcs[index].loading = true;
        var id = self.npcs[index]._id;
        delete self.changed[id];
        return this.request('/npcs/' + id, 'DELETE')
            .success(function (data) {
                self.npcs.splice(index, 1);
                console.log('npc removed');
            });
        ;
    };

    // randomize specific section
    this.randomize = function (npc, section_id) {
        var changed = self.to_patch[npc._id];

        // clear for update
        delete self.to_patch[npc._id];

        // do randomize request
        return this.request('/npcs/' + npc._id + '/randomize?type=' + section_id, 'POST', changed);
    }

    // check if NPC has skill
    this.hasSkill = function (npc, skill) {
        for (var i=0; i<npc.skills.length; i++) {
            if (npc.skills[i].name.toLowerCase() == skill.toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    // give NPC's passive perception
    this.passivePerception = function (npc) {
        if (npc.stats.length != 6)
            return '?';
        return 10 + npc.stats[4].mod + (self.hasSkill(npc, 'perception') ? npc.prof : 0);
    }

    // recalculate stats
    this.recalculate = function (npc) {
        return; // recalculation now happends onUpdate at server level
    };
};