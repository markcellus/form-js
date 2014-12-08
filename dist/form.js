/** 
* FormJS - v0.1.0.
* https://github.com/mkay581/formjs.git
* Copyright 2014. Licensed MIT.
*/
define([],function(){var e=function(e){this.options=e,this._setupEvents()};return e.prototype={_setupEvents:function(){var e;this.eventEls=this.options.el.elements;for(e=0;e<this.eventEls.length;e++)this.eventEls[e].kit.addEventListener("change","_onValueChange",this)},_onValueChange:function(e){this.options.onValueChange&&this.options.onValueChange(e)},disable:function(){this.setPropertyAll("disabled",!0)},enable:function(){this.setPropertyAll("disabled",!1)},setPropertyAll:function(e,t){var n,r=this.options.el.elements;for(n=0;n<r.length;n++)r[n][e]=t},getCurrentValues:function(){var e=[],t=this.options.el.querySelectorAll("[name]"),n=t.length,r,i,s;for(r=0;r<n;r++)i=t[r],i.name&&(s={name:i.name,value:i.value},e.push(s));return e},destroy:function(){var e;for(e=0;e<this.eventEls.length;e++)this.eventEls[e].kit.removeEventListener("change","_onValueChange",this)}},e});