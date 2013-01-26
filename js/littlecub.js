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

        "templates": {},

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

        "isEmpty": function(val) {
            return _.isNull(val) || _.isUndefined(val);
        },

        "isValEmpty": function(val) {
            if (LittleCub.isEmpty(val)) {
                return true;
            }
            if (_.isString(val) && val == "") {
                return true;
            }
            if (_.isObject(val) && _.isEmpty(val)) {
                return true;
            }
            if (_.isArray(val) && val.length == 0) {
                return true;
            }
            if (_.isNumber(val) && _.isNaN(val)) {
                return true;
            }
            return false;
        },

        /**
         * Finds if an string ends with a given suffix.
         *
         * @param {String} text The string being evaluated.
         * @param {String} suffix Suffix.
         * @returns {Boolean} True if the string ends with the given suffix, false otherwise.
         */
        endsWith : function(text, suffix) {
            return text.indexOf(suffix, text.length - suffix.length) !== -1;
        },

        /**
         * Finds if an string starts with a given prefix.
         *
         * @param {String} text The string being evaluated.
         * @param {String} prefix Prefix
         * @returns {Boolean} True if the string starts with the given prefix, false otherwise.
         */
        startsWith : function(text, prefix) {
            //return (text.match("^" + prefix) == prefix);
            return text.substr(0, prefix.length) === prefix;
        },

        "registerTheme": function(theme, themeId) {
            themeId = themeId || theme["id"];
            if (themeId) {
                LittleCub.themes[themeId] = theme;
            }
        },

        "renderTemplate": function(template, data) {
            if (LittleCub["defaults"] && LittleCub["defaults"]["templateEngine"] == "handlebars" && Handlebars) {
                var template = LittleCub["templates"][template] || Handlebars.compile(template);
                return template(data);
            }
        },

        "registerTemplate": function(id, template, isTemplate) {
            if (LittleCub["defaults"] && LittleCub["defaults"]["templateEngine"] == "handlebars" && Handlebars) {
                if (isTemplate) {
                    LittleCub["templates"][id] = Handlebars.compile(template);
                } else {
                    Handlebars.registerPartial(id, Handlebars.compile(template));
                }
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

        /*
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
        */
        "loadThemes": function (themes, callback) {
            var nbThemes = _.size(themes);
            var nbResponses = 0;
            var startTag = "<script";
            var endTag = "</script>";

            _.each(themes, function(path,id) {
                var xmlHttpRequest = new XMLHttpRequest();
                xmlHttpRequest.open("GET", path, true);
                xmlHttpRequest.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var fileContent = this.responseText;
                        var startIndex = 0, endIndex = 0;
                        while (startIndex != -1 && endIndex != -1) {
                            startIndex = fileContent.indexOf(startTag,startIndex);
                            if (startIndex != -1) {
                                endIndex = fileContent.indexOf(endTag,startIndex);
                                if (endIndex != -1) {
                                    var closingIndex = fileContent.indexOf(">",startIndex);
                                    if (closingIndex != -1) {
                                        var scriptTag = fileContent.substring(startIndex + startTag.length, closingIndex);
                                        var idMatch = scriptTag.match(/id(\s*)=(\s*)(.*?)['"]+(.*?)['"]+/);
                                        if (idMatch != null) {
                                            var templateId = idMatch[idMatch.length - 1];
                                            var isTemplate = templateId.indexOf("template-") == 0;
                                            if (isTemplate) {
                                                templateId = templateId.substring(9);
                                            }
                                            var templateContent = fileContent.substring(closingIndex + 1, endIndex);
                                            LittleCub.registerTemplate(id + "__" + templateId, templateContent.trim(), isTemplate);
                                        }
                                    }
                                    startIndex = endIndex + endTag.length;
                                }
                            }
                        }
                        // continue execution in the callback
                        nbResponses++;
                        if (nbResponses == nbThemes) {
                            if (callback) {
                                callback();
                            }
                        }
                    }
                };
                xmlHttpRequest.send();
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