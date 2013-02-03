(function() {
    "use strict";
    /**
     * Base class for providing common methods and interfaces for all controls.
     */
    LittleCub.ContainerControl = LittleCub.BaseControl.extend({
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

            isValidate: function() {
                if (!this.validate()) {
                    return false;
                } else {
                    return _.every(this.children, function(v) {
                        if (!v.isValidate()) {
                            return false;
                        } else {
                            return true;
                        }
                    });
                }
            }
        }
    );
})();