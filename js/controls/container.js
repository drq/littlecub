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
            constructor: function(container, data, configs, schema) {
                this.base(container, data, configs, schema);
                this.children = {};
            },

            init: function() {
                this.base();
            }
        }
    );
})();