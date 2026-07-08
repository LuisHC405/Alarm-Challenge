// @ts-nocheck
export class AlarmScheduler {
  constructor({ input, onTick, onTrigger }) {
    this.input = input;
    this.onTick = onTick;
    this.onTrigger = onTrigger;
    this.scheduledTime = null;
    this.timer = null;
    this.triggeredFor = null;
  }

  setDefaultTime() {
    const nextMinute = new Date(Date.now() + 60000);
    this.input.value = `${String(nextMinute.getHours()).padStart(2, '0')}:${String(nextMinute.getMinutes()).padStart(2, '0')}`;
  }

  schedule() {
    if (!this.input.value) {
      return false;
    }

    this.scheduledTime = this.getScheduledDate(this.input.value);
    this.triggeredFor = null;
    window.clearInterval(this.timer);
    this.tick();

    this.timer = window.setInterval(() => {
      const triggerKey = this.scheduledTime.toISOString();

      if (Date.now() >= this.scheduledTime.getTime() && this.triggeredFor !== triggerKey) {
        this.triggeredFor = triggerKey;
        window.clearInterval(this.timer);
        this.timer = null;
        this.onTrigger();
        return;
      }

      this.tick();
    }, 1000);

    return true;
  }

  tick() {
    if (!this.scheduledTime) return;

    const remainingMs = this.scheduledTime.getTime() - Date.now();
    if (remainingMs <= 0) return;

    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    this.onTick({
      scheduledTime: this.scheduledTime,
      minutes,
      seconds,
    });
  }

  getScheduledDate(timeValue) {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    if (date <= new Date()) {
      date.setDate(date.getDate() + 1);
    }

    return date;
  }
}
