(function() {
    "use strict";

    LittleCub.TextareaControl = LittleCub.TextControl.extend({
            /**
             *
             * @param container
             * @param data
             * @param configs
             * @param schema
             */
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            }
        }, {
            TYPE : "textarea"
        }
    );

    LittleCub.controlClass(LittleCub.TextareaControl.TYPE, LittleCub.TextareaControl);
})();