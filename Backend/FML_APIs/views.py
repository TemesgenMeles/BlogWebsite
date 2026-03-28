from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from .serializers import PostSerializer, PostImageSerializer, CommentSerializer, NewsletterSerializer, MessageSerializer, CatagorySerializer, UserSerializer
from FML_app.models import Post, Catagory, Comment, Newsletter, Message, Post_Image
from django.contrib.auth.models import User

# Create your views here.
class UserList(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class UserDetail(generics.RetrieveDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class PostList(generics.ListCreateAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        status = self.request.query_params.get('status', None)
        if status == 'all':
            queryset = Post.objects.all().order_by('-published_date')
        elif status == 'draft':
            queryset = Post.objects.filter(status='draft').order_by('-published_date')
        else:
            queryset = Post.posted_objects.all().order_by('-published_date')

        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            # We filter by the slug of the category. 
            # Note the double underscore for the ManyToMany relationship.
            queryset = queryset.filter(catagory__slug=category_slug)
        return queryset

class PostDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class PostLike(generics.UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.likes += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

# Management Views
class CatagoryList(generics.ListCreateAPIView):
    queryset = Catagory.objects.all()
    serializer_class = CatagorySerializer

class CatagoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Catagory.objects.all()
    serializer_class = CatagorySerializer

class CommentList(generics.ListCreateAPIView):
    queryset = Comment.objects.all().order_by('-commented_date')
    serializer_class = CommentSerializer

class CommentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class NewsletterList(generics.ListCreateAPIView):
    queryset = Newsletter.objects.all().order_by('-subscribed_date')
    serializer_class = NewsletterSerializer

class NewsletterDetail(generics.RetrieveDestroyAPIView):
    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer

class MessageList(generics.ListCreateAPIView):
    queryset = Message.objects.all().order_by('-message_date')
    serializer_class = MessageSerializer

class MessageUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

class PostImageList(generics.ListCreateAPIView):
    queryset = Post_Image.objects.all()
    serializer_class = PostImageSerializer

class PostImageDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post_Image.objects.all()
    serializer_class = PostImageSerializer

class MessageUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer