/**
 * Main angular app
 *
 * @author Rein Baarsma <rein@solidwebcode.com>
 */

angular.module('gm', [])

    // Service
    .factory('NPCCollection', ['$http', '$rootScope', function($http, $rootScope){
        return new NPCCollection($http, $rootScope);
    }])

    // filter to show + sign expressively for things like modifiers
    .filter('modifier', function() {
        return function(input) {
            input = parseInt(input);
            return input > 0 ? '+'+input : input;
        };
    })

    .controller('PanelController', ['$http', '$rootScope', 'NPCCollection', function($http, $rootScope, NPCCollection) {
        var self=this;

        self.classes = NPCCollection.CLASSES;

        this.addClass = function (npc) {
            npc.classes.push({name: 'Barbarian', level: 1});
            console.log(npc.classes);
            NPCCollection.update(npc);
        };

        this.removeClass = function (npc, index) {
            npc.classes.splice(index, 1);
            NPCCollection.update(npc);
        }

        this.changeStat = function (npc, stat) {
            stat.mod = Math.floor(stat.stat / 2) - 5;
            NPCCollection.recalculate(npc, stat);
            NPCCollection.update(npc);
        };

        this.changeLevel = function (npc) {
            console.log('changelevel');
            console.log(npc.classes);
            var level = 0;
            for (k in npc.classes) {
                console.log(npc.classes[k].level);
                level += npc.classes[k].level;
            }
            npc.lvl = level;
            NPCCollection.recalculate(npc);
            NPCCollection.update(npc);
        }

        this.generate = function (index) {
            var npc = $rootScope.npcs[index];
            $http.post('/npcs/'+ npc._id+'/generate', npc)
                .success(function(data) {
                    $rootScope.npcs[index] = data;
                    NPCCollection.recalculate($rootScope.npcs[index]);
                })
            ;
        };

        this.remove = function (npc) {
            npc.in_panel = false;
            NPCCollection.update(npc);
        };
    }])

    .directive('gmPanels', function () {
        return {
            'templateUrl': 'partial/panels.html',
            'controller': 'PanelController',
            'controllerAs': 'panelCtrl',
            link: function (scope, element, attrs) {
                $(element).sortable({
                    'connectWith': "gm-npc"
                });
            }

        };
    })

    .directive('gmSide', function () {
        return {
            'templateUrl': 'partial/side.html',
            'controller': ['$http', '$rootScope', 'NPCCollection', function($http, $rootScope, NPCCollection) {
                console.log('fetching npcs');
                var self=this;

                this.remove = function (index) {
                    NPCCollection.remove(index);
                };

                this.add = function (data) {
                    NPCCollection.add({name: self.name, classes: [{name: 'Barbarian', level: 1}]});
                    self.name = "";
                };

                this.addToPanel = function(npc) {
                    npc.in_panel = true;
                    NPCCollection.update(npc);
                }
            }],
            'controllerAs': 'sideCtrl'
        };
    })
    .directive('npcItem', function () {
        return {
            link: function (scope, element, attrs) {
                $(element).draggable({
                    connectToSortable: 'gm-main',
                    helper: 'clone',
                    revert: false,
                    stop: function (event, ui) {
                        scope.$parent.sideCtrl.addToPanel(scope.$index);
                        //ui.helper[0].innerHTML = npc;
                    }
                });
            }
        };
    })
;