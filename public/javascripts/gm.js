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
           'controller': ['NPCs', function(NPCs) {
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
           }],
           'controllerAs': 'side'
       };
    })
;