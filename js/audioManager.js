// AudioManager - 音频管理器
class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.isMuted = false;

        // 音效限制机制（防止音效过于频繁）
        this.lastSoundTimes = {
            shoot: 0,
            explosion: 0,
            hit: 0
        };
        this.soundCooldowns = {
            shoot: 50,      // 射击音效最小间隔50ms
            explosion: 100, // 爆炸音效最小间隔100ms
            hit: 150        // 受伤音效最小间隔150ms
        };

        // 创建音频上下文
        this.audioContext = null;
        this.initAudioContext();
        
        console.log('音频管理器初始化完成');
    }

    // 初始化音频上下文
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('无法创建音频上下文:', error);
        }
    }

    // 创建程序化音效
    createBeepSound(frequency = 440, duration = 0.1, type = 'sine') {
        if (!this.audioContext) return null;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return oscillator;
    }

    // 播放射击音效
    playShootSound() {
        if (this.isMuted) return;

        const now = Date.now();
        if (now - this.lastSoundTimes.shoot < this.soundCooldowns.shoot) {
            return; // 音效冷却中
        }

        this.lastSoundTimes.shoot = now;
        this.createBeepSound(800, 0.1, 'square');
    }

    // 播放爆炸音效
    playExplosionSound() {
        if (this.isMuted) return;

        const now = Date.now();
        if (now - this.lastSoundTimes.explosion < this.soundCooldowns.explosion) {
            return; // 音效冷却中
        }

        this.lastSoundTimes.explosion = now;

        // 创建爆炸音效（白噪声）
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 0.2; // 缩短爆炸音效时长
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime); // 降低音量

        source.start();
    }

    // 播放受伤音效
    playHitSound() {
        if (this.isMuted) return;

        const now = Date.now();
        if (now - this.lastSoundTimes.hit < this.soundCooldowns.hit) {
            return; // 音效冷却中
        }

        this.lastSoundTimes.hit = now;
        this.createBeepSound(200, 0.15, 'sawtooth'); // 缩短受伤音效时长
    }

    // 播放道具拾取音效
    playPickupSound() {
        if (this.isMuted) return;
        // 创建上升音调的拾取音效
        this.createBeepSound(523, 0.15, 'sine'); // C5
        setTimeout(() => {
            if (!this.isMuted) {
                this.createBeepSound(659, 0.15, 'sine'); // E5
            }
        }, 50);
        setTimeout(() => {
            if (!this.isMuted) {
                this.createBeepSound(784, 0.2, 'sine'); // G5
            }
        }, 100);
    }

    // 播放背景音乐（程序化生成）
    startBackgroundMusic() {
        if (this.isMuted || !this.audioContext) return;
        
        this.stopBackgroundMusic();
        
        // 创建简单的背景音乐循环
        this.backgroundMusicInterval = setInterval(() => {
            if (!this.isMuted) {
                // 播放和弦进行
                this.playChord([261.63, 329.63, 392.00], 1.0); // C大调和弦
                setTimeout(() => {
                    if (!this.isMuted) {
                        this.playChord([293.66, 369.99, 440.00], 1.0); // D小调和弦
                    }
                }, 1000);
                setTimeout(() => {
                    if (!this.isMuted) {
                        this.playChord([246.94, 311.13, 369.99], 1.0); // B小调和弦
                    }
                }, 2000);
                setTimeout(() => {
                    if (!this.isMuted) {
                        this.playChord([261.63, 329.63, 392.00], 1.0); // 回到C大调
                    }
                }, 3000);
            }
        }, 4000);
    }

    // 播放和弦
    playChord(frequencies, duration) {
        if (!this.audioContext || this.isMuted) return;

        frequencies.forEach(freq => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.1, this.audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.05, this.audioContext.currentTime + duration * 0.8);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        });
    }

    // 停止背景音乐
    stopBackgroundMusic() {
        if (this.backgroundMusicInterval) {
            clearInterval(this.backgroundMusicInterval);
            this.backgroundMusicInterval = null;
        }
    }

    // 设置音量
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    // 静音/取消静音
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        } else {
            this.startBackgroundMusic();
        }
        return this.isMuted;
    }

    // 设置静音状态
    setMuted(muted) {
        this.isMuted = muted;
        if (this.isMuted) {
            this.stopBackgroundMusic();
        } else {
            this.startBackgroundMusic();
        }
    }

    // 销毁音频管理器
    destroy() {
        this.stopBackgroundMusic();
        if (this.audioContext) {
            this.audioContext.close();
        }
        console.log('音频管理器已销毁');
    }

    // 获取音频状态
    getStatus() {
        return {
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            isMuted: this.isMuted,
            hasAudioContext: !!this.audioContext
        };
    }
}