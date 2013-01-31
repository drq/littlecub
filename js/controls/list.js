(function() {
    "use strict";

    LittleCub.ListControl = LittleCub.BaseControl.extend({
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
                this.configs["options"] = this.configs["options"] || [];
                var options = this.configs["options"];
                var enums = this.schema["enum"];
                var that = this;
                var isArray = _.isArray(that.data);
                if (enums) {
                    var _options = [];
                    _.each(enums, function(v, k) {
                        var text = v;
                        if (! LittleCub.isEmpty(options[k])) {
                            text = options[k];
                        } else if (! LittleCub.isEmpty(options[v])) {
                            text = options[v];
                        }
                        _options.push({
                            "value": v,
                            "text": text,
                            "selected": isArray ? _.contains(that.data, v) : that.data == v
                        });
                    });
                    this.configs["options"] = _options;
                }
            }
        }
    );

})();