(function() {
    "use strict";

    var LittleCub = {
        "version": "0.1.0",

        "defaults": {
            "templateEngine": "handlebars",
            "schemaToControl": {
                "string": "text",
                "boolean": "checkbox",
                "number": "number",
                "integer": "integer",
                "array": "array",
                "object": "object"
            }
        },

        "themes": {},

        "logger": {
            DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, level: 3,

            methodMap: {0: 'debug', 1: 'info', 2: 'warn', 3: 'error'},

            // can be overridden in the host environment
            "log": function(level, obj) {
                if (LittleCub.logger.level <= level) {
                    var method = LittleCub.logger.methodMap[level];
                    if (typeof console !== 'undefined' && console[method]) {
                        console[method].call(console, obj);
                    }
                }
            }
        },

        "id": (function() {
            var _id = 0;
            return function() {
                _id ++;
                return "lc-" + _id;
            };
        })(),

        "typeControlClass": (function() {
            var _typeControlClass = {};
            return function() {
                var len = arguments.length;
                if (len === 1) {
                    return _typeControlClass[arguments[0]];
                } else if (len === 2){
                    if ( _.isString(arguments[0]) && !_.isNull(arguments[0])) {
                        _typeControlClass[arguments[0]] = arguments[1];
                        return arguments[1];
                    }
                }
            };
        })(),
        
        "formatControlClass": (function() {
            var _formatControlClass = {};
            return function() {
                var len = arguments.length;
                if (len === 1) {
                    return _formatControlClass[arguments[0]];
                } else if (len === 2){
                    if (_.isString(arguments[0]) && !_.isNull(arguments[0])) {
                        _formatControlClass[arguments[0]] = arguments[1];
                        return arguments[1];
                    }
                }
            };
        })(),

        "controlClass": (function() {
            var _controlClassRegistry = {};
            return function() {
                var len = arguments.length;
                if (len === 1) {
                    return _controlClassRegistry[arguments[0]];
                } else if (len === 2){
                    if (_.isString(arguments[0]) && !_.isNull(arguments[0])) {
                        _controlClassRegistry[arguments[0]] = arguments[1];
                        return arguments[1];
                    }
                }
            };
        })(),

        "log": function(level, obj) {
            LittleCub.logger.log(level, obj);
        },

        "cloneJSON": function(json) {
            return JSON.parse(JSON.stringify(json));
        },

        "prettyTitle": function(str) {
            return str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1);
            });
        },

        "registerTheme": function(theme, themeId) {
            themeId = themeId || theme["id"];
            if (themeId) {
                LittleCub.themes[themeId] = theme;
            }
        },

        "renderTemplate": function(template, data) {
            if (LittleCub["defaults"] && LittleCub["defaults"]["templateEngine"] == "handlebars" && Handlebars) {
                var template = Handlebars.compile(template);
                return template(data);
            }
        },

        "registerTemplate": function(id, template) {
            if (LittleCub["defaults"] && LittleCub["defaults"]["templateEngine"] == "handlebars" && Handlebars) {
                Handlebars.registerPartial(id, Handlebars.compile(template));
            }
        },

        "loadTemplate": function (themeId, path, callback) {
            $.ajax({
                "url":path,
                "type": "get",
                "dataType": "html",
                "success": function(data) {
                    _.each($(data).filter('script'), function(v) {
                        LittleCub.registerTemplate(themeId + "__" + $(v).attr("id"), $(v).text());
                    });
                    if (callback) {
                        callback();
                    }
                },
                "error": function(jqXHR, textStatus, errorThrown) {

                }
            });
        },

        "loadThemes": function (themes, callback) {

            var loadTheme = function(id, path) {
                console.log("Loading ... " + id);
                return $.ajax({
                    "url":path,
                    "type": "get",
                    "dataType": "html",
                    "success": function(data) {
                        console.log(path + " is loaded.");
                        _.each($(data).filter('script'), function(v) {
                            LittleCub.registerTemplate(id + "__" + $(v).attr("id"), $(v).text());
                        });
                    }
                });
            }

            var loadArray = [];
            for (var id in themes) {
                if (themes.hasOwnProperty(id)) {
                    loadArray.push(loadTheme(id, themes[id]));
                }
            }
            $.when.apply(this, loadArray).then(function () {
                console.log("All loadings are done.");
                if (callback) {
                    callback();
                }
            });
        }
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = LittleCub;
    } else if (typeof define === 'function' && define.amd) {
        define(function() {
            return LittleCub;
        });
    } else {
        (function() {
            return this || (0, eval)('this');
        }()).LittleCub = LittleCub;
    }
}());