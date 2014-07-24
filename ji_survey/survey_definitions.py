# -*- coding: utf-8 -*-
import functools

from collections import namedtuple
from django.conf.urls import url

from ji_survey import views


SurveyDefinition = namedtuple('SurveyDefinition', 'url template long_name')


SURVEYS = (
    # SurveyDefinition('abet-alumni', 'abet-alumni-survey.j2', u'毕业生调查问卷'),
    SurveyDefinition('abet-alumni-survey-2014', 'abet/2014.j2', '2014ABET 校友问卷调查V2学生版'),
)


def get_urls():
    """Generate a list of url patterns that can be concatenated in urls.py"""

    return [
        url(r'^surveys/{url}$'.format(url=df.url), functools.partial(views.survey, df))
            for df in SURVEYS
    ]
