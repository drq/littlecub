(function() {
    "use strict";

    LittleCub.IntegerControl = LittleCub.NumberControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        return this.field.value == "" ? null : parseInt(this.field.value);
                    } else if (len == 1) {
                        this.field.value = arguments[0] || "";
                        return this.field.value;
                    }
                }
            },

            /**
             * Validates if it is a float integer.
             * @returns {Boolean} true if it is a float integer
             */
            _validateInteger: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isValEmpty(this.field.value) || (!_.isNaN(val) && this.field.value.match(/^([\+\-]?([1-9]\d*)|0)$/) != null && (val == parseFloat(this.field.value)))
                };
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("isInteger", this.configs["theme"]);
                }
                return validation;
            },

            /**
             */
            _validateMultipleOf: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isEmpty(this.schema["multipleOf"]) || (val % this.schema["multipleOf"] == 0)
                };
                if (! validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("multipleOf", this.configs["theme"]), [this.schema["multipleOf"]]);
                }
                return validation;
            },

            validate: function() {
                if (! LC.isValEmpty(this.field.value) || this.configs["required"]) {
                    this.validation["isInteger"] = this._validateInteger();
                    if (this.validation["isInteger"]["status"]) {
                        this.validation["multipleOf"] = this._validateMultipleOf();
                    }
                }
                return this.base();
            }

        }, {
            TYPE : "integer"
        }
    );

    LittleCub.controlClass(LittleCub.IntegerControl.TYPE, LittleCub.IntegerControl);
})();