# Create your views here.
from django.http import HttpResponse
from django.http import Http404
from django.template import Context, loader
from coffin.shortcuts import render_to_response
from django.core.context_processors import csrf
import datetime
import code

def index(request):
	return render_to_response('ji_survey/index.j2')

def survey_upload(request):
	return render_to_response('ji_survey/survey-done.j2')

def abet_alumni(request):
	data = {}
	data.update(csrf(request))
	return render_to_response('ji_survey/abet-alumni-survey.j2', data)