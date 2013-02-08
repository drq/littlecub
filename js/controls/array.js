(function() {
    "use strict";

    LittleCub.ArrayControl = LittleCub.ContainerControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
                this.children = [];
            },

            addChild : function(v, k) {
                var configs = this.configs;
                var schema = this.schema;
                var itemSchema = schema["items"];
                if (! itemSchema) {
                    itemSchema = schema["items"] = {};
                }
                var itemConfigs = configs["items"];
                if (! itemConfigs) {
                    itemConfigs = configs["items"] = {};
                }
                var _itemConfigs = LC.cloneJSON(itemConfigs);
                itemSchema["type"] = LC.schemaType.call(this, itemSchema, itemConfigs, v);
                _itemConfigs["type"] = LC.controlType.call(this, itemSchema, _itemConfigs);
                _itemConfigs["theme"] = _itemConfigs["theme"] || this.configs["theme"];
                var controlClass = LittleCub.controlClass(_itemConfigs["type"]);
                // Start to construct child controls
                var child = new controlClass(v, _itemConfigs, itemSchema);
                child.parent = this;
                child.key = (this.key ? this.key : "") + "[" + k + "]";
                child.path = this.path + "[" + k + "]";
                child.init();
                this.children.splice(k, 0, child);
                // Link them back to its parent
                configs["controls"].splice(k, 0, child.configs);
                return child;
            },

            removeChild : function(k) {
                this.children.splice(k, 1);
                this.configs["controls"].splice(k, 1);
            },

            init: function() {
                this.base();
                var configs = this.configs;
                var data = this.data;

                var itemData = LC.isEmpty(data) ? [] : data;
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

                var addElementToolbar = function(child) {
                    // Add array item toolbar
                    var elem = document.createElement("span");
                    elem.innerHTML = LC.renderTemplate(child.configs["theme"], "array_item_toolbar", child.configs, true);
                    _.each(elem.querySelectorAll('.lc-array-item-add'), function(v) {
                        v.addEventListener('click', addEventHandler);
                    });
                    _.each(elem.querySelectorAll('.lc-array-item-remove'), function(v) {
                        v.addEventListener('click', removeEventHandler);
                    });
                    return elem;
                };

                var addFirstEventHandler = function(e) {
                    var child = that.addChild(null, 1);
                    // Add array item toolbar
                    var elem = addElementToolbar(child);
                    var arrayToolbarElem = that.outerEl.querySelector('.lc-array-toolbar');
                    arrayToolbarElem.parentNode.insertBefore(elem.firstChild, arrayToolbarElem.nextSibling);
                    // Render the child
                    child.render(arrayToolbarElem.nextSibling, null, "insertAfter");
                    arrayToolbarElem.parentNode.removeChild(arrayToolbarElem);
                    // Trigger validation
                    that.validate();
                    return false;
                };

                var addEventHandler = function(e) {
                    var v = this;
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
                    var elem = addElementToolbar(child);
                    insertAt.outerEl.parentNode.insertBefore(elem.firstChild, insertAt.outerEl.nextSibling);
                    // Render the child
                    child.render(insertAt.outerEl.nextSibling, null, "insertAfter");
                    that.updateKeyPath();
                    // Trigger validation
                    that.validate();
                    return false;
                };

                var removeEventHandler = function(e) {
                    var v = this;
                    var lcId = v.getAttribute("data-lcid");
                    lcId = lcId.substring(0, lcId.length - 7);
                    var removeAtIndex;
                    _.every(that.children, function(v, k) {
                        if (v.id == lcId) {
                            removeAtIndex = k;
                            return false;
                        } else {
                            return true;
                        }
                    });
                    if (! LC.isEmpty(removeAtIndex)) {
                        var child = that.children[removeAtIndex];
                        var outerEl = child.outerEl;
                        outerEl.parentNode.removeChild(outerEl);
                        var toolbarElem = that.outerEl.querySelector('[data-lcid="' + lcId + '-toolbar"]');
                        toolbarElem.parentNode.removeChild(toolbarElem);
                        that.removeChild(removeAtIndex);
                        that.updateKeyPath();
                        // Trigger validation
                        that.validate();
                        // Add the array toolbar for empty array
                        if (that.children.length == 0) {
                            var elem = document.createElement("span");
                            elem.innerHTML = LC.renderTemplate(child.configs["theme"], "array_toolbar", child.configs, true);
                            _.each(elem.querySelectorAll('.lc-array-add'), function(v) {
                                v.addEventListener('click', addFirstEventHandler);
                            });
                            lcId = that.outerEl.getAttribute("data-lcid");
                            var itemsElem = that.outerEl.querySelector("[data-lcid='" + lcId + "-items']");
                            if (itemsElem) {
                                itemsElem.appendChild(elem.firstChild);
                            } else {
                                that.outerEl.appendChild(elem.firstChild);
                            }
                        }
                    }
                    return false;
                };

                _.each(this.outerEl.querySelectorAll('.lc-array-add'), function(v) {
                    v.addEventListener('click', addFirstEventHandler);
                });

                _.each(this.outerEl.querySelectorAll('.lc-array-item-add'), function(v) {
                    v.addEventListener('click', addEventHandler);
                });

                _.each(this.outerEl.querySelectorAll('.lc-array-item-remove'), function(v) {
                    v.addEventListener('click', removeEventHandler);
                });

                if (this.schema.uniqueItems) {
                    var that = this;
                    this.outerEl.addEventListener("lc-update", function(e) {
                        var lcControl = e["lc-control"];
                        var isParent = false, parent = lcControl.parent;
                        while(parent && !isParent) {
                            if (parent == that) {
                                isParent = true;
                            }
                            parent = parent.parent;
                        }
                        if (isParent) {
                            that.validate();
                        }
                    }, false);
                }
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
                        var _val = LC.isEmpty(value) ? null : value[k];
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
                var validation = {
                    "status" : LC.isEmpty(this.schema.minItems) || ! _.isNumber(this.schema.minItems) || _.size(this.children) >= this.schema.minItems
                };
                if (!validation["status"]) {
                    validation["message"] = LC.substituteTokens(LC.findMessage("minItems", this.configs["theme"]), [this.schema["minItems"]])
                }
                return validation;
            },

            /**
             * Validates if number of items has been over maxItems.
             * @returns {Boolean} true if number of items has been over maxItems
             */
            _validateMaxItems: function() {
                var validation = {
                    "status" : LC.isEmpty(this.schema.minItems) || ! _.isNumber(this.schema.maxItems) || _.size(this.children) <= this.schema.maxItems
                };
                if (!validation["status"]) {
                    validation["message"] = LC.substituteTokens(LC.findMessage("maxItems", this.configs["theme"]), [this.schema["maxItems"]])
                }
                return validation;
            },

            /**
             * Validates if all items are unique.
             * @returns {Boolean} true if all items are unique.
             */
            _validateUniqueItems: function() {
                var status = true;
                var val = this.val();
                if (this.schema.uniqueItems && _.isArray(val)) {
                    var isSame = false;
                    var len = val.length;
                    for (var i = 0; i < len && !isSame; i++) {
                        for (var j = i + 1; j < len && !isSame; j++) {
                            isSame = LC.compare(val[i], val[j]);
                        }
                    }
                    status = !isSame;
                }
                var validation = {
                    "status" : status
                };
                if (! status) {
                    validation["message"] = LC.findMessage("uniqueItems", this.configs["theme"]);
                }
                return validation;
            },

            validate: function() {
                this.validation["minItems"] = this._validateMinItems();
                this.validation["maxItems"] = this._validateMaxItems();
                this.validation["uniqueItems"] = this._validateUniqueItems();
                return this.base();
            }
        }, {
            TYPE : "array"
        }
    );

    LittleCub.controlClass(LittleCub.ArrayControl.TYPE, LittleCub.ArrayControl);
})();