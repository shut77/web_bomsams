const tg = window.Telegram.WebApp;
let currentGroup = null;

// Инициализация приложения
tg.ready();
tg.expand();
console.log("Telegram WebApp инициализирован", tg.initDataUnsafe);

// Основные функции
async function loadData() {
    try {
        console.log("----- Начало загрузки данных -----");
        
        const userId = tg.initDataUnsafe.user?.id;
        if(!userId) {
            console.error("User ID не найден в initData");
            showError("Ошибка авторизации");
            return;
        }

        console.log("Загружаем группы для user_id:", userId);
        
        // 1. Загрузка групп
        const groupsResponse = await fetch(
            `https://bomsams-production.up.railway.app/get_groups?user_id=${userId}`
        );
        
        console.log("Ответ на /get_groups:", {
            status: groupsResponse.status,
            headers: groupsResponse.headers
        });

        if(!groupsResponse.ok) {
            console.error("Ошибка HTTP:", await groupsResponse.text());
            throw new Error(`HTTP error! status: ${groupsResponse.status}`);
        }

        const groups = await groupsResponse.json();
        console.log("Полученные группы:", groups);

        if(!Array.isArray(groups)) {
            console.error("Некорректный формат групп:", groups);
            throw new Error("Invalid groups format");
        }

        renderGroups(groups);

        // 2. Загрузка событий если есть активная группа
        if(currentGroup) {
            console.log("Загружаем события для группы:", currentGroup);
            await loadEvents();
            await loadHistory();
        }

    } catch (error) {
        console.error("Critical error in loadData:", error);
        showError("Ошибка загрузки данных");
    }
}

async function createGroup() {
    console.log("----- Создание группы -----");
    try {
        const name = document.getElementById('group-name').value;
        const password = document.getElementById('group-password').value;

        if(!name || !password) {
            console.warn("Попытка создания группы с пустыми полями");
            showError("Заполните все поля");
            return;
        }

        console.log("Отправка запроса на создание группы:", {name, password});
        
        const response = await fetch('https://bomsams-production.up.railway.app/create_group', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: tg.initDataUnsafe.user.id,
                name: name,
                password: password
            })
        });

        console.log("Ответ на /create_group:", {
            status: response.status,
            body: await response.text()
        });

        if(response.ok) {
            tg.showAlert("Группа создана!");
            console.log("Группа успешно создана");
            await loadData();
            showMainScreen();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

    } catch (error) {
        console.error("Error in createGroup:", error);
        showError("Ошибка создания группы");
    }
}

// Остальные функции с аналогичным логированием

// Вспомогательные функции
function showError(text) {
    console.error("Показ ошибки пользователю:", text);
    tg.showPopup({
        title: 'Ошибка',
        message: text,
        buttons: [{type: 'ok'}]
    });
}

function renderGroups(groups) {
    console.log("Рендеринг групп:", groups);
    const list = document.getElementById('groups-list');
    
    if(!groups || groups.length === 0) {
        console.warn("Нет групп для отображения");
        list.innerHTML = '<div class="empty">Создайте или присоединитесь к группе</div>';
        return;
    }

    currentGroup = groups[0].id;
    console.log("Установлена текущая группа:", currentGroup);
    showMainScreen();
}

// Инициализация
console.log("Инициализация приложения...");
loadData();