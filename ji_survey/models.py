from django.db import models

class SurveyResult(models.Model):

	VALIDATION_RESULT = (
		('Y', 'Successful'),
		('F', 'Failed'),
		('NA', 'Not Present'),
	)

	survey_key      = models.CharField(max_length = 100)
	content         = models.TextField()
	ip              = models.CharField(max_length = 150)
	useragent       = models.CharField(max_length = 500)
	submission_date = models.DateTimeField()
	submitted       = models.BooleanField(default = True)
	validation_result = models.CharField(max_length=3, choices=VALIDATION_RESULT, default='NA')

	def __unicode__(self):
		return "[%s] %s: %s" % (self.survey_key, self.ip, self.submission_date)

class SurveyTranslation(models.Model):
	survey_key      = models.CharField(max_length = 100)
	translation     = models.TextField()

	def __unicode__(self):
		return self.survey_key