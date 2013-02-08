(function() {
    "use strict";

    LC["defaults"]["validationEvent"] = "keyup";

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var formGeneratorSchema = {
        "title" : "Form Generator",
        "description" : "Enter or select the below options and then hit the Generate button. The total number of controls will be capped at 2000.",
        "type" : "object",
        "properties" : {
            "depth" : {
                "title" : "Maximum Depth",
                "type" : "integer",
                "description" : "Enter the maximum depth of the form.",
                "default" : 3,
                "minimum": 1
            },
            "nbControls" : {
                "title" : "Number of Controls",
                "type" : "integer",
                "description" : "Enter the maximum number of controls for each level.",
                "default" : 30,
                "minimum": 1
            }
        }
    };

    var formGeneratorControl = LittleCub({}, null, formGeneratorSchema, document.getElementById('form-generator'));

    var maxControls = 2000;

    document.getElementById('form-generator-button').addEventListener('click', function() {
        var formVal = formGeneratorControl.val();
        var count = 0;
        var data = {

        };
        var schema = {
            "type" : "object",
            "properties" : {

            }
        }
        var configs = {
            "type" : "object",
            "label" : "Generated Form",
            "helper" : "Help message for generated form",
            "controls" : {

            }
        };
        var controlRegistry = LittleCub.controlClass();
        var controlArray = [];
        for (var controlType in controlRegistry) {
            if (controlRegistry.hasOwnProperty(controlType)) {
                controlArray.push(controlType);
            }
        }

        var renderControls = function(_data, _schema, _configs, level) {

            if (level >= formVal["depth"]) return;

            for (var i = 0; i < formVal["nbControls"] && count <= maxControls; i ++) {
                var type = controlArray[getRandomInt(0, controlArray.length - 1)];
                _schema[type + count] = {
                    "type" : type
                }
                _configs[type + count] = {
                    "label" : "Control " + count,
                    "type" : controlRegistry[type].TYPE,
                    "helper" : "Help message " + count
                }

                if (type == "radio" || type == "select") {
                    _schema[type + count]["enum"] = [count + "A", count + "B", count + "C"];
                    _data[type + count] = count + "B";
                } else if (type == "object") {
                    _schema[type + count]["properties"] = {};
                    _configs[type + count]["controls"] = {};
                    _data[type + count] = {};
                    renderControls(_data[type + count], _schema[type + count]["properties"], _configs[type + count]["controls"], level+1);
                } else if (type == "array") {
                    _schema[type + count]["items"] = {
                        "type" : "object",
                        "properties" : {}
                    };
                    _configs[type + count]["items"] = {
                        "type" : "object",
                        "controls" : {}
                    };
                    _data[type + count] = [{

                    }];
                    renderControls(_data[type + count][0], _schema[type + count]["items"]["properties"], _configs[type + count]["items"]["controls"], level+1);
                } else {
                    _data[type + count] = type + count;
                }

                count++;
            }
        }

        renderControls(data, schema["properties"],configs["controls"],0);

        //document.getElementById('generated-configs').innerHTML = JSON.stringify(configs, null, ' ');
        var start = new Date();
        LittleCub(data, configs, schema, document.getElementById('form'));
        var end = new Date();
        var secondsElapsed = (end - start) / 1000;
        document.getElementById('performance-info').innerHTML = count + " controls in " + secondsElapsed + " seconds!";
    });
})();