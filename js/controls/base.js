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
        constructor: function(container, data, configs, schema) {
            this.container = container;
            this.data = data;
            this.dataBackup = _.isObject(data) || _.isArray(data) ? LittleCub.cloneJSON(data) : data;
            this.configs = configs || {};
            this.schema = schema || {};

            // other members
            this.id = this.configs["id"] || LittleCub.id();
            this.path = this.configs["path"] || "/";
            this.parent = null;
            this.field = null;

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
            this.configs["name"] = this.configs["name"] || this.path.substring(1).replace(/\//g,"_");
        }
    });
})();