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
    // より複雑なダイスロール音（複数の周波数を組み合わせ）
    const buffer = this.createComplexDiceRoll();
    this.sounds.set('dice_roll', buffer);
  }

  private createDiceSettle() {
    // 木製テーブルにダイスが落ちる音
    const buffer = this.createImpactSound(800, 0.15);
    this.sounds.set('dice_settle', buffer);
  }

  private createBattleStart() {
    // 剣がぶつかる金属音
    const buffer = this.createMetallicClash();
    this.sounds.set('battle_start', buffer);
  }

  private createBattleWin() {
    // 勝利ファンファーレ（メジャーコード）
    const buffer = this.createVictoryFanfare();
    this.sounds.set('battle_win', buffer);
  }

  private createBattleLose() {
    // 敗北音（マイナーコード下降）
    const buffer = this.createDefeatSound();
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
    // 壮大なゲーム終了ファンファーレ
    const buffer = this.createEpicFinale();
    this.sounds.set('game_over', buffer);
  }

  private createClick() {
    // UIクリック音（ポップな音）
    const buffer = this.createUIClick();
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

  // 新しいリアルな音生成メソッド
  private createComplexDiceRoll(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.4;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // 複数の周波数成分を混ぜる（木とプラスチックの混合音）
      const noise = (Math.random() * 2 - 1) * 0.15;
      const lowFreq = Math.sin(2 * Math.PI * 150 * t) * 0.1;
      const midFreq = Math.sin(2 * Math.PI * 400 * t) * 0.05;
      const highFreq = Math.sin(2 * Math.PI * 1200 * t) * 0.03;
      
      // エンベロープ（徐々に減衰）
      const envelope = Math.exp(-3 * t);
      
      // ランダムな跳ね返り音
      const bounce = Math.sin(2 * Math.PI * 800 * t * (1 + Math.random() * 0.2)) * 0.05;
      
      data[i] = (noise + lowFreq + midFreq + highFreq + bounce) * envelope;
    }

    return buffer;
  }

  private createImpactSound(baseFreq: number, duration: number): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // インパクト音（衝撃波）
      const impact = Math.sin(2 * Math.PI * baseFreq * t) * Math.exp(-20 * t);
      const harmonics = Math.sin(2 * Math.PI * baseFreq * 2 * t) * Math.exp(-30 * t) * 0.5;
      const subharmonics = Math.sin(2 * Math.PI * baseFreq * 0.5 * t) * Math.exp(-15 * t) * 0.3;
      
      // 木製の共鳴
      const resonance = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-10 * t) * 0.2;
      
      data[i] = (impact + harmonics + subharmonics + resonance) * 0.5;
    }

    return buffer;
  }

  private createMetallicClash(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // 金属音の特徴的な高周波成分
      let metallic = 0;
      const frequencies = [523, 785, 1047, 1568, 2093]; // 不協和音的な周波数
      
      for (const freq of frequencies) {
        metallic += Math.sin(2 * Math.PI * freq * t) / frequencies.length;
      }
      
      // リング変調でメタリックな質感を追加
      const modulator = Math.sin(2 * Math.PI * 3000 * t);
      metallic *= (1 + modulator * 0.5);
      
      // 急速な減衰
      const envelope = Math.exp(-8 * t);
      
      // ノイズ成分（衝撃音）
      const noise = (Math.random() * 2 - 1) * 0.1 * Math.exp(-20 * t);
      
      data[i] = (metallic * envelope + noise) * 0.3;
    }

    return buffer;
  }

  private createVictoryFanfare(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // C Major トライアド with added 9th
    const notes = [
      { freq: 523.25, start: 0, duration: 0.15 },    // C5
      { freq: 659.25, start: 0.05, duration: 0.15 },  // E5
      { freq: 783.99, start: 0.1, duration: 0.15 },   // G5
      { freq: 1046.5, start: 0.15, duration: 0.35 },  // C6
      { freq: 587.33, start: 0.15, duration: 0.35 },  // D5 (9th)
    ];

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      for (const note of notes) {
        if (t >= note.start && t < note.start + note.duration) {
          const noteT = t - note.start;
          const noteEnv = Math.min(1, noteT * 20) * Math.exp(-2 * noteT);
          value += Math.sin(2 * Math.PI * note.freq * t) * noteEnv;
          // ハーモニクス追加
          value += Math.sin(2 * Math.PI * note.freq * 2 * t) * noteEnv * 0.3;
          value += Math.sin(2 * Math.PI * note.freq * 3 * t) * noteEnv * 0.15;
        }
      }
      
      data[i] = value * 0.25;
    }

    return buffer;
  }

  private createDefeatSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.4;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Descending minor progression
    const notes = [
      { freq: 440, start: 0, duration: 0.1 },     // A4
      { freq: 415.3, start: 0.1, duration: 0.1 }, // G#4
      { freq: 349.23, start: 0.2, duration: 0.2 }, // F4
      { freq: 261.63, start: 0.3, duration: 0.1 }, // C4 (low)
    ];

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      for (const note of notes) {
        if (t >= note.start && t < note.start + note.duration) {
          const noteT = t - note.start;
          const envelope = Math.exp(-3 * noteT);
          // Triangle wave for softer sound
          const triangleWave = Math.abs(((4 * note.freq * t) % 4) - 2) - 1;
          value += triangleWave * envelope;
        }
      }
      
      // Add slight vibrato for emotional effect
      value *= (1 + Math.sin(2 * Math.PI * 5 * t) * 0.05);
      
      data[i] = value * 0.3;
    }

    return buffer;
  }

  private createUIClick(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 0.03;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      
      // ポップでモダンなクリック音
      const fundamental = Math.sin(2 * Math.PI * 2000 * t);
      const harmonic = Math.sin(2 * Math.PI * 4000 * t) * 0.5;
      
      // エンベロープ（非常に短い）
      const envelope = Math.exp(-100 * t);
      
      // わずかなピッチベンド
      const pitchBend = 1 + Math.exp(-50 * t) * 0.5;
      const bent = Math.sin(2 * Math.PI * 1500 * pitchBend * t);
      
      data[i] = (fundamental + harmonic + bent * 0.3) * envelope * 0.2;
    }

    return buffer;
  }

  private createEpicFinale(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const duration = 1.2;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Epic chord progression
    const chords = [
      { notes: [261.63, 329.63, 392], start: 0, duration: 0.3 },      // C Major
      { notes: [349.23, 440, 523.25], start: 0.3, duration: 0.3 },    // F Major
      { notes: [392, 493.88, 587.33], start: 0.6, duration: 0.3 },    // G Major
      { notes: [523.25, 659.25, 783.99, 1046.5], start: 0.9, duration: 0.3 }, // C Major (octave)
    ];

    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      let value = 0;
      
      for (const chord of chords) {
        if (t >= chord.start && t < chord.start + chord.duration) {
          const chordT = t - chord.start;
          const chordEnv = Math.min(1, chordT * 10) * Math.exp(-1 * chordT);
          
          for (const freq of chord.notes) {
            // 豊かなハーモニクス
            value += Math.sin(2 * Math.PI * freq * t) * chordEnv;
            value += Math.sin(2 * Math.PI * freq * 2 * t) * chordEnv * 0.4;
            value += Math.sin(2 * Math.PI * freq * 3 * t) * chordEnv * 0.2;
            value += Math.sin(2 * Math.PI * freq * 4 * t) * chordEnv * 0.1;
          }
        }
      }
      
      // 全体のエンベロープ
      const masterEnv = Math.min(1, t * 5) * (t < 1.0 ? 1 : Math.exp(-3 * (t - 1.0)));
      
      data[i] = value * masterEnv * 0.15 / 4; // Normalize by number of notes
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