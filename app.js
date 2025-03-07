const tg = window.Telegram.WebApp;
let currentGroup = null;

tg.ready();
tg.expand();

// Основные функции
async function loadData() {
    try {
        const userId = tg.initDataUnsafe.user.id;
        
        // Загрузка групп
        const groupsResponse = await fetch(
            `https://bomsams-production.up.railway.app/get_groups?user_id=${userId}`
        );
        const groups = await groupsResponse.json();
        renderGroups(groups);

        // Загрузка событий
        if(currentGroup) {
            await loadEvents();
            await loadHistory();
        }
    } catch (error) {
        showError("Ошибка загрузки данных");
    }
}

async function createGroup() {
    const name = document.getElementById('group-name').value;
    const password = document.getElementById('group-password').value;

    if(!name || !password) {
        showError("Заполните все поля");
        return;
    }

    try {
        const response = await fetch('https://bomsams-production.up.railway.app/create_group', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: tg.initDataUnsafe.user.id,
                name: name,
                password: password
            })
        });

        if(response.ok) {
            tg.showAlert("Группа создана!");
            loadData();
            showMainScreen();
        }
    } catch (error) {
        showError("Ошибка создания группы");
    }
}

async function joinGroup() {
    const name = document.getElementById('join-group-name').value;
    const password = document.getElementById('join-group-password').value;

    if(!name || !password) {
        showError("Заполните все поля");
        return;
    }

    try {
        const response = await fetch('https://bomsams-production.up.railway.app/join_group', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: tg.initDataUnsafe.user.id,
                name: name,
                password: password
            })
        });

        if(response.ok) {
            tg.showAlert("Вы присоединились к группе!");
            loadData();
            showMainScreen();
        }
    } catch (error) {
        showError("Ошибка присоединения");
    }
}

async function addEvent() {
    const eventData = {
        user_id: tg.initDataUnsafe.user.id,
        group: currentGroup,
        date: document.getElementById('event-time').value,
        location: document.getElementById('event-location').value
    };

    try {
        const response = await fetch(
            'https://bomsams-production.up.railway.app/create_event',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(eventData)
            }
        );

        if(response.ok) {
            tg.showAlert('Событие добавлено!');
            loadData();
        }
    } catch (error) {
        showError("Ошибка создания события");
    }
}

// Вспомогательные функции
function showError(text) {
    tg.showPopup({
        title: 'Ошибка',
        message: text,
        buttons: [{type: 'ok'}]
    });
}

function renderGroups(groups) {
    if(groups.length > 0) {
        currentGroup = groups[0].id;
        showMainScreen();
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Инициализация
loadData();