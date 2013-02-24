(function() {
    "use strict";

    LittleCub.SelectControl = LittleCub.ListControl.extend({
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
                        var val = this.configs["multiple"] ? [] : this.field.value;
                        var that = this;
                        _.each(this.configs["options"], function(v, k) {
                            if (that.configs["multiple"]) {
                                if (that.field.options[k].selected && String(v['value']) == that.field.options[k].value) {
                                    val.push(v['value']);
                                }
                            } else {
                                if (String(v['value']) == val) {
                                    val = v['value'];
                                }
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

            _validateMinItems: function() {
                var validation = {
                    "status" : LC.isEmpty(this.schema.minItems) || this.val().length >= this.schema.minItems
                };
                if (! validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("minItems", this.configs["theme"]), [this.schema["minItems"]]);
                }
                return validation;
            },

            _validateMaxItems: function() {
                var validation = {
                    "status" : LC.isEmpty(this.schema.maxItems) || this.val().length <= this.schema.minItems
                };
                if (! validation["status"]) {
                    validation["message"] = LC.replaceTokens(LC.findMessage("maxItems", this.configs["theme"]), [this.schema["maxItems"]]);
                }
                return validation;
            },

            validate: function() {
                this.validation["minItems"] = this._validateMinItems();
                this.validation["maxItems"] = this._validateMaxItems();
                return this.base();
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