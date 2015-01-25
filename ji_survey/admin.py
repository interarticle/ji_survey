from django.contrib import admin
from .models import SurveyResult
from .models import SurveyTranslation
from django.http import HttpResponse
from django.core import serializers
import yaml
import json
import csv
import xlwt


def _parse_query_row(row):
	obj = yaml.safe_load(row.content)
	obj['validation_result'] = row.validation_result
	obj['submission_date'] = row.submission_date.isoformat(' ')
	obj['ip_address'] = row.ip

	return obj

def _parse_queryset(queryset):
	for row in queryset:
		if not row.submitted: continue
		
		yield _parse_query_row(row)

def survey_export_yaml(modeladmin, request, queryset):
	response = HttpResponse(content_type="application/x-yaml; charset=utf-8")
	data = list(_parse_queryset(queryset))
	yaml.safe_dump(data, response, encoding='utf-8', allow_unicode = True)
	return response

def survey_export_json(modeladmin, request, queryset):
	response = HttpResponse(content_type="application/json")
	data = list(_parse_queryset(queryset))
	json.dump(data, response)
	return response

def format_survey(queryset):
	first = True;
	translation = {}

	def translate_columns(columns):
		return map(lambda x: (translation[x] if translation[x] else x) if x in translation else x, columns)
	for row in queryset:
		if not row.submitted:
			continue
		if not row.survey_key:
			continue
		data = _parse_query_row(row)
		if first:
			first = False
			columns = sorted(list(data.iterkeys()))
			survey_key = row.survey_key
			for row in SurveyTranslation.objects.filter(survey_key=survey_key):
				translation = yaml.safe_load(row.translation)
				columns = sorted(list(set(columns + list(translation.iterkeys()))))
				break
			yield translate_columns(columns)
		if row.survey_key != survey_key:
			raise Exception("You cannot select results with different survey_keys.")
		sanitized = map(lambda x: data[x] if x in data else "", columns)
		yield sanitized

def survey_export_csv(modeladmin, request, queryset):
	response = HttpResponse(content_type='text/csv; charset=utf-8')
	response['Content-Disposition'] = 'attachment; filename="export.csv"'
	response.write(u'\uFEFF'.encode('utf-8'))
	csvwriter = csv.writer(response, quoting=csv.QUOTE_ALL)

	def encode_array(array):
		return map(lambda x: x.encode('utf-8'), array)
	for row in format_survey(queryset):
		csvwriter.writerow(encode_array(row))
	return response

def survey_export_xls(modeladmin, request, queryset):
	response = HttpResponse(content_type='application/octet-stream')
	response['Content-Disposition'] = 'attachment; filename="export.xls"'
	xlwb = xlwt.Workbook('utf-8')
	xlws = xlwb.add_sheet("Survey Results")

	regs = {'row': 0}
	def writeRow(row):
		col = 0
		for val in row:
			xlws.write(regs['row'], col, val)
			col += 1
		regs['row'] += 1

	for row in format_survey(queryset):
		writeRow(row)

	xlwb.save(response)

	return response

class SurveyResultAdmin(admin.ModelAdmin):
	list_display = ('id', 'survey_key', 'ip', 'submission_date', 'useragent', 'validation_result')
	actions = [survey_export_yaml, survey_export_json, survey_export_csv, survey_export_xls]

admin.site.register(SurveyResult, SurveyResultAdmin)

admin.site.register(SurveyTranslation)
