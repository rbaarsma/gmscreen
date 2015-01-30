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

    .controller('PanelController', ['$http', '$rootScope', 'NPCCollection', function($http, $rootScope, NPCCollection) {
        var self=this;

        this.remove = function (index) {
            NPCCollection.update(index, {in_panel: false});
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
            'controller': ['$http', '$rootScope', 'NPCCollection', function($http, $rootScope, NPCCollection) {
                console.log('fetching npcs');
                var self=this;

                this.remove = function (index) {
                    NPCCollection.remove(index);
                };

                this.add = function (data) {
                    NPCCollection.add({'name': self.name});
                };

                this.addToPanel = function(index) {
                    NPCCollection.update(index, {in_panel: true});
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