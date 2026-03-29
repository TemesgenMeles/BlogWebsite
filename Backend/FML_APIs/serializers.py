from rest_framework import serializers
from FML_app.models import Post, Post_Image, Comment, Newsletter, Message, Catagory
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_superuser'] = user.is_superuser
        token['is_staff'] = user.is_staff

        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_superuser', 'date_joined']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'date_joined': {'read_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class CatagorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Catagory
        fields = ['id', 'name', 'slug', 'discription']
        read_only_fields = ['slug']

class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post_Image
        fields = ['id', 'post', 'position', 'image', 'discription']

class CommentSerializer(serializers.ModelSerializer):
    post_title = serializers.ReadOnlyField(source='post.title')
    class Meta:
        model = Comment
        fields = ['id', 'name', 'email', 'comment', 'post', 'post_title', 'commented_date', 'displayed', 'new']
        
class PostSerializer(serializers.ModelSerializer):
    images = PostImageSerializer(many=True, read_only=True)
    author_name = serializers.ReadOnlyField(source='author.username')
    catagory = serializers.PrimaryKeyRelatedField(many=True, queryset=Catagory.objects.all())
    comments = CommentSerializer(many=True, read_only=True)
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['catagory'] = CatagorySerializer(instance.catagory.all(), many=True).data
        representation['author'] = UserSerializer(instance.author).data
        # Filter comments to only show approved (displayed=True) ones
        representation['comments'] = CommentSerializer(instance.comments.filter(displayed=True), many=True).data
        return representation
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'main_content', 'excerpt', 'content1', 'content2', 'content3', 'quote', 'quote_author', 'tags', 'author', 'author_name', 'catagory', 'published_date', 'status','latest', 'likes', 'dislikes', 'views', 'images', 'comments']


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ['id', 'email', 'subscribed_date']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'name', 'email', 'subject', 'message', 'message_date', 'new']
