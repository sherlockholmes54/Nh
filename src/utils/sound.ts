// Web Audio API sound synthesizer - zero external asset dependencies

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioBufferSourceNode | OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbientType: string = 'none';

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play celebratory session finish chime (multi-harmonic tibetan bowl sound)
  playChime(volume = 0.4) {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;
      const frequencies = [528, 792, 1056, 1320]; // 528Hz Solfeggio "transformation" tone harmonics

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const decay = 2.4 - idx * 0.4;
        const noteVol = (volume / frequencies.length) * (1 / (idx + 1));

        gain.gain.setValueAtTime(noteVol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + decay);
      });
    } catch {
      // Audio might be blocked by browser policy until interaction
    }
  }

  // Play crisp completion click / blip
  playComplete(volume = 0.25) {
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio context catch
    }
  }

  // Synthesize looping ambient focus sounds
  setAmbient(type: 'none' | 'brown' | 'white' | 'binaural', volume = 0.25) {
    try {
      const ctx = this.initContext();

      // Stop previous ambient sound
      this.stopAmbient();

      if (type === 'none' || volume <= 0) {
        this.currentAmbientType = 'none';
        return;
      }

      this.currentAmbientType = type;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gainNode.connect(ctx.destination);
      this.ambientGain = gainNode;

      if (type === 'brown' || type === 'white') {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds looped
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        if (type === 'white') {
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
        } else {
          // Brown noise algorithm (integrated white noise)
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // boost gain
          }
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Lowpass filter for smooth comforting sound
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(type === 'brown' ? 380 : 1200, ctx.currentTime);

        source.connect(filter);
        filter.connect(gainNode);

        source.start();
        this.ambientSource = source;
      } else if (type === 'binaural') {
        // 10Hz Alpha wave difference (210Hz left, 220Hz right)
        const merger = ctx.createChannelMerger(2);

        const oscL = ctx.createOscillator();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(210, ctx.currentTime);

        const oscR = ctx.createOscillator();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(220, ctx.currentTime);

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(gainNode);

        oscL.start();
        oscR.start();

        this.ambientSource = oscL; // track primary
      }
    } catch {
      // Audio context catch
    }
  }

  setAmbientVolume(vol: number) {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)) * 0.15, this.ctx.currentTime);
      } catch {
        // Safe update
      }
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      try {
        this.ambientGain.disconnect();
      } catch {
        // ignore
      }
      this.ambientGain = null;
    }
    this.currentAmbientType = 'none';
  }
}

export const soundManager = new SoundEngine();
