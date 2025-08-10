export type SoundType = 
  // サイコロ系
  | 'dice_roll'
  | 'dice_settle'
  | 'dice_pickup'
  // バトル系
  | 'battle_start'
  | 'battle_win'
  | 'battle_lose'
  | 'territory_capture'
  // ゲーム進行系
  | 'turn_start'
  | 'turn_end'
  | 'player_eliminated'
  | 'game_over'
  // UI操作系
  | 'click'
  | 'hover'
  | 'invalid_action'
  | 'menu_open'
  | 'menu_close'
  // パワーアップ系
  | 'powerup_appear'
  | 'powerup_collect'
  | 'powerup_activate'
  // 補充フェーズ系
  | 'reinforce_dice'
  | 'reinforce_complete';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, AudioBuffer> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.initializeAudioContext();
    this.createSynthSounds();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  private createSynthSounds() {
    if (!this.audioContext) return;

    // 各効果音を合成音で生成
    this.createDiceRoll();
    this.createDiceSettle();
    this.createBattleStart();
    this.createBattleWin();
    this.createBattleLose();
    this.createTerritoryCapture();
    this.createTurnStart();
    this.createTurnEnd();
    this.createPlayerEliminated();
    this.createGameOver();
    this.createClick();
    this.createHover();
    this.createInvalidAction();
    this.createMenuOpen();
    this.createMenuClose();
    this.createPowerupAppear();
    this.createPowerupCollect();
    this.createReinforceDice();
    this.createReinforceComplete();
  }

  private createDiceRoll() {
    const buffer = this.createNoiseBuffer(0.3, 0.2);
    this.sounds.set('dice_roll', buffer);
  }

  private createDiceSettle() {
    const buffer = this.createToneBuffer(800, 0.1, 'sine', 0.01, 0.05);
    this.sounds.set('dice_settle', buffer);
  }

  private createBattleStart() {
    const buffer = this.createToneBuffer(400, 0.2, 'sawtooth', 0.01, 0.1);
    this.sounds.set('battle_start', buffer);
  }

  private createBattleWin() {
    const buffer = this.createChordBuffer([523, 659, 784], 0.3, 'sine');
    this.sounds.set('battle_win', buffer);
  }

  private createBattleLose() {
    const buffer = this.createChordBuffer([349, 329, 261], 0.3, 'sine');
    this.sounds.set('battle_lose', buffer);
  }

  private createTerritoryCapture() {
    const buffer = this.createSweepBuffer(200, 600, 0.2);
    this.sounds.set('territory_capture', buffer);
  }

  private createTurnStart() {
    const buffer = this.createChordBuffer([440, 550, 660], 0.2, 'sine');
    this.sounds.set('turn_start', buffer);
  }

  private createTurnEnd() {
    const buffer = this.createToneBuffer(440, 0.15, 'sine', 0.01, 0.1);
    this.sounds.set('turn_end', buffer);
  }

  private createPlayerEliminated() {
    const buffer = this.createSweepBuffer(400, 100, 0.5);
    this.sounds.set('player_eliminated', buffer);
  }

  private createGameOver() {
    const buffer = this.createChordBuffer([523, 659, 784, 1047], 0.8, 'sine');
    this.sounds.set('game_over', buffer);
  }

  private createClick() {
    const buffer = this.createToneBuffer(1000, 0.05, 'square', 0.001, 0.01);
    this.sounds.set('click', buffer);
  }

  private createHover() {
    const buffer = this.createToneBuffer(1200, 0.03, 'sine', 0.001, 0.01);
    this.sounds.set('hover', buffer);
  }

  private createInvalidAction() {
    const buffer = this.createToneBuffer(200, 0.15, 'square', 0.01, 0.1);
    this.sounds.set('invalid_action', buffer);
  }

  private createMenuOpen() {
    const buffer = this.createSweepBuffer(300, 500, 0.1);
    this.sounds.set('menu_open', buffer);
  }

  private createMenuClose() {
    const buffer = this.createSweepBuffer(500, 300, 0.1);
    this.sounds.set('menu_close', buffer);
  }

  private createPowerupAppear() {
    const buffer = this.createChordBuffer([660, 880, 1320], 0.3, 'sine');
    this.sounds.set('powerup_appear', buffer);
  }

  private createPowerupCollect() {
    const buffer = this.createSweepBuffer(440, 880, 0.2);
    this.sounds.set('powerup_collect', buffer);
  }

  private createReinforceDice() {
    const buffer = this.createToneBuffer(600, 0.1, 'triangle', 0.01, 0.05);
    this.sounds.set('reinforce_dice', buffer);
  }

  private createReinforceComplete() {
    const buffer = this.createChordBuffer([440, 554, 659], 0.2, 'triangle');
    this.sounds.set('reinforce_complete', buffer);
  }

  // ヘルパーメソッド
  private createToneBuffer(
    frequency: number,
    duration: number,
    type: OscillatorType,
    attack: number = 0.01,
    release: number = 0.1
  ): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let amplitude = 1;

      // エンベロープ
      if (t < attack) {
        amplitude = t / attack;
      } else if (t > duration - release) {
        amplitude = (duration - t) / release;
      }

      // 波形生成
      switch (type) {
        case 'sine':
          data[i] = Math.sin(2 * Math.PI * frequency * t) * amplitude * 0.3;
          break;
        case 'square':
          data[i] = (Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1) * amplitude * 0.1;
          break;
        case 'sawtooth':
          data[i] = ((2 * frequency * t) % 2 - 1) * amplitude * 0.2;
          break;
        case 'triangle':
          data[i] = (Math.abs(((4 * frequency * t) % 4) - 2) - 1) * amplitude * 0.3;
          break;
      }
    }

    return buffer;
  }

  private createNoiseBuffer(duration: number, amplitude: number = 0.1): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * amplitude;
    }

    return buffer;
  }

  private createChordBuffer(frequencies: number[], duration: number, _type: OscillatorType): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      // エンベロープ
      let amplitude = 1;
      const attack = 0.01;
      const release = 0.1;
      
      if (t < attack) {
        amplitude = t / attack;
      } else if (t > duration - release) {
        amplitude = (duration - t) / release;
      }

      for (const freq of frequencies) {
        value += Math.sin(2 * Math.PI * freq * t) * amplitude;
      }
      
      data[i] = value / frequencies.length * 0.3;
    }

    return buffer;
  }

  private createSweepBuffer(startFreq: number, endFreq: number, duration: number): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const progress = t / duration;
      const frequency = startFreq + (endFreq - startFreq) * progress;
      
      // エンベロープ
      let amplitude = 1;
      const attack = 0.01;
      const release = 0.05;
      
      if (t < attack) {
        amplitude = t / attack;
      } else if (t > duration - release) {
        amplitude = (duration - t) / release;
      }
      
      data[i] = Math.sin(2 * Math.PI * frequency * t) * amplitude * 0.3;
    }

    return buffer;
  }

  // パブリックメソッド
  play(soundType: SoundType, volume?: number) {
    if (!this.enabled || !this.audioContext) return;

    const buffer = this.sounds.get(soundType);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    gainNode.gain.value = (volume ?? this.volume);
    
    source.start(0);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }
}

// シングルトンインスタンス
export const soundManager = new SoundManager();