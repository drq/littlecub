(function() {
    "use strict";
    /**
     * Base class for providing common methods and interfaces for all controls.
     */
    LittleCub.BaseControl = Base.extend({
        /**
         *
         * @param container
         * @param data
         * @param configs
         * @param schema
         */
        constructor: function(data, configs, schema) {
            this.data = data;
            this.dataBackup = _.isObject(data) || _.isArray(data) ? LittleCub.cloneJSON(data) : data;
            this.configs = configs || {};
            this.schema = schema || {};
            if (this.constructor.SCHEMA) {
                this.schema = _.extend(this.schema, LittleCub.cloneJSON(this.constructor.SCHEMA));
            }
            if (this.constructor.CONFIGS) {
                this.configs = _.extend(this.configs, LittleCub.cloneJSON(this.constructor.CONFIGS));
            }

            // other members
            this.id = this.configs["id"] || LittleCub.id();
            this.path = this.configs["path"] || "/";
            this.parent = null;
            this.field = null;

            this.validation = {};

            // Private methods
            this.extend({
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
                    if (_.isObject(data)) {
                        return "object";
                    }
                    if (_.isString(data)) {
                        return "string";
                    }
                    if (_.isNumber(data)) {
                        return "number";
                    }
                    if (_.isArray(data)) {
                        return "array";
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
        },

        init: function() {
            this.schema["type"] = this.schemaType();
            this.configs["type"] = this.controlType();

            // Sync configs and schema
            this.configs["label"] = this.configs["label"] || this.schema["title"] || LittleCub.prettyTitle(this.key) || "";
            this.schema["title"] = this.schema["title"] || this.configs["label"];

            this.configs["helper"] = this.configs["helper"] || this.schema["description"];
            this.schema["description"] = this.schema["description"] || this.configs["helper"];

            this.configs["name"] = this.configs["name"] || this.path.substring(1).replace(/\//g, "_");
            this.configs["theme"] = this.configs["theme"] || "default";

            this.configs["id"] = this.id;

            // Sync data
            this.configs["data"] = this.configs["data"] || this.data;
            this.data = this.data || this.configs["data"];
        },

        bindData: function(data) {
            this.data = data;
            this.configs["data"] = this.data;
        },

        isValidate: function() {
            this.validate();
            return _.every(this.validation, function(v) {
                return v["status"];
            });
        },

        _validateRequired: function() {
            var validation = {
                "status" : ! (this.configs.required && LittleCub.isValEmpty(this.val()))
            }
            if (! validation["status"]) {
                validation["message"] = LittleCub.findMessage("required", this.configs["theme"]);
            }
            return validation;
        },

        validate: function() {
            this.validation["required"] = this._validateRequired();
            var template = LittleCub.findTemplate(this.configs["theme"], "control_messages");
            if (template && this.messagesContainer) {
                this.messagesContainer.innerHTML = template({"validation" : this.validation}).trim();
            }
        },

        validationEvent: function() {
            return this.configs['validationEvent'] || LittleCub.defaults["validationEvent"];
        },

        bindCustomEventHandlers : function() {
            var that = this;
            // register general event handlers through configs
            _.each(this.configs, function(func, key) {
                if (LittleCub.startsWith(key, 'onControl') && _.isFunction(func)) {
                    var event = key.substring(9).toLowerCase();
                    that.field.addEventListener(event, function(e) {
                        func.call(that, e);
                    }, false);
                }
            })
        },

        bindEventListeners: function() {
            var validationTrigger = this.validationEvent();
            this.field.addEventListener(validationTrigger, this.validate.bind(this), false);
            this.bindCustomEventHandlers();
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
                if (this.field) {
                    this.bindEventListeners();
                }
                if (!LittleCub.isEmpty(this.configs["form"])) {
                    this.form = container.querySelector('form[data-lcid=' + this.id + '-form]');
                }
            }
        },

        render: function(container, data, mode) {
            mode = mode || "fill";
            this.container = container;
            var theme = this.configs["theme"];
            var template = this.configs["template"] ? this.configs["template"] : "form";
            if (!LittleCub.isEmpty(data)) {
                this.bindData(data);
            }
            if (mode == "fill") {
                container.innerHTML = LittleCub.renderTemplate(theme, template, this.configs);
            } else if (mode == "insertAfter") {
                var elem = document.createElement("span");
                elem.innerHTML = LittleCub.renderTemplate(theme, template, this.configs);
                container.parentNode.insertBefore(elem.firstChild, container.nextSibling);
                this.container = this.container.parentNode;
            } else if (mode == "appendTo") {

            }
            this.bindDOM();
        }
    });
})();