(function() {
    "use strict";

    LittleCub.NumberControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        return parseFloat(this.field.value);
                    } else if (len == 1) {
                        this.field.value = arguments[0] || "";
                        return this.field.value;
                    }
                }
            },

            init: function() {
                this.base();
                this.configs["template"] = this.configs["template"] || "control_text";
            },

            /**
             * Validates if it is a float number.
             * @returns {Boolean} true if it is a float number
             */
            _validateNumber: function() {
                var val = this.val();
                var validation = {
                    "status" : LC.isValEmpty(this.field.value) || (!_.isNaN(val) && this.field.value.match(/^([\+\-]?((([0-9]+(\.)?)|([0-9]*\.[0-9]+))([eE][+-]?[0-9]+)?))$/))
                };
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("isNumber", this.configs["theme"]);
                }
                return validation;
            },

            /**
             * Validates maximum constraint.
             * @returns {Boolean} true if it passes the maximum constraint.
             */
            _validateMaximum: function() {
                var val = this.val();
                var status = true;
                if (!LC.isEmpty(this.schema["maximum"])) {
                    if (val > this.schema["maximum"]) {
                        status = false;
                    } else if (this.schema["exclusiveMaximum"] && val == this.schema["maximum"]) {
                        status = false;
                    }
                }
                var validation = {
                    "status" : status
                };
                if (!status) {
                    if (this.schema["exclusiveMaximum"]) {
                        validation["message"] = LC.substituteTokens(LC.findMessage("exclusiveMinimum", this.configs["theme"]), [this.schema["maximum"]]);
                    } else {
                        validation["message"] = LC.substituteTokens(LC.findMessage("maximum", this.configs["theme"]), [this.schema["maximum"]]);
                    }
                }
                return validation;
            },

            /**
             * Validates maximum constraint.
             * @returns {Boolean} true if it passes the minimum constraint.
             */
            _validateMinimum: function() {
                var val = this.val();
                var status = true;
                if (!LC.isEmpty(this.schema["minimum"])) {
                    if (val < this.schema["minimum"]) {
                        status = false;
                    } else if (this.schema["exclusiveMinimum"] && val == this.schema["minimum"]) {
                        status = false;
                    }
                }
                var validation = {
                    "status" : status
                };
                if (!status) {
                    if (this.schema["exclusiveMinimum"]) {
                        validation["message"] = LC.substituteTokens(LC.findMessage("exclusiveMinimum", this.configs["theme"]), [this.schema["minimum"]]);
                    } else {
                        validation["message"] = LC.substituteTokens(LC.findMessage("minimum", this.configs["theme"]), [this.schema["minimum"]]);
                    }
                }
                return validation;
            },

            validate: function() {
                this.validation["isNumber"] = this._validateNumber();
                if (this.validation["isNumber"]["status"]) {
                    this.validation["maximum"] = this._validateMaximum();
                    this.validation["minimum"] = this._validateMinimum();
                }
                return this.base();
            }

        }, {
            TYPE : "number"
        }
    );

    LittleCub.controlClass(LittleCub.NumberControl.TYPE, LittleCub.NumberControl);
})();