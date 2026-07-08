// @ts-nocheck
export class AlarmView {
  constructor(elements) {
    this.elements = elements;
  }

  setMessage(text, type = 'info') {
    this.elements.message.textContent = text;
    this.elements.message.className = `message ${type}`;
  }

  setApiStatus(online) {
    this.elements.apiStatus.textContent = online ? 'API online' : 'API offline';
    this.elements.apiStatus.classList.toggle('online', online);
  }

  setApiUnstable() {
    this.elements.apiStatus.textContent = 'API instavel';
    this.elements.apiStatus.classList.remove('online');
  }

  renderState(data, fallbackChallengeType) {
    const active = data.status === 'active' || data.isActive;
    const challengeType = data.challengeType || fallbackChallengeType;

    this.elements.app.classList.toggle('is-ringing', active);
    this.elements.statusLabel.querySelector('span:last-child').textContent = active ? 'Alarme tocando' : 'Alarme desligado';
    this.elements.question.textContent = active && data.question ? data.question : '--';
    this.elements.question.classList.toggle('programming', challengeType === 'programming');
    this.elements.answer.disabled = !active;
    this.elements.answerBtn.disabled = !active;
    this.elements.scheduleBtn.disabled = active;
    this.elements.alarmTime.disabled = active;
    this.elements.statStatus.textContent = active ? 'On' : 'Off';
    this.elements.statAttempts.textContent = `${data.attemptsUsed || 0}/${data.maxAttempts || 5}`;

    if (active) {
      this.elements.answer.placeholder = challengeType === 'programming' ? 'Digite seu codigo TypeScript aqui' : 'Digite o resultado';
      this.elements.answer.focus();
    } else {
      this.elements.answer.placeholder = fallbackChallengeType === 'programming' ? 'Codigo TypeScript' : 'Resposta';
    }

    return active;
  }

  updateScore({ wins, errors }) {
    this.elements.statWins.textContent = wins;
    this.elements.statErrors.textContent = errors;
  }

  clearAnswer() {
    this.elements.answer.value = '';
  }

  answerValue() {
    return this.elements.answer.value;
  }
}
