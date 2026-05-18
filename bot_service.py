from flask import Flask, request, jsonify
import requests
from CinemaPortal.settings import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

app = Flask(__name__)


@app.route('/send_feedback', methods=['POST'])
def send_feedback():
    data = request.json

    # Достаем данные из запроса
    name = data.get('name', 'Аноним')
    email = data.get('email', 'Не указан')
    message = data.get('message', 'Пустое сообщение')

    # Формируем красивое сообщение для Telegram
    tg_text = (
        f"📩 <b>Новый отзыв с сайта!</b>\n"
        f"👤 <b>Имя:</b> {name}\n"
        f"📧 <b>Email:</b> {email}\n"
        f"💬 <b>Сообщение:</b>\n{message}"
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": tg_text,
        "parse_mode": "HTML"  # Чтобы работали жирные шрифты
    }

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        return jsonify({"status": "success"}), 200
    else:
        return jsonify({"status": "error", "details": response.text}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
