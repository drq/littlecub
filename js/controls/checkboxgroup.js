(function() {
    "use strict";

    LittleCub.CheckboxgroupControl = LittleCub.SelectControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
            },

            val: function() {
                if (this.field) {
                    var len = arguments.length;
                    if (len == 0) {
                        var val = this.configs["multiple"] ? [] : null;
                        if (this.configs["multiple"]) {
                            val = [];
                        } else {
                            var checked = this.field.querySelector('input[type=radio]:checked');
                            if (checked != null) {
                                val = checked.value;
                            }
                        }
                        var that = this;
                        var checkboxes = this.field.querySelectorAll('input[type=checkbox]');
                        _.each(this.configs["options"], function(v, k) {
                            if (that.configs["multiple"]) {
                                if (checkboxes[k].checked && String(v['value']) == checkboxes[k].value) {
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
                        var vals = _.isArray(arguments[0]) ? arguments[0] : [arguments[0]];
                        _.each(vals, function(val) {
                            _.each(this.field.querySelectorAll('input[type=checkbox]'), function(v) {
                                if (v.value == val) {
                                    v.checked = "checked";
                                } else {
                                    v.removeAttribute("checked");
                                }
                            });
                        });
                        return arguments[0];
                    }
                }
            },

            validationEvent: function() {
                return this.configs['validationEvent'] || "click";
            },

            bindEventListeners: function() {
                var validationTrigger = this.validationEvent();
                var that = this;
                _.each(this.field.querySelectorAll('input[type=checkbox]'), function(v) {
                    v.addEventListener(validationTrigger, that.validate.bind(that), false);
                });
                this.bindCustomEventHandlers();
            },

            bindDOM: function() {
                this.base();
                if (this.configs["readonly"]) {
                    _.each(this.field.querySelectorAll('input[type=checkbox]'), function(v) {
                        v.onclick = v.onkeydown = function() {
                            return false;
                        };
                    });
                }
            }
        }, {
            TYPE : "checkboxgroup"
        }
    );

    LittleCub.controlClass(LittleCub.CheckboxgroupControl.TYPE, LittleCub.CheckboxgroupControl);
})();