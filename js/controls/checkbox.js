(function() {
    "use strict";

    LittleCub.CheckboxControl = LittleCub.BaseControl.extend({
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
                        return this.field.checked ? true : false;
                    } else if (len == 1) {
                        var val = arguments[0];
                        if (LittleCub.isEmpty(val)) {
                            this.field.checked = false;
                        } else if (_.isString(val)) {
                            this.field.checked = val === 'true';
                        } else if (_.isBoolean(val)) {
                            this.field.checked = val;
                        } else {
                            this.field.checked = false;
                        }
                        return this.field.checked;
                    }
                }
            }
        }, {
            TYPE : "checkbox"
        }
    );

    LittleCub.controlClass(LittleCub.CheckboxControl.TYPE, LittleCub.CheckboxControl);
})();