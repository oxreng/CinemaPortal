from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('movie/<int:movie_id>/', views.movie_detail_view, name='movie_detail'),
    path('register/', views.registration_view, name='register'),

    path('feedback/', views.feedback_view, name='feedback'),

    path('api/movies/', views.MovieListAPI.as_view(), name='api_movie_list'),
    path('api/movies/<int:pk>/', views.MovieDetailAPI.as_view(), name='api_movie_detail'),
    path('movie/<int:movie_id>/like/', views.like_movie, name='like_movie'),
    path('movie/<int:movie_id>/get_likes/', views.get_movie_likes, name='get_movie_likes'), ]
