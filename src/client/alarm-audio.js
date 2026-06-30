export class AlarmAudio {
  constructor({ src, baseVolume = 0.08, maxVolume = 0.9, volumeStep = 0.14, fadeSeconds = 0.18 }) {
    this.src = src;
    this.baseVolume = baseVolume;
    this.maxVolume = maxVolume;
    this.volumeStep = volumeStep;
    this.fadeSeconds = fadeSeconds;
    this.volume = baseVolume;
    this.context = null;
    this.buffer = null;
    this.sources = [];
    this.gain = null;
    this.isStarting = false;
    this.isPlaying = false;
    this.loopTimer = null;
  }

  async loadBuffer() {
    if (this.buffer) return this.buffer;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    this.context = this.context || new AudioContextClass();
    const response = await fetch(this.src);
    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await this.context.decodeAudioData(arrayBuffer);
    return this.buffer;
  }

  volumePercent() {
    return Math.min(100, Math.round((this.volume / this.maxVolume) * 100));
  }

  scheduleChunk() {
    if (!this.isPlaying || !this.buffer || !this.context || !this.gain) return;

    const trimStart = Math.min(0.04, this.buffer.duration / 5);
    const trimEnd = Math.min(0.12, this.buffer.duration / 5);
    const chunkDuration = Math.max(0.25, this.buffer.duration - trimStart - trimEnd);
    const fadeDuration = Math.min(this.fadeSeconds, chunkDuration / 4);
    const nextDelay = Math.max(0.08, chunkDuration - fadeDuration);
    const now = this.context.currentTime;
    const source = this.context.createBufferSource();
    const chunkGain = this.context.createGain();

    source.buffer = this.buffer;
    chunkGain.gain.setValueAtTime(0.0001, now);
    chunkGain.gain.exponentialRampToValueAtTime(1, now + fadeDuration);
    chunkGain.gain.setValueAtTime(1, now + chunkDuration - fadeDuration);
    chunkGain.gain.exponentialRampToValueAtTime(0.0001, now + chunkDuration);

    source.connect(chunkGain);
    chunkGain.connect(this.gain);
    source.start(now, trimStart, chunkDuration);
    source.stop(now + chunkDuration + 0.02);
    this.sources.push(source);

    source.onended = () => {
      source.disconnect();
      chunkGain.disconnect();
      this.sources = this.sources.filter((item) => item !== source);
    };

    this.loopTimer = window.setTimeout(() => this.scheduleChunk(), nextDelay * 1000);
  }

  async start() {
    if (this.isPlaying || this.isStarting) return;

    this.isStarting = true;
    const buffer = await this.loadBuffer();
    if (!buffer) {
      this.isStarting = false;
      return;
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    this.gain = this.context.createGain();
    this.gain.gain.value = this.volume;
    this.gain.connect(this.context.destination);
    this.isPlaying = true;
    this.scheduleChunk();
    this.isStarting = false;
  }

  stop() {
    this.isPlaying = false;
    window.clearTimeout(this.loopTimer);
    this.loopTimer = null;
    this.sources.forEach((source) => {
      try {
        source.stop();
      } catch (error) {
        // The source may already have ended naturally.
      }
    });
    this.sources = [];
    if (this.gain) {
      this.gain.disconnect();
    }
    this.gain = null;
    this.isStarting = false;
  }

  resetVolume() {
    this.volume = this.baseVolume;
    if (this.gain) {
      this.gain.gain.value = this.volume;
    }
  }

  increaseVolume() {
    this.volume = Math.min(this.maxVolume, this.volume + this.volumeStep);
    if (this.gain) {
      this.gain.gain.value = this.volume;
    } else {
      this.start();
    }
    return this.volumePercent();
  }
}
