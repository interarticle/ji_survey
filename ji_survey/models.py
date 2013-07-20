from django.db import models

class SurveyResult(models.Model):
	survey_key      = models.CharField(max_length = 100)
	content         = models.TextField()
	ip              = models.CharField(max_length = 150)
	useragent       = models.CharField(max_length = 500)
	submission_date = models.DateTimeField()
	submitted       = models.BooleanField(default = True)

	def __unicode__(self):
		return "[%s] %s: %s" % (self.survey_key, self.ip, self.submission_date)

class SurveyTranslation(models.Model):
	survey_key      = models.CharField(max_length = 100)
	translation     = models.TextField()

	def __unicode__(self):
		return self.survey_key