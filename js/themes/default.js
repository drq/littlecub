(function() {
    "use strict";

    LittleCub.registerTheme({
        "id" : "default",
        "parent" : "base",
        "title" : "Default",
        "description" : "Default theme for rendering basic forms.",
        "errorClass" : "lc-error"
    });

    LittleCub.registerTheme({
        "id" : "default-horizontal",
        "parent" : "default",
        "title" : "Default Horizontal",
        "description" : "Default theme for rendering basic forms with helpers and labels on the same line as their mapped control."
    });

}());