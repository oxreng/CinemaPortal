from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.db import IntegrityError
from .models import Movie
from .forms import RegistrationForm
from rest_framework import generics
from .serializers import MovieSerializer
import requests
import json
from django.conf import settings
from .forms import FeedbackForm
from django.http import JsonResponse


def feedback_view(request):
    # Если это обычный переход на страницу — отдаем страницу с формой
    if request.method == 'GET':
        form = FeedbackForm()
        return render(request, 'movies/feedback.html', {'form': form})

    # Если это POST запрос (отправка формы через AJAX)
    if request.method == 'POST':
        try:
            # Читаем данные из JSON (для Лабы №6)
            data = json.loads(request.body)
            name = data.get('name')
            email = data.get('email')
            message = data.get('message')

            # --- ЛОГИКА МИКРОСЕРВИСА (Лаба №7) ---
            # Отправляем данные во внутреннюю сеть Docker микросервису 'bot'
            bot_url = "http://bot:5000/send_feedback"
            requests.post(bot_url, json={
                "name": name,
                "email": email,
                "message": message
            }, timeout=3)

            # Возвращаем ответ без перезагрузки страницы
            return JsonResponse({
                "status": "success",
                "message": f"Спасибо, {name}! Мы получили ваш отзыв."
            })
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)

# Этот класс сам сделает GET (список) и POST (создание)
class MovieListAPI(generics.ListCreateAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer


# Этот класс сделает GET (один фильм), PUT (обновить) и DELETE (удалить)
class MovieDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer


def index_view(request):
    movies = Movie.objects.all()
    return render(request, 'movies/index.html', {'movies': movies})


def movie_detail_view(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)
    return render(request, 'movies/movie_detail.html', {'movie': movie})


def registration_view(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            try:
                # Создаем пользователя сразу с паролем (он зашифруется автоматически)
                new_user = User.objects.create_user(
                    username=form.cleaned_data['email'],
                    email=form.cleaned_data['email'],
                    first_name=form.cleaned_data['firstName'],
                    last_name=form.cleaned_data['lastName'],
                    password=form.cleaned_data['password']
                )

                profile = new_user.profile
                profile.patronymic = form.cleaned_data.get('patronymic')
                profile.age = form.cleaned_data.get('age')
                profile.save()

                login(request, new_user)
                return redirect('index')

            except IntegrityError:
                form.add_error('email', 'Пользователь с таким Email уже зарегистрирован')
    else:
        form = RegistrationForm()

    return render(request, 'movies/register.html', {'form': form})


def like_movie(request, movie_id):
    movie = get_object_or_404(Movie, id=movie_id)

    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "not_authenticated"}, status=403)

        if request.user in movie.likes.all():
            movie.likes.remove(request.user)  # Убираем лайк
            is_liked = False
        else:
            movie.likes.add(request.user)  # Ставим лайк
            is_liked = True

        return JsonResponse({
            "likes": movie.total_likes,
            "is_liked": is_liked
        })

    # Для Polling (проверка текущего состояния)
    return JsonResponse({
        "likes": movie.total_likes,
        "is_liked": request.user in movie.likes.all() if request.user.is_authenticated else False
    })


def get_movie_likes(request, movie_id):
    # Находим фильм по ID
    movie = get_object_or_404(Movie, id=movie_id)
    # Считаем количество лайков (пользователей, которые нажали лайк)
    likes_count = movie.likes.count()

    # Возвращаем просто число в формате JSON
    return JsonResponse({'status': 'success', 'likes_count': likes_count})