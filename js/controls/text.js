(function() {
    "use strict";

    LittleCub.TextControl = LittleCub.BaseControl.extend({
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
                        return this.field.value;
                    } else if (len == 1) {
                        this.field.value = arguments[0] || "";
                        return this.field.value;
                    }
                }
            },

            /**
             * Validates against the schema pattern property.
             *
             * @returns {Boolean} True if it matches the pattern, false otherwise.
             */
            _validatePattern: function() {
                if (this.schema.pattern) {
                    var val = this.val();
                    if (!LittleCub.isValEmpty(val) && !val.match(this.schema.pattern)) {
                        return false;
                    }
                }

                return true;
            },

            /**
             * Validates against the schema minLength property.
             *
             * @returns {Boolean} True if its size is greater than minLength, false otherwise.
             */
            _validateMinLength: function() {
                if (!LittleCub.isEmpty(this.schema.minLength)) {
                    var val = this.val();
                    if (!LittleCub.isEmpty(val)) {
                        if (val.length < this.schema.minLength) {
                            return false;
                        }
                    }
                }
                return true;
            },

            /**
             * Validates against the schema maxLength property.
             *
             * @returns {Boolean} True if its size is less than maxLength , false otherwise.
             */
            _validateMaxLength: function() {
                if (!LittleCub.isEmpty(this.schema.maxLength)) {
                    var val = this.val();
                    if (!LittleCub.isEmpty(val)) {
                        if (val.length > this.schema.maxLength) {
                            return false;
                        }
                    }
                }
                return true;
            },

            validate: function() {
                this.validation["pattern"] = {
                    "status" : this._validatePattern()
                };
                if (! this.validation["pattern"]["status"]) {
                    this.validation["pattern"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("pattern", this.configs["theme"]),[this.schema["pattern"]]);
                }
                this.validation["minLength"] = {
                    "status" : this._validateMinLength()
                };
                if (! this.validation["minLength"]["status"]) {
                    this.validation["minLength"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("minLength", this.configs["theme"]),[this.schema["minLength"]]);
                }
                this.validation["maxLength"] = {
                    "status" : this._validateMaxLength()
                };
                if (! this.validation["maxLength"]["status"]) {
                    this.validation["maxLength"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("maxLength", this.configs["theme"]),[this.schema["maxLength"]]);
                }
                this.base();
            }
        }, {
            TYPE : "text"
        }
    );

    LittleCub.controlClass(LittleCub.TextControl.TYPE, LittleCub.TextControl);
})();