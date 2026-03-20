from django.urls import path
from .views import PostList, PostDetail, PostLike, CommentCreate, NewsletterCreate, MessageCreate, MessageUpdate

urlpatterns = [
    path('', PostList.as_view(), name='post-list'),
    path('<int:pk>/', PostDetail.as_view(), name='post-detail'),
    path('<int:pk>/like/', PostLike.as_view(), name='post-like'),
    path('comments/', CommentCreate.as_view(), name='comment-create'),
    path('newsletter/', NewsletterCreate.as_view(), name='newsletter-list-create'),
    path('contact-message/', MessageCreate.as_view(), name='message-list-create'),
    path('contact-message/<int:pk>/', MessageUpdate.as_view(), name='message-update'),
]