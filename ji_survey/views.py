# Create your views here.
import time
import logging

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


class Speck64(object):

	def __init__(self, k):
		self.k = k
		self.alpha = 7
		self.beta = 2
		self.T = 22

	@staticmethod
	def mask(num):
		return num & 0xffffffff

	def rotateLeft(self, num, by):
		rotation = num << by
		return self.mask(rotation | (num >> (32 - by)))

	def rotateRight(self, num, by):
		rotation = num >> by
		return self.mask(rotation | (num << (32 - by)))

	def encrypt(self, val):
		x = val >> 32;
		y = self.mask(val)


		for i in xrange(0, self.T):
			x = self.mask(self.rotateRight(x, self.alpha) + y) ^ self.k[i]
			y = self.rotateLeft(y, self.beta) ^ x

		return x ^ y


encrypter = Speck64([
	2482838457, 4118176477, 2186512637, 2853099636, 1670965135, 1939273452,
	32483733, 104330877, 1830035343, 135608872, 4106942868, 4142733777,
	4056360673,9395589, 1580122221, 3344849734, 4173263305, 4070394753,
	4099697325, 3148460326, 1056492960, 389149080])


def survey_upload(request):
	survey = dict(request.POST)
	if 'csrfmiddlewaretoken' in survey:
		del survey['csrfmiddlewaretoken']
	survey_key = ''
	if ('survey_key' in survey):
		survey_key = survey['survey_key'][0]
		del survey['survey_key']

	validation_result = 'NA'

	if (survey.get('_verification') and survey.get('_challenge') and
			survey['_verification'][0] and survey['_challenge'][0]):
		validation_result = 'F'

		try:
			timestamp = int(survey['_challenge'][0])
			verification_number = int(survey['_verification'][0])

			verification = encrypter.encrypt(timestamp)

			if verification != verification_number:
				raise ValueError('verification failed')

			current_time = time.time()

			if abs(current_time - timestamp / 1000) > 60 * 60:
				raise ValueError('timestamp off by more than 1 hour.')

			validation_result = 'Y'
		except Exception:
			logging.exception('broke!')
			pass

	if '_verification' in survey: del survey['_verification']
	if '_challenge' in survey: del survey['_challenge']

	for name, values in survey.iteritems():
		if len(values) == 1:
			survey[name] = values[0]
	result = SurveyResult()
	result.submission_date = timezone.now()
	result.submitted = True
	result.content =  yaml.safe_dump(survey, encoding='utf-8', allow_unicode = True, default_flow_style=False)
	result.ip = request.META.get('HTTP_X_FORWARDED_FOR') or request.META['REMOTE_ADDR']
	result.useragent = request.META['HTTP_USER_AGENT']
	result.survey_key = survey_key
	result.validation_result = validation_result
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
