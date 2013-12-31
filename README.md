LittleCub Forms
===============

LittleCub is a light-weight, high-performance, easily customizable forms engine for Node.js and browser. It comes with comprehensive form control library and support for various responsive and mobile UI frameworks and can be easily customized or extended for additional framework support or custom controls.

Installing
----------

Add required dependencies to your web page

* [Underscore](http://underscorejs.org/) for utility functions

* [Handlebar](http://handlebarsjs.com/) for templating.

```
<script type="text/javascript" src="http://builds.handlebarsjs.com.s3.amazonaws.com/handlebars.runtime-v1.2.0.js"></script>
<script type="text/javascript" src="http://underscorejs.org/underscore-min.js"></script>
```

After the two dependencies, add one of the following LittleCub theme libraries depends on which UI framework you choose.

You may also need to add the required libraries and stylesheets for your selected framework.

```
<!-- Basic Theme with no fancy stuff -->
<script src="dist/littlecub.min.js" type="text/javascript"></script>

<!-- Twitter Bootstrap 3.x -->
<script src="dist/templates-bootstrap.min.js" type="text/javascript"></script>

<!-- Twitter Bootstrap 2.x -->
<script src="dist/templates-bootstrap2.min.js" type="text/javascript"></script>

<!-- jQuery Mobile Foundation -->
<script src="dist/templates-jquerymobile.min.js" type="text/javascript"></script>

<!-- jQuery UI Foundation -->
<script src="dist/templates-jqueryui.min.js" type="text/javascript"></script>

<!-- Zurb Foundation -->
<script src="dist/templates-foundation.min.js" type="text/javascript"></script>
```

Usage
-----

In general, LittleCub takes a JSON data document with a matched JSON Schema document and produce an HTML form
within the container DOM element that your provide.

You can also provide an additional configs JSON document that contains all control related settings such as
control type, size of text field etc.

Depending on your use case, you may only need to provide one of the three JSON documents or any combination of the three.

jQuery is not required for LittleCub although it comes with support for it.

```
// Renders an array control with a dynamic list of text controls.
// Each text field has length 25 and a validation error will be displayed
// is the length of text input is less than 4.
var arrayControl2 = LittleCub(["Sample1","Sample2"], {
    "type" : "array",
    "items" : {
        "type" : "text",
        "size" : 25
    }
}, {
    "type" : "array",
    "items" : {
        "type" : "string",
        "minLength" : 4
    }
},document.getElementById('array-control-2'));

// Renders the same array control with a dynamic list of text controls using jQuery.
var arrayControl1 = $('#array-control-1').lc(["Sample1","Sample2"], {
    "type" : "array",
    "items" : {
        "type" : "text",
        "size" : 25
    }
}, {
    "type" : "array",
    "items" : {
        "type" : "string",
        "minLength" : 4
    }
});
```

Building
--------

To build LittleCub, you'll need have [npm](https://npmjs.org/‎) and [Grunt](http://gruntjs.com/getting-started) installed.

Project dependencies can be installed via `npm install --save-dev`.

To build LittleCub from scratch, you'll want to run `grunt`
in the root of the project. That will build LittleCub and output the
results to the dist/ folder.

To run the unit tests, run `grunt test` in the project root.

The `grunt connect` allows you to check out LittleCub documentation and samples at `http://localhost:9001/docs/`.

License
-------

LittleCub is released under the Apache 2 license.
