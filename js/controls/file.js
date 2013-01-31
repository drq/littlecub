(function() {
    "use strict";

    LittleCub.FileControl = LittleCub.TextControl.extend({
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
            TYPE : "file"
        }
    );

    LittleCub.controlClass(LittleCub.FileControl.TYPE, LittleCub.FileControl);
})();