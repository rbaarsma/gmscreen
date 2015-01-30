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

        this.templates = [
            {'name': 'test'}
        ];

        this.changeStat = function (npc, stat) {
            stat.mod = Math.floor(stat.stat/2)-5;
            NPCCollection.update(npc);
        };

        this.generate = function (index) {
            console.log('generating');
            $http.post('/npcs/'+ $rootScope.npcs[index]._id+'/generate', $rootScope.npcs[index])
                .success(function(data) {
                    console.log(data);
                    console.log(data.stats);
                    $rootScope.npcs[index] = data;
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
                    NPCCollection.add({name: self.name});
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