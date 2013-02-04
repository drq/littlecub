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
                var val = this.val();
                var regex;
                if (this.schema.pattern) {
                    var flags = this.schema.pattern.replace(/.*\/([gimy]*)$/, '$1');
                    var pattern = this.schema.pattern.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
                    regex = new RegExp(pattern, flags);
                }
                var validation = {
                    "status" : LittleCub.isEmpty(this.schema.pattern) || LittleCub.isValEmpty(val) || ! LittleCub.isEmpty(val.match(regex))
                };
                if (! validation["status"]) {
                    validation["message"] = LittleCub.substituteTokens(LittleCub.findMessage("pattern", this.configs["theme"]), [this.schema["pattern"]]);
                }
                return validation;
            },

            /**
             * Validates against the schema minLength property.
             *
             * @returns {Boolean} True if its size is greater than minLength, false otherwise.
             */
            _validateMinLength: function() {
                var val = this.val();
                var validation = {
                    "status" : LittleCub.isEmpty(this.schema.minLength) || LittleCub.isValEmpty(val) || val.length >= this.schema.minLength
                };
                if (! validation["status"]) {
                    validation["message"] = LittleCub.substituteTokens(LittleCub.findMessage("minLength", this.configs["theme"]), [this.schema["minLength"]]);
                }
                return validation;
            },

            /**
             * Validates against the schema maxLength property.
             *
             * @returns {Boolean} True if its size is less than maxLength , false otherwise.
             */
            _validateMaxLength: function() {
                var val = this.val();
                var validation = {
                    "status" : LittleCub.isEmpty(this.schema.maxLength) || LittleCub.isValEmpty(val) || val.length <= this.schema.maxLength
                };
                if (! validation["status"]) {
                    validation["message"] = LittleCub.substituteTokens(LittleCub.findMessage("maxLength", this.configs["theme"]), [this.schema["maxLength"]]);
                }
                return validation;
            },

            validate: function() {
                this.validation["pattern"] = this._validatePattern();
                this.validation["minLength"] = this._validateMinLength();
                this.validation["maxLength"] = this._validateMaxLength();
                this.base();
            }
        }, {
            TYPE : "text"
        }
    );

    LittleCub.controlClass(LittleCub.TextControl.TYPE, LittleCub.TextControl);
})();