from django.urls import path
from .views import (
    PostList, PostDetail, PostLike, 
    CatagoryList, CatagoryDetail,
    CommentList, CommentDetail,
    NewsletterList, NewsletterDetail,
    MessageList, MessageUpdate
)

urlpatterns = [
    path('', PostList.as_view(), name='post-list'),
    path('<int:pk>/', PostDetail.as_view(), name='post-detail'),
    path('<int:pk>/like/', PostLike.as_view(), name='post-like'),
    path('categories/', CatagoryList.as_view(), name='category-list'),
    path('categories/<int:pk>/', CatagoryDetail.as_view(), name='category-detail'),
    path('comments/', CommentList.as_view(), name='comment-list'),
    path('comments/<int:pk>/', CommentDetail.as_view(), name='comment-detail'),
    path('newsletter/', NewsletterList.as_view(), name='newsletter-list'),
    path('newsletter/<int:pk>/', NewsletterDetail.as_view(), name='newsletter-detail'),
    path('contact-message/', MessageList.as_view(), name='message-list'),
    path('contact-message/<int:pk>/', MessageUpdate.as_view(), name='message-update'),
]