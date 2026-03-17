from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from .serializers import PostSerializer, PostImageSerializer
from FML_app.models import Post

# Create your views here.
class PostList(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class PostDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class PostLike(generics.UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.likes += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)