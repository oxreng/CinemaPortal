# 1. Берем официальный образ Python
FROM python:3.11-slim

# 2. Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# 3. Запрещаем Python писать файлы .pyc и включаем немедленный вывод логов
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 4. Копируем список зависимостей и устанавливаем их
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Копируем весь проект в контейнер
COPY . .

# 6. Открываем порт 8000 (на нем работает Django)
EXPOSE 8000

# 7. Команда для запуска
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]