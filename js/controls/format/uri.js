(function() {
    "use strict";

    LittleCub.UriControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            _validateUri: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isValEmpty(this.field.value) || true
                };
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("isUri", this.configs["theme"]);
                }
                return validation;
            },

            validate: function() {
                this.validation["isUri"] = this._validateUri();
                return this.base();
            }
        }, {
            TYPE : "uri"
        }
    );

    LittleCub.controlClass(LittleCub.UriControl.TYPE, LittleCub.UriControl);
})();