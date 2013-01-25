(function() {
    "use strict";
    /**
     * Base class for providing common methods and interfaces for all controls.
     */
    LittleCub.ObjectControl = LittleCub.ContainerControl.extend({
            /**
             *
             * @param container
             * @param data
             * @param configs
             * @param schema
             */
            constructor: function(container, data, configs, schema) {
                this.base(container, data, configs, schema);
            },

            init: function() {
                this.base();
                var configs = this.configs;
                var schema = this.schema;
                var data = this.data;
                var that = this;

                var params = {};
                if (configs && configs["controls"]) {
                    _.each(configs["controls"], function(v, k) {
                        params[k] = params[k] || {};
                        params[k]["configs"] = v;
                    });
                }
                if (schema && schema["properties"]) {
                    _.each(schema["properties"], function(v, k) {
                        params[k] = params[k] || {};
                        params[k]["schema"] = v;
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
                    v["schema"]["type"] = that.schemaType(v["schema"], v["configs"], v["data"]);
                    v["configs"]["type"] = that.controlType(v["schema"], v["configs"]);
                    var controlClass = LittleCub.controlClass(v["configs"]["type"]);
                    // Start to construct child controls
                    that.children[k] = new controlClass("", v["data"], v["configs"], v["schema"]);
                    that.children[k].parent = that;
                    that.children[k].key = k;
                    that.children[k].path = that.path == "/" ? that.path + k  : that.path + "/" + k;
                    that.children[k].init();
                    // Link them back to its parent
                    schema["properties"] = schema["properties"] || {};
                    schema["properties"][k] = that.children[k].schema;
                    configs["controls"] = configs["controls"] || {};
                    configs["controls"][k] = that.children[k].configs;
                });
            }
        }, {
            TYPE : "object"
        }
    );

    LittleCub.controlClass(LittleCub.ObjectControl.TYPE, LittleCub.ObjectControl);
})();