(function() {
    "use strict";

    LittleCub.DatetimeControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            _validateDatetime: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isValEmpty(this.field.value) || !_.isNaN(Date.parse(val))
                };
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("isDatetime", this.configs["theme"]);
                }
                return validation;
            },

            validate: function() {
                this.validation["isDatetime"] = this._validateDatetime();
                return this.base();
            }
        }, {
            TYPE : "datetime"
        }
    );

    LittleCub.controlClass(LittleCub.DatetimeControl.TYPE, LittleCub.DatetimeControl);
})();