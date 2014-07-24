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
			var result = {};
			result.each = function(callback) {
				for (var i in this){
					if (typeof(this[i]) == 'object')
						if (callback(i, this[i]) === false)
							return;
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
		},
		hierDataElement: function(name) {
			var data = $(this).data(name);
			if (data != null)
				return $(this);
			var found = $(this).parents().filter(function() { return $(this).data(name) != null; }).first();
			return found;
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
	$.fn.extend({
		dependancyUpdate: function() {
			if ($(this).hasClass('dependant'))
				$(this).find('.question').attr('title', $(this).hierData('dependant-message'));
			else
				$(this).find('.question').removeAttr('title');
		}
	});
	$(function() {
		var form = $("#survey").form();
		var gdependancies = [];
		$("#survey").find("[data-condition]").each(function() {
			var elem = $(this);
			elem.css('height', elem.innerHeight());
			elem.addClass('hidden');
			elem.addClass('conditional');
			var expr = elem.data('condition');
			
			var dependancies = [];

			conditionParser.exec(); //Clear global
			var match;
			while ((match = conditionParser.exec(expr))) {
				if ($.inArray(match[1], dependancies) == -1)
					dependancies.push(match[1]);
				if ($.inArray(match[1], gdependancies) == -1)
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
			(function(elem) {
				var sq = elem.first().closest('.survey-question');
				sq.addClass('dependant').dependancyUpdate();
				function elemChange() {
					if (elem.formVal()) {
						sq.removeClass('dependant');
					} else {
						sq.addClass('dependant');
					}
					sq.dependancyUpdate();
				}
				elem.change(elemChange);
				elemChange();
			})(form[gdependancies[i]]);
		}
	});
})(jQuery);

/**
 * Validation
 */
(function($, undefined){
	function required(number) {
		if (number == null)
			number = -1;
		return function(elem) {
			elem.closest('.survey-question').data('error-message', gettext('This question is required'));
			if (number == -1) {
				return Boolean($.trim(elem.formVal()));
			} else {
				var validCount = 0;
				var rootElem = elem.hierDataElement('validation');
				rootElem.form().each(function(name, control) {
					if (Boolean($.trim(control.formVal()))) {
						validCount ++;
					}
					if (validCount >= number) 
						return false;
				});
				return (validCount >= number);
			}
		}
	}
	function numeric() {
		return function(elem) {
			elem.closest('.survey-question').data('error-message', gettext('Please enter a number'))
			var n = elem.formVal();

			if (!elem.formVal())  //Don't check for empty
				return true;

			//@author CMS
			//http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
			return !isNaN(parseFloat(n)) && isFinite(n);
		}
	}
	function numeric_range(min, max) {
		return function(elem) {
			elem.closest('.survey-question').data('error-message', interpolate(gettext("Please enter a number between %(min)s and %(max)s"), {min: min.toString(), max: max.toString()}, true))

			if (!elem.formVal())  //Don't check for empty
				return true;
			
			var n = parseFloat(elem.formVal());
			return min <= n && n <= max;
		}
	}
	function regex(pattern, message) {
		return function(elem) {
			elem.closest('.survey-question').data('error-message', message);
			if (!elem.formVal())  //Don't check for empty
				return true;
			return pattern.test(elem.formVal());
		}
	}
	function choices(items, message) {
		return function(elem) {
			elem.closest('.survey-question').data('error-message', message);
			return $.inArray($.trim(elem.formVal()), items);
		};
	}
	function phonenumber() {
		return regex(/^[0-9\+\-\ ]+$/i, gettext("Please enter a valid telephone number"));
	}

	function email() {
		return regex(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]+$/i, gettext("Please enter a valid email address"));
	}
	var form = $("#survey").form();
	$(function() {
		form.each(function(name, control) {
			if (control.hierData('omit') == '1')
				return;
			var validation = control.hierData('validation');
			validation = $.trim(validation);
			if (!validation)
				return;
			var validations = validation.split(';');
			var valFuncs = [];
			for (var i = 0; i < validations.length; i++) {
				validation = $.trim(validations[i]);
				if (validation) {
					if (!/\(/.test(validation))
						validation += '()';
				}
				valFuncs.push(eval(validation));
			}
			control.data('validation_function', function(){
				if (location.hash=="#no-validation-f898ed23d4479fd95e1fb6960ba73ad4c5529b9c")
					return true;
				for (var i = 0; i < valFuncs.length; i++){
					if (!valFuncs[i](control))
						return false;
				}
				return true;
			});
			control.change(function() {
				if ($(this).hasClass('failed')) {
					$(this).closest('.survey-question').validateForm();
				}
			})
		});
	});
	$.fn.extend({
		validateForm: function(allSections) {
			var form = $(this).form();
			var result = true;
			form.each(function(name, control) {
				if (!control.validate(allSections))
					result = false;
			});
			return result;
		},
		validationClear: function(force) {
			var sq = $(this).closest('.survey-question');
			if (sq.find('.failed').size() == 0 || force) {
				sq.removeClass('error');
				sq.find('.question').removeAttr('title');
				sq.dependancyUpdate();
			}
		},
		validate: function(allSections) {
			var control = form[$(this).attr('name')];
			if (control.closest('.hidden').filter(':not(.section)').size() > 0) {
				control.removeClass('failed');
				control.validationClear();
				return true;
			}
			if (control.closest('.hidden').size() > 0 && !allSections)
				return true;
			if (control.data('validation_function')){
				var sq = control.closest('.survey-question');
				if (!control.data('validation_function')()){
					control.addClass('failed');
					sq.addClass('error');
					sq.find('.question').attr('title', sq.hierData('error-message'));
					return false;
				} else {
					control.removeClass('failed');
					control.validationClear();
				}
			}
			return true;
		}
	})
})(jQuery);

/**
 * Sectioning and GUI
 */
(function($, undefined) {
	$(function() {
		var sections = $("#survey").find("section.section");
		var sectionButtons = [];
		var i = 0;

		sections.each(function() {
			var elem = $(this);
			var btn = $("<button>");
			if (elem.find('.section-title').data('short-name')) {
				btn.text(elem.find('.section-title').data('short-name'));
			} else {
				btn.text(elem.find('.section-title').text());
			}
			$("#survey-sections-display ul.sections").append($("<li>").append(btn));
			btn.data('section-index', i);
			sectionButtons.push(btn[0]);
			i++;
		});
		$("#survey-sections-display").removeClass('hidden');
		sectionButtons = $(sectionButtons);

		var progressBar = $("#survey-progress-display .progressbar").progressbar();
		var progressLabel = $("#survey-progress-display .progress-label");

		var currentSectionIndex = 0;
		function updateSectionDisplay() {
			if (currentSectionIndex <= 0) currentSectionIndex = 0;
			if (currentSectionIndex >= sections.size()) currentSectionIndex = sections.size() - 1;
			sections.addClass('hidden');
			$(sections[currentSectionIndex]).removeClass('hidden');
			sectionButtons.removeClass('active');
			$(sectionButtons[currentSectionIndex]).addClass('active');
			progressBar.progressbar('value', (currentSectionIndex + 1) / (sections.size()) * 100);
			progressLabel.text(interpolate(gettext("Section %(current)s/%(total)s"), {current: (currentSectionIndex + 1).toString(), total: (sections.size()).toString()}, true));
			window.scrollTo(null, 0);
		}


		function showSection(index, force) {
			if (index <= 0) index = 0;
			if (index >= sections.size()) index = sections.size() - 1;
			if (!force) {
				//Optimized for fast section switching
				if (!checkSection(currentSectionIndex) && !$(sectionButtons[index]).hasClass('passed'))
					return;
			}
			currentSectionIndex = index;
			updateSectionDisplay();
		}

		function changeSection(count, force) {
			showSection(currentSectionIndex + count, force);
		}

		updateSectionDisplay();

		function checkAllSections() {
			var result = true;
			for (var i = 0; i < sections.size(); i++) {
				if (!checkSection(i, true))
					result = false;
			}
			return result;
		}

		function checkSection(sectionIndex, checkAll) {
			var result = $(sections[sectionIndex]).validateForm(checkAll);
			if (result) {
				$(sectionButtons[sectionIndex]).addClass('passed');
				$(sectionButtons[sectionIndex]).removeClass('error');
			} else {
				$(sectionButtons[sectionIndex]).removeClass('passed');
				$(sectionButtons[sectionIndex]).addClass('error');
			}
			return result;
		}

		$("#survey-form").submit(function(e) {
			if (!checkAllSections()) {
				alert(gettext("You haven't finished the entire survey. Please check sections with exclamation marks."));
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		})
		var prevBtn = $("#survey-controls .section-controls .btn-prev");
		var nextBtn = $("#survey-controls .section-controls .btn-next");
		$("#survey-check-button").click(function() {
			if (!checkAllSections()) {
				alert(gettext("You haven't finished the entire survey. Please check sections with exclamation marks."));
			} else {
				alert(gettext('You have completed the survey. You may now submit.'));
			}
		});
		$("#survey-check-button").before(prevBtn).after(nextBtn);

		prevBtn.click(function() {
			changeSection(-1);
		})

		nextBtn.click(function() {
			changeSection(1);
		})

		sectionButtons.click(function() {
			showSection($(this).data('section-index'))
		})

		$("#survey-sidebar button").click(function(e) {
			e.preventDefault();
			e.stopPropagation();
		});

		$("#survey").data('check_all_sections_function', checkAllSections);
		$("#survey").data('check_section_function', checkSection);
	});
})(jQuery);