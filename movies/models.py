from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Movie(models.Model):
    title = models.CharField(max_length=200, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    poster = models.URLField(max_length=300, verbose_name="URL постера")
    trailer = models.URLField(max_length=300, blank=True, null=True, verbose_name="URL трейлера")
    genre = models.CharField(max_length=100, verbose_name="Жанр")
    year = models.IntegerField(verbose_name="Год")
    duration = models.IntegerField(verbose_name="Длительность (мин)")
    rating = models.FloatField(verbose_name="Рейтинг") # Добавить мин и макс
    likes = models.ManyToManyField(User, related_name='liked_movies', blank=True)

    @property
    def total_likes(self):
        return self.likes.count()

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Фильм"
        verbose_name_plural = "Фильмы"

class Profile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Пользователь")
    patronymic = models.CharField(max_length=50, blank=True, null=True, verbose_name="Отчество")
    age = models.IntegerField(null=True, blank=True, verbose_name="Возраст")

    def __str__(self):
        return f"Профиль {self.user.username}"

    class Meta:
        verbose_name = "Профиль"
        verbose_name_plural = "Профили"

# Автоматическое создание профиля при создании пользователя
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()