from jinja2.ext import do as j2do
from jinja2.ext import loopcontrols
from jinja2.ext import with_
from coffin.template import Library
register = Library()

register.tag(j2do)
register.tag(loopcontrols)
register.tag(with_)