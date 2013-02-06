(function() {
    "use strict";

    LittleCub.TextareaControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            }
        }, {
            TYPE : "textarea"
        }
    );

    LittleCub.controlClass(LittleCub.TextareaControl.TYPE, LittleCub.TextareaControl);
})();