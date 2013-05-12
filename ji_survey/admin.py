from django.contrib import admin
from .models import SurveyResult

class SurveyResultAdmin(admin.ModelAdmin):
	list_display = ('id', 'survey_key', 'ip', 'submission_date', 'useragent')

admin.site.register(SurveyResult, SurveyResultAdmin)