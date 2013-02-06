(function() {
    "use strict";

    LittleCub.FileControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            }
        }, {
            TYPE : "file"
        }
    );

    LittleCub.controlClass(LittleCub.FileControl.TYPE, LittleCub.FileControl);
})();