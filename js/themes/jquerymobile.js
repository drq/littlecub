(function() {
    "use strict";

    LittleCub["defaults"]["theme"] = "jquerymobile";

    LittleCub.registerTheme({
        "id" : "jquerymobile",
        "parent" : "base",
        "platform":["mobile"],
        "title" : "jQuery Mobile",
        "description" : "Default jQuery Mobile theme for rendering basic forms.",
        "errorClass" : "mobile-state-error",
        "injection" : function(container) {
            // find the data-role="page" and refresh it
            var el = $(container);
            while (el.length != 0 && el.attr("data-role") !== "page") {
                el = el.parent();
            }
            if (el != null) {
                $(el).trigger('create');
            }
            //$('label', el).addClass("ui-input-text");
        }
    });

    LittleCub.registerTheme({
        "id" : "jquerymobile-horizontal",
        "parent" : "jquerymobile",
        "title" : "jQuery Mobile Horizontal",
        "description" : "Default jQuery Mobile theme for rendering basic forms with helpers and labels on the same line as their mapped control."
    });

}());