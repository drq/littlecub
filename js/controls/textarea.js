(function() {
    "use strict";
    /**
     * Base class for providing common methods and interfaces for all controls.
     */
    LittleCub.TextareaControl = LittleCub.TextControl.extend({
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
            },

            bind: function() {

            }
        }, {
            TYPE : "textarea"
        }
    );

    LittleCub.controlClass(LittleCub.TextareaControl.TYPE, LittleCub.TextareaControl);
})();