export class AlarmApi {
  async request(path, options = {}) {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await response.json();
    return { response, data };
  }

  info() {
    return this.request('/api');
  }

  status() {
    return this.request('/alarm/status');
  }

  start({ challengeType, difficulty }) {
    return this.request('/alarm/start', {
      method: 'POST',
      body: JSON.stringify({ challengeType, difficulty }),
    });
  }

  answer(answer) {
    return this.request('/alarm/answer', {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }
}
