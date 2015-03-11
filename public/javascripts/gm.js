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

        // filter to show + sign expressively for things like modifiers
        .filter('dieaverage', function () {
            return function (input) {
                var dies = input.match(/[0-9]*d[0-9]+/ig);
                if (!dies || dies.length == 0)
                    return input;

                for (var i=0; i<dies.length; i++) {
                    var die = dies[i];
                    if (die.length == 2)
                        die = '1'+die;
                    var parts = die.split('d');
                    var average = Math.floor(parseInt(parts[0]) * (parseInt(parts[1])/2));
                    input = input.replace(die, average);
                }
                if (input.match(/[0-9\+\- ]+/)) {
                    eval("var t = " + input);
                    return t;
                }
                return '';
            };
        })

        // filter to join array to string
        .filter('join', function() {
            return function(input, delim) {
                // do some bounds checking here to ensure it has that index
                if (typeof input == 'object' && input instanceof Array)
                    return input.join(delim);
            }
        })

        .directive('gmContainer', function () {
            return {
                controller: ['$http', '$rootScope', 'NPCCollection', function ($http, $rootScope, NPCCollection) {
                    var self = this;

                    self.loaded = 0;
                    self.total_to_load = 3;

                    // load config
                    $rootScope.config = {};
                    $http.get('/config')
                        .success(function (data) {
                            $rootScope.config = data;
                            self.loaded++;
                        })
                    ;

                    // load user
                    $rootScope.user = {};
                    $http.get('/me')
                        .success(function (data) {
                            $rootScope.user = data;
                            self.loaded++;
                        })
                    ;

                    // load npcs
                    $http.get('/npcs')
                        .success(function (data) {
                            $rootScope.npcs = data;
                            $rootScope.npcs.sort(function(a, b){
                                if(a.name < b.name) return -1;
                                if(a.name > b.name) return 1;
                                return 0;
                            })
                            self.loaded++;
                        })
                    ;
                }],
                controllerAs: 'gmCtrl'
            };
        })

        .directive('gmSide', function () {
            return {
                restrict: 'E',
                templateUrl: 'partial/side.html',
                controller: ['$rootScope', '$scope', 'NPCCollection', function ($rootScope, $scope, NPCCollection) {
                    this.search = '';

                    this.addToPanel = function (npc) {
                        npc.panel.show = true;
                        NPCCollection.patch($scope.npc, 'panel');
                    }

                    this.toggleCollapsed = function () {
                        $rootScope.user.side_collapsed = !$rootScope.user.side_collapsed;
                    }

                    this.remove = function (index) {
                        NPCCollection.remove(index);
                    }

                    /**
                     * Automatically update NPC list when search is used
                     */
                    $scope.$watch(angular.bind(this, function () {
                        return this.search; // `this` IS the `this` above!!
                    }), function (newVal, oldVal) {
                        newVal = newVal.toLowerCase();
                        if (newVal == '')
                            return;

                        search:
                        for (var i=0; i<$rootScope.npcs.length; i++) {
                            if ($rootScope.npcs[i].name.toLowerCase().indexOf(newVal) > -1) {
                                $rootScope.npcs[i].panel.filtered = true;
                                continue;
                            }

                            // check tags
                            var tags = $rootScope.npcs[i].tags;
                            for (var j=0; j<tags.length; j++) {
                                if (tags[j] == newVal) {
                                    $rootScope.npcs[i].panel.filtered = true;
                                    continue search;
                                }
                            }

                            $rootScope.npcs[i].panel.filtered = false;
                        }
                    });
                }],
                controllerAs: 'sideCtrl'
            }
        })

        .directive('gmPanels', function () {
            return {
                restrict: 'E',
                templateUrl: 'partial/panels.html',
            }
        })

        .directive('npcPanel', function () {
            return {
                restrict: 'E',
                controller: ['$upload', '$http', '$scope', '$rootScope', 'NPCCollection', function ($upload, $http, $scope, $rootScope, NPCCollection) {
                    var self = this;

                    /**
                     *
                     * @param key in $scope.npc (only first level!)
                     */
                    this.npcChange = function (key) {
                        console.log(key);
                        if (typeof $scope.npc[key] == 'undefined')
                            throw Error('key '+key+' is not in $scope.npc: '+$scope.npc);
                        NPCCollection.patch($scope.npc, key);
                    }

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

                    this.randomizeAll = function () {
                        NPCCollection.randomize($scope.npc, 'all')
                            .success(function (data) {
                                $scope.npc = data;
                            })
                    };

                    this.changeSkill = function (npc) {
                        for (var i = 0; i < npc.skills.length; i++) {
                            for (var j = 0; j < $rootScope.config.SKILLS.length; j++) {
                                if (npc.skills[i].name == $rootScope.config.SKILLS[j].name) {
                                    npc.skills[i].stat = $rootScope.config.SKILLS[j].stat;
                                }
                            }
                        }
                        self.npcChange('skills');
                    };

                    this.addClass = function (npc) {
                        npc.classes.push({name: 'Barbarian', level: 1});
                        self.npcChange('classes');
                    };

                    this.addAttack = function (npc) {
                        npc.attacks.push({name: 'New attack', bonus: 0, damage: '', special: ''});
                        self.npcChange('attacks');
                    }

                    this.hasSave = function (npc, index) {
                        return $.inArray(index, npc.saves) > -1;
                    }

                    this.toggleSave = function (npc, index) {
                        var k = $.inArray(index, npc.saves);
                        if (k > -1) {
                            npc.saves.splice(k, 1);
                        } else {
                            npc.saves.push(index);
                        }
                        self.npcChange('saves');
                    }

                    this.removeClass = function (npc, index) {
                        npc.classes.splice(index, 1);
                        self.npcChange('classes');
                    }

                    this.changeStat = function (npc, stat) {
                        stat.mod = Math.floor(stat.stat / 2) - 5;
                        self.npcChange('stats');
                    };

                    this.toggleMaximize = function () {
                        $scope.npc.panel.maximized = !$scope.npc.panel.maximized;
                        self.npcChange('panel');
                    };

                    this.toggleShow = function () {
                        $scope.npc.panel.show = !$scope.npc.panel.show;
                        self.npcChange('panel');
                    };

                    this.toggleEdit = function () {
                        console.log('test');
                        $scope.npc.panel.edit = !$scope.npc.panel.edit;
                        for (var i=0; i<$scope.npc.panel.sections.length; i++) {
                            $scope.npc.panel.sections[i].edit = $scope.npc.panel.edit;
                        }
                        self.npcChange('panel');
                    };

                    this.sectionGroups = function (npc) {
                        if (!npc.panel.sections)
                            return;

                        var groups = [[],[],[],[]];
                        for (var i=0; i<npc.panel.sections.length; i++) {
                            var group_index = npc.panel.sections[i].group;
                            groups[group_index].push(npc.panel.sections[i]);
                        }
                        return groups;
                    }

                    this.toggleLocked = function (type) {
                        var k = $.inArray(type, $scope.npc.unlocked);
                        if (k > -1) {
                            $scope.npc.unlocked.splice(k, 1);
                        } else {
                            $scope.npc.unlocked.push(type);
                        }
                        self.npcChange('locked');
                    }

                    this.isLocked = function (type) {
                        return $.inArray(type, $scope.npc.unlocked) == -1;
                    }
                }],
                'controllerAs': 'panelCtrl',
                link: function (scope, element, attrs) {



                }
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
                }],
                'controllerAs': 'modalCtrl'
            }
        })

        .directive('npcSection', function () {
            return {
                controller: ['$scope', 'NPCCollection', function ($scope, NPCCollection) {
                    /**
                     * show or hide panel body (and save in npc.panel.sections)
                     */
                    this.toggleShow = function () {
                        $scope.section.show = !$scope.section.show;
                        NPCCollection.patch($scope.npc, 'panel');
                    }

                    /**
                     * randomize/refresh specific section
                     */
                    this.randomize = function () {
                        NPCCollection.randomize($scope.npc, $scope.section.id)
                            .success(function (data) {
                                $scope.npc = angular.extend($scope.npc, data);
                            })
                        ;
                    }

                    /**
                     * Toggle section editing
                     */
                    this.toggleEdit = function () {
                        $scope.section.edit = !$scope.section.edit;
                        NPCCollection.patch($scope.npc, 'panel');
                    }
                }],
                controllerAs: 'sectionCtrl',
                restrict: 'E'
            }
        })

        .directive('npcPanelColumn', ['NPCCollection', function (NPCCollection) {
            return {
                restrict: 'E',
                link: function (scope, elem, attrs) {
                    $(elem).sortable({
                        connectWith: "npc-panel-column",
                        placeholder: "section-placeholder ui-corner-all",
                        receive: function (event, ui) {
                            var panel_body = elem.parent().parent().parent();
                            var sections = [];

                            $(panel_body).find('npc-section').each(function (index, elem) {
                                var section_id = $(elem).data('section');

                                for (var i=0; i<scope.npc.panel.sections.length; i++) {
                                    if (scope.npc.panel.sections[i].id == section_id) {
                                        var section = scope.npc.panel.sections[i];
                                        break;
                                    }
                                }

                                sections.push({
                                    id: section_id,
                                    show: section.show,
                                    edit: section.edit,
                                    group: $(elem).parent().data('index')
                                });
                            });
                            scope.npc.panel.sections = sections;
                            NPCCollection.patch(scope.npc, 'panel');
                        }
                    });
                }
            }
        }])
    ;
})();