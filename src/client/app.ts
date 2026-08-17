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
  alarmList: document.getElementById('alarmList'),
  alarmCount: document.getElementById('alarmCount'),
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
  mathStatStatus: document.getElementById('mathStatStatus'),
  mathStatAttempts: document.getElementById('mathStatAttempts'),
  mathStatWins: document.getElementById('mathStatWins'),
  mathStatErrors: document.getElementById('mathStatErrors'),
  programmingQuestion: document.getElementById('programmingQuestion'),
  programmingAnswer: document.getElementById('programmingAnswer'),
  programmingAnswerBtn: document.getElementById('programmingAnswerBtn'),
  programmingMessage: document.getElementById('programmingMessage'),
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

function showScreen(screenName) {
  elements.createScreen.classList.toggle('active', screenName === 'create');
  elements.mathChallengeScreen.classList.toggle('active', screenName === 'math');
  elements.programmingChallengeScreen.classList.toggle('active', screenName === 'programming');
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

function challengeElements(type = activeChallengeType) {
  if (type === 'programming') {
    return {
      screen: 'programming',
      question: elements.programmingQuestion,
      answer: elements.programmingAnswer,
      button: elements.programmingAnswerBtn,
      message: elements.programmingMessage,
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
    statStatus: elements.mathStatStatus,
    statAttempts: elements.mathStatAttempts,
    statWins: elements.mathStatWins,
    statErrors: elements.mathStatErrors,
  };
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
    setMessage(elements.message, 'Nao foi possivel consultar o alarme.', 'error');
  }
}

async function loadAlarms() {
  try {
    const { data } = await api.listAlarms();
    savedAlarms = data.alarms || [];
    renderAlarmList();
  } catch (error) {
    setMessage(elements.message, 'Nao foi possivel carregar os alarmes salvos.', 'error');
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
      response.ok ? 'Horario atingido. Resolva o desafio para desligar o alarme.' : data.message,
      response.ok ? 'info' : 'error',
    );
  } catch (error) {
    setMessage(elements.message, 'Nao foi possivel iniciar o alarme.', 'error');
  }
}

async function scheduleAlarm(event) {
  event.preventDefault();

  if (!elements.alarmTime.value) {
    setMessage(elements.message, 'Escolha um horario para o alarme tocar.', 'error');
    return;
  }

  try {
    await api.createAlarm({
      name: elements.alarmName.value || 'Alarme',
      time: elements.alarmTime.value,
      difficulty: challengeSelector.difficulty,
      challengeType: challengeSelector.type,
      enabled: true,
    });

    elements.alarmName.value = '';
    await loadAlarms();
    setMessage(elements.message, 'Alarme salvo no banco de dados.', 'success');
  } catch (error) {
    setMessage(elements.message, 'Nao foi possivel salvar o alarme.', 'error');
  }
}

async function deleteAlarm(id) {
  try {
    await api.deleteAlarm(id);
    triggeredAlarms.delete(id);
    await loadAlarms();
    setMessage(elements.message, 'Alarme removido.', 'success');
  } catch (error) {
    setMessage(elements.message, 'Nao foi possivel remover o alarme.', 'error');
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
    setMessage(ui.message, 'Nao foi possivel enviar a resposta.', 'error');
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
    audio.start().catch(() => {
      setMessage(ui.message, 'Clique na tela e tente responder se o navegador bloquear o som.', 'error');
    });
    return true;
  }

  audio.stop();
  audio.resetVolume();
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
    <article class="alarm-item">
      <div>
        <strong>${alarm.time} - ${alarm.name}</strong>
        <small>${alarm.challengeType === 'programming' ? 'Programacao' : 'Matematica'} / ${alarm.difficulty}</small>
      </div>
      <button type="button" data-delete-alarm="${alarm.id}">Remover</button>
    </article>
  `).join('');
}

function watchSavedAlarms() {
  window.setInterval(() => {
    const now = currentTime();
    const alarm = savedAlarms.find((item) => item.enabled && item.time === now && !triggeredAlarms.has(todayTriggerKey(item)));
    if (!alarm) return;

    triggeredAlarms.add(todayTriggerKey(alarm));
    startAlarm(alarm);
  }, 1000);
}

elements.alarmForm.addEventListener('submit', scheduleAlarm);
elements.alarmList.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.deleteAlarm) {
    deleteAlarm(target.dataset.deleteAlarm);
  }
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
