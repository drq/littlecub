(function() {
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

            this.configs["helper"] = LC.isEmpty(this.configs["helper"]) ?  this.schema["description"] : this.configs["helper"];
            this.schema["description"] = LC.isEmpty(this.schema["description"]) ?  this.configs["helper"] : this.schema["description"];

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
                var pathArray = path.split('/[]\//');
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
            }
        },

        render: function(container, data, mode) {
            mode = mode || "fill";
            this.container = container;
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
                injection.call(this,container);
            }
        }
    });
})();