/**
 * Keeps track of a global npcs object
 *
 * @param $http
 * @param $rootScope
 * @constructor
 */
var NPCCollection = function ($http, $rootScope) {
    $rootScope.npcs = [];

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
            })
        ;
    };

    // update single NPC
    this.update = function (index, data) {
        if (typeof data != 'object')
            throw new Error('invalid object to update npc');

        data.loading = true;
        for (var k in data) {
            $rootScope.npcs[index][k] = data[k];
        }

        var npc = $rootScope.npcs[index];

        return this.request('/npcs/' + npc._id, 'PATCH', npc)
            .then(function (data) {
                $rootScope.npcs[index].loading = false;
                console.log('npc updated');
            });
        ;
    };

    // add single NPC
    this.add = function (data) {
        data.loading = true;
        var index = $rootScope.npcs.push(data);
        console.log(data);
        return this.request('/npcs', 'POST', data)
            .success(function (data) {
                console.log(data);
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

    this.load();
};
