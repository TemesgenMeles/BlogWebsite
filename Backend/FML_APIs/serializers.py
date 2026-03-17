from rest_framework import serializers
from FML_app.models import Post, Post_Image
from django.contrib.auth.models import User
from FML_app.models import Catagory

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']

class CatagorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Catagory
        fields = ['name', 'slug']

class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post_Image
        fields = ['id', 'post', 'position', 'image', 'discription']
        
class PostSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True, read_only=True)
    author = UserSerializer()
    catagory = CatagorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'main_content', 'excerpt', 'content1', 'content2', 'content3', 'author', 'catagory', 'published_date', 'status','latest', 'likes', 'dislikes', 'images']

