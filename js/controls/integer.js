(function() {
    "use strict";

    LittleCub.IntegerControl = LittleCub.NumberControl.extend({
            /**
             *
             * @param container
             * @param data
             * @param configs
             * @param schema
             */
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        return parseInt(this.field.value);
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
                // allow null
                return !_.isNaN(val) && _.isNumber(val) && (val == parseFloat(this.field.value));
            },

            /**
             */
            _validateMultipleOf: function() {
                var val = this.val();
                if (!LittleCub.isEmpty(this.schema["multipleOf"]) && !(val % this.schema["multipleOf"] == 0)) {
                    return false;
                } else {
                    return true;
                }
            },

            validate: function() {
                this.validation["isInteger"] = {
                    "status" : this._validateInteger()
                };
                if (! this.validation["isInteger"]["status"]) {
                    this.validation["isInteger"]["message"] = LittleCub.findMessage("isInteger", this.configs["theme"]);
                }
                this.validation["multipleOf"] = {
                    "status" : this._validateMultipleOf()
                };
                if (! this.validation["multipleOf"]["status"]) {
                    this.validation["multipleOf"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("multipleOf", this.configs["theme"]),[this.schema["multipleOf"]]);
                }
                this.base();
            }

        }, {
            TYPE : "integer"
        }
    );

    LittleCub.controlClass(LittleCub.IntegerControl.TYPE, LittleCub.IntegerControl);
})();