from django.contrib import admin
from .models import SurveyResult
from .models import SurveyTranslation
from django.http import HttpResponse
from django.core import serializers
import yaml
import json
import csv

def survey_export_yaml(modeladmin, request, queryset):
	response = HttpResponse(content_type="application/x-yaml; charset=utf-8")
	data = map(lambda x: yaml.safe_load(x.content), queryset)
	yaml.safe_dump(data, response, encoding='utf-8', allow_unicode = True)
	return response

def survey_export_json(modeladmin, request, queryset):
	response = HttpResponse(content_type="application/json")
	data = map(lambda x: yaml.safe_load(x.content), queryset)
	json.dump(data, response)
	return response

def survey_export_csv(modeladmin, request, queryset):
	response = HttpResponse(content_type='text/csv; charset=utf-8')
	response['Content-Disposition'] = 'attachment; filename="export.csv"'
	response.write(u'\uFEFF'.encode('utf-8'))
	csvwriter = csv.writer(response, quoting=csv.QUOTE_ALL)
	first = True;
	translation = {}
	def encode_array(array):
		return map(lambda x: x.encode('utf-8'), array)

	def translate_columns(columns):
		return map(lambda x: (translation[x] if translation[x] else x) if x in translation else x, columns)
	for row in queryset:
		data = yaml.safe_load(row.content)
		if first:
			first = False
			columns = sorted(list(data.iterkeys()))
			survey_key = row.survey_key
			for row in SurveyTranslation.objects.filter(survey_key=survey_key):
				translation = yaml.safe_load(row.translation)
				columns = sorted(list(set(columns + list(translation.iterkeys()))))
				break
			csvwriter.writerow(encode_array(translate_columns(columns)))
		if row.survey_key != survey_key:
			raise Exception("You cannot select results with different survey_keys.")
		sanitized = map(lambda x: data[x] if x in data else "", columns)
		csvwriter.writerow(encode_array(sanitized))
	return response

class SurveyResultAdmin(admin.ModelAdmin):
	list_display = ('id', 'survey_key', 'ip', 'submission_date', 'useragent')
	actions = [survey_export_yaml, survey_export_json, survey_export_csv]

admin.site.register(SurveyResult, SurveyResultAdmin)

admin.site.register(SurveyTranslation)