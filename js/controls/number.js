(function() {
    "use strict";

    LittleCub.NumberControl = LittleCub.TextControl.extend({
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
                        return parseFloat(this.field.value);
                    } else if (len == 1) {
                        this.field.value = arguments[0] || "";
                        return this.field.value;
                    }
                }
            },
            
            /**
             * Validates if it is a float number.
             * @returns {Boolean} true if it is a float number
             */
            _validateNumber: function() {
                var val = this.val();
                // allow null
                return !_.isNaN(val) && _.isNumber(val);
            },

            /**
             * Validates maximum constraint.
             * @returns {Boolean} true if it passes the maximum constraint.
             */
            _validateMaximum: function() {
                var val = this.val();
                if (val > this.schema["maximum"]) {
                    return false;
                } else if (this.schema["exclusiveMaximum"] && val == this.schema["maximum"]) {
                    return false;
                } else {
                    return true;
                }
            },

            /**
             * Validates maximum constraint.
             * @returns {Boolean} true if it passes the minimum constraint.
             */
            _validateMinimum: function() {
                var val = this.val();
                if (val < this.schema["minimum"]) {
                    return false;
                } else if (this.schema["exclusiveMinimum"] && val == this.schema["minimum"]) {
                    return false;
                } else {
                    return true;
                }
            },

            validate: function() {
                this.validation["isNumber"] = {
                    "status" : this._validateNumber()
                };
                if (! this.validation["isNumber"]["status"]) {
                    this.validation["isNumber"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("isNumber", this.configs["theme"]),[this.schema["isNumber"]]);
                }
                if (!LittleCub.isEmpty(this.schema["minimum"])) {
                    this.validation["minimum"] = {
                        "status" : this._validateMinimum()
                    };
                    if (! this.validation["minimum"]["status"]) {
                         if (this.schema["exclusiveMinimum"]) {
                             this.validation["minimum"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("exclusiveMinimum", this.configs["theme"]),[this.schema["minimum"]]);
                         } else {
                            this.validation["minimum"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("minimum", this.configs["theme"]),[this.schema["minimum"]]);
                         }
                    }
                }
                if (!LittleCub.isEmpty(this.schema["maximum"])) {
                    this.validation["maximum"] = {
                        "status" : this._validateMaximum()
                    };
                    if (! this.validation["maximum"]["status"]) {
                         if (this.schema["exclusiveMaximum"]) {
                             this.validation["maximum"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("exclusiveMinimum", this.configs["theme"]),[this.schema["maximum"]]);
                         } else {
                            this.validation["maximum"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("maximum", this.configs["theme"]),[this.schema["maximum"]]);
                         }
                    }
                }
                this.base();
            }

        }, {
            TYPE : "number"
        }
    );

    LittleCub.controlClass(LittleCub.NumberControl.TYPE, LittleCub.NumberControl);
})();