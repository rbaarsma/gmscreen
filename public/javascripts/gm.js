/**
 * Main angular app
 *
 * @author Rein Baarsma <rein@solidwebcode.com>
 */
(function () {
    angular.module('gm', ['angularFileUpload'])

        // Service
        .factory('NPCCollection', ['$http', '$rootScope', function ($http, $rootScope) {
            return new NPCCollection($http, $rootScope);
        }])

        // filter to show + sign expressively for things like modifiers
        .filter('modifier', function () {
            return function (input) {
                input = parseInt(input);
                return input > 0 ? '+' + input : input;
            };
        })

        .directive('gmPanels', function () {
            return {
                'templateUrl': 'partial/panels.html',
                'controller': ['$upload', '$http', '$scope', '$rootScope', 'NPCCollection', function ($upload, $http, $scope, $rootScope, NPCCollection) {
                    var self = this;

                    $rootScope.config = {};
                    $http.get('/config')
                        .success(function (data) {
                            $rootScope.config = data;
                            // add subraces when race changes
                        })
                    ;

                    // image stuff
                    this.onFileSelect = function (npc, image) {
                        console.log('selected file');
                        if (angular.isArray(image)) {
                            image = image[0];
                        }

                        // This is how I handle file types in client side
                        if (image.type !== 'image/png' && image.type !== 'image/jpeg') {
                            alert('Only PNG and JPEG are accepted.');
                            return;
                        }

                        self.uploadInProgress = true;
                        self.uploadProgress = 0;

                        $upload.upload({
                            url: '/npcs/' + npc._id + '/picture',
                            method: 'POST',
                            file: image
                        }).progress(function (evt) {
                            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                        }).success(function (data, status, headers, config) {
                            self.uploadInProgress = false;
                            npc._picture_id = data._picture_id;

                            // If you need uploaded file immediately
                        }).error(function (err) {
                            self.uploadInProgress = false;
                            console.log('Error uploading file: ' + err.message || err);
                        });
                    };

                    this.recalculate = function (npc) {
                        NPCCollection.recalculate(npc);
                        NPCCollection.update(npc);
                    };

                    this.randomize = function (type, index) {
                        NPCCollection.randomize(type, index);
                    };

                    this.changeSkill = function (npc) {
                        for (var j = 0; j < $rootScope.config.SKILLS.length; j++) {
                            if (npc.skills[i].name == $rootScope.config.SKILLS[j].name) {
                                npc.skills[i].stat = $rootScope.config.SKILLS[j].stat;
                            }
                        }
                        self.recalculate(npc);
                    };

                    this.changeBackground = function (npc) {
                        NPCCollection.update(npc);
                    }

                    this.addClass = function (npc) {
                        npc.classes.push({name: 'Barbarian', level: 1});
                        NPCCollection.update(npc);
                    };

                    this.removeClass = function (npc, index) {
                        npc.classes.splice(index, 1);
                        NPCCollection.update(npc);
                    }

                    this.changeStat = function (npc, stat) {
                        stat.mod = Math.floor(stat.stat / 2) - 5;
                        NPCCollection.recalculate(npc);
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

                    this.remove = function (npc) {
                        npc.in_panel = false;
                        NPCCollection.update(npc);
                    };
                }],
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
                'controller': ['$http', '$rootScope', 'NPCCollection', function ($http, $rootScope, NPCCollection) {
                    console.log('fetching npcs');
                    var self = this;

                    this.remove = function (index) {
                        NPCCollection.remove(index);
                    };

                    this.add = function (data) {
                        NPCCollection.add({name: self.name, classes: [{name: 'Barbarian', level: 1}]});
                        self.name = "";
                    };

                    this.addToPanel = function (npc) {
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
        .directive('npcNew', function () {
            return {
                'templateUrl': 'partial/npc-new.html',
                'controller': ['$http', '$scope', 'NPCCollection', function ($http, $scope, NPCCollection) {
                    this.show = false;
                    $scope.npc = {
                        classes: [{name: '', level: ''}],
                        multiclass: true,
                        in_panel: true,
                        maximized: true
                    };

                    this.generate = function () {
                        NPCCollection.create($scope.npc);
                        this.show=false;
                    }
                    /*
                    this.addClass = function (npc) {
                        npc.classes.push({name: '', level: ''});
                    };

                    this.removeClass = function (npc, index) {
                        npc.classes.splice(index, 1);
                    }
                    */

                }],
                'controllerAs': 'modalCtrl'
            }
        })
    ;
})();