// Вебхук URL из задания
const WEBHOOK_URL = "https://discord.com/api/webhooks/1465054930787373299/BEGl8AVwF3r23gU5-HJqih8KxDAh3lA8DCjOtJkwOUUlDxnJoh2wW8uinmrFIsyMzpBm";

// Элементы DOM
const form = document.getElementById('applicationForm');
const submitBtn = document.getElementById('submitBtn');
const resultModal = document.getElementById('resultModal');
const errorModal = document.getElementById('errorModal');
const closeModalBtn = document.getElementById('closeModal');
const closeErrorModalBtn = document.getElementById('closeErrorModal');

// Функция для показа модального окна
function showModal(modal) {
    modal.style.display = 'flex';
}

// Функция для скрытия модального окна
function hideModal(modal) {
    modal.style.display = 'none';
}

// Обработчики закрытия модальных окон
closeModalBtn.addEventListener('click', () => hideModal(resultModal));
closeErrorModalBtn.addEventListener('click', () => hideModal(errorModal));

// Закрытие модальных окон при клике вне их
window.addEventListener('click', (event) => {
    if (event.target === resultModal) {
        hideModal(resultModal);
    }
    if (event.target === errorModal) {
        hideModal(errorModal);
    }
});

// Функция для отправки данных на вебхук Discord
async function sendToDiscord(data) {
    try {
        // Форматируем данные для Discord
        const discordMessage = {
            username: "Анкета в администрацию",
            avatar_url: "https://cdn.discordapp.com/attachments/1142563887833153546/1142563916743946340/logotip.png",
            embeds: [{
                title: "Новая анкета на рассмотрение",
                color: 0x6a11cb,
                timestamp: new Date().toISOString(),
                fields: [
                    {
                        name: "Discord ник",
                        value: data.discord || "Не указано",
                        inline: true
                    },
                    {
                        name: "Telegram юзернейм",
                        value: data.telegram || "Не указано",
                        inline: true
                    },
                    {
                        name: "Возраст",
                        value: data.age || "Не указано",
                        inline: true
                    },
                    {
                        name: "Как узнал о сервере",
                        value: data.discovery || "Не указано",
                        inline: false
                    },
                    {
                        name: "Блокировки на аккаунте",
                        value: data.bans || "Не указаны",
                        inline: false
                    },
                    {
                        name: "Готов пройти обзвон",
                        value: data.interview || "Не указано",
                        inline: true
                    },
                    {
                        name: "Имеет микрофон",
                        value: data.microphone || "Не указано",
                        inline: true
                    }
                ],
                footer: {
                    text: "Анкета отправлена через сайт"
                }
            }]
        };

        // Отправляем запрос на вебхук
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordMessage)
        });

        return response.ok;
    } catch (error) {
        console.error('Ошибка при отправке:', error);
        return false;
    }
}

// Обработка отправки формы
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Получаем данные формы
    const formData = new FormData(form);
    const data = {
        discord: formData.get('discord'),
        telegram: formData.get('telegram'),
        age: formData.get('age'),
        discovery: formData.get('discovery'),
        bans: formData.get('bans') || "Отсутствуют",
        interview: formData.get('interview'),
        microphone: formData.get('microphone')
    };
    
    // Изменяем текст кнопки и добавляем анимацию
    const originalBtnText = submitBtn.querySelector('.btn-text').textContent;
    submitBtn.querySelector('.btn-text').textContent = "Отправка...";
    submitBtn.disabled = true;
    
    // Отправляем данные
    const isSuccess = await sendToDiscord(data);
    
    // Возвращаем оригинальный текст кнопки
    submitBtn.querySelector('.btn-text').textContent = originalBtnText;
    submitBtn.disabled = false;
    
    // Показываем результат
    if (isSuccess) {
        showModal(resultModal);
        form.reset();
    } else {
        showModal(errorModal);
    }
});

// Анимация для элементов формы при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Анимация появления элементов
    const formElements = document.querySelectorAll('.form-group, .info-section, header');
    formElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
