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
        });
    };

    // update single NPC after 1000 ms. Refresh timer on new update.
    this.update = function (npc) {
        if (self.timeout != null)
            window.clearTimeout(self.timeout);

        self.timeout = window.setTimeout(function () {
            for (id in self.changed) {
                self.request('/npcs/' + npc._id, 'PATCH', npc)
                    .success(function (data) {
                        for (var i=0; i<$rootScope.npcs.length; i++) {
                            if ($rootScope.npcs[i]._id == id) {
                                $rootScope.npcs[i] = data;
                            }
                        }
                        delete self.changed[id];
                    })
                ;
            }
        }, 5000);

        self.changed[npc._id] = npc;
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
        return this.request('/npcs/' + $rootScope.npcs[index]._id, 'DELETE')
            .success(function (data) {
                $rootScope.npcs.splice(index, 1);
                console.log('npc removed');
            });
        ;
    };

    this.randomize = function (npc, section_id) {
        // clear for update
        delete self.changed[npc._id];

        return this.request('/npcs/' + npc._id+'/randomize?type='+section_id, 'POST', npc);
    }

    // recalculate stats
    this.recalculate = function (npc) {
        return; // recalculation now happends onUpdate at server level
    };
};
