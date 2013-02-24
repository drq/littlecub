(function() {
    "use strict";

    LittleCub.PasswordControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            }
        }, {
            TYPE : "password"
        }
    );

    LittleCub.controlClass(LittleCub.PasswordControl.TYPE, LittleCub.PasswordControl);
})();