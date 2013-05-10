/**
 * @file
 * Helper jQuery functions for implementing a persistent "close message"/"hide message" button
 *
 * @author 赵迤晨 (Zhao, Yichen) <interarticle@gmail.com>
 * @license MIT License
 * @copyright Copyright (C) 2013 赵迤晨 (Zhao, Yichen)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function ($, undefined) {
	var cookieName = 'hide_element_ids';
	var basePath = '/';
	function extractCookie(name, def) {
		if (def == undefined) def = null;
		var regex = new RegExp(name + '=([^;]*)', 'g');
		var result = regex.exec(document.cookie);
		if (!result)
			return def;
		return $.trim(result[1]) || def;
	}

	function setCookie(name, val) {
		var time = new Date();
		time.setTime(time.getTime() + 365 * 24 * 3600 * 1000);
		document.cookie = name + "=" + val + "; expires=" + time.toGMTString() + '; path=' + basePath;
	}

	function getHideArray() {
		var entry = extractCookie(cookieName, "");
		entries = entry.split("|");
		var result = [];
		for (var i = 0; i < entries.length; i++) {
			entries[i] = $.trim(entries[i]);
			if (entries[i])
				result.push(entries[i]);
		}
		return result;
	}

	function setHideArray(array) {
		var entry = array.join('|');
		setCookie(cookieName, entry);
	}

	function arrayExists(array, elem){
		for (var i = 0; i < array.length; i++)
			if (array[i] == elem)
				return true;
		return false;
	}

	$.fn.extend({
		hideButton: function() {
			var btn = this;
			var element = this.closest('.hide-element');
			var elementid = element.attr('id');
			btn.click(function() {
				var hdArray = getHideArray();
				if (!arrayExists(hdArray, elementid)) {
					hdArray.push(elementid);
					setHideArray(hdArray);
				}
				element.hide();
			});
		}
	})
	$.extend({
		hideElements: function() {
			hdArray = getHideArray();
			for (var i = 0; i < hdArray.length; i++) {
				$("#" + hdArray[i] + ".hide-element").hide();
			}
		}
	})
})(jQuery);