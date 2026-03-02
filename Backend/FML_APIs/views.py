from django.shortcuts import render
from rest_framework import generics
from .serializers import PostSerializer
from FML_app.models import Post

# Create your views here.
class PostList(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer