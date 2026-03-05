from django.contrib import admin

from FML_app.models import Catagory, Post, Post_Image

# Register your models here.


admin.site.register(Post)
admin.site.register(Post_Image)
admin.site.register(Catagory)