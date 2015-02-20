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
                return input.join(delim);
            }
        })

        .directive('gmContainer', function () {
            return {
            };
        })

        .directive('gmPanels', function () {
            return {
                restrict: 'E',
                templateUrl: 'partial/panels.html',
                controller: ['$http', '$rootScope', function ($http, $rootScope) {
                    // load config
                    $rootScope.config = {};
                    $http.get('/config')
                        .success(function (data) {
                            $rootScope.config = data;
                            console.log(data);
                        })
                    ;
                }]
            }
        })

        .directive('npcPanel', function () {
            return {
                restrict: 'E',
                controller: ['$upload', '$http', '$scope', '$rootScope', 'NPCCollection', function ($upload, $http, $scope, $rootScope, NPCCollection) {
                    var self = this;

                    this.removeTag = function (npc, index) {
                        npc.tags.splice(index, 1);
                    };

                    this.addTag = function (npc) {
                        npc.tags = npc.tags || [];
                        npc.tags.push(self.newtag);
                        NPCCollection.update(npc)
                        self.newtag = "";
                    };

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
                        self.recalculate(npc);
                    };

                    this.changeBackground = function (npc) {
                        NPCCollection.update(npc);
                    }

                    this.addClass = function (npc) {
                        npc.classes.push({name: 'Barbarian', level: 1});
                        NPCCollection.update(npc);
                    };

                    this.addAttack = function (npc) {
                        npc.attacks.push({name: 'New attack', bonus: 0, damage: '', special: ''});
                        NPCCollection.update(npc);
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
                    }

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

                    this.toggleMaximize = function () {
                        $scope.npc.panel.maximized = !$scope.npc.panel.maximized;
                        NPCCollection.update($scope.npc);
                    };

                    this.toggleShow = function () {
                        $scope.npc.panel.show = !$scope.npc.panel.show;
                        NPCCollection.update($scope.npc);
                    };

                    this.toggleEdit = function () {
                        $scope.npc.panel.edit = !$scope.npc.panel.edit;
                        for (var i=0; i<$scope.npc.panel.sections.length; i++) {
                            $scope.npc.panel.sections[i].edit = $scope.npc.panel.edit;
                        }
                        NPCCollection.update($scope.npc);
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
                        NPCCollection.update($scope.npc);
                    }

                    this.isLocked = function (type) {
                        return $.inArray(type, $scope.npc.unlocked) == -1;
                    }
                }],
                'controllerAs': 'panelCtrl',
                link: function (scope, element, attrs) {
                    //$(element).sortable({
                    //    'connectWith': "gm-npc"
                    //});
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
        /*
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
        */

        .directive('npcSection', function () {
            return {
                controller: ['$scope', 'NPCCollection', function ($scope, NPCCollection) {
                    /**
                     * show or hide panel body (and save in npc.panel.sections)
                     */
                    this.toggleShow = function () {
                        $scope.section.show = !$scope.section.show;
                        NPCCollection.update($scope.npc);
                    }

                    /**
                     * randomize/refresh specific section
                     */
                    this.randomize = function () {
                        $scope.npc = NPCCollection.randomize($scope.npc, $scope.section.id)
                            .success(function (data) {
                                $scope.npc = data;
                            })
                        ;
                    }

                    /**
                     * Toggle section editing
                     */
                    this.toggleEdit = function () {
                        $scope.section.edit = !$scope.section.edit;
                        NPCCollection.update($scope.npc);
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
                            NPCCollection.update(scope.npc);
                        }
                    });
                }
            }
        }])

/*
        .directive('masonry', function($timeout) {
            return {
                restrict: 'AC',
                link: function(scope, elem, attrs) {
                    console.log(elem);
                    if (scope.npc.panel.sections.length > 0) {
                        for (var i=0; i<scope.npc.panel.sections.length; i++) {
                            //console.log(scope.npc.panel.sections[key].show);
                            if (scope.npc.panel.sections[i].show === false) {
                                var key = scope.npc.panel.sections[i].id;
                                console.log(key);
                                //console.log(key);
                                //console.log($('#' + key).find('.panel-body'));
                                $(elem).find('.'+key).find('.panel-body').toggleClass('hide');
                                var tg = $(elem).find('.'+key).find('.panel-heading .glyphicon');
                                $(tg).toggleClass('glyphicon-minus').toggleClass('glyphicon-plus');
                            }
                        }
                    }

                    var container = elem[0];
                    var options = angular.extend({
                        itemSelector: '.item'
                    }, angular.fromJson(attrs.masonry));

                    var masonry = scope.masonry = scope.$root.masonry = new Masonry(container, options);

                    var debounceTimeout = 0;
                    scope.update = function() {
                        if (debounceTimeout) {
                            $timeout.cancel(debounceTimeout);
                        }
                        debounceTimeout = $timeout(function() {
                            debounceTimeout = 0;

                            masonry.reloadItems();
                            masonry.layout();

                            elem.children(options.itemSelector).css('visibility', 'visible');
                        }, 120);
                    };

                    scope.$root.$on('masonry.update', scope.update);

                    scope.removeBrick = function() {
                        $timeout(function() {
                            masonry.reloadItems();
                            masonry.layout();
                        }, 500);
                    };

                    scope.appendBricks = function(ele) {
                        masonry.appended(ele);
                    };

                    scope.$on('masonry.layout', function() {
                        masonry.layout();
                    });

                    scope.update();
                }
            };
        })

        .directive('masonryTile', function(NPCCollection) {
            return {
                restrict: 'AC',
                link: function(scope, elem) {
                    window.setTimeout(function () {
                        var master = elem.parent('*[masonry]:first').scope(),
                            update = master.update,
                            removeBrick = master.removeBrick,
                            appendBricks = master.appendBricks;

                        if (update) {
                            //imagesLoaded( elem.get(0), update);
                            elem.ready(update);
                        }
                        if (appendBricks) {
                            //imagesLoaded( elem.get(0), appendBricks(elem));
                        }
                        scope.$on('$destroy', function() {
                            if (removeBrick) {
                                removeBrick();
                            }
                        });

                        $(elem).find('.resizable').on('click', function (event) {
                            $(elem).find('.panel-body').toggleClass('hide');
                            var tg = event.target;
                            if (tg.tagName != 'I') {
                                tg = $(tg).find('i.glyphicon');
                            }

                            if (typeof scope.npc.panel.sections == 'undefined')
                                scope.npc.panel.sections = [];

                            var obj = null;
                            for (var i=0; i<scope.npc.panel.sections.length; i++) {
                                if (scope.npc.panel.sections[i].id == $(elem).attr('class')) {
                                    obj = scope.npc.panel.sections[i];
                                }
                            }

                            if (obj === null)
                                obj = scope.npc.panel.sections.push({'id': $(elem).attr('class'), 'show': true});

                            obj.show = $(tg).hasClass('glyphicon-plus');

                            NPCCollection.update(scope.npc);

                            $(tg).toggleClass('glyphicon-minus').toggleClass('glyphicon-plus');
                            update();
                        });
                    },0 );
                }
            };
        });
*/
    ;
})();