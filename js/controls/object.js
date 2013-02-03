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
                    v["schema"]["type"] = that.schemaType(v["schema"], v["configs"], v["data"]);
                    v["configs"]["type"] = that.controlType(v["schema"], v["configs"]);
                    v["configs"]["theme"] = v["configs"]["theme"] || that.configs["theme"];
                    var controlClass = LittleCub.controlClass(v["configs"]["type"]);
                    // Start to construct child controls
                    if (that.schema["required"] && _.indexOf(that.schema["required"], k) != -1) {
                        v["configs"]["required"] = true;
                    }
                    that.children[k] = new controlClass(v["data"], LittleCub.cloneJSON(v["configs"]), LittleCub.cloneJSON(v["schema"]));
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
                        var _val = LittleCub.isEmpty(value) ? null : value[v.key];
                        v.val(_val);
                    });
                    return value;
                }
            },

            bindData: function(data) {
                this.base(data);
                _.each(this.children, function(v, k) {
                    var d = LittleCub.isEmpty(data) ? null : data[k];
                    v.bindData(d);
                });
            }
        }, {
            TYPE : "object"
        }
    );

    LittleCub.controlClass(LittleCub.ObjectControl.TYPE, LittleCub.ObjectControl);
})();