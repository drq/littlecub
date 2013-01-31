(function() {
    "use strict";

    LittleCub.SelectControl = LittleCub.ListControl.extend({
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

            init: function() {
                this.base();
                if (this.schema["type"] && this.schema["type"] == "array") {
                    this.configs["multiple"] = true;
                }
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        var val = this.field.value;
                        _.each(this.configs["options"], function(v) {
                            if (String(v['value']) == val) {
                                val = v['value'];
                            }
                        });
                        return val;
                    } else if (len == 1) {
                        var val = arguments[0] || "";
                        if (val != this.val()) {
                            _.each(this.field.value, function(v) {
                                if (v.value == val) {
                                    v.selected = "selected";
                                } else {
                                    v.removeAttribute("selected");
                                }
                            });
                            if (!this.field.querySelector('option[selected]')) {
                                this.field.selectedIndex = 0;
                            }
                            return val;
                        }
                    }
                }
            },

            /**
             * Validates if number of items has been less than minItems.
             * @returns {Boolean} true if number of items has been less than minItems
             */
            _validateMinItems: function() {
                if (this.schema.items && this.schema.items.minItems) {
                    if (this.field.value.length < this.schema.items.minItems) {
                        return false;
                    }
                }
                return true;
            },

            /**
             * Validates if number of items has been over maxItems.
             * @returns {Boolean} true if number of items has been over maxItems
             */
            _validateMaxItems: function() {
                if (this.schema.items && this.schema.items.maxItems) {
                    if (this.field.value.length > this.schema.items.maxItems) {
                        return false;
                    }
                }
                return true;
            },

            validate: function() {
                this.validation["minItems"] = {
                    "status" : this._validateMinItems()
                };
                if (! this.validation["minItems"]["status"]) {
                    this.validation["minItems"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("minItems", this.configs["theme"]), [this.schema["minItems"]]);
                }
                this.validation["maxItems"] = {
                    "status" : this._validateMaxItems()
                };
                if (! this.validation["maxItems"]["status"]) {
                    this.validation["maxItems"]["message"] = LittleCub.substituteTokens(LittleCub.findMessage("maxItems", this.configs["theme"]), [this.schema["maxItems"]]);
                }
                this.base();
            },

            validationEvent: function() {
                return this.configs['validationEvent'] || "change";
            }
        }, {
            TYPE : "select"
        }
    );

    LittleCub.controlClass(LittleCub.SelectControl.TYPE, LittleCub.SelectControl);
})();