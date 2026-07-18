// ЗАМЕНИТЕ ЭТОТ ID НА ВАШ ID В ДИСКОРДЕ
const DISCORD_USER_ID = '1012369169406251188';

// Элементы DOM
const statusDot = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const activityTitle = document.getElementById('activity-title');
const activityDesc = document.getElementById('activity-desc');
const activityIcon = document.getElementById('activity-icon');
const activityDuration = document.getElementById('activity-duration');

// Функция для форматирования времени
function formatDuration(timestamp) {
    if (!timestamp) return '';
    
    const now = Date.now();
    const start = timestamp;
    const diff = Math.floor((now - start) / 1000); // разница в секундах
    
    if (diff < 60) {
        return `${diff} сек`;
    } else if (diff < 3600) {
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return `${mins} мин ${secs} сек`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        return `${hours} ч ${mins} мин`;
    } else {
        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        return `${days} д ${hours} ч`;
    }
}

// Функция обновления статуса
async function updateDiscordStatus() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error('Не удалось получить данные');
        }

        const { discord_status, activities } = data.data;

        // 1. Обновляем статус (точку и текст)
        statusDot.className = 'status-dot';

        if (discord_status === 'online') {
            statusDot.classList.add('online');
            statusText.textContent = 'В сети';
        } else if (discord_status === 'idle') {
            statusDot.classList.add('idle');
            statusText.textContent = 'Не активен';
        } else if (discord_status === 'dnd') {
            statusDot.classList.add('dnd');
            statusText.textContent = 'Не беспокоить';
        } else {
            statusDot.classList.add('offline');
            statusText.textContent = 'Не в сети';
        }

        // 2. Обновляем активность с иконками и продолжительностью
        const gameActivity = activities.find(act => act.type === 0);
        const spotifyActivity = activities.find(act => act.type === 2);

        // Показываем иконку по умолчанию
        activityIcon.style.display = 'block';

        if (gameActivity) {
            // ИГРАЕТ - иконка контроллера
            activityTitle.textContent = 'Играет';
            activityDesc.textContent = gameActivity.name.trim();
            activityIcon.src = 'asssets/img/game.png';
            activityIcon.style.filter = 'none';
            
            // Продолжительность игры
            if (gameActivity.timestamps && gameActivity.timestamps.start) {
                const duration = formatDuration(gameActivity.timestamps.start);
                activityDuration.textContent = `⏱ ${duration}`;
                activityDuration.style.display = 'block';
            } else {
                activityDuration.style.display = 'none';
            }
        } else if (spotifyActivity) {
            // СЛУШАЕТ МУЗЫКУ - иконка ноты
            activityTitle.textContent = 'Слушает';
            activityDesc.textContent = `${spotifyActivity.details || ''} - ${spotifyActivity.state || ''}`;
            activityIcon.src = 'https://cdn-icons-png.flaticon.com/512/3176/3176365.png';
            activityIcon.style.filter = 'none';
            
            // Продолжительность прослушивания
            if (spotifyActivity.timestamps && spotifyActivity.timestamps.start) {
                const duration = formatDuration(spotifyActivity.timestamps.start);
                activityDuration.textContent = `⏱ ${duration}`;
                activityDuration.style.display = 'block';
            } else {
                activityDuration.style.display = 'none';
            }
        } else {
            // НЕТ АКТИВНОСТИ
            activityTitle.textContent = 'Ничем не занимается';
            activityDesc.textContent = 'Не факт что отвечу';
            activityIcon.style.display = 'none';
            activityDuration.style.display = 'none';
        }

    } catch (error) {
        console.error('Ошибка при получении статуса Discord:', error);
        statusText.textContent = 'Ошибка';
        activityDesc.textContent = 'Не удалось загрузить';
        statusDot.className = 'status-dot offline';
        activityIcon.style.display = 'none';
        activityDuration.style.display = 'none';
    }
}

// Обновляем статус при загрузке страницы
updateDiscordStatus();

// Обновляем статус каждые 3 секунды
setInterval(updateDiscordStatus, 3000);