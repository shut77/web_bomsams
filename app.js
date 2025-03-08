document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();

  // Переменная для хранения текущей выбранной группы
  window.currentGroup = null;

  // Функция для скрытия всех экранов
  function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
  }

  // Функции для переключения экранов
  function showInitialScreen() {
    hideAllScreens();
    document.getElementById('initial-screen').classList.add('active');
  }

  function showGroupListScreen() {
    hideAllScreens();
    document.getElementById('group-list-screen').classList.add('active');
    loadGroups();
  }

  function showCreateGroupForm() {
    hideAllScreens();
    document.getElementById('create-group-form').classList.add('active');
  }

  function showJoinGroupForm() {
    hideAllScreens();
    document.getElementById('join-group-form').classList.add('active');
  }

  function showGroupDetailScreen(group) {
    hideAllScreens();
    document.getElementById('group-title').textContent = group.name;
    window.currentGroup = group;
    document.getElementById('group-detail-screen').classList.add('active');
    // Можно очистить контент группы при каждом входе
    document.getElementById('group-content').innerHTML = '';
  }

  function showAddEventForm() {
  // Очищаем только контент, но оставляем экран и вкладки
  document.getElementById('group-content').innerHTML = ''; 
  document.getElementById('add-event-form').classList.add('active');
}


  function hideAddEventForm() {
  document.getElementById('add-event-form').classList.remove('active');
  showEventHistory(); // или showNearestEvents(), если нужно
}


  async function showNearestEvents() {
  hideAllScreens();
  document.getElementById('group-detail-screen').classList.add('active');
  try {
    const response = await fetch(`https://bomsams-production.up.railway.app/get_events?group=${window.currentGroup.name}&filter=current`);
    const events = await response.json();
    let html = '';
    if (events.length === 0) {
      html = '<p>Нет ближайших событий</p>';
    } else {
      events.forEach(event => {
        html += `<div class="event-card">
                   <div class="event-header">Дата: ${event.date}</div>
                   <p>Время: ${event.start_time} - ${event.end_time}</p>
                   <p>Место: ${event.location}</p>
                   <p>Создатель: ${event.user_id}</p>
                 </div>`;
      });
    }
    document.getElementById('group-content').innerHTML = html;
  } catch (error) {
    console.error("Ошибка загрузки ближайших событий:", error);
  }
}


  async function showEventHistory() {
  hideAllScreens();
  document.getElementById('group-detail-screen').classList.add('active');
  try {
    const response = await fetch(`https://bomsams-production.up.railway.app/get_events?group=${window.currentGroup.name}&filter=history`);
    const events = await response.json();
    let html = '';
    if (events.length === 0) {
      html = '<p>История пуста</p>';
    } else {
      events.forEach(event => {
        html += `<div class="event-card">
                   <div class="event-header">Дата: ${event.date}</div>
                   <p>Время: ${event.start_time || ''} - ${event.end_time || ''}</p>
                   <p>Место: ${event.location}</p>
                   <p>Создатель: ${event.user_id}</p>
                 </div>`;
      });
    }
    document.getElementById('group-content').innerHTML = html;
  } catch (error) {
    console.error("Ошибка загрузки истории событий:", error);
  }
}

  // Функция для рендеринга списка групп
  function renderGroups(groups) {
    const list = document.getElementById('groups-list');
    if (!list) {
      console.error("Элемент #groups-list не найден!");
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
      // При клике на группу открывается экран деталей
      div.addEventListener('click', () => {
        showGroupDetailScreen(group);
      });
      list.appendChild(div);
    });
  }

  // Загрузка групп пользователя
  async function loadGroups() {
    try {
      const userId = tg.initDataUnsafe.user.id;
      const response = await fetch(`https://bomsams-production.up.railway.app/get_groups?user_id=${userId}`);
      const groups = await response.json();
      renderGroups(groups);
    } catch (error) {
      console.error("Ошибка загрузки групп:", error);
    }
  }

  // Функция создания группы
  async function createGroup() {
    const userId = tg.initDataUnsafe.user.id;
    const groupName = document.getElementById('group-name').value;
    const groupPassword = document.getElementById('group-password').value;
    try {
      const response = await fetch(`https://bomsams-production.up.railway.app/create_group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: groupName,
          password: groupPassword
        })
      });
      if (response.ok) {
        alert("Группа успешно создана!");
        showInitialScreen();
      } else {
        const errorData = await response.json();
        alert("Ошибка создания группы: " + errorData.error);
      }
    } catch (error) {
      console.error("Ошибка при создании группы:", error);
    }
  }

  // Функция присоединения к группе
  async function joinGroup() {
    const userId = tg.initDataUnsafe.user.id;
    const groupName = document.getElementById('join-group-name').value;
    const groupPassword = document.getElementById('join-group-password').value;
    try {
      const response = await fetch(`https://bomsams-production.up.railway.app/join_group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          name: groupName,
          password: groupPassword
        })
      });
      if (response.ok) {
        alert("Вы успешно присоединились к группе!");
        showInitialScreen();
      } else {
        const errorData = await response.json();
        alert("Ошибка присоединения: " + errorData.error);
      }
    } catch (error) {
      console.error("Ошибка при присоединении к группе:", error);
    }
  }

  // Функция добавления события в группу
  async function addEvent() {
    const userId = tg.initDataUnsafe.user.id;
    const groupName = window.currentGroup.name;
    const eventDate = document.getElementById('event-date').value;
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const location = document.getElementById('event-location').value;
    try {
      const response = await fetch(`https://bomsams-production.up.railway.app/create_event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          group: groupName,
          date: eventDate,
          start_time: startTime,
          end_time: endTime,
          location: location
        })
      });
      if (response.ok) {
        alert("Событие добавлено!");
        hideAddEventForm();
        showEventHistory();
      } else {
        const errorData = await response.json();
        alert("Ошибка при добавлении события: " + errorData.error);
      }
    } catch (error) {
      console.error("Ошибка при добавлении события:", error);
    }
  }

  // Привязываем функции к глобальному объекту, чтобы они были доступны из HTML
  window.showInitialScreen = showInitialScreen;
  window.showGroupListScreen = showGroupListScreen;
  window.showCreateGroupForm = showCreateGroupForm;
  window.showJoinGroupForm = showJoinGroupForm;
  window.createGroup = createGroup;
  window.joinGroup = joinGroup;
  window.showGroupDetailScreen = showGroupDetailScreen;
  window.showAddEventForm = showAddEventForm;
  window.hideAddEventForm = hideAddEventForm;
  window.addEvent = addEvent;
  window.showNearestEvents = showNearestEvents;
  window.showEventHistory = showEventHistory;
});
