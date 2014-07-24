# Create your views here.
from django.http import HttpResponse
from django.http import Http404
from django.template import Context, loader
from coffin.shortcuts import render_to_response
from django.core.context_processors import csrf
from django.utils import timezone
from .models import SurveyResult
from django.views.decorators.cache import never_cache
import yaml


from django.views.decorators.cache import patch_cache_control
from functools import wraps

def never_ever_cache(decorated_function):
    """Like Django @never_cache but sets more valid cache disabling headers.

    @never_cache only sets Cache-Control:max-age=0 which is not
    enough. For example, with max-axe=0 Firefox returns cached results
    of GET calls when it is restarted.
    """
    @wraps(decorated_function)
    def wrapper(*args, **kwargs):
        response = decorated_function(*args, **kwargs)
        patch_cache_control(
            response, no_cache=True, no_store=True, must_revalidate=True,
            max_age=0)
        return response
    return wrapper


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

@never_ever_cache
def survey(survey_definition, request):
	data = {}
	data.update(csrf(request))
	data['is_2009'] = '2009' in request.GET;
	return render_to_response(
        'ji_survey/{template}'.format(template=survey_definition.template),
        data)