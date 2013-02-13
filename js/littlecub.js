(function() {
    "use strict";

    var LittleCub = function(data, configs, schema, domElem) {
        schema = schema || {};
        configs = configs || {};
        schema["type"] = LC.schemaType(schema, configs, data);
        configs["type"] = LC.controlType(schema, configs, data);
        var controlClass = LittleCub.controlClass(configs["type"]);
        if (!controlClass) {
            configs["type"] = "text";
            controlClass = LittleCub.controlClass(configs["type"]);
        }
        var control = new controlClass(data, configs, schema);
        control.init();
        if (domElem) {
            control.render(domElem);
        }
        return control;
    };

    _.extend(LittleCub, {
        "version": "0.1.0",

        "defaults": {
            "locale": "en_US",
            "theme" : "default",
            "templateEngine": "handlebars",
            "validationEvent": "blur",
            "schemaToControl": {
                "string": "text",
                "boolean": "checkbox",
                "number": "number",
                "integer": "integer",
                "array": "array",
                "object": "object"
            },
            "formatToControl": {
                "date-time": "datetime",
                "email": "email",
                "hostname": "hostname",
                "ipv4": "ipv4",
                "ipv6": "ipv6",
                "uri": "uri"
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
                } else if (len === 2) {
                    if (_.isString(arguments[0]) && !_.isNull(arguments[0])) {
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
                } else if (len === 2) {
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
                } else if (len === 2) {
                    if (_.isString(arguments[0]) && !_.isNull(arguments[0])) {
                        _controlClassRegistry[arguments[0]] = arguments[1];
                        return arguments[1];
                    }
                } else if (len === 0) {
                    // return a duplicated copy
                    return _.clone(_controlClassRegistry);
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
            return str ? str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1);
            }) : "";
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

        "endsWith" : function(text, suffix) {
            return text.indexOf(suffix, text.length - suffix.length) !== -1;
        },

        "startsWith" : function(text, prefix) {
            return text.substr(0, prefix.length) === prefix;
        },

        "replaceTokens" : function(text, args) {
            if (!LittleCub.isEmpty(text)) {
                for (var i = 0, len = args.length; i < len; i++) {
                    var token = "{" + i + "}";
                    var index = text.indexOf(token);
                    if (index != -1) {
                        var nt = text.substring(0, index) + args[i] + text.substring(index + token.length);
                        text = nt;
                    }
                }
            }
            return text;
        },

        "compare" : function(obj1, obj2) {
            if (_.isObject(obj1) && _.isObject(obj2)) {
                return _.isEqual(obj1, obj2);
            } else if (_.isArray(obj1) && _.isArray(obj2)) {
                if (obj1.length != obj2.length) {
                    return false;
                } else {
                    var isSame = true;
                    for (var i = 0, len = obj1.length; i < len && isSame; i++) {
                        for (var j = 0, len2 = obj2.length; j < len2 && isSame; j++) {
                            isSame = this.compare(obj1[i], obj2[j]);
                        }
                    }
                    return isSame;
                }
            } else {
                return obj1 == obj2;
            }
        },

        "regExp" : function(text) {
            var flags = text.replace(/.*\/([gimy]*)$/, '$1');
            var pattern = text.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
            return new RegExp(pattern, flags);
        },

        "hasClass" : function(elem, className) {
            var regexp = LC.regExp('/(?:^|\\s)' + className +'(?!\\S)/');
            return elem.className.match(regexp);
        },

        "addClass" : function(elem, className) {
            if (!LC.hasClass(elem,className)) {
                elem.className += " " + className;
            }
        },

        "removeClass" : function(elem, className) {
            if (LC.hasClass(elem, className)) {
                var regexp = LC.regExp('/(?:^|\\s)' + className +'(?!\\S)/g');
                elem.className = elem.className.replace(regexp, '');
            }
        },

        "registerTheme": function(theme, themeId) {
            themeId = themeId || theme["id"];
            if (themeId) {
                LittleCub.themes[themeId] = theme;
            }
        },

        "findThemeConfig" : function(configId, themeId) {
            var theme = LittleCub.themes[themeId];
            var config = theme[configId];
            var parentThemeId = theme["parent"];
            while (!config && parentThemeId) {
                theme = LittleCub.themes[parentThemeId];
                config = theme[configId];
                parentThemeId = theme["parent"];
            }
            return config;
        },

        "findMessage" : function(messageId, themeId, locale) {
            var theme = LittleCub.themes[themeId];
            locale = locale || LittleCub.defaults.locale;
            var message = theme["messages"] && theme["messages"][locale] ? theme["messages"][locale][messageId] : null;
            var parentThemeId = theme["parent"];
            while (!message && parentThemeId) {
                theme = LittleCub.themes[parentThemeId];
                message = theme["messages"] && theme["messages"][locale] ? theme["messages"][locale][messageId] : null;
                parentThemeId = theme["parent"];
            }
            if (message) {
                return message;
            } else if (locale != LittleCub.defaults.locale) {
                return this.findMessage(messageId, themeId, LittleCub.defaults.locale);
            }
        },

        "findTemplate" : function(themeId, partialId) {
            var fullId = themeId + "__" + partialId;
            var template = Handlebars.partials[fullId] || LittleCub["templates"][fullId];
            // check parent theme
            var theme = LittleCub.themes[themeId];
            var parentThemeId = theme["parent"];
            while (!template && parentThemeId) {
                fullId = parentThemeId + "__" + partialId;
                template = Handlebars.partials[fullId] || LittleCub["templates"][fullId];
                parentThemeId = theme["parent"];
                theme = LC.themes[parentThemeId];
            }
            return template;
        },

        "renderTemplate": function(themeId, templateId, data) {
            if (LittleCub["defaults"] && LittleCub["defaults"]["templateEngine"] == "handlebars" && Handlebars) {
                var template = this.findTemplate(themeId, templateId) || Handlebars.compile(template);
                return template(data).trim();
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

        "loadThemes": function (themes, callback) {
            var nbThemes = _.size(themes);
            var nbResponses = 0;
            var startTag = "<script";
            var endTag = "</script>";

            _.each(themes, function(path, id) {
                var xmlHttpRequest = new XMLHttpRequest();
                xmlHttpRequest.open("GET", path, true);
                xmlHttpRequest.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        var fileContent = this.responseText;
                        var startIndex = 0, endIndex = 0;
                        while (startIndex != -1 && endIndex != -1) {
                            startIndex = fileContent.indexOf(startTag, startIndex);
                            if (startIndex != -1) {
                                endIndex = fileContent.indexOf(endTag, startIndex);
                                if (endIndex != -1) {
                                    var closingIndex = fileContent.indexOf(">", startIndex);
                                    if (closingIndex != -1) {
                                        var scriptTag = fileContent.substring(startIndex + startTag.length, closingIndex);
                                        var idMatch = scriptTag.match(/id(\s*)=(\s*)(.*?)['"]+(.*?)['"]+/);
                                        if (idMatch != null) {
                                            var templateId = idMatch[idMatch.length - 1];
                                            var templateIdList = templateId.split(",");
                                            _.each(templateIdList, function (v) {
                                                var _id = v.trim();
                                                if (_id) {
                                                    var isTemplate = _id.indexOf("template-") == 0;
                                                    if (isTemplate) {
                                                        _id = _id.substring(9);
                                                    }
                                                    var templateContent = fileContent.substring(closingIndex + 1, endIndex);
                                                    LittleCub.registerTemplate(id + "__" + _id, templateContent.trim(), isTemplate);
                                                }
                                            });
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
        },

        schemaType: function(schema, configs, data) {
            var schema = schema || this.schema;
            var configs = configs || this.configs;
            var data = data || this.data;
            if (schema["type"]) {
                return schema["type"];
            }
            if (configs["type"]) {
                _.every(LittleCub["defaults"]["schemaToControl"], function(v, k) {
                    if (v === configs["type"]) {
                        return schema["type"] = k;
                    } else {
                        return true;
                    }
                });
                if (schema["type"]) {
                    return schema["type"];
                }
            }
            if (_.isNull(data) || _.isUndefined(data)) {
                return "string";
            }
            if (_.isArray(data)) {
                return "array";
            }
            if (_.isObject(data)) {
                return "object";
            }
            if (_.isString(data)) {
                return "string";
            }
            if (_.isNumber(data)) {
                return "number";
            }
            if (_.isBoolean(data)) {
                return "boolean";
            }
            return "string";
        },

        controlType: function(schema, configs) {
            var schema = schema || this.schema;
            var configs = configs || this.configs;
            if (configs["type"]) {
                return configs["type"];
            }
            if (schema["type"] && schema["enum"]) {
                if (schema["enum"].length > 3) {
                    return "select";
                } else {
                    return "radio";
                }
            }
            if (schema["format"] && LittleCub["defaults"]["formatToControl"][schema["format"]]) {
                return LittleCub["defaults"]["formatToControl"][schema["format"]];
            }
            return LittleCub["defaults"]["schemaToControl"][schema["type"]] || "text";
        }
    });

    var LC = LittleCub;

    // In case bind is not implemented
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (oThis) {
            if (typeof this !== "function") {
                // closest thing possible to the ECMAScript 5 internal IsCallable function
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }

            var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {
            }, fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }

    // for jquery
    if (typeof jQuery != 'undefined') {
        $.littlecub = $.lc = LittleCub;

        $.fn.littlecub = $.fn.lc = function() {
            var controls = [];
            for (var i = 0; i < this.length; i++) {
                var args = _.toArray(arguments);
                while (args.length < 3) {
                    args.push(null);
                }
                args.push(this[i]);
                controls.push(LittleCub.apply(this, args));
            }
            return controls.length == 1 ? controls[0] : controls;
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = LittleCub;
    } else if (typeof define === 'function' && define.amd) {
        define("littlecub", [], function() {
            return LittleCub;
        });
    } else {

        var env = function() {
            return this || (0, eval)('this');
        };
        (env)().LittleCub = (env)().LC = LittleCub;
    }
}());