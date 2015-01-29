/**
 * Main angular app
 *
 * @author Rein Baarsma <rein@solidwebcode.com>
 */

var NPCs = function ($http) {
    this.npcs = [];

    this.update = function (npc) {
        $http.post('/npcs/'+npc._id, npc)
            .success(function (data) {
                data.loading = false;
                console.log('npc updated');
            }).error(function(data, status){
                console.log(data, status);
            })
        ;
    };
};

angular.module('gm', [])

    // Service
    .factory('NPCs', ['$http', function($http){
        return new NPCs($http);
    }])

    .controller('PanelController', ['$http', '$rootScope', 'NPCs', function($http, $rootScope, NPCs) {
        var self=this;

        this.remove = function (index) {
            $rootScope.npcs[index].in_panel = false;
            NPCs.update($rootScope.npcs[index]);
        }
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
            'controller': ['$http', '$rootScope', 'NPCs', function($http, $rootScope, NPCs) {
                console.log('fetching npcs');
                var self=this;
                $http.get('/npcs').success(function(data){
                    console.log('npcs obtained');
                    console.log(data);
                    $rootScope.npcs = data;
                }).error(function(data, status){
                    console.log(data, status);
                    $rootScope.npcs = [];
                });

                this.remove = function (index) {
                    var id = $rootScope.npcs[index]._id;
                    $rootScope.npcs[index].loading = true;

                    $http.delete('/npcs/'+id)
                        .success(function (data) {
                            $rootScope.npcs.splice(index,1);
                            console.log('npc removed');
                        }).error(function(data, status){
                            console.log(data, status);
                        })
                    ;
                };

                this.add = function (data) {
                    var npc = {'name': self.name, loading: true};
                    var index = $rootScope.npcs.push(npc);
                    $http.post('/npcs', npc)
                        .success(function (data) {
                            data.loading = false;
                            $rootScope.npcs[index-1] = data;
                            console.log('npc added');
                        }).error(function(data, status){
                            console.log(data, status);
                        })
                    ;
                };

                this.addToPanel = function(index) {
                    $rootScope.npcs[index].in_panel = true;
                    NPCs.update($rootScope.npcs[index]);
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