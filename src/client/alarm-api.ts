// @ts-nocheck
export class AlarmApi {
  async request(path, options = {}) {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const content = await response.text();
    const data = content ? JSON.parse(content) : {};
    return { response, data };
  }

  async requestRequired(path, options = {}) {
    const result = await this.request(path, options);
    if (!result.response.ok) {
      throw new Error(result.data.message || `Erro na API (${result.response.status}).`);
    }
    return result;
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

  listAlarms() {
    return this.requestRequired('/alarms');
  }

  createAlarm(alarm) {
    return this.requestRequired('/alarms', {
      method: 'POST',
      body: JSON.stringify(alarm),
    });
  }

  updateAlarm(id, alarm) {
    return this.requestRequired(`/alarms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(alarm),
    });
  }

  deleteAlarm(id) {
    return this.requestRequired(`/alarms/${id}`, {
      method: 'DELETE',
    });
  }
}
