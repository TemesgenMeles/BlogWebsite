from rest_framework import serializers
from FML_app.models import Post, Post_Image
class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post_Image
        fields = ['id', 'post', 'position', 'image', 'discription']
        
class PostSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'main_content', 'excerpt', 'content1', 'content2', 'content3', 'author', 'catagory', 'published_date', 'status', 'images']

