/**
 * Keeps track of a global npcs object
 *
 * @param $http
 * @param $rootScope
 * @constructor
 */

var NPCCollection = function ($http, $rootScope) {
    var self=this;

    $rootScope.npcs = [];
    self.timeout = null;
    self.changed = {};
    self.to_patch = {};

    // on unload do synchronious ajax to save last changes.
    $(window).unload(function () {
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

    // update single NPC after 1000 ms. Refresh timer on new update.
    this.update = function (npc) {
        return; // no longer used
    };

    this.patch = function (npc, key) {
        self.to_patch[npc._id] = self.to_patch[npc._id] || {};
        self.to_patch[npc._id][key] = npc[key];

        if (self.timeout != null)
            window.clearTimeout(self.timeout);

        self.timeout = window.setTimeout(function () {
            for (id in self.to_patch) {
                self.request('/npcs/' + npc._id, 'PATCH', self.to_patch[npc._id])
                    .success(function (data) {
                        for (var i=0; i<$rootScope.npcs.length; i++) {
                            if ($rootScope.npcs[i]._id == npc._id) {
                                angular.extend($rootScope.npcs[i], data);
                                //jQuery.extend(true, $rootScope.npcs[i], data);
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
        var index = $rootScope.npcs.push(data);
        return this.request('/npcs', 'POST', data)
            .success(function (data) {
                data.loading = false;
                $rootScope.npcs[index-1] = data;
                console.log('npc added');
            })
        ;
    };

    // remove single NPC
    this.remove = function (index) {
        $rootScope.npcs[index].loading = true;
        var id = $rootScope.npcs[index]._id;
        delete self.changed[id];
        return this.request('/npcs/' + id, 'DELETE')
            .success(function (data) {
                $rootScope.npcs.splice(index, 1);
                console.log('npc removed');
            });
        ;
    };

    this.randomize = function (npc, section_id) {
        var changed = self.to_patch[npc._id];

        // clear for update
        delete self.to_patch[npc._id];

        // do randomize request
        return this.request('/npcs/' + npc._id+'/randomize?type='+section_id, 'POST', changed);
    }

    // recalculate stats
    this.recalculate = function (npc) {
        return; // recalculation now happends onUpdate at server level
    };
};
