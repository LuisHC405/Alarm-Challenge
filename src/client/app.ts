// @ts-nocheck
import { AlarmApi } from './alarm-api.js';
import { AlarmAudio } from './alarm-audio.js';
import { AlarmView } from './alarm-view.js';
import { ChallengeSelector } from './challenge-selector.js';

const elements = {
  app: document.getElementById('app'),
  apiStatus: document.getElementById('apiStatus'),
  statusLabel: document.getElementById('statusLabel'),
  question: document.getElementById('question'),
  answer: document.getElementById('answer'),
  answerBtn: document.getElementById('answerBtn'),
  scheduleBtn: document.getElementById('scheduleBtn'),
  mathTab: document.getElementById('mathTab'),
  programmingTab: document.getElementById('programmingTab'),
  message: document.getElementById('message'),
  alarmTime: document.getElementById('alarmTime'),
  alarmName: document.getElementById('alarmName'),
  alarmList: document.getElementById('alarmList'),
  difficulty: document.getElementById('difficulty'),
  difficultyPreview: document.getElementById('difficultyPreview'),
  statStatus: document.getElementById('statStatus'),
  statAttempts: document.getElementById('statAttempts'),
  statWins: document.getElementById('statWins'),
  statErrors: document.getElementById('statErrors'),
};

const api = new AlarmApi();
const audio = new AlarmAudio({ src: '/assets/alarm.mp3' });
const view = new AlarmView(elements);
const challengeSelector = new ChallengeSelector({
  difficultySelect: elements.difficulty,
  preview: elements.difficultyPreview,
  mathTab: elements.mathTab,
  programmingTab: elements.programmingTab,
  answer: elements.answer,
});

const score = {
  wins: 0,
  errors: 0,
};
let savedAlarms = [];
const triggeredAlarms = new Set();

function todayTriggerKey(alarm) {
  return `${alarm.id}:${new Date().toISOString().slice(0, 10)}`;
}

function currentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

async function checkApi() {
  try {
    const { response } = await api.info();
    if (response.ok) {
      view.setApiStatus(true);
    } else {
      view.setApiUnstable();
    }
  } catch (error) {
    view.setApiStatus(false);
  }
}

async function refreshStatus() {
  try {
    const { data } = await api.status();
    renderAlarmState(data);
  } catch (error) {
    view.setMessage('Nao foi possivel consultar o alarme.', 'error');
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
    view.setMessage(response.ok ? 'Horario atingido. Resolva o desafio para desligar o alarme.' : data.message, response.ok ? 'info' : 'error');
  } catch (error) {
    view.setMessage('Nao foi possivel iniciar o alarme.', 'error');
  }
}

async function loadAlarms() {
  try {
    const { data } = await api.listAlarms();
    savedAlarms = data.alarms || [];
    renderAlarmList();
  } catch (error) {
    view.setMessage('Nao foi possivel carregar os alarmes salvos.', 'error');
  }
}

async function submitAnswer() {
  const answer = view.answerValue();
  if (answer.trim() === '') {
    view.setMessage('Digite uma resposta.', 'error');
    return;
  }

  try {
    const { response, data } = await api.answer(answer);

    if (data.correct) {
      score.wins += 1;
      view.setMessage(data.message, 'success');
    } else {
      score.errors += 1;
      const volumePercent = audio.increaseVolume();
      view.setMessage(`${data.message} Volume do alarme: ${volumePercent}%.`, 'error');
    }

    view.updateScore(score);
    view.clearAnswer();
    renderAlarmState(data);

    if (!response.ok && data.previousCorrectAnswer !== undefined) {
      view.setMessage(`${data.message} Resposta anterior: ${data.previousCorrectAnswer}. Volume do alarme: ${audio.volumePercent()}%.`, 'error');
    }
  } catch (error) {
    view.setMessage('Nao foi possivel enviar a resposta.', 'error');
  }
}

function renderAlarmState(data) {
  const active = view.renderState(data, challengeSelector.type);
  challengeSelector.setDisabled(active);

  if (active) {
    audio.start().catch(() => {
      view.setMessage('Clique em Agendar novamente se o navegador bloquear o som.', 'error');
    });
  } else {
    audio.stop();
    audio.resetVolume();
  }
}

async function scheduleAlarm() {
  if (!elements.alarmTime.value) {
    view.setMessage('Escolha um horario para o alarme tocar.', 'error');
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
    view.setMessage('Alarme salvo no banco de dados.', 'success');
  } catch (error) {
    view.setMessage('Nao foi possivel salvar o alarme.', 'error');
  }
}

async function deleteAlarm(id) {
  try {
    await api.deleteAlarm(id);
    triggeredAlarms.delete(id);
    await loadAlarms();
    view.setMessage('Alarme removido.', 'success');
  } catch (error) {
    view.setMessage('Nao foi possivel remover o alarme.', 'error');
  }
}

function renderAlarmList() {
  if (savedAlarms.length === 0) {
    elements.alarmList.innerHTML = 'Nenhum alarme salvo.';
    return;
  }

  elements.alarmList.innerHTML = `
    <div class="alarm-list">
      ${savedAlarms.map((alarm) => `
        <div class="alarm-item">
          <div>
            <strong>${alarm.time} - ${alarm.name}</strong>
            <small>${alarm.challengeType} / ${alarm.difficulty}</small>
          </div>
          <button type="button" data-delete-alarm="${alarm.id}">Remover</button>
        </div>
      `).join('')}
    </div>
  `;
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

elements.scheduleBtn.addEventListener('click', scheduleAlarm);
elements.answerBtn.addEventListener('click', submitAnswer);
elements.alarmList.addEventListener('click', (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.dataset.deleteAlarm) {
    deleteAlarm(target.dataset.deleteAlarm);
  }
});
elements.mathTab.addEventListener('click', () => challengeSelector.setType('math'));
elements.programmingTab.addEventListener('click', () => challengeSelector.setType('programming'));
elements.difficulty.addEventListener('change', () => challengeSelector.updatePreview());
elements.answer.addEventListener('keydown', (event) => {
  const shouldSubmit = event.key === 'Enter' && (!challengeSelector.isProgramming() || event.ctrlKey);
  if (shouldSubmit) {
    event.preventDefault();
    submitAnswer();
  }
});

challengeSelector.updatePreview();
const nextMinute = new Date(Date.now() + 60000);
elements.alarmTime.value = `${String(nextMinute.getHours()).padStart(2, '0')}:${String(nextMinute.getMinutes()).padStart(2, '0')}`;
checkApi();
refreshStatus();
loadAlarms();
watchSavedAlarms();
