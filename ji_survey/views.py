# Create your views here.
from django.http import HttpResponse
from django.http import Http404
from django.template import Context, loader
from coffin.shortcuts import render_to_response
from django.core.context_processors import csrf
from django.utils import timezone
from .models import SurveyResult
import yaml

def index(request):
	return render_to_response('ji_survey/index.j2')

def survey_upload(request):
	survey = dict(request.POST)
	if 'csrfmiddlewaretoken' in survey:
		del survey['csrfmiddlewaretoken']
	survey_key = ''
	if ('survey_key' in survey):
		survey_key = survey['survey_key'][0]
		del survey['survey_key']

	for name, values in survey.iteritems():
		if len(values) == 1:
			survey[name] = values[0]
	result = SurveyResult()
	result.submission_date = timezone.now()
	result.submitted = True
	result.content =  yaml.safe_dump(survey, encoding='utf-8', allow_unicode = True, default_flow_style=False)
	result.ip = request.META['REMOTE_ADDR']
	result.useragent = request.META['HTTP_USER_AGENT']
	result.survey_key = survey_key
	result.save()
	return render_to_response('ji_survey/survey-done.j2')

def abet_alumni(request):
	data = {}
	data.update(csrf(request))
	return render_to_response('ji_survey/abet-alumni-survey.j2', data)