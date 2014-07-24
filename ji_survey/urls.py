from django.conf.urls import patterns, include, url
from . import views

from ji_survey.survey_definitions import get_urls


# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'ji_survey.views.home', name='home'),
    # url(r'^ji_survey/', include('ji_survey.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', views.index),
    url(r'^surveys/upload$', views.survey_upload),
)

js_info_dict = {
    'packages': ('ji_survey',),
}

urlpatterns += patterns('',
    (r'^jsi18n/$', 'django.views.i18n.javascript_catalog', js_info_dict),
)

urlpatterns += get_urls()
