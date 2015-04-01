/**
 * Main angular app
 *
 * @author Rein Baarsma <rein@solidwebcode.com>
 */
(function () {
    angular.module('gm', ['angularFileUpload'])

        .service('NPCManager', ['$http', NPCManager])

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

        /*
         This directive allows us to pass a function in on an enter key to do what we want.
         */
        .directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if(event.which === 13) {
                        scope.$apply(function (){
                            scope.$eval(attrs.ngEnter);
                        });

                        event.preventDefault();
                    }
                });
            };
        })

        .directive("ngEscape", function() {
            return function(scope, element, attrs) {
                var target = angular.element(window);
                if (element.nodeName == 'INPUT') {
                    target = element;
                }

                element.bind("keydown keypress", function (event) {
                    if(event.which === 27) {
                        scope.$apply(function (){
                            scope.$eval(attrs.ngEscape);
                        });

                        event.preventDefault();
                    }
                });
            };
        })

        .directive('focusOn',function($timeout) {
            return {
                restrict : 'A',
                link : function($scope,$element,$attr) {
                    $scope.$watch($attr.focusOn,function(_focusVal) {
                        $timeout(function() {
                            _focusVal ? $element[0].focus() :
                                $element[0].blur();
                        });
                    });
                }
            }
        })

        /**
         * Main Controller
         */
        .controller('npcController', ['$http', '$scope', 'NPCManager', function ($http, $scope, NPCManager) {
            var self = this;

            $scope.NPCManager = NPCManager;
            
            self.loaded = 0;
            self.total_to_load = 3;

            // load config
            $scope.config = {};
            $http.get('/config')
                .success(function (data) {
                    $scope.config = data;
                    self.loaded++;
                })
            ;

            // load user
            $scope.user = {};
            $http.get('/me')
                .success(function (data) {
                    $scope.user = data;
                    self.loaded++;
                })
                .error(function (data) {
                    console.log('not logged in');
                })
            ;

            $scope.npcs = NPCManager.get();

            // toggle side menu
            $scope.toggleSide = function () {
                $scope.user.side_collapsed = !$scope.user.side_collapsed;
            }

            $scope.patch = function (npc, key) {
                NPCManager.patch(npc, key);
            }

            $scope.log = function (msg) {
                console.log(msg);
            }

            $scope.addToPanel = function (npc) {
                $scope.panels.add('npc', npc);
            }
        }])

        .directive('npcSide', function () {
            return {
                restrict: 'E',
                templateUrl: 'partial/side.html',
                controller: ['$scope', 'NPCManager', function ($scope, NPCManager) {
                    this.search = '';

                    this.remove = function (index) {
                        NPCManager.remove(index);
                    }

                    // add
                    $scope.addFirstSearchResultToPanel = function () {
                        for (var i=0; i<$scope.npcs.length; i++) {
                            if ($scope.npcs[i].filtered == true) {
                                $scope.panels.add('npc', $scope.npcs[i]);
                            }
                        }
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
                        for (var i=0; i<$scope.npcs.length; i++) {
                            if ($scope.npcs[i].name.toLowerCase().indexOf(newVal) > -1) {
                                $scope.npcs[i].filtered = true;
                                continue;
                            }

                            // check tags
                            var tags = $scope.npcs[i].tags;
                            for (var j=0; j<tags.length; j++) {
                                if (tags[j] == newVal) {
                                    $scope.npcs[i].filtered = true;
                                    continue search;
                                }
                            }

                            $scope.npcs[i].filtered = false;
                        }
                    });
                }],
                controllerAs: 'sideCtrl'
            }
        })

        /*
         * An attempt to seperate panel logic in it's own controller
         */
        .directive('gmPanels', function () {
            return {
                restrict: 'E',
                templateUrl: 'partial/panels.html',
                controller: ['$scope', 'NPCManager', function ($scope, NPCManager) {
                    $scope.panels = [];
                    $scope.panels.add = function (type, obj) {
                        // check if already in panels
                        for (var i=0; i<$scope.panels.length; i++) {
                            console.log($scope.panels[i].obj._id, obj._id);
                            if ($scope.panels[i].obj._id == obj._id) {
                                return false;
                            }
                        }

                        // otherwise add it
                        $scope.panels.push({
                            obj: obj,
                            type: type
                        });

                        // TODO: when it's not only about NPCs, this should change..
                        obj.in_panel = true;
                        NPCManager.patch(obj, 'in_panel');
                    }

                    $scope.panels.remove = function (index) {
                        $scope.panels[index].obj.in_panel = false;
                        NPCManager.patch($scope.panels[index].obj, 'in_panel');
                        $scope.panels.splice(index, 1);
                    }

                    // TODO: is this also the best performant? Maybe more logical is that the NPCCollection has a success method that adds the panels.
                    // initially load panels from npc that have in_panel=true
                    var unbindWatcher = $scope.$watchCollection('npcs', function (newval) {
                        if (newval.length > 0) {
                            for (var i=0; i<newval.length; i++) {
                                if (newval[i].in_panel) {
                                    $scope.panels.add('npc', newval[i]);
                                }
                            }
                            unbindWatcher();
                        }
                    });

                    console.log('test');
                }],
                controllerAlias: 'panelCtrl'
            }
        })

        .directive('npcPanel', function () {
            return {
                restrict: 'E',
                templateUrl: 'partial/npc-panel.html'
            }
        })


        /*
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
        */

        .directive('npcNew', function () {
            return {
                'templateUrl': 'partial/npc-new.html',
                scope: {
                    'visible': '=',
                    'config': '='
                },
                'controller': ['$http', '$scope', 'NPCManager', function ($http, $scope, NPCManager) {
                    $scope.$watch('visible', function (newval) {
                        if (newval === true) {

                        }
                    })

                    $scope.npc = {
                        classes: [{name: '', level: ''}],
                        multiclass: true,
                        in_panel: true,
                    };

                    this.generate = function () {
                        NPCManager.create($scope.npc);
                        $scope.visible = false;
                    }
                }],
                'controllerAs': 'npcNewCtrl'
            }
        })

         .directive('npcEdit', function () {
            return {
                restrict: 'E',
                templateUrl: 'partial/npc-modal.html',
                controller: ['$upload', '$http', '$scope', 'NPCManager', function ($upload, $http, $scope, NPCManager) {
                    var self = this;

                    this.npcChange = function (key) {
                        if (typeof $scope.npc[key] == 'undefined')
                            throw Error('key '+key+' is not in $scope.npc: '+$scope.npc);
                        $scope.npcs[$scope.npc.index] = $scope.npc;
                        NPCManager.patch($scope.npc, key);
                    }

                    // image stuff
                    this.onFileSelect = function (npc, image) {
                        if (angular.isArray(image)) {
                            image = image[0];
                        }
                        if (typeof image == 'undefined') {
                            throw new Error('Image is undefined');
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

                    this.addCantrip = function (cantrips) {
                        if (cantrips.indexOf(this.cantrip_to_add) == -1) {
                            cantrips.push(this.cantrip_to_add);
                            self.npcChange('classes');
                        }
                        self.cantrip_to_add = '';
                    }

                    this.addSpell = function (spells) {
                        if (spells.indexOf(this.spell_to_add) == -1) {
                            spells.push(this.spell_to_add);
                            self.npcChange('classes');
                        }
                        self.spell_to_add = '';
                    }

                    this.randomizeAll = function () {
                        NPCManager.randomize($scope.npc, 'all')
                            .success(function (data) {
                                $scope.npc = data;
                            })
                    };

                    this.changeSkill = function (npc) {
                        for (var i = 0; i < npc.skills.length; i++) {
                            for (var j = 0; j < $scope.config.SKILLS.length; j++) {
                                if (npc.skills[i].name == $scope.config.SKILLS[j].name) {
                                    npc.skills[i].stat = $scope.config.SKILLS[j].stat;
                                    npc.skills[i].mod = npc.stats[npc.skills[i].stat].mod + npc.prof;
                                }
                            }
                        }
                        self.npcChange('skills');
                    };

                    this.changeClass = function (index, name, cls) {
                        var clsnames = [];
                        for (var i=0; i<$scope.config.CLASSES.length; i++) {
                            clsnames.push($scope.config.CLASSES[i].name);
                        }

                        $scope.npc.classes[index].index = clsnames.indexOf(name);
                        $scope.npc.classes[index].path = '';
                        $scope.npc.classes[index].fighting_style = '';

                        this.npcChange('classes');
                    }

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

                    this.toggleLocked = function (type) {
                        var k = $.inArray(type, $scope.npc.unlocked);
                        if (k > -1) {
                            $scope.npc.unlocked.splice(k, 1);
                        } else {
                            $scope.npc.unlocked.push(type);
                        }
                        self.npcChange('unlocked');
                    }

                    this.isLocked = function (type) {
                        if (typeof $scope.npc == 'undefined')
                            return;
                        return $.inArray(type, $scope.npc.unlocked) == -1;
                    }

                    this.show = function (npc, index) {
                        $scope.npc = npc;
                        $scope.npc.index = index;
                        this.visible = true;
                    }

                    // randomize/refresh specific section
                    this.randomize = function (title) {
                        NPCManager.randomize($scope.npc, title.toLowerCase())
                            .success(function (data) {
                                $scope.npc = angular.extend($scope.npc, data);
                            })
                        ;
                    }

                    this.isEditing = function (npc, title) {
                        if (npc)
                            return npc.edit_panels.indexOf(title) == -1;
                    }

                }],
                'controllerAs': 'npcEditCtrl'
            }
        })


        .directive('panel', function () {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    'title': '@',
                    'npc': '='
                },
                controller: ['$scope', 'NPCManager', function ($scope, NPCManager) {
                    // show or hide panel body (and save)
                    this.toggleShow = function () {
                        if (typeof $scope.npc.closed_panels == 'undefined') {
                            $scope.npc.closed_panels = [];
                        }

                        var index = $scope.npc.closed_panels.indexOf($scope.title);
                        if (index == -1) {
                            $scope.npc.closed_panels.push($scope.title);
                        } else {
                            $scope.npc.closed_panels.splice(index, 1);
                        }
                        NPCManager.patch($scope.npc, 'closed_panels');
                    }

                    // toggle editing modus
                    this.toggleEdit = function () {
                        if (typeof $scope.npc.edit_panels == 'undefined') {
                            $scope.npc.edit_panels = [];
                        }

                        var index = $scope.npc.edit_panels.indexOf($scope.title);
                        if (index == -1) {
                            $scope.npc.edit_panels.push($scope.title);
                        } else {
                            $scope.npc.edit_panels.splice(index, 1);
                        }

                        // also open panel for editing if it was closed
                        var index = $scope.npc.closed_panels.indexOf($scope.title);
                        if (index > -1) {
                            $scope.npc.closed_panels.splice(index, 1);
                            NPCManager.patch($scope.npc, 'edit_panels');
                        }

                        NPCManager.patch($scope.npc, 'edit_panels');
                    }

                    // randomize/refresh specific section
                    this.randomize = function (section) {
                        NPCManager.randomize($scope.npc, $scope.title.toLowerCase())
                            .success(function (data) {
                                $scope.npc = angular.extend($scope.npc, data);
                            })
                        ;
                    }
                }],
                controllerAs: 'panelCtrl',
                template: '\
                    <div class="panel panel-primary">\
                        <div class="panel-heading">\
                            <button ng-click="panelCtrl.toggleShow(npc)" class="pull-right btn btn-xs"><i ng-class="{\'glyphicon-plus\': npc.closed_panels.indexOf(title) > -1, \'glyphicon-minus\': npc.closed_panels.indexOf(title) == -1}" class="glyphicon"></i></button>\
                            <button ng-click="panelCtrl.toggleEdit(npc)" class="pull-right btn btn-xs"><i class="glyphicon"  ng-class="{\'glyphicon-search\': npc.edit_panels.indexOf(title) == -1, \'glyphicon-pencil\': npc.edit_panels.indexOf(title) > -1}"></i></button>\
                            <button ng-click="panelCtrl.randomize(npc)" class="pull-right btn btn-xs"><i class="glyphicon glyphicon-repeat"></i></button>\
                            {{ title }}\
                        </div>\
                        <div class="panel-body" ng-transclude ng-show="npc.closed_panels.indexOf(title) == -1"></div>\
                    </div>',
                link: function (scope, elem, attrs) {
                    scope.title = attrs.title;
                    elem.parent().parent().parent().css('max-height', 'calc(100vh - 120px)');
                }
            }
        })
    ;
})();