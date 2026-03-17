from django.urls import path
from .views import PostList, PostDetail, PostLike

urlpatterns = [
    path('', PostList.as_view(), name='post-list'),
    path('<int:pk>/', PostDetail.as_view(), name='post-detail'),
    path('<int:pk>/like/', PostLike.as_view(), name='post-like'),
]