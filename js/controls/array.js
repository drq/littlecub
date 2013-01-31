(function() {
    "use strict";

    LittleCub.ArrayControl = LittleCub.ContainerControl.extend({
            /**
             *
             * @param container
             * @param data
             * @param configs
             * @param schema
             */
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);

                this.children = [];
            },

            addChild : function(v, k) {
                var configs = this.configs;
                var schema = this.schema;
                var itemSchema = schema && schema["items"] ? schema["items"] : {}
                var itemConfigs = configs && configs["items"] ? configs["items"] : {}
                var _itemConfigs = LittleCub.cloneJSON(itemConfigs);
                itemSchema["type"] = this.schemaType(itemSchema, itemConfigs, v);
                _itemConfigs["type"] = this.controlType(itemSchema, _itemConfigs);
                _itemConfigs["theme"] = _itemConfigs["theme"] || this.configs["theme"];
                var controlClass = LittleCub.controlClass(_itemConfigs["type"]);
                // Start to construct child controls
                var child = new controlClass(v, _itemConfigs, itemSchema);
                child.parent = this;
                child.key = this.key + "[" + k + "]";
                child.path = this.path + "[" + k + "]";
                child.init();
                this.children.splice(k, 0, child);
                // Link them back to its parent
                configs["controls"].splice(k, 0, child.configs);
                return child;
            },

            init: function() {
                this.base();
                var configs = this.configs;
                var data = this.data;

                var itemData = LittleCub.isEmpty(data) ? [] : data;
                if (!_.isArray(itemData)) {
                    itemData = [itemData];
                }
                var that = this;

                configs["controls"] = [];

                _.each(itemData, function(v, k) {
                    that.addChild(v, k);
                });
            },

            bindDOM: function() {
                this.base();
                this.validate();
                var that = this;
                _.each(this.outerEl.querySelectorAll('button[class=lc-array-item-add]'), function(v, k) {
                    v.addEventListener('click', function(e) {
                        var lcId = v.getAttribute("data-lcid");
                        lcId = lcId.substring(0, lcId.length - 4);
                        var insertAtIndex = that.children.length - 1;
                        _.every(that.children, function(v, k) {
                            if (v.id == lcId) {
                                insertAtIndex = k;
                                return false;
                            } else {
                                return true;
                            }
                        });
                        var insertAt = that.children[insertAtIndex];
                        var child = that.addChild(null, insertAtIndex + 1);
                        // Add array item toolbar
                        var elem = document.createElement("span");
                        elem.innerHTML = LittleCub.renderTemplate(child.configs["theme"], "array_item_toolbar", child.configs, true);
                        insertAt.outerEl.parentNode.insertBefore(elem.firstChild, insertAt.outerEl.nextSibling);
                        // Render the child
                        child.render(insertAt.outerEl.nextSibling, null, "insertAfter");
                        that.updateKeyPath();
                        return false;
                    });
                })
            },

            _updateKeyPath: function(v, k) {
                if (v.parent) {
                    v.key = v.parent.key + "[" + k + "]";
                    v.path = v.parent.path + "[" + k + "]";
                } else {
                    v.path = "[" + k + "]";
                }
            },

            val: function() {
                var len = arguments.length;
                if (len == 0) {
                    var value = [];
                    _.each(this.children, function(v) {
                        value.push(v.val());
                    });
                    return value;
                } else if (len == 1) {
                    var value = arguments[0];
                    _.each(this.children, function(v, k) {
                        var _val = LittleCub.isEmpty(value) ? null : value[k];
                        v.val(_val);
                    });
                    return value;
                }
            },

            bindData: function(data) {
                this.base(data);

                var nbChildren = this.children.length;
                var dataLen = data.length;

                var copyLen = nbChildren >= dataLen ? dataLen : nbChildren;
                for (var i = 0; i < copyLen; i++) {
                    this.children[i].bindData(data[i]);
                }
                if (nbChildren >= dataLen) {
                    for (var i = dataLen; i < nbChildren; i++) {
                        this.children.pop();
                    }
                } else {
                    for (var i = nbChildren; i < dataLen; i++) {
                        this.addChild(data[i], i)
                    }
                }
            },

            /**
             * Validates if number of items has been less than minItems.
             * @returns {Boolean} true if number of items has been less than minItems
             */
            _validateMinItems: function() {
                return ! ( _.isNumber(this.schema.minItems) && _.size(this.children) < this.schema.minItems);
            },

            /**
             * Validates if number of items has been over maxItems.
             * @returns {Boolean} true if number of items has been over maxItems
             */
            _validateMaxItems: function() {
                return ! (_.isNumber(this.schema.maxItems) && _.size(this.children) > this.schema.maxItems);
            },

            /**
             * Validates if all items are unique.
             * @returns {Boolean} true if all items are unique.
             */
            _validateUniqueItems: function() {
                if (this.schema.uniqueItems && _.isArray(this.data)) {
                    var isSame = true;
                    var data = this.data;
                    var len = this.data.length
                    for (var i = 0; i < len && isSame; i++) {
                        for (var j = i + 1; j < len && isSame; j++) {
                            isSame = LittleCub.compare(data[i], data[j]);
                        }
                    }
                    return isSame;
                } else {
                    return true;
                }
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
                this.validation["uniqueItems"] = {
                    "status" : this._validateUniqueItems()
                };
                if (! this.validation["uniqueItems"]["status"]) {
                    this.validation["uniqueItems"]["message"] = LittleCub.findMessage("uniqueItems", this.configs["theme"]);
                }
                this.base();
            }
        }, {
            TYPE : "array"
        }
    );

    LittleCub.controlClass(LittleCub.ArrayControl.TYPE, LittleCub.ArrayControl);
})();