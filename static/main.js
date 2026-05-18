// ====== Данные фильмов (локально, чтобы не требовать сервер) ======
const MOVIES = [
  {
    id: 1,
    title: "Дюна 2",
    description: "Эпическая фантастика о борьбе за ресурсы и судьбы галактики. Великолепные пейзажи, драматические сражения.",
    poster: "https://m.media-amazon.com/images/I/81UA6mArHJL._AC_UF894,1000_QL80_.jpg",
    trailer: "https://rutube.ru/video/0bdcd4b4f8512075f79ec70d954a460c/?r=plwd", // put real youtube link if you want
    genre: "Фантастика",
    year: 2025,
    duration: 155,
    rating: 8.5
  },
  {
    id: 2,
    title: "Оппенгеймер",
    description: "Историческая драма о создателе атомной бомбы и моральных дилеммах науки.",
    poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhklgvQm6gFEZSM1-uJaruW_c1G1-HvEO38Q&s",
    trailer: "https://www.w3schools.com/html/mov_bbb.mp4", // локальный mp4 ссылка (пример)
    genre: "Драма",
    year: 2024,
    duration: 180,
    rating: 9.3
  },
  {
    id: 3,
    title: "F1",
    description: "История ветерана автогонок Сонни Хейса (Брэд Питт), который возвращается из отставки, чтобы стать наставником молодого таланта в вымышленной команде APXGP",
    poster: "https://www.film.ru/sites/default/files/styles/thumb_260x400/public/movies/posters/50524571-5309362.jpg",
    trailer: "",
    genre: "Драма",
    year: 2025,
    duration: 100,
    rating: 9.2
  }
];

// ------ Помощник: получить параметр ?id= из URL ------
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ====== Рендер на главной: 4 карточки в ряд ======
function renderIndexGrid() {
  const row = document.getElementById('moviesRow');
  if(!row) return;
  row.innerHTML = '';

  MOVIES.forEach(movie => {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';

    col.innerHTML = `
      <div class="card h-100 movie-card">
        <img src="${movie.poster}" class="card-img-top" alt="${movie.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${movie.title}</h5>
          <p class="card-text text-muted">${movie.genre} • ${movie.year}</p>
          <p class="card-text" style="flex:1;">${truncate(movie.description, 110)}</p>
          <a href="movie.html?id=${movie.id}" class="btn btn-warning">Подробнее</a>
          <div class="mt-3 small-text">
            <h6>Рейтинг: <em>${movie.rating}</em></h6>
          </div>
        </div>
      </div>
    `;
    row.appendChild(col);
  });
}

// ====== Рендер деталки фильма (movie.html) ======
function renderMovieDetail() {
  const id = parseInt( getQueryParam('id') );
  const container = document.getElementById('movieContent');
  if(!container) return;

  const movie = MOVIES.find(m => m.id === id);
  if(!movie) {
    container.innerHTML = `<div class="alert alert-warning">Фильм не найден. <a href="index.html">Вернуться</a></div>`;
    return;
  }

  container.innerHTML = `
    <a href="index.html" class="btn btn-secondary mb-3">← Назад</a>
    <div class="row">
      <div class="col-md-4">
        <img src="${movie.poster}" class="img-fluid mb-3" alt="${movie.title}">
        <div class="info-box">
          <p><strong>Жанр:</strong> ${movie.genre}</p>
          <p><strong>Год:</strong> ${movie.year}</p>
          <p><strong>Длительность:</strong> ${movie.duration} мин</p>
        </div>
      </div>
      <div class="col-md-8">
        <h1>${movie.title}</h1>
        <p><em>Описание:</em></p>
        <p>${movie.description.replace(/\n/g,'<br/>')}</p>

        <h3>Трейлер</h3>
        ${ renderTrailer(movie.trailer) }

        <br/>
        <a href="buy.html?id=${movie.id}" class="btn btn-warning" style="color:#000;">Купить билет</a>
      </div>
    </div>
  `;
}

// ====== Рендер покупки (buy.html) ======
function renderBuyForm() {
  const id = parseInt( getQueryParam('id') );
  const container = document.getElementById('buyArea');
  if(!container) return;

  const movie = MOVIES.find(m => m.id === id);
  if(!movie) {
    container.innerHTML = `<div class="alert alert-warning">Фильм не найден. <a href="index.html">Вернуться</a></div>`;
    return;
  }

  container.innerHTML = `
    <a href="movie.html?id=${movie.id}" class="btn btn-secondary mb-3">← К фильму</a>
    <h2>Покупка билетов — ${movie.title}</h2>
    <form id="buyForm">
      <div class="mb-3">
        <label class="form-label">Имя</label>
        <input name="name" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input name="email" type="email" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Количество мест</label>
        <input name="seats" type="number" min="1" max="10" value="1" class="form-control">
      </div>

      <button type="submit" class="btn btn-success" style="border-radius:12px;">Оплатить / Забронировать</button>
    </form>
    <div id="purchaseResult" class="mt-4"></div>
  `;

  document.getElementById('buyForm').addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(e.target);
    const booking = {
      id: Date.now(),
      movieId: movie.id,
      name: fd.get('name'),
      email: fd.get('email'),
      seats: parseInt(fd.get('seats')),
      createdAt: new Date().toISOString()
    };
    saveBooking(booking);
    document.getElementById('purchaseResult').innerHTML = `
      <div class="confirm">
        <p>Спасибо, <strong>${booking.name}</strong>! Бронь на <em>${movie.title}</em> подтверждена.</p>
        <p>Количество мест: ${booking.seats}</p>
        <p>Подтверждение отправлено на: ${booking.email}</p>
        <p><a href="index.html">Вернуться на главную</a></p>
      </div>
    `;
    e.target.reset();
  });
}

// ====== Логика для страницы регистрации (login.html) - ОБНОВЛЕНО ======
function initRegistrationForm() {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  form.addEventListener('submit', function(event) {
    event.preventDefault(); // Всегда отменяем стандартную отправку

    // Сбрасываем предыдущие ошибки
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    let isFormValid = true;

    // --- Валидация каждого поля с конкретными сообщениями ---

    const checkField = (id, messageEmpty, messagePattern) => {
      const field = form.querySelector(`#${id}`);
      const feedback = field.nextElementSibling; // <div class="invalid-feedback">

      if (field.required && !field.value) {
        field.classList.add('is-invalid');
        feedback.textContent = messageEmpty;
        isFormValid = false;
      } else if (field.value && field.pattern && !new RegExp(field.pattern).test(field.value)) {
        field.classList.add('is-invalid');
        feedback.textContent = messagePattern;
        isFormValid = false;
      }
    };

    // Проверка Имени
    checkField('firstName', 'Поле "Имя" не может быть пустым.', 'Неверный формат имени. Используйте только буквы, первая заглавная.');

    // Проверка Фамилии
    checkField('lastName', 'Поле "Фамилия" не может быть пустым.', 'Неверный формат фамилии. Используйте только буквы, первая заглавная.');

    // Проверка Отчества (необязательное, поэтому проверяем только на паттерн, если оно заполнено)
    checkField('patronymic', '', 'Неверный формат отчества. Используйте только буквы, первая заглавная.');

    // Проверка Email
    const emailField = form.querySelector('#email');
    const emailFeedback = emailField.nextElementSibling;
    if (!emailField.value) {
        emailField.classList.add('is-invalid');
        emailFeedback.textContent = 'Поле "Email" не может быть пустым.';
        isFormValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) { // Простая проверка email
        emailField.classList.add('is-invalid');
        emailFeedback.textContent = 'Введите корректный адрес email.';
        isFormValid = false;
    }

    // Проверка Возраста
    const ageField = form.querySelector('#age');
    const ageFeedback = ageField.nextElementSibling;
    const ageValue = parseInt(ageField.value, 10);
    if (!ageField.value) {
        ageField.classList.add('is-invalid');
        ageFeedback.textContent = 'Поле "Возраст" не может быть пустым.';
        isFormValid = false;
    } else if (isNaN(ageValue) || ageValue < 18 || ageValue > 100) {
        ageField.classList.add('is-invalid');
        ageFeedback.textContent = 'Возраст должен быть числом от 18 до 100.';
        isFormValid = false;
    }

    // --- Финальное действие ---
    if (isFormValid) {
        alert('Форма заполнена корректно! Регистрация прошла успешно.');
        form.reset();
    } else {
        // Ошибки уже показаны под невалидными полями
        console.log('Форма содержит ошибки.');
    }
  });
}


// ====== Сохранение и выборка брони (localStorage) ======
function saveBooking(b) {
  const key = 'cinema_bookings_v1';
  const arr = JSON.parse(localStorage.getItem(key)||'[]');
  arr.push(b);
  localStorage.setItem(key, JSON.stringify(arr));
}

function getBookings() {
  const arr = JSON.parse(localStorage.getItem('cinema_bookings_v1')||'[]');
  return arr;
}

// ====== Вспомогательные ======
function truncate(str, n){
  return str.length>n? str.slice(0,n-1)+'…' : str;
}

function renderTrailer(url){
  if(!url) return `<p>Трейлер отсутствует.</p>`;

  if(url.includes('youtube.com') || url.includes('youtu.be')){
    let embed = url.replace('watch?v=','embed/').replace('youtu.be/','youtube.com/embed/');
    return `<div class="ratio ratio-16x9"><iframe src="${embed}" allowfullscreen></iframe></div>`;
  }

  if(url.includes('rutube.ru')){
    if(url.includes('/play/embed/')){
      return `<div class="ratio ratio-16x9"><iframe src="${url}" allowfullscreen></iframe></div>`;
    }
    const match = url.match(/rutube\.ru\/video\/([^\/]+)/);
    if(match){
      const embed = `https://rutube.ru/play/embed/${match[1]}/`;
      return `<div class="ratio ratio-16x9"><iframe src="${embed}" allowfullscreen></iframe></div>`;
    }
  }

  if(url.endsWith('.mp4')){
    return `<video controls width="100%"><source src="${url}" type="video/mp4">Ваш браузер не поддерживает видео.</video>`;
  }

  return `<p><a href="${url}" target="_blank">Открыть трейлер</a></p>`;
}

// ====== Поиск / фильтр (простая реализация) ======
function filterMovies(){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const row = document.getElementById('moviesRow');
  if(!row) return;
  if(!q) { renderIndexGrid(); return; }
  row.innerHTML = '';
  const filtered = MOVIES.filter(m => (m.title + ' ' + m.genre + ' ' + m.description).toLowerCase().includes(q));
  if(filtered.length===0){
    row.innerHTML = `<div class="col-12"><div class="alert alert-info">Ничего не найдено.</div></div>`;
  } else {
    filtered.forEach(m => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';
      col.innerHTML = `
        <div class="card h-100 movie-card">
          <img src="${m.poster}" class="card-img-top" alt="${m.title}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${m.title}</h5>
            <p class="card-text text-muted">${m.genre} • ${m.year}</p>
            <p class="card-text" style="flex:1;">${truncate(m.description,110)}</p>
            <a href="movie.html?id=${m.id}" class="btn btn-warning">Подробнее</a>
          </div>
        </div>
      `;
      row.appendChild(col);
    });
  }
}

// ====== Инициализация при загрузке страницы ======
document.addEventListener('DOMContentLoaded', function(){
  // Вызываем нужные функции в зависимости от того, какая страница открыта
  if(document.getElementById('moviesRow')) renderIndexGrid();
  if(document.getElementById('movieContent')) renderMovieDetail();
  if(document.getElementById('buyArea')) renderBuyForm();
  if(document.getElementById('registrationForm')) initRegistrationForm();
});
