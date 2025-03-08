// app.js
document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    let currentGroup = null;

    tg.ready();
    tg.expand();

    function renderGroups(groups) {
        const list = document.getElementById('groups-list');
        
        if (!list) {
            console.error("Element #groups-list not found!");
            return;
        }

        list.innerHTML = '';
        
        if (!groups || groups.length === 0) {
            list.innerHTML = '<div class="empty">Нет доступных групп</div>';
            return;
        }

        groups.forEach(group => {
            const div = document.createElement('div');
            div.className = 'group-item';
            div.textContent = group.name;
            list.appendChild(div);
        });
    }
    function showAuthScreen() {
        document.getElementById('auth-screen').classList.add('active');
        document.getElementById('create-group-form').classList.remove('active');
        document.getElementById('join-group-form').classList.remove('active');
        document.getElementById('main-screen').classList.remove('active');
    }
    
    function showCreateGroupForm() {
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('create-group-form').classList.add('active');
        document.getElementById('join-group-form').classList.remove('active');
    }
    
    function showJoinGroupForm() {
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('join-group-form').classList.add('active');
        document.getElementById('create-group-form').classList.remove('active');
    }





    async function createGroup() {
    // Получаем данные из формы создания группы
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    const groupName = document.getElementById('group-name').value;
    const groupPassword = document.getElementById('group-password').value;
    
    try {
        const response = await fetch(`https://bomsams-production.up.railway.app/create_group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                name: groupName,
                password: groupPassword
            })
        });
        
        if(response.ok) {
            alert("Группа успешно создана!");
            // Переключаем экран обратно на главный или обновляем список групп
            showAuthScreen();
            loadData();
        } else {
            const errorData = await response.json();
            alert("Ошибка создания группы: " + errorData.error);
        }
    } catch (error) {
        console.error("Ошибка при создании группы:", error);
    }
}


    async function joinGroup() {
    // Получаем данные из формы присоединения
    const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
    const groupName = document.getElementById('join-group-name').value;
    const groupPassword = document.getElementById('join-group-password').value;
    
    try {
        const response = await fetch(`https://bomsams-production.up.railway.app/join_group`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                name: groupName,
                password: groupPassword
            })
        });
        
        if(response.ok) {
            alert("Вы успешно присоединились к группе!");
            // Переключаем экран обратно и обновляем список групп
            showAuthScreen();
            loadData();
        } else {
            const errorData = await response.json();
            alert("Ошибка присоединения: " + errorData.error);
        }
    } catch (error) {
        console.error("Ошибка при присоединении к группе:", error);
    }
}




    

    async function loadData() {
        try {
            const userId = tg.initDataUnsafe.user.id;
            const response = await fetch(`https://bomsams-production.up.railway.app/get_groups?user_id=${userId}`);
            const groups = await response.json();
            renderGroups(groups);
        } catch (error) {
            console.error("Ошибка:", error);
        }
    }
    

    loadData();
});
