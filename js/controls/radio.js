(function() {
    "use strict";

    LittleCub.RadioControl = LittleCub.ListControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        var val = this.field.querySelector('input[type=radio]:checked').value;
                        _.each(this.configs["options"], function(v) {
                            if (String(v['value']) == val) {
                                val = v['value'];
                            }
                        });

                        if (this.schema["type"] == "number") {
                            return parseFloat(val);
                        } else if (this.schema["type"] == "integer") {
                            return parseInt(val);
                        } else {
                            return val;
                        }
                    } else if (len == 1) {
                        var val = arguments[0] || "";
                        if (val != this.val()) {
                            _.each(this.field.querySelectorAll('input[type=radio]'), function(v) {
                                if (v.value == val) {
                                    v.checked = "checked";
                                } else {
                                    v.removeAttribute("checked");
                                }
                            });
                            if (!this.field.querySelector('input[type=radio]:checked')) {
                                this.field.querySelector('input[type=radio]').checked = "checked";
                            }
                            return val;
                        }
                    }
                }
            },

            validationEvent: function() {
                return this.configs['validationEvent'] || "click";
            },

            bindEventListeners: function() {
                var validationTrigger = this.validationEvent();
                var that = this;
                _.each(this.field.querySelectorAll('input[type=radio]'), function(v) {
                    v.addEventListener(validationTrigger, that.validate.bind(that), false);
                });
                this.bindCustomEventHandlers();
            },

            bindDOM: function() {
                this.base();
                if (this.configs["readonly"]) {
                    _.each(this.field.querySelectorAll('input[type=radio]'), function(v) {
                        v.onclick = v.onkeydown = function() {
                            return false;
                        };
                    });
                }
            }
        }, {
            TYPE : "radio"
        }
    );

    LittleCub.controlClass(LittleCub.RadioControl.TYPE, LittleCub.RadioControl);
})();