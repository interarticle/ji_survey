/**
 * @file Survey Helper Features. 
 * @copyright 赵迤晨 (Zhao Yichen) <interarticle@gmail.com>
 * @license MIT License
 * This library may be split into sub feature libraries in the future
 */
/**
 * Form control value getter/setter regardless of type
 */
"use strict";
(function($, undefined) {
	$.fn.extend({
		formVal: function(value) {
			var elem = $(this);
			if (elem.prop('tagName') == 'INPUT') {
				var type = elem.attr('type');
				if (type == 'button' || type == 'submit' || type=='reset' || type=='file')
					return null;
				if (type == 'text' || type == 'password')
				{
					if (value == null)
						return elem.val();
					else 
						return elem.val(value);
				}
				if (type == 'radio' || type == 'checkbox')
				{
					if (value == null) {
						return elem.filter(':checked').val()
					} else {
						var selElem = elem.filter(function() { return $(this).val() == value; });
						elem.filter(':checked').prop('checked', false);
						selElem.prop('checked', true);
					}
				}
			}
			else if (elem.prop('tagName') == 'TEXTAREA') {
				if (value == null)
					return elem.val();
				else 
					return elem.val(value);
			}
			else if (elem.prop('tagName') == 'SELECT') {
				if (value == null) {
					return elem.find('option:selected').val()
				} else {
					elem.find(':selected').prop('selected', false);
					elem.find('option').filter(function() { return $(this).val() == value; }).prop('selected', true)
				}
			}
		},
		removeFormVal: function() {
			var elem = $(this);
			if (elem.prop('tagName') == 'INPUT') {
				var type = elem.attr('type');
				if (type == 'button' || type == 'submit' || type=='reset' || type=='file')
					return;
				if (type == 'text' || type == 'password')
					return elem.val('')
				if (type == 'radio' || type == 'checkbox')
				{
					elem.filter(':checked').prop('checked', false);
				}
			}
			else if (elem.prop('tagName') == 'TEXTAREA') {
				elem.val('')
			}
			else if (elem.prop('tagName') == 'SELECT') {
				elem.find(':selected').prop('selected', false);
			}
		},
		form: function() {
			var elem = $(this);
			if (elem.prop('tagName') != 'FORM')
				elem = elem.closest('form');
			var result = {};
			result.each = function(callback) {
				for (var i in this){
					if (typeof(this[i]) == 'object')
						callback(i, this[i])
				}
			}
			elem.find('input,textarea,select').filter('[name]').each(
				function() {
					var name = $(this).attr('name')
					if (!result[name])
						result[name] = $(this);
					else
						result[name].push(this);
				}
				);
			return result;
		}
	});
})(jQuery);

/**
 * Hierarchical data retrieval
 */
(function($, undefined) {
	$.fn.extend({
		hierData: function(name) {
			var data = $(this).data(name);
			if (data != null)
				return data;
			var found = $(this).parents().filter(function() { return $(this).data(name) != null; }).first();
			return found.data(name);
		}
	})
})(jQuery);

/**
 * Convert Radio Groups into slider (jQuery UI)
 */
(function($, undefined){
	$(function() {
	$('.magnitude-radio-group.first').each(function(){
		var elem = $(this);
		var name = elem.data('group-name');
		var rgroup = elem.parent().find('.magnitude-radio-group')
						.filter(function() { return $(this).data('group-name') == name; })
						.find('input:radio');
		var relem = rgroup.closest('.magnitude-radio-group').filter(':not(.first)')
		relem.hide();
		elem.attr('colspan', rgroup.size());
		var slider = $('<div>');
		slider.appendTo(elem);
		slider.addClass('magnitude-radio-slider')
		slider.slider(
			{
				min: 1,
				max: rgroup.size()
			}
			);
		rgroup.hide();
		var intChange = false;
		function sliderChange() {
			slider.find('a.ui-slider-handle').show();
			rgroup.formVal(slider.slider('value'));
			intChange = true;
			rgroup.change();
			intChange = false;
		}
		function radioChange() {
			if (intChange)
				return;
			var val = rgroup.formVal();
			if (val == null) {
				slider.find('a.ui-slider-handle').hide();
			} else {
				slider.slider('value', val);
			}
		}
		slider.slider({'change': sliderChange});
		rgroup.change(radioChange);
		radioChange();
	});
	});
})(jQuery);

/**
 * Conditianal display
 */
(function($, undefined) {
	var conditionParser = /\{([^\}]+)\}/g;
	$(function() {
		var form = $("#survey-form").form();
		var gdependancies = [];
		$("#survey-form [data-condition]").each(function() {
			var elem = $(this);
			elem.css('height', elem.innerHeight());
			elem.addClass('hidden');
			elem.addClass('conditional');
			var expr = elem.data('condition');
			
			var dependancies = [];

			conditionParser.exec(); //Clear global
			var match;
			while ((match = conditionParser.exec(expr))) {
				if (dependancies.indexOf(match[1]) == -1)
					dependancies.push(match[1]);
				if (gdependancies.indexOf(match[1]) == -1)
					gdependancies.push(match[1]);
			}
			conditionParser.exec();

			expr = expr.replace(conditionParser, "(form['$1'].formVal())")

			function depChange() {
				if (eval(expr)) {
					elem.removeClass('hidden');
				} else {
					elem.addClass('hidden');
				}
			}
			for (var i = 0; i < dependancies.length; i++) {
				form[dependancies[i]].change(depChange)
			}
			depChange();
		});
		for (var i = 0; i < gdependancies.length; i++) {
			form[gdependancies[i]].first().closest('.survey-question').addClass('dependant');
		}
	});
})(jQuery);