const tg = window.Telegram.WebApp;
let currentGroup = null;

// Инициализация приложения
tg.ready();
tg.expand();

// Загрузка групп при старте
loadGroups();

async function loadGroups() {
    try {
        const response = await fetch(
            `https://bomsams-production.up.railway.app/get_groups?user_id=${tg.initDataUnsafe.user.id}`
        );
        
        const groups = await response.json();
        renderGroups(groups);
    } catch (error) {
        showError("Ошибка загрузки групп");
    }
}

function renderGroups(groups) {
    const list = document.getElementById('groups-list');
    list.innerHTML = '';

    groups.forEach(group => {
        const div = document.createElement('div');
        div.className = 'group-item';
        div.innerHTML = group.name;
        div.onclick = () => showGroupEvents(group.id);
        list.appendChild(div);
    });
}

function openCreateGroupForm() {
    tg.showPopup({
        title: 'Создать группу',
        message: 'Введите название и пароль:',
        buttons: [{
            type: 'default',
            text: 'Создать',
            id: 'create'
        }]
    }, async (btnId) => {
        if (btnId === 'create') {
            // Здесь логика создания группы через API
        }
    });
}

async function submitEvent() {
    const eventData = {
        user_id: tg.initDataUnsafe.user.id,
        group: currentGroup,
        date: document.getElementById('event-date').value,
        location: document.getElementById('event-location').value
    };

    try {
        const response = await fetch(
            'https://ВАШ_БОТ.railway.app/create_event',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(eventData)
            }
        );

        if (response.ok) {
            tg.showAlert('Событие успешно создано!');
            closeEventForm();
        }
    } catch (error) {
        showError("Ошибка создания события");
    }
}

function showError(text) {
    tg.showPopup({
        title: '⚠️ Ошибка',
        message: text,
        buttons: [{type: 'ok'}]
    });
}

// Вспомогательные функции
function closeEventForm() {
    document.getElementById('event-form').classList.add('hidden');
}

function showGroupEvents(groupId) {
    currentGroup = groupId;
    document.getElementById('event-form').classList.remove('hidden');
}