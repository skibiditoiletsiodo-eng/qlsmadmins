// Вебхук URL для админов
const ADMIN_WEBHOOK_URL = "${{ secrets.ADMIN_WEBHOOK }}";

// Вебхук URL для разработчиков (ЗАМЕНИТЕ НА СВОЙ!)
const DEV_WEBHOOK_URL = "${{ secrets.DEV_WEBHOOK }}";

// Элементы DOM
const adminForm = document.getElementById('applicationForm');
const devForm = document.getElementById('developerForm');
const submitBtn = document.getElementById('submitBtn');
const submitDevBtn = document.getElementById('submitDevBtn');
const resultModal = document.getElementById('resultModal');
const devResultModal = document.getElementById('devResultModal');
const errorModal = document.getElementById('errorModal');
const closeModalBtn = document.getElementById('closeModal');
const closeDevModalBtn = document.getElementById('closeDevModal');
const closeErrorModalBtn = document.getElementById('closeErrorModal');

// Функция для показа модального окна
function showModal(modal) {
    if (modal) modal.style.display = 'flex';
}

// Функция для скрытия модального окна
function hideModal(modal) {
    if (modal) modal.style.display = 'none';
}

// Обработчики закрытия модальных окон
if (closeModalBtn) closeModalBtn.addEventListener('click', () => hideModal(resultModal));
if (closeDevModalBtn) closeDevModalBtn.addEventListener('click', () => hideModal(devResultModal));
if (closeErrorModalBtn) closeErrorModalBtn.addEventListener('click', () => hideModal(errorModal));

// Закрытие модальных окон при клике вне их
window.addEventListener('click', (event) => {
    if (event.target === resultModal) hideModal(resultModal);
    if (event.target === devResultModal) hideModal(devResultModal);
    if (event.target === errorModal) hideModal(errorModal);
});

// Функция для отправки данных на вебхук Discord (для админов)
async function sendToDiscord(data, isDeveloper = false) {
    try {
        const webhookUrl = isDeveloper ? DEV_WEBHOOK_URL : ADMIN_WEBHOOK_URL;
        
        // Форматируем данные для Discord
        const discordMessage = {
            username: isDeveloper ? "Анкета в разработчики" : "Анкета в администрацию",
            avatar_url: "https://cdn.discordapp.com/attachments/1142563887833153546/1142563916743946340/logotip.png",
            embeds: [{
                title: isDeveloper ? "🎯 Новая анкета разработчика" : "📋 Новая анкета на рассмотрение",
                color: isDeveloper ? 0x38ef7d : 0x6a11cb,
                timestamp: new Date().toISOString(),
                fields: isDeveloper ? [
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
                        name: "Время на сервере",
                        value: data.time_on_server || "Не указано",
                        inline: true
                    },
                    {
                        name: "ВКонтакте",
                        value: data.vk || "Не указано",
                        inline: true
                    },
                    {
                        name: "Языки программирования",
                        value: data.languages || "Не указаны",
                        inline: false
                    },
                    {
                        name: "О себе",
                        value: data.about ? (data.about.substring(0, 500) + (data.about.length > 500 ? "..." : "")) : "Не указано",
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
                ] : [
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
                        value: data.bans || "Отсутствуют",
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
                    text: isDeveloper ? "Анкета разработчика отправлена через сайт" : "Анкета отправлена через сайт"
                }
            }]
        };

        // Отправляем запрос на вебхук
        const response = await fetch(webhookUrl, {
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

// Функция для обработки отправки формы
async function handleFormSubmit(form, submitButton, isDeveloper = false) {
    // Получаем данные формы
    const formData = new FormData(form);
    
    let data;
    if (isDeveloper) {
        data = {
            discord: formData.get('dev_discord'),
            telegram: formData.get('dev_telegram'),
            age: formData.get('dev_age'),
            discovery: formData.get('dev_discovery'),
            time_on_server: formData.get('dev_time'),
            vk: formData.get('dev_vk') || "Не указано",
            languages: formData.get('dev_languages'),
            about: formData.get('dev_about'),
            interview: formData.get('dev_interview'),
            microphone: formData.get('dev_microphone')
        };
        
        // Проверка количества слов для разработчиков
        const wordCount = data.about ? data.about.trim().split(/\s+/).length : 0;
        if (wordCount < 70) {
            alert('Пожалуйста, расскажите о себе более подробно (минимум 70 слов). Сейчас у вас ' + wordCount + ' слов.');
            return false;
        }
    } else {
        data = {
            discord: formData.get('discord'),
            telegram: formData.get('telegram'),
            age: formData.get('age'),
            discovery: formData.get('discovery'),
            bans: formData.get('bans') || "Отсутствуют",
            interview: formData.get('interview'),
            microphone: formData.get('microphone')
        };
    }
    
    // Изменяем текст кнопки и добавляем анимацию
    const originalBtnText = submitButton.querySelector('.btn-text').textContent;
    submitButton.querySelector('.btn-text').textContent = "Отправка...";
    submitButton.disabled = true;
    
    // Отправляем данные
    const isSuccess = await sendToDiscord(data, isDeveloper);
    
    // Возвращаем оригинальный текст кнопки
    submitButton.querySelector('.btn-text').textContent = originalBtnText;
    submitButton.disabled = false;
    
    return isSuccess;
}

// Обработка отправки формы администратора
if (adminForm && submitBtn) {
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isSuccess = await handleFormSubmit(adminForm, submitBtn, false);
        
        // Показываем результат
        if (isSuccess) {
            showModal(resultModal);
            adminForm.reset();
        } else {
            showModal(errorModal);
        }
    });
}

// Обработка отправки формы разработчика
if (devForm && submitDevBtn) {
    devForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isSuccess = await handleFormSubmit(devForm, submitDevBtn, true);
        
        // Показываем результат
        if (isSuccess) {
            showModal(devResultModal);
            devForm.reset();
            
            // Сбрасываем счетчик слов
            const wordCountSpan = document.getElementById('wordCount');
            if (wordCountSpan) {
                wordCountSpan.textContent = '0';
                wordCountSpan.style.color = '#ff6b6b';
            }
        } else {
            showModal(errorModal);
        }
    });
}

// Счетчик слов для поля "Расскажите о себе"
const aboutTextarea = document.getElementById('dev_about');
const wordCountSpan = document.getElementById('wordCount');

if (aboutTextarea && wordCountSpan) {
    aboutTextarea.addEventListener('input', function() {
        const text = this.value.trim();
        const wordCount = text === '' ? 0 : text.split(/\s+/).length;
        wordCountSpan.textContent = wordCount;
        
        // Изменяем цвет счетчика, если слов недостаточно
        if (wordCount < 70) {
            wordCountSpan.style.color = '#ff6b6b';
        } else {
            wordCountSpan.style.color = '#51cf66';
        }
    });
}

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

// Обработка переключения между анкетами (если у вас есть кнопка переключения)
const switchBtn = document.getElementById('switchBtn');
if (switchBtn) {
    switchBtn.addEventListener('click', function() {
        // Эта часть кода должна синхронизироваться с вашей HTML-логикой переключения
        console.log('Переключение между анкетами');
    });
}
