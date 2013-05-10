# Create your views here.
from django.http import HttpResponse
from django.http import Http404
from django.template import Context, loader
from coffin.shortcuts import render_to_response
import datetime
import code

def index(request):
	return render_to_response('abet_alumni_survey/index.j2')