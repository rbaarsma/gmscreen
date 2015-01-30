/**
 * Keeps track of a global npcs object
 *
 * @param $http
 * @param $rootScope
 * @constructor
 */
var NPCCollection = function ($http, $rootScope) {
    var self=this;

    self.CLASSES = [
        {name: 'Barbarian', hd: 12},
        {name: 'Fighter', hd: 10}
    ];

    $rootScope.npcs = [];
    self.timeout = null;
    self.changed = {};

    // on unload do synchronious ajax to save last changes.
    $(window).unload(function () {
        for (id in self.changed) {
            // use plain old ajax to be able to make async: false request.
            $.ajax('/npcs/' + id, {
                'method': 'PATCH',
                // unlike JSON.stringify, this also removes the angular stuff that otherwise
                // bothers MongoDB in the backend
                'data': angular.toJson(self.changed[id]),
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
        })
            ;
    };

    // load ALL npcs from /npcs
    this.load = function () {
        this.request('/npcs', 'GET')
            .success(function (data) {
                $rootScope.npcs = data;
                for (i in $rootScope.npcs) {
                    self.recalculate($rootScope.npcs[i]);
                }
            })
        ;
    };

    // update single NPC after 1000 ms. Refresh timer on new update.
    this.update = function (npc) {
        if (self.timeout != null)
            window.clearTimeout(self.timeout);

        self.timeout = window.setTimeout(function () {
            self.request('/npcs/' + npc._id, 'PATCH', npc)
                .success(function () {
                    delete self.changed[npc._id];
                })
            ;
        }, 5000);

        // TODO: also add to window unload
        self.changed[npc._id] = npc;
    };

    // add single NPC
    this.add = function (data) {
        data.loading = true;
        var index = $rootScope.npcs.push(data);
        return this.request('/npcs', 'POST', data)
            .success(function (data) {
                data.loading = false;
                $rootScope.npcs[index - 1] = data;
                console.log('npc added');
            })
        ;
    };

    // remove single NPC
    this.remove = function (index) {
        $rootScope.npcs[index].loading = true;
        return this.request('/npcs/' + $rootScope.npcs[index]._id, 'DELETE')
            .success(function (data) {
                $rootScope.npcs.splice(index, 1);
                console.log('npc removed');
            });
        ;
    };

    this.recalculate = function (npc) {
        console.log(npc);

        var conmod = npc.stats[2].mod,
            dexmod = npc.stats[1].mod;

        // calculate hp
        npc.hp = 0;
        for (i in npc.classes) {
            for (j in self.CLASSES) {
                if (self.CLASSES[j].name == npc.classes[i].name) {
                    var hd = self.CLASSES[j].hd,
                        hpplvl = Math.floor(hd/2)+ 1,
                        lvl =  npc.classes[i].level
                        ;

                    npc.hp += i == 0 ? hd + (hpplvl * (lvl-1)) : hpplvl * lvl;
                    npc.hp += conmod * lvl;
                }
            }
        }

        // calculate ac
        npc.ac = 10 + dexmod;
        npc.it = dexmod;
    };

    this.load();
};
