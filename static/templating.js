document.addEventListener("DOMContentLoaded", function() {
  // Найти все плейсхолдеры для шаблонов
  const includes = document.querySelectorAll('[data-include]');

  includes.forEach(async (el) => {
    const file = el.getAttribute('data-include');
    if (file) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          const text = await response.text();
          el.innerHTML = text;
        } else {
          el.innerHTML = 'Ошибка: не удалось загрузить шаблон.';
          console.error('Failed to fetch template:', file, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        el.innerHTML = 'Ошибка: не удалось загрузить шаблон.';
      }
    }
  });
});
