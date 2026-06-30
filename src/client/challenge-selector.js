import { challengeDetails } from './challenge-details.js';

export class ChallengeSelector {
  constructor({ difficultySelect, preview, mathTab, programmingTab, answer }) {
    this.difficultySelect = difficultySelect;
    this.preview = preview;
    this.mathTab = mathTab;
    this.programmingTab = programmingTab;
    this.answer = answer;
    this.type = 'math';
  }

  get difficulty() {
    return this.difficultySelect.value;
  }

  setType(type) {
    this.type = type;
    this.mathTab.classList.toggle('active', type === 'math');
    this.programmingTab.classList.toggle('active', type === 'programming');
    this.answer.placeholder = type === 'programming' ? 'Codigo TypeScript' : 'Resposta';
    this.updatePreview();
  }

  setDisabled(disabled) {
    this.difficultySelect.disabled = disabled;
    this.mathTab.disabled = disabled;
    this.programmingTab.disabled = disabled;
  }

  updatePreview() {
    const detail = challengeDetails[this.type][this.difficulty];
    this.preview.innerHTML = `
      <span>Preview da dificuldade</span>
      <strong>${detail.label}</strong>: ${detail.text}
      <em>${detail.examples}</em>
    `;
  }

  isProgramming() {
    return this.type === 'programming';
  }
}
