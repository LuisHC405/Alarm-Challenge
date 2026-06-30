import { AlarmApi } from './alarm-api.js';
import { AlarmAudio } from './alarm-audio.js';
import { AlarmScheduler } from './alarm-scheduler.js';
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
const scheduler = new AlarmScheduler({
  input: elements.alarmTime,
  onTick: ({ scheduledTime, minutes, seconds }) => {
    view.setMessage(`Alarme agendado para ${formatTime(scheduledTime)}. Faltam ${minutes}m ${String(seconds).padStart(2, '0')}s.`);
  },
  onTrigger: startAlarm,
});

const score = {
  wins: 0,
  errors: 0,
};

function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
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

async function startAlarm() {
  try {
    audio.resetVolume();
    const { response, data } = await api.start({
      difficulty: challengeSelector.difficulty,
      challengeType: challengeSelector.type,
    });

    renderAlarmState(data);
    view.setMessage(response.ok ? 'Horario atingido. Resolva o desafio para desligar o alarme.' : data.message, response.ok ? 'info' : 'error');
  } catch (error) {
    view.setMessage('Nao foi possivel iniciar o alarme.', 'error');
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

function scheduleAlarm() {
  if (!scheduler.schedule()) {
    view.setMessage('Escolha um horario para o alarme tocar.', 'error');
  }
}

elements.scheduleBtn.addEventListener('click', scheduleAlarm);
elements.answerBtn.addEventListener('click', submitAnswer);
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
scheduler.setDefaultTime();
checkApi();
refreshStatus();
