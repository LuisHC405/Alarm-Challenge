// @ts-nocheck
import { AlarmApi } from './alarm-api.js';
import { AlarmAudio } from './alarm-audio.js';
import { ChallengeSelector } from './challenge-selector.js';

const elements = {
  app: document.getElementById('app'),
  currentClock: document.getElementById('currentClock'),
  currentDate: document.getElementById('currentDate'),
  createScreen: document.getElementById('createScreen'),
  mathChallengeScreen: document.getElementById('mathChallengeScreen'),
  programmingChallengeScreen: document.getElementById('programmingChallengeScreen'),
  alarmForm: document.getElementById('alarmForm'),
  alarmTime: document.getElementById('alarmTime'),
  alarmName: document.getElementById('alarmName'),
  alarmDate: document.getElementById('alarmDate'),
  alarmList: document.getElementById('alarmList'),
  alarmCount: document.getElementById('alarmCount'),
  createModal: document.getElementById('createModal'),
  openCreateBtn: document.getElementById('openCreateBtn'),
  closeCreateBtn: document.getElementById('closeCreateBtn'),
  weekdayList: document.getElementById('weekdayList'),
  scheduleBtn: document.getElementById('scheduleBtn'),
  mathTab: document.getElementById('mathTab'),
  programmingTab: document.getElementById('programmingTab'),
  difficulty: document.getElementById('difficulty'),
  difficultyPreview: document.getElementById('difficultyPreview'),
  message: document.getElementById('message'),
  mathQuestion: document.getElementById('mathQuestion'),
  mathAnswer: document.getElementById('mathAnswer'),
  mathAnswerBtn: document.getElementById('mathAnswerBtn'),
  mathMessage: document.getElementById('mathMessage'),
  mathTimer: document.getElementById('mathTimer'),
  mathStatStatus: document.getElementById('mathStatStatus'),
  mathStatAttempts: document.getElementById('mathStatAttempts'),
  mathStatWins: document.getElementById('mathStatWins'),
  mathStatErrors: document.getElementById('mathStatErrors'),
  programmingQuestion: document.getElementById('programmingQuestion'),
  programmingAnswer: document.getElementById('programmingAnswer'),
  programmingAnswerBtn: document.getElementById('programmingAnswerBtn'),
  programmingMessage: document.getElementById('programmingMessage'),
  programmingTimer: document.getElementById('programmingTimer'),
  programmingStatStatus: document.getElementById('programmingStatStatus'),
  programmingStatAttempts: document.getElementById('programmingStatAttempts'),
  programmingStatWins: document.getElementById('programmingStatWins'),
  programmingStatErrors: document.getElementById('programmingStatErrors'),
};

const api = new AlarmApi();
const audio = new AlarmAudio({ src: '/assets/alarm.mp3' });
const challengeSelector = new ChallengeSelector({
  difficultySelect: elements.difficulty,
  preview: elements.difficultyPreview,
  mathTab: elements.mathTab,
  programmingTab: elements.programmingTab,
  answer: elements.programmingAnswer,
});

const score = {
  wins: 0,
  errors: 0,
};
let savedAlarms = [];
let activeChallengeType = 'math';
const triggeredAlarms = new Set();
let answerTimerId = null;
const allWeekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const workdays = ['mon', 'tue', 'wed', 'thu', 'fri'];
const weekendDays = ['sat', 'sun'];
const weekdayLabels = { sun: 'Dom', mon: 'Seg', tue: 'Ter', wed: 'Qua', thu: 'Qui', fri: 'Sex', sat: 'Sáb' };

function showScreen(screenName) {
  elements.createScreen.classList.toggle('active', screenName === 'create');
  elements.mathChallengeScreen.classList.toggle('active', screenName === 'math');
  elements.programmingChallengeScreen.classList.toggle('active', screenName === 'programming');
}

function setCreateModal(open) {
  elements.createModal.classList.toggle('open', open);
  if (open) {
    elements.alarmTime.focus();
  }
}

function setMessage(element, text, type = 'info') {
  element.textContent = text;
  element.className = `message ${type}`;
}

function setApiStatus(online) {
  document.body.classList.toggle('api-online', online);
}

function todayTriggerKey(alarm) {
  return `${alarm.id}:${new Date().toISOString().slice(0, 10)}`;
}

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function renderCurrentClock() {
  const now = new Date();
  elements.currentClock.textContent = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  elements.currentDate.textContent = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

function selectedWeekdays() {
  return [...elements.weekdayList.querySelectorAll('[data-weekday].active')].map((button) => button.dataset.weekday);
}

function setWeekdays(days) {
  elements.weekdayList.querySelectorAll('[data-weekday]').forEach((button) => {
    button.classList.toggle('active', days.includes(button.dataset.weekday));
  });
}

function weekdaySummary(days) {
  if (days.length === allWeekdays.length) return 'Todos os dias';
  if (workdays.every((day) => days.includes(day)) && days.length === workdays.length) return 'Dias úteis';
  if (weekendDays.every((day) => days.includes(day)) && days.length === weekendDays.length) return 'Fim de semana';
  return days.map((day) => weekdayLabels[day]).join(', ');
}

function currentWeekday() {
  return allWeekdays[new Date().getDay()];
}

function currentLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function challengeElements(type = activeChallengeType) {
  if (type === 'programming') {
    return {
      screen: 'programming',
      question: elements.programmingQuestion,
      answer: elements.programmingAnswer,
      button: elements.programmingAnswerBtn,
      message: elements.programmingMessage,
      timer: elements.programmingTimer,
      statStatus: elements.programmingStatStatus,
      statAttempts: elements.programmingStatAttempts,
      statWins: elements.programmingStatWins,
      statErrors: elements.programmingStatErrors,
    };
  }

  return {
    screen: 'math',
    question: elements.mathQuestion,
    answer: elements.mathAnswer,
    button: elements.mathAnswerBtn,
    message: elements.mathMessage,
    timer: elements.mathTimer,
    statStatus: elements.mathStatStatus,
    statAttempts: elements.mathStatAttempts,
    statWins: elements.mathStatWins,
    statErrors: elements.mathStatErrors,
  };
}

function stopAnswerTimer() {
  window.clearInterval(answerTimerId);
  answerTimerId = null;
}

function startAnswerTimer(ui) {
  stopAnswerTimer();
  let secondsLeft = 10;
  const renderTimer = () => {
    ui.timer.innerHTML = `Responda em <strong>${secondsLeft}s</strong>`;
    ui.timer.classList.toggle('expired', secondsLeft === 0);
  };

  renderTimer();
  answerTimerId = window.setInterval(() => {
    secondsLeft -= 1;
    renderTimer();

    if (secondsLeft === 0) {
      stopAnswerTimer();
      audio.setMaxVolume();
      setMessage(ui.message, 'Tempo esgotado. O alarme foi para o volume máximo.', 'error');
    }
  }, 1000);
}

async function checkApi() {
  try {
    const { response } = await api.info();
    if (response.ok) {
      setApiStatus(true);
    } else {
      setApiStatus(false);
    }
  } catch (error) {
    setApiStatus(false);
  }
}

async function refreshStatus() {
  try {
    const { data } = await api.status();
    renderAlarmState(data);
  } catch (error) {
    setMessage(elements.message, 'Não foi possível consultar o alarme.', 'error');
  }
}

async function loadAlarms() {
  try {
    const { data } = await api.listAlarms();
    savedAlarms = data.alarms || [];
    renderAlarmList();
  } catch (error) {
    setMessage(elements.message, error instanceof Error ? error.message : 'Não foi possível carregar os alarmes salvos.', 'error');
  }
}

async function startAlarm(alarm = null) {
  try {
    audio.resetVolume();
    const { response, data } = await api.start({
      difficulty: alarm?.difficulty || challengeSelector.difficulty,
      challengeType: alarm?.challengeType || challengeSelector.type,
    });

    renderAlarmState(data);
    const ui = challengeElements(data.challengeType || alarm?.challengeType || challengeSelector.type);
    setMessage(
      response.ok ? ui.message : elements.message,
      response.ok ? 'Horário atingido. Resolva o desafio para desligar o alarme.' : data.message,
      response.ok ? 'info' : 'error',
    );
  } catch (error) {
    setMessage(elements.message, 'Não foi possível iniciar o alarme.', 'error');
  }
}

async function scheduleAlarm(event) {
  event.preventDefault();

  if (!elements.alarmTime.value) {
    setMessage(elements.message, 'Escolha um horário para o alarme tocar.', 'error');
    return;
  }

  try {
    await api.createAlarm({
      name: elements.alarmName.value || 'Alarme',
      time: elements.alarmTime.value,
      difficulty: challengeSelector.difficulty,
      challengeType: challengeSelector.type,
      weekdays: selectedWeekdays(),
      scheduledDate: elements.alarmDate.value || null,
      enabled: true,
    });

    elements.alarmName.value = '';
    elements.alarmDate.value = '';
    await loadAlarms();
    setMessage(elements.message, 'Alarme salvo.', 'success');
    setCreateModal(false);
  } catch (error) {
    setMessage(elements.message, error instanceof Error ? error.message : 'Não foi possível salvar o alarme.', 'error');
  }
}

async function deleteAlarm(id) {
  try {
    await api.deleteAlarm(id);
    triggeredAlarms.delete(id);
    await loadAlarms();
    setMessage(elements.message, 'Alarme removido.', 'success');
  } catch (error) {
    setMessage(elements.message, error instanceof Error ? error.message : 'Não foi possível remover o alarme.', 'error');
  }
}

async function toggleAlarm(id, enabled) {
  try {
    await api.updateAlarm(id, { enabled });
    await loadAlarms();
    setMessage(elements.message, enabled ? 'Alarme ativado.' : 'Alarme desativado.', 'success');
  } catch (error) {
    await loadAlarms();
    setMessage(elements.message, error instanceof Error ? error.message : 'Não foi possível atualizar o alarme.', 'error');
  }
}

async function submitAnswer() {
  const ui = challengeElements();
  const answer = ui.answer.value;

  if (answer.trim() === '') {
    setMessage(ui.message, 'Digite uma resposta.', 'error');
    return;
  }

  try {
    stopAnswerTimer();
    const { response, data } = await api.answer(answer);

    if (data.correct) {
      score.wins += 1;
      setMessage(ui.message, data.message, 'success');
    } else {
      score.errors += 1;
      const volumePercent = audio.increaseVolume();
      setMessage(ui.message, `${data.message} Volume do alarme: ${volumePercent}%.`, 'error');
    }

    ui.answer.value = '';
    renderAlarmState(data);

    if (!response.ok && data.previousCorrectAnswer !== undefined) {
      const updatedUi = challengeElements();
      setMessage(
        updatedUi.message,
        `${data.message} Resposta anterior: ${data.previousCorrectAnswer}. Volume do alarme: ${audio.volumePercent()}%.`,
        'error',
      );
    }
  } catch (error) {
    setMessage(ui.message, 'Não foi possível enviar a resposta.', 'error');
    if (elements.app.classList.contains('is-ringing')) {
      startAnswerTimer(ui);
    }
  }
}

function renderAlarmState(data) {
  const active = data.status === 'active' || data.isActive;
  activeChallengeType = data.challengeType || activeChallengeType || challengeSelector.type;
  elements.app.classList.toggle('is-ringing', active);
  elements.scheduleBtn.disabled = active;
  elements.alarmTime.disabled = active;
  elements.alarmName.disabled = active;
  elements.difficulty.disabled = active;
  challengeSelector.setDisabled(active);

  const ui = challengeElements(activeChallengeType);
  ui.question.textContent = active && data.question ? data.question : '--';
  ui.answer.disabled = !active;
  ui.button.disabled = !active;
  ui.statStatus.textContent = active ? 'On' : 'Off';
  ui.statAttempts.textContent = `${data.attemptsUsed || 0}/${data.maxAttempts || 5}`;
  ui.statWins.textContent = score.wins;
  ui.statErrors.textContent = score.errors;

  if (active) {
    showScreen(ui.screen);
    ui.answer.focus();
    startAnswerTimer(ui);
    audio.start().catch(() => {
      setMessage(ui.message, 'Clique na tela e tente responder se o navegador bloquear o som.', 'error');
    });
    return true;
  }

  audio.stop();
  audio.resetVolume();
  stopAnswerTimer();
  showScreen('create');
  return false;
}

function renderAlarmList() {
  elements.alarmCount.textContent = savedAlarms.length;

  if (savedAlarms.length === 0) {
    elements.alarmList.className = 'alarm-list empty';
    elements.alarmList.innerHTML = 'Nenhum alarme salvo.';
    return;
  }

  elements.alarmList.className = 'alarm-list';
  elements.alarmList.innerHTML = savedAlarms.map((alarm) => `
    <article class="alarm-item ${alarm.enabled ? '' : 'disabled'}">
      <div>
        <strong>${alarm.time}</strong>
        <small>${alarm.scheduledDate ? `Data: ${new Date(`${alarm.scheduledDate}T00:00:00`).toLocaleDateString('pt-BR')}` : weekdaySummary(alarm.weekdays || allWeekdays)}${alarm.name ? ` · ${alarm.name}` : ''}</small>
        <small>${alarm.name}</small>
      </div>
      <div>
        <label class="alarm-toggle" aria-label="${alarm.enabled ? 'Desativar' : 'Ativar'} ${alarm.name}">
          <input type="checkbox" data-toggle-alarm="${alarm.id}" ${alarm.enabled ? 'checked' : ''}>
          <span class="toggle-track"></span>
        </label>
        <button type="button" data-delete-alarm="${alarm.id}">Remover</button>
      </div>
    </article>
  `).join('');
}

function watchSavedAlarms() {
  window.setInterval(() => {
    const now = currentTime();
    const alarm = savedAlarms.find((item) => {
      const matchesSchedule = item.scheduledDate ? item.scheduledDate === currentLocalDate() : (item.weekdays || allWeekdays).includes(currentWeekday());
      return item.enabled && matchesSchedule && item.time === now && !triggeredAlarms.has(todayTriggerKey(item));
    });
    if (!alarm) return;

    triggeredAlarms.add(todayTriggerKey(alarm));
    startAlarm(alarm);
  }, 1000);
}

elements.alarmForm.addEventListener('submit', scheduleAlarm);
elements.openCreateBtn.addEventListener('click', () => setCreateModal(true));
elements.closeCreateBtn.addEventListener('click', () => setCreateModal(false));
elements.createModal.addEventListener('click', (event) => {
  if (event.target === elements.createModal) setCreateModal(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setCreateModal(false);
});
elements.alarmList.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.deleteAlarm) {
    deleteAlarm(target.dataset.deleteAlarm);
  }
});
elements.alarmList.addEventListener('change', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.dataset.toggleAlarm) {
    toggleAlarm(target.dataset.toggleAlarm, target.checked);
  }
});
elements.weekdayList.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof HTMLButtonElement && target.dataset.weekday) {
    const selected = selectedWeekdays();
    if (target.classList.contains('active') && selected.length === 1) return;
    target.classList.toggle('active');
  }
});
document.querySelectorAll('[data-weekday-preset]').forEach((button) => {
  button.addEventListener('click', () => {
    const preset = button.dataset.weekdayPreset;
    setWeekdays(preset === 'workdays' ? workdays : preset === 'weekend' ? weekendDays : allWeekdays);
  });
});
elements.mathTab.addEventListener('click', () => challengeSelector.setType('math'));
elements.programmingTab.addEventListener('click', () => challengeSelector.setType('programming'));
elements.difficulty.addEventListener('change', () => challengeSelector.updatePreview());
elements.mathAnswerBtn.addEventListener('click', submitAnswer);
elements.programmingAnswerBtn.addEventListener('click', submitAnswer);
elements.mathAnswer.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    submitAnswer();
  }
});
elements.programmingAnswer.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    event.preventDefault();
    submitAnswer();
  }
});

challengeSelector.updatePreview();
renderCurrentClock();
window.setInterval(renderCurrentClock, 1000);
const nextMinute = new Date(Date.now() + 60000);
elements.alarmTime.value = `${String(nextMinute.getHours()).padStart(2, '0')}:${String(nextMinute.getMinutes()).padStart(2, '0')}`;
checkApi();
refreshStatus();
loadAlarms();
watchSavedAlarms();
