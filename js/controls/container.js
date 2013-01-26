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
                this.children = {};
            },

            init: function() {
                this.base();
            }
        }
    );
})();