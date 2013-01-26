(function() {
    "use strict";
    /**
     * Base class for providing common methods and interfaces for all controls.
     */
    LittleCub.TextControl = LittleCub.BaseControl.extend({
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
            }
        }, {
            TYPE : "text"
        }
    );

    LittleCub.controlClass(LittleCub.TextControl.TYPE, LittleCub.TextControl);
})();