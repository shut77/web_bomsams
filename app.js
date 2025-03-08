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


    

    async function loadData() {
        try {
            const userId = tg.initDataUnsafe.user.id;
            const response = await fetch(`/get_groups?user_id=${userId}`);
            const groups = await response.json();
            renderGroups(groups);
        } catch (error) {
            console.error("Ошибка:", error);
        }
    }
    

    loadData();
});
