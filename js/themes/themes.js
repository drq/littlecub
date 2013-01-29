(function() {
    "use strict";

    LittleCub.registerTheme({
        "id" : "default",
        "title" : "Default Them",
        "description" : "Default theme for rendering basic forms.",
        "templateEngine":"handlebars",
        "platform":["web"],
        "messages" : {
            "en_US" : {
                "required" : "Required field.",
                "pattern": "This field should have pattern {0}.",
                "minLength": "This field should contain at least {0} numbers or characters.",
                "maxLength": "This field should contain at most {0} numbers or characters.",
                "minimum": "The minimum value for this field is {0}.",
                "maximum": "The maximum value for this field is {0}.",
                "minimumExclusive": "Value of this field must be greater than {0}.",
                "maximumExclusive": "Value of this field must be less than {0}.",
                "multipleOf": "The value must be multiple of {0}.",
                "isNumber": "Field value must be a number.",
                "isInteger": "Field value must be an integer."
            }
        }
    });

    LittleCub.registerTheme({
        "id" : "default-inline",
        "parent" : "default",
        "title" : "Default Inline Style Theme",
        "description" : "Default theme for rendering basic forms with inline styles."
    });
}());