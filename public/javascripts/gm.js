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
                for (var i=0; i<dies.length; i++) {
                    var die = dies[i];
                    console.log(die);
                    if (die.length == 2)
                        die = '1'+die;
                    var parts = die.split('d');
                    var average = Math.floor(parseInt(parts[0]) * (parseInt(parts[1])/2));
                    console.log(die, average, input);
                    input = input.replace(die, average);
                    console.log(input);
                }
                if (input.match(/[0-9\+\- ]+/)) {
                    console.log(input);
                    eval("var t = " + input);
                    return t;
                }
                return '';
            };
        })

        .directive('gmContainer', function () {
            return {
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
                            console.log(data);
                        })
                    ;

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

                    this.randomize = function (type, index) {
                        NPCCollection.randomize(type, index);
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

                    this.isEditing = function (npc, section) {
                        return $.inArray(section, npc.editing) > -1;
                    };

                    this.toggleEditing = function (npc, section) {
                        console.log(npc.editing);
                        console.log(section);
                        var index = $.inArray(section, npc.editing);
                        if (index > -1) {
                            npc.editing.splice(index, 1);
                        } else {
                            console.log(section);
                            npc.editing.push(section);
                        }
                        NPCCollection.update(npc);
                    }
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
                        console.log($rootScope);

                        $rootScope.$broadcast('masonry.update');
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
                }],
                'controllerAs': 'modalCtrl'
            }
        })

        .directive('masonry', function($timeout) {
            return {
                restrict: 'AC',
                link: function(scope, elem, attrs) {
                    console.log(elem);
                    if (scope.npc.sections.length > 0) {
                        for (var i=0; i<scope.npc.sections.length; i++) {
                            //console.log(scope.npc.sections[key].show);
                            if (scope.npc.sections[i].show === false) {
                                var key = scope.npc.sections[i].id;
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

                            if (typeof scope.npc.sections == 'undefined')
                                scope.npc.sections = [];

                            var obj = null;
                            for (var i=0; i<scope.npc.sections.length; i++) {
                                if (scope.npc.sections[i].id == $(elem).attr('class')) {
                                    obj = scope.npc.sections[i];
                                }
                            }

                            if (obj === null)
                                obj = scope.npc.sections.push({'id': $(elem).attr('class'), 'show': true});

                            obj.show = $(tg).hasClass('glyphicon-plus');

                            NPCCollection.update(scope.npc);

                            $(tg).toggleClass('glyphicon-minus').toggleClass('glyphicon-plus');
                            update();
                        });
                    },0 );
                }
            };
        });
    ;
})();