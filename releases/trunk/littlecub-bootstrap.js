/*!
Copyright 2014 NextFrontier Technologies Inc.

Licensed under the Apache License, Version 2.0 (the "License"); 
you may not use this file except in compliance with the License. 

You may obtain a copy of the License at 
	http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software 
distributed under the License is distributed on an "AS IS" BASIS, 
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
See the License for the specific language governing permissions and 
limitations under the License. 

For more information, please contact NextFrontier Technologies Inc. at this
address:

  drq@nxfinc.com
*/

;/*!
	Base.js, version 1.1a
	Copyright 2006-2010, Dean Edwards
	License: http://www.opensource.org/licenses/mit-license.php
*/
/**
 * @ignore
 */
var Base = function() {
	// dummy
};

Base.extend = function(_instance, _static) { // subclass
	var extend = Base.prototype.extend;
	
	// build the prototype
	Base._prototyping = true;
	var proto = new this;
	extend.call(proto, _instance);
  proto.base = function() {
    // call this method from any other method to invoke that method's ancestor
  };
	delete Base._prototyping;
	
	// create the wrapper for the constructor function
	//var constructor = proto.constructor.valueOf(); //-dean
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!Base._prototyping) {
			if (this._constructing || this.constructor == klass) { // instantiation
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else if (arguments[0] != null) { // casting
				return (arguments[0].extend || extend).call(arguments[0], proto);
			}
		}
	};
	
	// build the class interface
	klass.ancestor = this;
	klass.extend = this.extend;
	klass.forEach = this.forEach;
	klass.implement = this.implement;
	klass.prototype = proto;
	klass.toString = this.toString;
	klass.valueOf = function(type) {
		//return (type == "object") ? klass : constructor; //-dean
		return (type == "object") ? klass : constructor.valueOf();
	};
	extend.call(klass, _static);
	// class initialisation
	if (typeof klass.init == "function") klass.init();
	return klass;
};

Base.prototype = {	
	extend: function(source, value) {
		if (arguments.length > 1) { // extending with a name/value pair
			var ancestor = this[source];
			if (ancestor && (typeof value == "function") && // overriding a method?
				// the valueOf() comparison is to avoid circular references
				(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
				/\bbase\b/.test(value)) {
				// get the underlying method
				var method = value.valueOf();
				// override
                /**
                 * @ignore
                 */
                value = function() {
					var previous = this.base || Base.prototype.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				// point to the underlying method
				value.valueOf = function(type) {
					return (type == "object") ? value : method;
				};
				value.toString = Base.toString;
			}
			this[source] = value;
		} else if (source) { // extending with an object literal
			var extend = Base.prototype.extend;
			// if this object has a customised extend method then use it
			if (!Base._prototyping && typeof this != "function") {
				extend = this.extend || extend;
			}
			var proto = {toSource: null};
			// do the "toString" and other methods manually
			var hidden = ["constructor", "toString", "valueOf"];
			// if we are prototyping then include the constructor
			var i = Base._prototyping ? 0 : 1;
			while (key = hidden[i++]) {
				if (source[key] != proto[key]) {
					extend.call(this, key, source[key]);

				}
			}
			// copy each of the source object's properties to this object
			for (var key in source) {
				if (!proto[key]) extend.call(this, key, source[key]);
			}
		}
		return this;
	}
};

// initialise
Base = Base.extend({
	constructor: function() {
		this.extend(arguments[0]);
	}
}, {
	ancestor: Object,
	version: "1.1",
	
	forEach: function(object, block, context) {
		for (var key in object) {
			if (this.prototype[key] === undefined) {
				block.call(context, object[key], key, object);
			}
		}
	},
		
	implement: function() {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == "function") {
				// if it's a function, call it
				arguments[i](this.prototype);
			} else {
				// add the interface using the extend method
				this.prototype.extend(arguments[i]);
			}
		}
		return this;
	},
	
	toString: function() {
		return String(this.valueOf());
	}
});
;(function() {
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
}());;(function() {
    "use strict";

    LittleCub.registerTheme({
        "id" : "base",
        "title" : "Base Theme",
        "description" : "Base theme for extending.",
        "templateEngine":"handlebars",
        "platform":["web"],
        "messages" : {
            "en_US" : {
                "required" : "Required field.",
                "pattern": "This field should have pattern {0}.",
                "minLength": "This field should contain at least {0} numbers or characters.",
                "maxLength": "This field should contain at most {0} numbers or characters.",
                "minimum": "The minimum value for this field is {0}.",
                "maximum": "The maximum value for this field is {0}.",
                "exclusiveMinimum": "Value of this field must be greater than {0}.",
                "exclusiveMaximum": "Value of this field must be less than {0}.",
                "multipleOf": "The value must be multiple of {0}.",
                "isNumber": "Field value must be a number.",
                "isInteger": "Field value must be an integer.",
                "minItems": "The minimum number of items is {0}.",
                "maxItems": "The maximum number of items is {0}.",
                "uniqueItems": "Array items are not unique.",
                "invalidEmail": "Invalid email address.",
                "invalidHostname": "Invalid hostname.",
                "invalidIpv4": "Invalid ip address (v4).",
                "invalidIpv6": "Invalid ip address (v6).",
                "isDatetime": "Field value must be a date-time.",
                "isUri": "Field value must be a uri."
            }
        }
    });

}());;(function() {
    "use strict";

    /**
     * HELPER: #key_value
     *
     * Usage: {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
     *
     * Iterate over an object, setting 'key' and 'value' for each property in the object.
     */
    Handlebars.registerHelper("key_value", function(obj, configs) {
        if (!configs) {
            configs = obj;
            obj = this;
        }
        var buffer = "";
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                buffer += configs.fn({key: key, value: obj[key]});
            }
        }
        return buffer;
    });

    /**
     * HELPER: #each_with_key
     *
     * Usage: {{#each_with_key container key="myKey"}}...{{/each_with_key}}
     *
     * Iterate over an object containing other objects. Each
     * inner object will be used in turn, with an added key ("myKey")
     * set to the value of the inner object's key in the container.
     */
    Handlebars.registerHelper("each_with_key", function(obj, configs) {
        var context, buffer = "", keyName = configs.hash.key;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                context = obj[key];
                if (keyName) {
                    context[keyName] = key;
                }
                buffer += configs.fn(context);
            }
        }
        return buffer;
    });

    Handlebars.registerHelper("object_with_key", function(context, configs) {
        var keyName = configs.hash.key;
        if (context.hasOwnProperty(keyName)) {
            return configs.fn(context[keyName]);
        } else {
            return "";
        }
    });

    /**
     *
     */
    Handlebars.registerHelper('include', function (context, configs) {
        var val = this["value"] || this;
        var themeId = val["theme"];
        var template = LittleCub.findTemplate(themeId, context);
        return template ? new Handlebars.SafeString(template(val)) : "";
    });

    /**
     *
     */
    Handlebars.registerHelper('injectControl', function (context, configs) {
        var themeId = this["theme"];
        var templateId = this["template"] || "control_" + this.type;
        var template = LittleCub.findTemplate(themeId, templateId);
        if (!template && this["altTemplate"]) {
            template = LittleCub.findTemplate(themeId, this["altTemplate"]);
        }
        return template ? new Handlebars.SafeString(template(this)) : "";
    });

    /**
     *
     */
    Handlebars.registerHelper('isContainer', function(context, options) {
        if (this.isContainer) {
            return context.fn(this);
        }
        return context.inverse(this);
    });

    /**
     *
     */
    Handlebars.registerHelper('isType', function(v, context) {
        v = v.split(' ');
        if (_.indexOf(v, this["type"]) != -1) {
            return context.fn(this);
        }
        return context.inverse(this);
    });
})();;(function() {
    "use strict";
    /**
     * Base class for providing common methods and interfaces for all controls.
     */
    LittleCub.BaseControl = Base.extend({
        constructor: function(data, configs, schema) {
            this.data = data;
            this.dataBackup = _.isObject(data) || _.isArray(data) ? LC.cloneJSON(data) : data;
            this.configs = configs || {};
            this.schema = schema || {};
            if (this.constructor.SCHEMA) {
                this.schema = _.extend(this.schema, LC.cloneJSON(this.constructor.SCHEMA));
            }
            if (this.constructor.CONFIGS) {
                this.configs = _.extend(this.configs, LC.cloneJSON(this.constructor.CONFIGS));
            }

            // other members
            this.id = this.configs["id"] || LC.id();
            this.path = this.configs["path"] || "/";
            this.parent = null;
            this.field = null;

            this.validation = {};
        },

        init: function() {
            // Load Schema through $ref
            // Support paths such as #/definitions/address
            if (this.schema["$ref"]) {
                var pathElems = this.schema["$ref"].split("/");
                if (pathElems[0] == "#") {
                    var control = this;
                    while (control.parent) {
                        control = control.parent;
                    }
                    var ref = control.schema;
                    for (var i = 1; i < pathElems.length && ref; i++) {
                        ref = ref[pathElems[i]];
                    }
                    if (ref) {
                        this.schema = _.extend(this.schema, LC.cloneJSON(ref));
                        delete this.schema["$ref"];
                    }
                }
            }

            this.schema["type"] = LC.schemaType.call(this);
            this.configs["type"] = LC.controlType.call(this);

            // Sync configs and schema
            this.configs["label"] = !LC.isEmpty(this.configs["label"]) ? this.configs["label"] : this.schema["title"];
            if (LC.isEmpty(this.configs["label"]) && this.parent && this.parent.schema["type"] != "array") {
                this.configs["label"] = LC.prettyTitle(this.key) || "";
            }
            this.schema["title"] = LC.isEmpty(this.schema["title"]) ? this.configs["label"] : this.schema["title"];

            this.configs["helper"] = LC.isEmpty(this.configs["helper"]) ? this.schema["description"] : this.configs["helper"];
            this.schema["description"] = LC.isEmpty(this.schema["description"]) ? this.configs["helper"] : this.schema["description"];

            this.configs["name"] = this.configs["name"] || this.path.substring(1).replace(/\//g, "_");
            this.configs["theme"] = this.configs["theme"] || LittleCub["defaults"]["theme"];

            this.configs["id"] = this.id;

            // Sync data
            this.configs["data"] = this.configs["data"] || this.data;
            if (LC.isValEmpty(this.configs["data"]) && !LC.isEmpty(this.schema["default"])) {
                this.configs["data"] = this.schema["default"];
            }
            this.data = this.data || this.configs["data"];
        },

        bindData: function(data) {
            this.data = data;
            this.configs["data"] = this.data;
        },

        isValid: function(skipValidation) {
            if (!skipValidation) {
                this.validate();
            }
            return _.every(this.validation, function(v) {
                return v["status"];
            });
        },

        _validateRequired: function() {
            var validation = {
                "status" : ! (this.configs.required && LC.isValEmpty(this.val()))
            }
            if (! validation["status"]) {
                validation["message"] = LC.findMessage("required", this.configs["theme"]);
            }
            return validation;
        },

        validate: function() {
            this.validation["required"] = this._validateRequired();
            var template = LC.findTemplate(this.configs["theme"], "control_messages");
            var errorInjection = LC.findThemeConfig("errorInjection", this.configs["theme"]);
            var errorClass = LC.findThemeConfig("errorClass", this.configs["theme"]);
            if (template && this.messagesContainer) {
                this.messagesContainer.innerHTML = template({"validation" : this.validation}).trim();
                var status = _.every(this.validation, function(v) {
                    return v["status"];
                });
                if (_.isFunction(errorInjection)) {
                    errorInjection.call(this, status);
                } else if (errorClass) {
                    if (status) {
                        LC.removeClass(this.field || this.outerEl, errorClass);
                        LC.removeClass(this.messagesContainer, errorClass);
                    } else {
                        LC.addClass(this.field || this.outerEl, errorClass);
                        LC.addClass(this.messagesContainer, errorClass);
                    }
                }
            }
            return this;
        },

        validationEvent: function() {
            return this.configs['validationEvent'] || LittleCub.defaults["validationEvent"];
        },

        bindCustomEventHandlers : function() {
            var that = this;
            // register general event handlers through configs
            _.each(this.configs, function(func, key) {
                if (LC.startsWith(key, 'onControl') && _.isFunction(func)) {
                    var event = key.substring(9).toLowerCase();
                    that.field.addEventListener(event, function(e) {
                        func.call(that, e);
                    }, false);
                }
            })
        },

        bindEventListeners: function() {
            if (this.field) {
                var validationTrigger = this.validationEvent();
                this.field.addEventListener(validationTrigger, this.validate.bind(this), false);
                var that = this;
                this.field.addEventListener("change", function() {
                    var evt = document.createEvent("Events");
                    evt.initEvent("lc-update", true, true);
                    evt["lc-control"] = that;
                    that.field.dispatchEvent(evt);
                }, false);
                this.bindCustomEventHandlers();
            }
        },

        controlByPath: function(path) {
            var parentControl = this;
            if (path) {
                var pathArray = _.compact(path.split(/[\[\]\/]/));
                for (var i = 0; i < pathArray.length; i++) {
                    if (!LC.isValEmpty(pathArray[i])) {
                        if (parentControl && parentControl.children) {
                            if (parentControl.children[pathArray[i]]) {
                                parentControl = parentControl.children[pathArray[i]];
                            } else {
                                return null;
                            }
                        } else {
                            return null;
                        }
                    } else {
                        return null;
                    }
                }
                return parentControl;
            }
        },

        val: function() {

        },

        bindDOM: function() {
            var container = this.container;
            var parent = this.parent;
            while (!container && parent) {
                container = parent.container;
                parent = parent.parent;
            }
            if (container) {
                this.outerEl = container.querySelector('[data-lcid=' + this.id + ']');
                this.field = container.querySelector('[data-lcid=' + this.id + '-field]');
                this.messagesContainer = container.querySelector('[data-lcid=' + this.id + '-messages]');
                this.bindEventListeners();
                if (!LC.isEmpty(this.configs["form"])) {
                    this.form = container.querySelector('form[data-lcid=' + this.id + '-form]');
                }
                if (this.configs["hidden"] && this.outerEl) {
                    this.outerEl.style.display = "none";
                }
            }
        },

        render: function(container, data, mode) {
            mode = mode || "fill";
            if (container) {
                this.container = container;
            }
            var theme = this.configs["theme"];
            var template = this.configs["template"] ? this.configs["template"] : "form";
            if (!LC.isEmpty(data)) {
                this.bindData(data);
            }
            if (mode == "fill") {
                container.innerHTML = LC.renderTemplate(theme, template, this.configs);
            } else if (mode == "insertAfter") {
                var elem = document.createElement("span");
                elem.innerHTML = LC.renderTemplate(theme, template, this.configs);
                container.parentNode.insertBefore(elem.firstChild, container.nextSibling);
                this.container = this.container.parentNode;
            }
            this.bindDOM();
            var injection = LC.findThemeConfig("injection", theme)
            if (injection && _.isFunction(injection)) {
                injection.call(this, container);
            }
        }
    });
})();;(function() {
    "use strict";

    LittleCub.ContainerControl = LittleCub.BaseControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["isContainer"] = true;
            },

            updateKeyPath: function() {
                var that = this;
                _.each(this.children, function(v, k) {
                    var isCalculatedName = v.configs["name"] == v.path.substring(1).replace(/\//g, "_");
                    that._updateKeyPath(v,k);
                    if (isCalculatedName) {
                        var oldName = v.configs["name"];
                        v.configs["name"] = v.path.substring(1).replace(/\//g, "_");
                        if (v.outerEl) {
                            if (v.outerEl.getAttribute("name") == oldName) {
                               v.outerEl.setAttribute("name", v.configs["name"]);
                            }
                            _.each(v.outerEl.querySelectorAll("[name='" + oldName +"']"), function(elem) {
                                elem.setAttribute("name", v.configs["name"]);
                            });
                            _.each(v.outerEl.querySelectorAll("[for='" + oldName +"']"), function(elem) {
                                elem.setAttribute("for", v.configs["name"]);
                            });
                        }
                    }
                    if (v.updateKeyPath) {
                        v.updateKeyPath();
                    }
                });
            },

            bindDOM: function() {
                this.base();
                _.each(this.children, function(v) {
                    v.bindDOM();
                });
            },

            isValid: function(skipValidation) {
                var status = this.base(skipValidation);
                if (! status) {
                    return false;
                } else {
                    return _.every(this.children, function(v) {
                        return v.isValid(skipValidation);
                    });
                }
            },

            validate: function(validateChildren) {
                if (validateChildren) {
                    _.each(this.children, function(v) {
                        v.validate(validateChildren);
                    });
                }
                return this.base();
            }
        }
    );
})();;(function() {
    "use strict";

    LittleCub.ObjectControl = LittleCub.ContainerControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);

                this.children = {};
            },

            init: function() {
                this.base();
                var configs = this.configs;
                var schema = this.schema;
                var data = this.data;
                var that = this;

                var params = {};
                if (schema && schema["properties"]) {
                    _.each(schema["properties"], function(v, k) {
                        params[k] = params[k] || {};
                        params[k]["schema"] = v;
                    });
                }
                if (configs && configs["controls"]) {
                    _.each(configs["controls"], function(v, k) {
                        params[k] = params[k] || {};
                        params[k]["configs"] = v;
                    });
                }
                if (_.isObject(data)) {
                    _.each(data, function(v, k) {
                        params[k] = params[k] || {};
                        params[k]["data"] = v;
                    });
                }
                _.each(params, function(v, k) {
                    v["schema"] = v["schema"] || {};
                    v["configs"] = v["configs"] || {};
                    v["schema"]["type"] = LC.schemaType.call(that,v["schema"], v["configs"], v["data"]);
                    v["configs"]["type"] = LC.controlType.call(that,v["schema"], v["configs"]);
                    v["configs"]["theme"] = v["configs"]["theme"] || that.configs["theme"];
                    var controlClass = LittleCub.controlClass(v["configs"]["type"]);
                    // Start to construct child controls
                    if (that.schema["required"] && _.indexOf(that.schema["required"], k) != -1) {
                        v["configs"]["required"] = true;
                    }
                    that.children[k] = new controlClass(v["data"], LC.cloneJSON(v["configs"]), LC.cloneJSON(v["schema"]));
                    that.children[k].parent = that;
                    that.children[k].key = k;
                    that.children[k].path = that.path == "/" ? that.path + k : that.path + "/" + k;
                    that.children[k].init();
                    // Link them back to its parent
                    schema["properties"] = schema["properties"] || {};
                    schema["properties"][k] = that.children[k].schema;
                    configs["controls"] = configs["controls"] || {};
                    configs["controls"][k] = that.children[k].configs;
                });

                // Make sure the sequence is what we would expect.
                var controls = {}
                _.each(params, function(v, k) {
                    controls[k] = configs["controls"][k];
                });
                configs["controls"] = controls;
            },

            _updateKeyPath: function(v, k) {
                if (v.parent) {
                    var pPath = v.parent.path;
                    v.path = pPath == "/" ? pPath + k : pPath + "/" + k;
                } else {
                    v.path = k;
                }
            },

            val: function() {
                var len = arguments.length;
                if (len == 0) {
                    var value = {};
                    _.each(this.children, function(v) {
                        value[v.key] = v.val();
                    });
                    return value;
                } else if (len == 1) {
                    var value = arguments[0];
                    _.each(this.children, function(v) {
                        var _val = LC.isEmpty(value) ? null : value[v.key];
                        v.val(_val);
                    });
                    return value;
                }
            },

            bindData: function(data) {
                this.base(data);
                _.each(this.children, function(v, k) {
                    var d = LC.isEmpty(data) ? null : data[k];
                    v.bindData(d);
                });
            },

            validate: function(validateChildren) {
                return this.base(validateChildren);
            }
        }, {
            TYPE : "object"
        }
    );

    LittleCub.controlClass(LittleCub.ObjectControl.TYPE, LittleCub.ObjectControl);
})();;(function() {
    "use strict";

    LittleCub.TextControl = LittleCub.BaseControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        return this.field.value;
                    } else if (len == 1) {
                        this.field.value = arguments[0] || "";
                        return this.field.value;
                    }
                }
            },

            /**
             * Validates against the schema pattern property.
             *
             * @returns {Boolean} True if it matches the pattern, false otherwise.
             */
            _validatePattern: function() {
                var val = this.val();
                var regex;
                if (this.schema.pattern) {
                    regex = LC.regExp(this.schema.pattern);
                }
                var validation = {
                    "status" : LC.isEmpty(this.schema.pattern) || LC.isValEmpty(val) || ! LC.isEmpty(val.match(regex))
                };
                if (! validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("pattern", this.configs["theme"]), [this.schema["pattern"]]);
                }
                return validation;
            },

            /**
             * Validates against the schema minLength property.
             *
             * @returns {Boolean} True if its size is greater than minLength, false otherwise.
             */
            _validateMinLength: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isEmpty(this.schema.minLength) || LC.isValEmpty(val) || val.length >= this.schema.minLength
                };
                if (! validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("minLength", this.configs["theme"]), [this.schema["minLength"]]);
                }
                return validation;
            },

            /**
             * Validates against the schema maxLength property.
             *
             * @returns {Boolean} True if its size is less than maxLength , false otherwise.
             */
            _validateMaxLength: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isEmpty(this.schema.maxLength) || LC.isValEmpty(val) || val.length <= this.schema.maxLength
                };
                if (! validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("maxLength", this.configs["theme"]), [this.schema["maxLength"]]);
                }
                return validation;
            },

            validate: function() {
                this.validation["pattern"] = this._validatePattern();
                this.validation["minLength"] = this._validateMinLength();
                this.validation["maxLength"] = this._validateMaxLength();
                return this.base();
            }
        }, {
            TYPE : "text"
        }
    );

    LittleCub.controlClass(LittleCub.TextControl.TYPE, LittleCub.TextControl);
})();;(function() {
    "use strict";

    LittleCub.TextareaControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            }
        }, {
            TYPE : "textarea"
        }
    );

    LittleCub.controlClass(LittleCub.TextareaControl.TYPE, LittleCub.TextareaControl);
})();;(function() {
    "use strict";

    LittleCub.NumberControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        return this.field.value == "" ? null : parseFloat(this.field.value);
                    } else if (len == 1) {
                        this.field.value = arguments[0] || "";
                        return this.field.value;
                    }
                }
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            /**
             * Validates if it is a float number.
             * @returns {Boolean} true if it is a float number
             */
            _validateNumber: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isValEmpty(this.field.value) || (!_.isNaN(val) && this.field.value.match(/^([\+\-]?((([0-9]+(\.)?)|([0-9]*\.[0-9]+))([eE][+-]?[0-9]+)?))$/) != null)
                };
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("isNumber", this.configs["theme"]);
                }
                return validation;
            },

            /**
             * Validates maximum constraint.
             * @returns {Boolean} true if it passes the maximum constraint.
             */
            _validateMaximum: function() {
                var val = this.val();
                var status = true;
                if (!LC.isEmpty(this.schema["maximum"])) {
                    if (val > this.schema["maximum"]) {
                        status = false;
                    }
                    if (this.schema["exclusiveMaximum"] && val == this.schema["maximum"]) {
                        status = false;
                    }
                }
                var validation = {
                    "status" : status
                };
                if (!status) {
                    if (this.schema["exclusiveMaximum"]) {
                        validation["message"] = LC.replaceTokens(LC.findMessage("exclusiveMinimum", this.configs["theme"]), [this.schema["maximum"]]);
                    } else {
                        validation["message"] = LC.replaceTokens(LC.findMessage("maximum", this.configs["theme"]), [this.schema["maximum"]]);
                    }
                }
                return validation;
            },

            /**
             * Validates maximum constraint.
             * @returns {Boolean} true if it passes the minimum constraint.
             */
            _validateMinimum: function() {
                var val = this.val();
                var status = true;
                if (!LC.isEmpty(this.schema["minimum"])) {
                    if (val < this.schema["minimum"]) {
                        status = false;
                    } else if (this.schema["exclusiveMinimum"] && val == this.schema["minimum"]) {
                        status = false;
                    }
                }
                var validation = {
                    "status" : status
                };
                if (!status) {
                    if (this.schema["exclusiveMinimum"]) {
                        validation["message"] = LC.replaceTokens(LC.findMessage("exclusiveMinimum", this.configs["theme"]), [this.schema["minimum"]]);
                    } else {
                        validation["message"] = LC.replaceTokens(LC.findMessage("minimum", this.configs["theme"]), [this.schema["minimum"]]);
                    }
                }
                return validation;
            },

            validate: function() {
                if (! LC.isValEmpty(this.field.value) || this.configs["required"]) {
                    this.validation["isNumber"] = this._validateNumber();
                    if (this.validation["isNumber"]["status"]) {
                        this.validation["maximum"] = this._validateMaximum();
                        this.validation["minimum"] = this._validateMinimum();
                    }
                }
                return this.base();
            }

        }, {
            TYPE : "number"
        }
    );

    LittleCub.controlClass(LittleCub.NumberControl.TYPE, LittleCub.NumberControl);
})();;(function() {
    "use strict";

    LittleCub.IntegerControl = LittleCub.NumberControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        return this.field.value == "" ? null : parseInt(this.field.value);
                    } else if (len == 1) {
                        this.field.value = arguments[0] || "";
                        return this.field.value;
                    }
                }
            },

            /**
             * Validates if it is a float integer.
             * @returns {Boolean} true if it is a float integer
             */
            _validateInteger: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isValEmpty(this.field.value) || (!_.isNaN(val) && this.field.value.match(/^([\+\-]?([1-9]\d*)|0)$/) != null && (val == parseFloat(this.field.value)))
                };
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("isInteger", this.configs["theme"]);
                }
                return validation;
            },

            /**
             */
            _validateMultipleOf: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isEmpty(this.schema["multipleOf"]) || (val % this.schema["multipleOf"] == 0)
                };
                if (! validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("multipleOf", this.configs["theme"]), [this.schema["multipleOf"]]);
                }
                return validation;
            },

            validate: function() {
                if (! LC.isValEmpty(this.field.value) || this.configs["required"]) {
                    this.validation["isInteger"] = this._validateInteger();
                    if (this.validation["isInteger"]["status"]) {
                        this.validation["multipleOf"] = this._validateMultipleOf();
                    }
                }
                return this.base();
            }

        }, {
            TYPE : "integer"
        }
    );

    LittleCub.controlClass(LittleCub.IntegerControl.TYPE, LittleCub.IntegerControl);
})();;(function() {
    "use strict";

    LittleCub.CheckboxControl = LittleCub.BaseControl.extend({
            /**
             *
             * @param container
             * @param data
             * @param configs
             * @param schema
             */
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        return this.field.checked ? true : false;
                    } else if (len == 1) {
                        var val = arguments[0];
                        if (LC.isEmpty(val)) {
                            this.field.checked = false;
                        } else if (_.isString(val)) {
                            this.field.checked = val === 'true';
                        } else if (_.isBoolean(val)) {
                            this.field.checked = val;
                        } else {
                            this.field.checked = false;
                        }
                        return this.field.checked;
                    }
                }
            },

            bindDOM: function() {
                this.base();
                if (this.configs["readonly"]) {
                    this.field.onclick = this.field.onkeydown = function() {
                        return false;
                    };
                }
            }
        }, {
            TYPE : "checkbox"
        }
    );

    LittleCub.controlClass(LittleCub.CheckboxControl.TYPE, LittleCub.CheckboxControl);
})();;(function() {
    "use strict";

    LittleCub.ListControl = LittleCub.BaseControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["options"] = this.configs["options"] || [];
                var options = this.configs["options"];
                var that = this;
                var isArray = _.isArray(that.data);
                var enums = isArray && this.schema["items"] ? this.schema["items"]["enum"] : this.schema["enum"];

                if (enums) {
                    var _options = [];
                    _.each(enums, function(v, k) {
                        var text = v;
                        if (! LC.isEmpty(options[v])) {
                            text = options[v];
                        } else if (! LC.isEmpty(options[k])) {
                            text = options[k];
                        }
                        _options.push({
                            "value": v,
                            "text": text,
                            "selected": isArray ? _.contains(that.data, v) : that.data == v
                        });
                    });
                    this.configs["options"] = _options;
                }
            }
        }
    );

})();;(function() {
    "use strict";

    LittleCub.RadioControl = LittleCub.ListControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        var val = this.field.querySelector('input[type=radio]:checked').value;
                        _.each(this.configs["options"], function(v) {
                            if (String(v['value']) == val) {
                                val = v['value'];
                            }
                        });

                        if (this.schema["type"] == "number") {
                            return parseFloat(val);
                        } else if (this.schema["type"] == "integer") {
                            return parseInt(val);
                        } else {
                            return val;
                        }
                    } else if (len == 1) {
                        var val = arguments[0] || "";
                        if (val != this.val()) {
                            _.each(this.field.querySelectorAll('input[type=radio]'), function(v) {
                                if (v.value == val) {
                                    v.checked = "checked";
                                } else {
                                    v.removeAttribute("checked");
                                }
                            });
                            if (!this.field.querySelector('input[type=radio]:checked')) {
                                this.field.querySelector('input[type=radio]').checked = "checked";
                            }
                            return val;
                        }
                    }
                }
            },

            validationEvent: function() {
                return this.configs['validationEvent'] || "click";
            },

            bindEventListeners: function() {
                var validationTrigger = this.validationEvent();
                var that = this;
                _.each(this.field.querySelectorAll('input[type=radio]'), function(v) {
                    v.addEventListener(validationTrigger, that.validate.bind(that), false);
                });
                this.bindCustomEventHandlers();
            },

            bindDOM: function() {
                this.base();
                if (this.configs["readonly"]) {
                    _.each(this.field.querySelectorAll('input[type=radio]'), function(v) {
                        v.onclick = v.onkeydown = function() {
                            return false;
                        };
                    });
                }
            }
        }, {
            TYPE : "radio"
        }
    );

    LittleCub.controlClass(LittleCub.RadioControl.TYPE, LittleCub.RadioControl);
})();;(function() {
    "use strict";

    LittleCub.SelectControl = LittleCub.ListControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                if (this.schema["type"] && this.schema["type"] == "array") {
                    this.configs["multiple"] = true;
                }
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        var val = this.configs["multiple"] ? [] : this.field.value;
                        var that = this;
                        _.each(this.configs["options"], function(v, k) {
                            if (that.configs["multiple"]) {
                                if (that.field.options[k].selected && String(v['value']) == that.field.options[k].value) {
                                    val.push(v['value']);
                                }
                            } else {
                                if (String(v['value']) == val) {
                                    val = v['value'];
                                }
                            }
                        });
                        return val;
                    } else if (len == 1) {
                        var val = arguments[0] || "";
                        if (val != this.val()) {
                            _.each(this.field.value, function(v) {
                                if (v.value == val) {
                                    v.selected = "selected";
                                } else {
                                    v.removeAttribute("selected");
                                }
                            });
                            if (!this.field.querySelector('option[selected]')) {
                                this.field.selectedIndex = 0;
                            }
                            return val;
                        }
                    }
                }
            },

            _validateMinItems: function() {
                var validation = {
                    "status" : LC.isEmpty(this.schema.minItems) || this.val().length >= this.schema.minItems
                };
                if (! validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("minItems", this.configs["theme"]), [this.schema["minItems"]]);
                }
                return validation;
            },

            _validateMaxItems: function() {
                var validation = {
                    "status" : LC.isEmpty(this.schema.maxItems) || this.val().length <= this.schema.minItems
                };
                if (! validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("maxItems", this.configs["theme"]), [this.schema["maxItems"]]);
                }
                return validation;
            },

            validate: function() {
                this.validation["minItems"] = this._validateMinItems();
                this.validation["maxItems"] = this._validateMaxItems();
                return this.base();
            },

            validationEvent: function() {
                return this.configs['validationEvent'] || "change";
            }
        }, {
            TYPE : "select"
        }
    );

    LittleCub.controlClass(LittleCub.SelectControl.TYPE, LittleCub.SelectControl);
})();;(function() {
    "use strict";

    LittleCub.CheckboxgroupControl = LittleCub.SelectControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        var val = this.configs["multiple"] ? [] : null;
                        if (this.configs["multiple"]) {
                            val = [];
                        } else {
                            var checked = this.field.querySelector('input[type=radio]:checked');
                            if (checked != null) {
                                val = checked.value;
                            }
                        }
                        var that = this;
                        var checkboxes = this.field.querySelectorAll('input[type=checkbox]');
                        _.each(this.configs["options"], function(v, k) {
                            if (that.configs["multiple"]) {
                                if (checkboxes[k].checked && String(v['value']) == checkboxes[k].value) {
                                    val.push(v['value']);
                                }
                            } else {
                                if (String(v['value']) == val) {
                                    val = v['value'];
                                }
                            }
                        });
                        return val;
                    } else if (len == 1) {
                        var vals = _.isArray(arguments[0]) ? arguments[0] : [arguments[0]];
                        _.each(vals, function(val) {
                            _.each(this.field.querySelectorAll('input[type=checkbox]'), function(v) {
                                if (v.value == val) {
                                    v.checked = "checked";
                                } else {
                                    v.removeAttribute("checked");
                                }
                            });
                        });
                        return arguments[0];
                    }
                }
            },

            validationEvent: function() {
                return this.configs['validationEvent'] || "click";
            },

            bindEventListeners: function() {
                var validationTrigger = this.validationEvent();
                var that = this;
                _.each(this.field.querySelectorAll('input[type=checkbox]'), function(v) {
                    v.addEventListener(validationTrigger, that.validate.bind(that), false);
                });
                this.bindCustomEventHandlers();
            },

            bindDOM: function() {
                this.base();
                if (this.configs["readonly"]) {
                    _.each(this.field.querySelectorAll('input[type=checkbox]'), function(v) {
                        v.onclick = v.onkeydown = function() {
                            return false;
                        };
                    });
                }
            }
        }, {
            TYPE : "checkboxgroup"
        }
    );

    LittleCub.controlClass(LittleCub.CheckboxgroupControl.TYPE, LittleCub.CheckboxgroupControl);
})();;(function() {
    "use strict";

    LittleCub.FileControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            }
        }, {
            TYPE : "file"
        }
    );

    LittleCub.controlClass(LittleCub.FileControl.TYPE, LittleCub.FileControl);
})();;(function() {
    "use strict";

    LittleCub.HiddenControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["helper"] = "";
                this.configs["label"] = "";
            }
        }, {
            TYPE : "hidden"
        }
    );

    LittleCub.controlClass(LittleCub.HiddenControl.TYPE, LittleCub.HiddenControl);
})();;(function() {
    "use strict";

    LittleCub.ArrayControl = LittleCub.ContainerControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
                this.children = [];
            },

            addChild : function(v, k) {
                var configs = this.configs;
                var schema = this.schema;
                var itemSchema = schema["items"];
                if (! itemSchema) {
                    itemSchema = schema["items"] = {};
                }
                var itemConfigs = configs["items"];
                if (! itemConfigs) {
                    itemConfigs = configs["items"] = {};
                }
                var _itemConfigs = LC.cloneJSON(itemConfigs);
                itemSchema["type"] = LC.schemaType.call(this, itemSchema, itemConfigs, v);
                _itemConfigs["type"] = LC.controlType.call(this, itemSchema, _itemConfigs);
                _itemConfigs["theme"] = _itemConfigs["theme"] || this.configs["theme"];
                var controlClass = LittleCub.controlClass(_itemConfigs["type"]);
                // Start to construct child controls
                var child = new controlClass(v, _itemConfigs, itemSchema);
                child.parent = this;
                child.key = (this.key ? this.key : "") + "[" + k + "]";
                child.path = this.path + "[" + k + "]";
                child.init();
                this.children.splice(k, 0, child);
                // Link them back to its parent
                configs["controls"].splice(k, 0, child.configs);
                return child;
            },

            removeChild : function(k) {
                this.children.splice(k, 1);
                this.configs["controls"].splice(k, 1);
            },

            init: function() {
                this.base();
                var configs = this.configs;
                var data = this.data;

                var itemData = LC.isEmpty(data) ? [] : data;
                if (!_.isArray(itemData)) {
                    itemData = [itemData];
                }
                var that = this;

                configs["controls"] = [];

                _.each(itemData, function(v, k) {
                    that.addChild(v, k);
                });
            },

            bindDOM: function() {
                this.base();
                this.validate();
                var that = this;

                var addElementToolbar = function(child) {
                    // Add array item toolbar
                    var elem = document.createElement("span");
                    elem.innerHTML = LC.renderTemplate(child.configs["theme"], "array_item_toolbar", child.configs);
                    _.each(elem.querySelectorAll('.lc-array-item-add'), function(v) {
                        v.addEventListener('click', addEventHandler);
                    });
                    _.each(elem.querySelectorAll('.lc-array-item-remove'), function(v) {
                        v.addEventListener('click', removeEventHandler);
                    });
                    return elem;
                };

                var addFirstEventHandler = function(e) {
                    var child = that.addChild(null, 1);
                    // Add array item toolbar
                    var elem = addElementToolbar(child);
                    var arrayToolbarElem = that.outerEl.querySelector('.lc-array-toolbar');
                    arrayToolbarElem.parentNode.insertBefore(elem.firstChild, arrayToolbarElem.nextSibling);
                    // Render the child
                    child.render(arrayToolbarElem.nextSibling, null, "insertAfter");
                    arrayToolbarElem.parentNode.removeChild(arrayToolbarElem);
                    // Trigger validation
                    that.validate();
                    return false;
                };

                var addEventHandler = function(e) {
                    var v = this;
                    var lcId = v.getAttribute("data-lcid");
                    lcId = lcId.substring(0, lcId.length - 4);
                    var insertAtIndex = that.children.length - 1;
                    _.every(that.children, function(v, k) {
                        if (v.id == lcId) {
                            insertAtIndex = k;
                            return false;
                        } else {
                            return true;
                        }
                    });
                    var insertAt = that.children[insertAtIndex];
                    var child = that.addChild(null, insertAtIndex + 1);
                    // Add array item toolbar
                    var elem = addElementToolbar(child);
                    insertAt.outerEl.parentNode.insertBefore(elem.firstChild, insertAt.outerEl.nextSibling);
                    // Render the child
                    child.render(insertAt.outerEl.nextSibling, null, "insertAfter");
                    that.updateKeyPath();
                    // Trigger validation
                    that.validate();
                    e.preventDefault();
                    return false;
                };

                var removeEventHandler = function(e) {
                    var v = this;
                    var lcId = v.getAttribute("data-lcid");
                    lcId = lcId.substring(0, lcId.length - 7);
                    var removeAtIndex;
                    _.every(that.children, function(v, k) {
                        if (v.id == lcId) {
                            removeAtIndex = k;
                            return false;
                        } else {
                            return true;
                        }
                    });
                    if (! LC.isEmpty(removeAtIndex)) {
                        var child = that.children[removeAtIndex];
                        var outerEl = child.outerEl;
                        outerEl.parentNode.removeChild(outerEl);
                        var toolbarElem = that.outerEl.querySelector('[data-lcid="' + lcId + '-toolbar"]');
                        toolbarElem.parentNode.removeChild(toolbarElem);
                        that.removeChild(removeAtIndex);
                        that.updateKeyPath();
                        // Trigger validation
                        that.validate();
                        // Trigger update event
                        var evt = document.createEvent("Events");
                        evt.initEvent("lc-update", true, true);
                        evt["lc-control"] = that;
                        that.outerEl.dispatchEvent(evt);
                        // Add the array toolbar for empty array
                        if (that.children.length == 0) {
                            var elem = document.createElement("span");
                            elem.innerHTML = LC.renderTemplate(child.configs["theme"], "array_toolbar", child.configs, true);
                            _.each(elem.querySelectorAll('.lc-array-add'), function(v) {
                                v.addEventListener('click', addFirstEventHandler);
                            });
                            /*
                            var injection = LC.findThemeConfig("injection", that.configs["theme"])
                            if (injection && _.isFunction(injection)) {
                                injection.call(that, elem);
                            }
                            */
                            lcId = that.outerEl.getAttribute("data-lcid");
                            var itemsElem = that.outerEl.querySelector("[data-lcid='" + lcId + "-items']");
                            if (itemsElem) {
                                itemsElem.appendChild(elem.firstChild);
                            } else {
                                that.outerEl.appendChild(elem.firstChild);
                            }
                            var injection = LC.findThemeConfig("injection", that.configs["theme"])
                            if (injection && _.isFunction(injection)) {
                                injection.call(that, that.outerEl);
                            }
                        }
                    }
                    e.preventDefault();
                    return false;
                };

                _.each(this.outerEl.querySelectorAll('.lc-array-add'), function(v) {
                    v.addEventListener('click', addFirstEventHandler);
                });

                _.each(this.outerEl.querySelectorAll('.lc-array-item-add'), function(v) {
                    v.addEventListener('click', addEventHandler);
                });

                _.each(this.outerEl.querySelectorAll('.lc-array-item-remove'), function(v) {
                    v.addEventListener('click', removeEventHandler);
                });

                if (this.schema.uniqueItems) {
                    var that = this;
                    this.outerEl.addEventListener("lc-update", function(e) {
                        var lcControl = e["lc-control"];
                        var isParent = false, parent = lcControl.parent;
                        while(parent && !isParent) {
                            if (parent == that) {
                                isParent = true;
                            }
                            parent = parent.parent;
                        }
                        if (isParent) {
                            that.validate();
                        }
                    }, false);
                }
            },

            _updateKeyPath: function(v, k) {
                if (v.parent) {
                    v.key = v.parent.key + "[" + k + "]";
                    v.path = v.parent.path + "[" + k + "]";
                } else {
                    v.path = "[" + k + "]";
                }
            },

            val: function() {
                var len = arguments.length;
                if (len == 0) {
                    var value = [];
                    _.each(this.children, function(v) {
                        value.push(v.val());
                    });
                    return value;
                } else if (len == 1) {
                    var value = arguments[0];
                    _.each(this.children, function(v, k) {
                        var _val = LC.isEmpty(value) ? null : value[k];
                        v.val(_val);
                    });
                    return value;
                }
            },

            bindData: function(data) {
                this.base(data);

                var nbChildren = this.children.length;
                var dataLen = data.length;

                var copyLen = nbChildren >= dataLen ? dataLen : nbChildren;
                for (var i = 0; i < copyLen; i++) {
                    this.children[i].bindData(data[i]);
                }
                if (nbChildren >= dataLen) {
                    for (var i = dataLen; i < nbChildren; i++) {
                        this.children.pop();
                    }
                } else {
                    for (var i = nbChildren; i < dataLen; i++) {
                        this.addChild(data[i], i)
                    }
                }
            },

            /**
             * Validates if number of items has been less than minItems.
             * @returns {Boolean} true if number of items has been less than minItems
             */
            _validateMinItems: function() {
                var validation = {
                    "status" : LC.isEmpty(this.schema.minItems) || ! _.isNumber(this.schema.minItems) || _.size(this.children) >= this.schema.minItems
                };
                if (!validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("minItems", this.configs["theme"]), [this.schema["minItems"]])
                }
                return validation;
            },

            /**
             * Validates if number of items has been over maxItems.
             * @returns {Boolean} true if number of items has been over maxItems
             */
            _validateMaxItems: function() {
                var validation = {
                    "status" : LC.isEmpty(this.schema.minItems) || ! _.isNumber(this.schema.maxItems) || _.size(this.children) <= this.schema.maxItems
                };
                if (!validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("maxItems", this.configs["theme"]), [this.schema["maxItems"]])
                }
                return validation;
            },

            /**
             * Validates if all items are unique.
             * @returns {Boolean} true if all items are unique.
             */
            _validateUniqueItems: function() {
                var status = true;
                var val = this.val();
                if (this.schema.uniqueItems && _.isArray(val)) {
                    var isSame = false;
                    var len = val.length;
                    for (var i = 0; i < len && !isSame; i++) {
                        for (var j = i + 1; j < len && !isSame; j++) {
                            isSame = LC.compare(val[i], val[j]);
                        }
                    }
                    status = !isSame;
                }
                var validation = {
                    "status" : status
                };
                if (! status) {
                    validation["message"] = LC.findMessage("uniqueItems", this.configs["theme"]);
                }
                return validation;
            },

            validate: function(validateChildren) {
                this.validation["minItems"] = this._validateMinItems();
                this.validation["maxItems"] = this._validateMaxItems();
                this.validation["uniqueItems"] = this._validateUniqueItems();
                return this.base(validateChildren);
            }
        }, {
            TYPE : "array"
        }
    );

    LittleCub.controlClass(LittleCub.ArrayControl.TYPE, LittleCub.ArrayControl);
})();;(function() {
    "use strict";

    LittleCub.PasswordControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            }
        }, {
            TYPE : "password"
        }
    );

    LittleCub.controlClass(LittleCub.PasswordControl.TYPE, LittleCub.PasswordControl);
})();;(function() {
    "use strict";

    LittleCub.DatetimeControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            _validateDatetime: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isValEmpty(this.field.value) || !_.isNaN(Date.parse(val))
                };
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("isDatetime", this.configs["theme"]);
                }
                return validation;
            },

            validate: function() {
                this.validation["isDatetime"] = this._validateDatetime();
                return this.base();
            }
        }, {
            TYPE : "datetime"
        }
    );

    LittleCub.controlClass(LittleCub.DatetimeControl.TYPE, LittleCub.DatetimeControl);
})();;(function() {
    "use strict";

    LittleCub.EmailControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            _validatePattern: function() {
                var validation = this.base();
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("invalidEmail", this.configs["theme"]);
                }
                return validation;
            }
        }, {
            TYPE : "email",
            SCHEMA : {
                "pattern" : "/^[a-z0-9!\\#\\$%&'\\*\\-\\/=\\?\\+\\-\\^_`\\{\\|\\}~]+(?:\\.[a-z0-9!\\#\\$%&'\\*\\-\\/=\\?\\+\\-\\^_`\\{\\|\\}~]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,6}$/i"
            }
        }
    );

    LittleCub.controlClass(LittleCub.EmailControl.TYPE, LittleCub.EmailControl);
})();;(function() {
    "use strict";

    LittleCub.HostnameControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            _validatePattern: function() {
                var validation = this.base();
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("invalidHostname", this.configs["theme"]);
                }
                return validation;
            }
        }, {
            TYPE : "hostname",
            SCHEMA : {
                "pattern" : "/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\\-]*[A-Za-z0-9])$/"
            }
        }
    );

    LittleCub.controlClass(LittleCub.HostnameControl.TYPE, LittleCub.HostnameControl);
})();;(function() {
    "use strict";

    LittleCub.Ipv4Control = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            _validatePattern: function() {
                var validation = this.base();
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("invalidIpv4", this.configs["theme"]);
                }
                return validation;
            }
        }, {
            TYPE : "ipv4",
            SCHEMA : {
                "pattern" : "/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/"
            }
        }
    );

    LittleCub.controlClass(LittleCub.Ipv4Control.TYPE, LittleCub.Ipv4Control);
})();;(function() {
    "use strict";

    LittleCub.Ipv6Control = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            _validatePattern: function() {
                var validation = this.base();
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("invalidIpv6", this.configs["theme"]);
                }
                return validation;
            }
        }, {
            TYPE : "ipv6",
            SCHEMA : {
                "pattern" : "/^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/"
            }
        }
    );

    LittleCub.controlClass(LittleCub.Ipv6Control.TYPE, LittleCub.Ipv6Control);
})();;(function() {
    "use strict";

    LittleCub.UriControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            _validateUri: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isValEmpty(this.field.value) || true
                };
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("isUri", this.configs["theme"]);
                }
                return validation;
            },

            validate: function() {
                this.validation["isUri"] = this._validateUri();
                return this.base();
            }
        }, {
            TYPE : "uri"
        }
    );

    LittleCub.controlClass(LittleCub.UriControl.TYPE, LittleCub.UriControl);
})();;(function() {
    "use strict";

    LittleCub["defaults"]["theme"] = "bootstrap";

    LittleCub.registerTheme({
        "id" : "bootstrap",
        "title" : "Twitter Bootstrap",
        "description" : "Default Twitter bootstrap theme for rendering basic forms.",
        "parent" : "base",
        "errorInjection" : function(status) {
            var errorClass= "control-group has-error";
            if (status) {
                $(this.outerEl).removeClass(errorClass);
            } else {
                $(this.outerEl).addClass(errorClass);
            }
        }
    });

    LittleCub.registerTheme({
        "id" : "bootstrap-horizontal",
        "parent" : "bootstrap",
        "title" : "Twitter Bootstrap Horizontal",
        "description" : "Twitter bootstrap theme for rendering basic forms with horizontal styles."
    });

}());;this["LittleCub"] = this["LittleCub"] || {};
this["LittleCub"]["templates"] = this["LittleCub"]["templates"] || {};

Handlebars.registerPartial("bootstrap-horizontal__control", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, options, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  if (stack1 = helpers.injectControl) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.injectControl); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n        ";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n            <span data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-lctype=\"";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"form-horizontal\">\n                ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control_label", options) : helperMissing.call(depth0, "include", "control_label", options)))
    + "\n                <div class=\"controls ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.wrapperClass), {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\">\n                ";
  if (stack2 = helpers.injectControl) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.injectControl); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "\n                </div>\n                ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control_helper", options) : helperMissing.call(depth0, "include", "control_helper", options)))
    + "\n                <span data-lcid=\"";
  if (stack2 = helpers.id) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.id); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "-messages\"></span>\n            </span>\n        ";
  return buffer;
  }
function program4(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.wrapperClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.wrapperClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program6(depth0,data) {
  
  
  return "col-sm-10";
  }

  options = {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data};
  if (stack1 = helpers.isContainer) { stack1 = stack1.call(depth0, options); }
  else { stack1 = (depth0 && depth0.isContainer); stack1 = typeof stack1 === functionType ? stack1.call(depth0, options) : stack1; }
  if (!helpers.isContainer) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap-horizontal__control_array", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<legend for=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.label); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</legend>";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<div>";
  if (stack1 = helpers.helper) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.helper); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.controls), {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n                        ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "array_item_toolbar", options) : helperMissing.call(depth0, "include", "array_item_toolbar", options)))
    + "\n                        ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control", options) : helperMissing.call(depth0, "include", "control", options)))
    + "\n                    ";
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n                    ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "array_toolbar", options) : helperMissing.call(depth0, "include", "array_toolbar", options)))
    + "\n                ";
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "class=\"";
  if (stack1 = helpers.messageClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.messageClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  buffer += "<fieldset name=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-lctype=\"";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"col-sm-12\">\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.helper), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            <div data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-items\">\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.controls), {hash:{},inverse:self.program(10, program10, data),fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </div>\n            <span data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-messages\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.messageClass), {hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "></span>\n        </fieldset>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap-horizontal__control_checkboxgroup", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n                <label class=\"checkbox\">\n                    <input type=\"checkbox\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " name=\""
    + escapeExpression(((stack1 = (depth1 && depth1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "["
    + escapeExpression(((stack1 = ((stack1 = data),stack1 == null || stack1 === false ? stack1 : stack1.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "]\" value=\"";
  if (stack2 = helpers.value) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.value); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "\" ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.selected), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "/>\n                    ";
  if (stack2 = helpers.text) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.text); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "\n                </label>\n            ";
  return buffer;
  }
function program4(depth0,data) {
  
  
  return "readonly=\"readonly\"";
  }

function program6(depth0,data) {
  
  
  return "checked=\"checked\"";
  }

  buffer += "<div class=\"form-inline";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\">\n            ";
  options = {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data};
  if (stack1 = helpers.options) { stack1 = stack1.call(depth0, options); }
  else { stack1 = (depth0 && depth0.options); stack1 = typeof stack1 === functionType ? stack1.call(depth0, options) : stack1; }
  if (!helpers.options) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap-horizontal__control_helper", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <span class=\"col-sm-offset-2 col-sm-10 controls help-block";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.helperClass), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"><i class=\"glyphicon glyphicon-info-sign\"></i> ";
  if (stack1 = helpers.helper) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.helper); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.helperClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.helperClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.helper), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap-horizontal__control_label", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <label class=\"col-sm-2 control-label";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.labelClass), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.label); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</label>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.labelClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.labelClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "for=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap-horizontal__control_messages", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.message), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <div class=\"col-sm-offset-2 col-sm-10 help-block controls\">";
  if (stack1 = helpers.message) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.message); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n            ";
  return buffer;
  }

  stack1 = helpers.each.call(depth0, (depth0 && depth0.validation), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap-horizontal__control_object", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n            <fieldset name=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-lctype=\"";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"col-sm-12\">\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.helper), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  options = {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data};
  stack2 = ((stack1 = helpers.key_value || (depth0 && depth0.key_value)),stack1 ? stack1.call(depth0, (depth0 && depth0.controls), options) : helperMissing.call(depth0, "key_value", (depth0 && depth0.controls), options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                <span data-lcid=\"";
  if (stack2 = helpers.id) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.id); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "-messages\" ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.messageClass), {hash:{},inverse:self.noop,fn:self.program(10, program10, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "></span>\n            </fieldset>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<legend for=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.label); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</legend>";
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<div>";
  if (stack1 = helpers.helper) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.helper); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>";
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n                    <div class=\"form-group row\">";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control", options) : helperMissing.call(depth0, "include", "control", options)))
    + "</div>\n                ";
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "class=\"";
  if (stack1 = helpers.messageClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.messageClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.controls), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap-horizontal__control_object_table", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <fieldset name=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-lctype=\"";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"col-sm-12\">\n                <legend for=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.label); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</legend>\n                <div>";
  if (stack1 = helpers.helper) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.helper); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.table), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <span data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-message\"></span>\n            </fieldset>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program4(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n                <table>\n                    ";
  options = {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data};
  stack2 = ((stack1 = helpers.key_value || (depth0 && depth0.key_value)),stack1 ? stack1.call(depth0, (depth0 && depth0.table), options) : helperMissing.call(depth0, "key_value", (depth0 && depth0.table), options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                </table>\n                ";
  return buffer;
  }
function program5(depth0,data,depth1) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n                    <tr>\n                        ";
  options = {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth0, depth1),data:data};
  stack2 = ((stack1 = helpers.key_value || (depth0 && depth0.key_value)),stack1 ? stack1.call(depth0, (depth0 && depth0.value), options) : helperMissing.call(depth0, "key_value", (depth0 && depth0.value), options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                    </tr>\n                    ";
  return buffer;
  }
function program6(depth0,data,depth1,depth2) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n                            <td data-licid=\""
    + escapeExpression(((stack1 = (depth1 && depth1.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-";
  if (stack2 = helpers.key) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.key); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "\">\n                                ";
  stack2 = helpers.each.call(depth0, (depth0 && depth0.value), {hash:{},inverse:self.noop,fn:self.programWithDepth(7, program7, data, depth2),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                            </td>\n                        ";
  return buffer;
  }
function program7(depth0,data,depth3) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n                                    ";
  options = {hash:{
    'key': (depth0)
  },inverse:self.noop,fn:self.program(8, program8, data),data:data};
  stack2 = ((stack1 = helpers.object_with_key || (depth0 && depth0.object_with_key)),stack1 ? stack1.call(depth0, (depth3 && depth3.controls), options) : helperMissing.call(depth0, "object_with_key", (depth3 && depth3.controls), options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                                ";
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n                                        <div>";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control", options) : helperMissing.call(depth0, "include", "control", options)))
    + "</div>\n                                    ";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.controls), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap-horizontal__control_radio", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <label class=\"radio\">\n                    <input type=\"radio\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " value=\"\"/>\n                    None\n                </label>\n            ";
  return buffer;
  }
function program4(depth0,data) {
  
  
  return "readonly=\"readonly\"";
  }

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program8(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n                <label class=\"radio\">\n                    <input type=\"radio\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['with'].call(depth0, (depth1 && depth1.name), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " value=\"";
  if (stack1 = helpers.value) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.value); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.selected), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "/>\n                    ";
  if (stack1 = helpers.text) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.text); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n                </label>\n            ";
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = "";
  buffer += "name=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\"";
  return buffer;
  }

function program11(depth0,data) {
  
  
  return "checked=\"checked\"";
  }

  buffer += "<div class=\"form-inline";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\">\n            ";
  stack1 = helpers.unless.call(depth0, (depth0 && depth0.required), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  options = {hash:{},inverse:self.noop,fn:self.programWithDepth(8, program8, data, depth0),data:data};
  if (stack1 = helpers.options) { stack1 = stack1.call(depth0, options); }
  else { stack1 = (depth0 && depth0.options); stack1 = typeof stack1 === functionType ? stack1.call(depth0, options) : stack1; }
  if (!helpers.options) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap-horizontal__form", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n        <form data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"form-horizontal\" ";
  stack1 = helpers['with'].call(depth0, (depth0 && depth0.form), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n            ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control", options) : helperMissing.call(depth0, "include", "control", options)))
    + "\n            ";
  stack2 = helpers['with'].call(depth0, (depth0 && depth0.form), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n        </form>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var stack1, stack2, options;
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data};
  stack2 = ((stack1 = helpers.key_value || (depth0 && depth0.key_value)),stack1 ? stack1.call(depth0, (depth0 && depth0.attrs), options) : helperMissing.call(depth0, "key_value", (depth0 && depth0.attrs), options));
  if(stack2 || stack2 === 0) { return stack2; }
  else { return ''; }
  }
function program3(depth0,data) {
  
  var buffer = "", stack1;
  if (stack1 = helpers.key) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.key); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "=\"";
  if (stack1 = helpers.value) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.value); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program5(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.buttons), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;
  }
function program6(depth0,data,depth2) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n                    <div data-lcid=\""
    + escapeExpression(((stack1 = (depth2 && depth2.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-buttons\" class=\"form-group\">\n                        ";
  stack2 = helpers.each.call(depth0, (depth0 && depth0.buttons), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                    </div>\n                ";
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n                            <input class=\"btn btn-default\" ";
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data};
  stack2 = ((stack1 = helpers.key_value || (depth0 && depth0.key_value)),stack1 ? stack1.call(depth0, depth0, options) : helperMissing.call(depth0, "key_value", depth0, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "/>\n                        ";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n            ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control", options) : helperMissing.call(depth0, "include", "control", options)))
    + "\n        ";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.form), {hash:{},inverse:self.program(9, program9, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap__array_item_toolbar", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div>\n            <p class=\"btn-toolbar\">\n                <div data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-toolbar\" class=\"lc-array-item-toolbar btn-group\">\n                    <button data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-add\" class=\"lc-array-item-add btn btn-default btn-sm\"><i><span class=\"glyphicon glyphicon-plus\"></span></i></button>\n                    <button data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-remove\" class=\"lc-array-item-remove btn btn-default btn-sm\"><i><span class=\"glyphicon glyphicon-minus\"></span></i></button>\n                </div>\n            </p>\n        </div>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__array_toolbar", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<div class=\"lc-array-toolbar btn-group\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-array-toolbar\">\n            <button  type=\"button\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-array-toolbar-add\" class=\"lc-array-add btn btn-default btn-sm\"><i><span class=\"glyphicon glyphicon-plus\"/></i> Add</button>\n        </div>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, options, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  if (stack1 = helpers.injectControl) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.injectControl); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n        ";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n            <div data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-lctype=\"";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"form-group row\">\n                <div class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.wrapperClass), {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">\n                    ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control_label", options) : helperMissing.call(depth0, "include", "control_label", options)))
    + "\n                    ";
  if (stack2 = helpers.injectControl) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.injectControl); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "\n                    ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control_helper", options) : helperMissing.call(depth0, "include", "control_helper", options)))
    + "\n                    <span data-lcid=\"";
  if (stack2 = helpers.id) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.id); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "-messages\"></span>\n                </div>\n            </div>\n        ";
  return buffer;
  }
function program4(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.wrapperClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.wrapperClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program6(depth0,data) {
  
  
  return "col-md-6";
  }

  options = {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data};
  if (stack1 = helpers.isContainer) { stack1 = stack1.call(depth0, options); }
  else { stack1 = (depth0 && depth0.isContainer); stack1 = typeof stack1 === functionType ? stack1.call(depth0, options) : stack1; }
  if (!helpers.isContainer) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap__control_array", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<legend for=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.label); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</legend>";
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<div>";
  if (stack1 = helpers.helper) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.helper); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                    ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.controls), {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  return buffer;
  }
function program8(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n                        ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "array_item_toolbar", options) : helperMissing.call(depth0, "include", "array_item_toolbar", options)))
    + "\n                        ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control", options) : helperMissing.call(depth0, "include", "control", options)))
    + "\n                    ";
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n                    ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "array_toolbar", options) : helperMissing.call(depth0, "include", "array_toolbar", options)))
    + "\n                ";
  return buffer;
  }

function program12(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "class=\"";
  if (stack1 = helpers.messageClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.messageClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  buffer += "<fieldset name=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-lctype=\"";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"form-group\">\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.helper), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            <div data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-items\">\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.controls), {hash:{},inverse:self.program(10, program10, data),fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            </div>\n            <span data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-messages\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.messageClass), {hash:{},inverse:self.noop,fn:self.program(12, program12, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "></span>\n        </fieldset>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_checkbox", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "checked=\"checked\"";
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "class=\"";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "readonly=\"readonly\"";
  }

function program9(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.prompt) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.prompt); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

  buffer += "<label class=\"checkbox\">\n            <input data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\" type=\"checkbox\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.data), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " />\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.prompt), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </label>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_checkboxgroup", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "class=\"";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program3(depth0,data,depth1) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n                <label class=\"checkbox\">\n                    <input type=\"checkbox\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " name=\""
    + escapeExpression(((stack1 = (depth1 && depth1.name)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "["
    + escapeExpression(((stack1 = ((stack1 = data),stack1 == null || stack1 === false ? stack1 : stack1.index)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "]\" value=\"";
  if (stack2 = helpers.value) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.value); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "\" ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.selected), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "/>\n                    ";
  if (stack2 = helpers.text) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.text); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "\n                </label>\n            ";
  return buffer;
  }
function program4(depth0,data) {
  
  
  return "readonly=\"readonly\"";
  }

function program6(depth0,data) {
  
  
  return "checked=\"checked\"";
  }

  buffer += "<div data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n            ";
  options = {hash:{},inverse:self.noop,fn:self.programWithDepth(3, program3, data, depth0),data:data};
  if (stack1 = helpers.options) { stack1 = stack1.call(depth0, options); }
  else { stack1 = (depth0 && depth0.options); stack1 = typeof stack1 === functionType ? stack1.call(depth0, options) : stack1; }
  if (!helpers.options) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_datetime", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program3(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.data) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.data); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "readonly=\"readonly\"";
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "placeholder=\"";
  if (stack1 = helpers.placeholder) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.placeholder); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "size=\"";
  if (stack1 = helpers.size) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.size); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  buffer += "<div class=\"input-group\">\n            <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-calendar\"></i></span>\n            <input data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\" type=\"text\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                value=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.data), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" class=\"form-control";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.placeholder), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.size), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "/>\n        </div>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_email", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program3(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.data) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.data); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "readonly=\"readonly\"";
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "placeholder=\"";
  if (stack1 = helpers.placeholder) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.placeholder); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "size=\"";
  if (stack1 = helpers.size) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.size); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  buffer += "<div class=\"input-group\">\n            <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-envelope\"></i></span>\n            <input data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\" type=\"text\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                value=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.data), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" class=\"form-control";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.placeholder), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.size), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "/>\n        </div>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_file", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "placeholder=\"";
  if (stack1 = helpers.placeholder) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.placeholder); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "size=\"";
  if (stack1 = helpers.size) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.size); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  buffer += "<input data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\" type=\"file\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.placeholder), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.size), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "/>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_helper", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <span class=\"help-block";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.helperClass), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"><i class=\"glyphicon glyphicon-info-sign\"></i> ";
  if (stack1 = helpers.helper) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.helper); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.helperClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.helperClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.helper), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap__control_hidden", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program3(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.data) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.data); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

  buffer += "<input data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\" type=\"hidden\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            value=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.data), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\"/>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_label", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <label class=\"control-label";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.labelClass), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.label); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</label>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.labelClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.labelClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "for=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap__control_messages", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.message), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <div class=\"help-block\">";
  if (stack1 = helpers.message) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.message); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n            ";
  return buffer;
  }

  stack1 = helpers.each.call(depth0, (depth0 && depth0.validation), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap__control_object", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n            <fieldset name=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-lctype=\"";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"form-group\">\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.helper), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                ";
  options = {hash:{},inverse:self.noop,fn:self.program(8, program8, data),data:data};
  stack2 = ((stack1 = helpers.key_value || (depth0 && depth0.key_value)),stack1 ? stack1.call(depth0, (depth0 && depth0.controls), options) : helperMissing.call(depth0, "key_value", (depth0 && depth0.controls), options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                <span data-lcid=\"";
  if (stack2 = helpers.id) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.id); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "-messages\" ";
  stack2 = helpers['if'].call(depth0, (depth0 && depth0.messageClass), {hash:{},inverse:self.noop,fn:self.program(10, program10, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "></span>\n            </fieldset>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<legend for=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.label); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</legend>";
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<div>";
  if (stack1 = helpers.helper) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.helper); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>";
  return buffer;
  }

function program8(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n                    ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control", options) : helperMissing.call(depth0, "include", "control", options)))
    + "\n                ";
  return buffer;
  }

function program10(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "class=\"";
  if (stack1 = helpers.messageClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.messageClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.controls), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap__control_object_grid", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n            <fieldset name=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" data-lctype=\"";
  if (stack1 = helpers.type) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.type); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.label), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <div>";
  if (stack1 = helpers.helper) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.helper); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</div>\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.grid), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth0),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n                <span data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-message\"></span>\n            </fieldset>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program4(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "<legend for=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\">";
  if (stack1 = helpers.label) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.label); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</legend>";
  return buffer;
  }

function program6(depth0,data,depth1) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n                <div class=\"container\">\n                    ";
  options = {hash:{},inverse:self.noop,fn:self.programWithDepth(7, program7, data, depth1),data:data};
  stack2 = ((stack1 = helpers.key_value || (depth0 && depth0.key_value)),stack1 ? stack1.call(depth0, (depth0 && depth0.grid), options) : helperMissing.call(depth0, "key_value", (depth0 && depth0.grid), options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                </div>\n                ";
  return buffer;
  }
function program7(depth0,data,depth2) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n                    <div class=\"row\">\n                        ";
  options = {hash:{},inverse:self.noop,fn:self.programWithDepth(8, program8, data, depth0, depth2),data:data};
  stack2 = ((stack1 = helpers.key_value || (depth0 && depth0.key_value)),stack1 ? stack1.call(depth0, (depth0 && depth0.value), options) : helperMissing.call(depth0, "key_value", (depth0 && depth0.value), options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                    </div>\n                    ";
  return buffer;
  }
function program8(depth0,data,depth1,depth3) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n                            <div class=\"col-md-"
    + escapeExpression(((stack1 = ((stack1 = (depth0 && depth0.value)),stack1 == null || stack1 === false ? stack1 : stack1.span)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "\" data-licid=\""
    + escapeExpression(((stack1 = (depth1 && depth1.key)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-";
  if (stack2 = helpers.key) { stack2 = stack2.call(depth0, {hash:{},data:data}); }
  else { stack2 = (depth0 && depth0.key); stack2 = typeof stack2 === functionType ? stack2.call(depth0, {hash:{},data:data}) : stack2; }
  buffer += escapeExpression(stack2)
    + "\">\n                                ";
  stack2 = helpers.each.call(depth0, ((stack1 = (depth0 && depth0.value)),stack1 == null || stack1 === false ? stack1 : stack1.controls), {hash:{},inverse:self.noop,fn:self.programWithDepth(9, program9, data, depth3),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                            </div>\n                        ";
  return buffer;
  }
function program9(depth0,data,depth4) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n                                    ";
  options = {hash:{
    'key': (depth0)
  },inverse:self.noop,fn:self.program(10, program10, data),data:data};
  stack2 = ((stack1 = helpers.object_with_key || (depth0 && depth0.object_with_key)),stack1 ? stack1.call(depth0, (depth4 && depth4.controls), options) : helperMissing.call(depth0, "object_with_key", (depth4 && depth4.controls), options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                                ";
  return buffer;
  }
function program10(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n                                        ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control", options) : helperMissing.call(depth0, "include", "control", options)))
    + "\n                                    ";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.controls), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));

Handlebars.registerPartial("bootstrap__control_password", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program3(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.data) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.data); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "readonly=\"readonly\"";
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "placeholder=\"";
  if (stack1 = helpers.placeholder) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.placeholder); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "size=\"";
  if (stack1 = helpers.size) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.size); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  buffer += "<input data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\" type=\"password\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            value=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.data), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" class=\"form-control";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.placeholder), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.size), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "/>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_radio", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, options, functionType="function", escapeExpression=this.escapeExpression, self=this, blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <label class=\"radio\">\n                    <input type=\"radio\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(6, program6, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " value=\"\"/>\n                    None\n                </label>\n            ";
  return buffer;
  }
function program4(depth0,data) {
  
  
  return "readonly=\"readonly\"";
  }

function program6(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program8(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n                <label class=\"radio\">\n                    <input type=\"radio\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['with'].call(depth0, (depth1 && depth1.name), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " value=\"";
  if (stack1 = helpers.value) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.value); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.selected), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "/>\n                    ";
  if (stack1 = helpers.text) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.text); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\n                </label>\n            ";
  return buffer;
  }
function program9(depth0,data) {
  
  var buffer = "";
  buffer += "name=\""
    + escapeExpression((typeof depth0 === functionType ? depth0.apply(depth0) : depth0))
    + "\"";
  return buffer;
  }

function program11(depth0,data) {
  
  
  return "checked=\"checked\"";
  }

  buffer += "<div class=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\">\n            ";
  stack1 = helpers.unless.call(depth0, (depth0 && depth0.required), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  options = {hash:{},inverse:self.noop,fn:self.programWithDepth(8, program8, data, depth0),data:data};
  if (stack1 = helpers.options) { stack1 = stack1.call(depth0, options); }
  else { stack1 = (depth0 && depth0.options); stack1 = typeof stack1 === functionType ? stack1.call(depth0, options) : stack1; }
  if (!helpers.options) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </div>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_select", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program3(depth0,data) {
  
  
  return "multiple=\"multiple\"";
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "size=\"";
  if (stack1 = helpers.size) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.size); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <option value=\"\">";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.placeholder), {hash:{},inverse:self.program(12, program12, data),fn:self.program(10, program10, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</option>\n            ";
  return buffer;
  }
function program10(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.placeholder) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.placeholder); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program12(depth0,data) {
  
  
  return "None";
  }

function program14(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "\n                <option value=\"";
  if (stack1 = helpers.value) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.value); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.selected), {hash:{},inverse:self.noop,fn:self.program(15, program15, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  if (stack1 = helpers.text) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.text); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "</option>\n            ";
  return buffer;
  }
function program15(depth0,data) {
  
  
  return "selected=\"selected\"";
  }

  buffer += "<select data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\" class=\"form-control";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.multiple), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.size), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n            ";
  stack1 = helpers.unless.call(depth0, (depth0 && depth0.required), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = helpers.each.call(depth0, (depth0 && depth0.options), {hash:{},inverse:self.noop,fn:self.program(14, program14, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        </select>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_text", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program3(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.data) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.data); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

function program5(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program7(depth0,data) {
  
  
  return "readonly=\"readonly\"";
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "placeholder=\"";
  if (stack1 = helpers.placeholder) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.placeholder); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "size=\"";
  if (stack1 = helpers.size) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.size); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

  buffer += "<input data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\" type=\"text\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            value=\"";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.data), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" class=\"form-control";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.placeholder), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.size), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "/>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__control_textarea", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "name=\"";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.name); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = "", stack1;
  buffer += " ";
  if (stack1 = helpers.fieldClass) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.fieldClass); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1);
  return buffer;
  }

function program5(depth0,data) {
  
  
  return "readonly=\"readonly\"";
  }

function program7(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "placeholder=\"";
  if (stack1 = helpers.placeholder) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.placeholder); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "rows=\"";
  if (stack1 = helpers.rows) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.rows); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program11(depth0,data) {
  
  var buffer = "", stack1;
  buffer += "cols=\"";
  if (stack1 = helpers.cols) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.cols); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program13(depth0,data) {
  
  var stack1;
  if (stack1 = helpers.data) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.data); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  return escapeExpression(stack1);
  }

  buffer += "<textarea data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "-field\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.name), {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n        class=\"form-control";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.fieldClass), {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\" ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.readonly), {hash:{},inverse:self.noop,fn:self.program(5, program5, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.placeholder), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.rows), {hash:{},inverse:self.noop,fn:self.program(9, program9, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += " ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.cols), {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.data), {hash:{},inverse:self.noop,fn:self.program(13, program13, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</textarea>";
  return buffer;
  }));

Handlebars.registerPartial("bootstrap__form", Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var stack1, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n        <form data-lcid=\"";
  if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.id); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" ";
  stack1 = helpers['with'].call(depth0, (depth0 && depth0.form), {hash:{},inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n            ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control", options) : helperMissing.call(depth0, "include", "control", options)))
    + "\n            ";
  stack2 = helpers['with'].call(depth0, (depth0 && depth0.form), {hash:{},inverse:self.noop,fn:self.programWithDepth(5, program5, data, depth0),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n        </form>\n        ";
  return buffer;
  }
function program2(depth0,data) {
  
  var stack1, stack2, options;
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data};
  stack2 = ((stack1 = helpers.key_value || (depth0 && depth0.key_value)),stack1 ? stack1.call(depth0, (depth0 && depth0.attrs), options) : helperMissing.call(depth0, "key_value", (depth0 && depth0.attrs), options));
  if(stack2 || stack2 === 0) { return stack2; }
  else { return ''; }
  }
function program3(depth0,data) {
  
  var buffer = "", stack1;
  if (stack1 = helpers.key) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.key); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "=\"";
  if (stack1 = helpers.value) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = (depth0 && depth0.value); stack1 = typeof stack1 === functionType ? stack1.call(depth0, {hash:{},data:data}) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"";
  return buffer;
  }

function program5(depth0,data,depth1) {
  
  var buffer = "", stack1;
  buffer += "\n                ";
  stack1 = helpers['if'].call(depth0, (depth0 && depth0.buttons), {hash:{},inverse:self.noop,fn:self.programWithDepth(6, program6, data, depth1),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n            ";
  return buffer;
  }
function program6(depth0,data,depth2) {
  
  var buffer = "", stack1, stack2;
  buffer += "\n                    <div data-lcid=\""
    + escapeExpression(((stack1 = (depth2 && depth2.id)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "-buttons\" class=\"form-group\">\n                        ";
  stack2 = helpers.each.call(depth0, (depth0 && depth0.buttons), {hash:{},inverse:self.noop,fn:self.program(7, program7, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "\n                    </div>\n                ";
  return buffer;
  }
function program7(depth0,data) {
  
  var buffer = "", stack1, stack2, options;
  buffer += "\n                            <input class=\"btn btn-default\" ";
  options = {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data};
  stack2 = ((stack1 = helpers.key_value || (depth0 && depth0.key_value)),stack1 ? stack1.call(depth0, depth0, options) : helperMissing.call(depth0, "key_value", depth0, options));
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "/>\n                        ";
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = "", stack1, options;
  buffer += "\n            ";
  options = {hash:{},data:data};
  buffer += escapeExpression(((stack1 = helpers.include || (depth0 && depth0.include)),stack1 ? stack1.call(depth0, "control", options) : helperMissing.call(depth0, "include", "control", options)))
    + "\n        ";
  return buffer;
  }

  stack1 = helpers['if'].call(depth0, (depth0 && depth0.form), {hash:{},inverse:self.program(9, program9, data),fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { return stack1; }
  else { return ''; }
  }));