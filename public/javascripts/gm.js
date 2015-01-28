/**
 * Main angular app
 *
 * @author Rein Baarsma <rein@solidwebcode.com>
 */

angular.module('gm', [])

    // Service
    .factory('NPCs', ['$http', function($http){
        return $http.get('/npcs');
    }])

    .directive('gmSide', function () {
       return {
           'templateUrl': 'partial/side.html',
           'controller': ['$http', 'NPCs', function($http, NPCs) {
               console.log('fetching npcs');
               var self=this;
               NPCs.success(function(data){
                   console.log('npcs obtained');
                   console.log(data);
                   self.npcs = data;
               }).error(function(data, status){
                   console.log(data, status);
                   self.npcs = [];
               });

               this.remove = function (index) {
                   var id = self.npcs[index]._id;
                   self.npcs[index].loading = true;

                   $http.delete('/npcs/'+id)
                       .success(function (data) {
                           self.npcs.splice(index,1);
                           console.log('npc removed');
                       }).error(function(data, status){
                           console.log(data, status);
                       })
                   ;
               };

               this.add = function (data) {
                   var npc = {'name': self.name, loading: true};
                   var index = self.npcs.push(npc);
                   $http.post('/npcs', npc)
                       .success(function (data) {
                           data.loading = false;
                           self.npcs[index-1] = data;
                           console.log('npc added');
                       }).error(function(data, status){
                           console.log(data, status);
                       })
                   ;
               }
           }],
           'controllerAs': 'side'
       };
    })
    .directive('gmNpc', function () {
        return {
            link: function (scope, element, attrs) {
                $(element).draggable({
                    connectToSortable: 'gm-main',
                    helper: 'clone',
                    revert: 'invalid',
                    stop: function (event, ui) {
                        var npc = scope.$parent.side.npcs[scope.$index];
                        ui.helper[0].innerHTML = npc;
                    }
                });
            }
        };
    })
    .directive('gmMain', function () {
        return {
            link: function (scope, element, attrs) {
                $(element).sortable({
                    'connectWith': "gm-npc"
                });
            }
        }
    })
;