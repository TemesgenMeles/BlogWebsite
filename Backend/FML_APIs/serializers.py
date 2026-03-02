from rest_framework import serializers
from FML_app.models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'main_content', 'excerpt', 'content1', 'content2', 'content3', 'author', 'catagory', 'published_date', 'status']