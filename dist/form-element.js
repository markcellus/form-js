/** 
* FormJS - v0.1.1.
* https://github.com/mkay581/formjs.git
* Copyright 2014. Licensed MIT.
*/
define(["underscore"],function(e){var t=function(e){this.initialize(e)};return t.prototype={initialize:function(e){},getFormElement:function(){return this.el},getUIElement:function(){return this.getFormElement()},getFormElements:function(){return[this.getFormElement()]},getValue:function(){return this.getFormElement().value},getUIElements:function(){return[this.getUIElement()]},enable:function(){this.getFormElement().disabled=!1},disable:function(){this.getFormElement().disabled=!0},getElementKey:function(){return"element"},destroy:function(){}},t});