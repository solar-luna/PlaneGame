// EndlessMode - 无尽模式管理器
class EndlessMode {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.isActive = false;
        
        // 无尽模式参数
        this.wave = 1;
        this.enemiesPerWave = 10;
        this.waveMultiplier = 1.2; // 每波敌机数量增长倍数
        this.difficultyMultiplier = 1.1; // 每波难度增长倍数
        this.scoreMultiplier = 1.0; // 分数倍数
        
        // 时间管理
        this.startTime = 0;
        this.survivalTime = 0;
        this.waveStartTime = 0;
        this.waveDuration = 30000; // 每波30秒
        
        // 敌机管理
        this.enemiesKilledThisWave = 0;
        this.enemiesRequiredThisWave = 0;
        this.totalEnemiesKilled = 0;
        
        // 难度递增参数
        this.baseEnemySpawnRate = 1500;
        this.minEnemySpawnRate = 200;
        this.baseEnemySpeed = 150;
        this.maxEnemySpeed = 400;
        
        // 道具掉落增强
        this.powerUpDropRate = 0.4; // 无尽模式道具掉落率更高
        
        // 波次奖励
        this.waveBonus = 1000;
        this.waveBonusMultiplier = 1.5;
        
        console.log('无尽模式管理器初始化完成');
    }

    // 开始无尽模式
    start() {
        if (this.isActive) {
            console.warn('无尽模式已经激活');
            return;
        }

        this.isActive = true;
        this.wave = 1;
        this.startTime = Date.now();
        this.survivalTime = 0;
        this.totalEnemiesKilled = 0;
        this.scoreMultiplier = 1.0;
        
        // 开始第一波
        this.startWave();
        
        // 显示无尽模式开始提示
        this.showModeStartNotification();
        
        console.log('无尽模式开始！');
    }

    // 停止无尽模式
    stop() {
        if (!this.isActive) return;

        this.isActive = false;
        
        // 显示无尽模式结束统计
        this.showEndlessStats();
        
        console.log('无尽模式结束');
    }

    // 开始新波次
    startWave() {
        this.waveStartTime = Date.now();
        this.enemiesKilledThisWave = 0;
        
        // 计算本波次敌机数量
        this.enemiesRequiredThisWave = Math.floor(this.enemiesPerWave * Math.pow(this.waveMultiplier, this.wave - 1));
        
        // 更新敌机生成器参数
        this.updateEnemySpawner();
        
        // 更新分数倍数
        this.scoreMultiplier = 1.0 + (this.wave - 1) * 0.1;
        
        // 显示波次开始提示
        this.showWaveStartNotification();
        
        console.log(`第${this.wave}波开始！目标击杀: ${this.enemiesRequiredThisWave}个敌机`);
    }

    // 更新敌机生成器参数
    updateEnemySpawner() {
        const spawner = this.gameManager.enemySpawner;
        
        // 计算新的生成间隔（越来越快）
        const newSpawnRate = Math.max(
            this.minEnemySpawnRate,
            this.baseEnemySpawnRate / Math.pow(this.difficultyMultiplier, this.wave - 1)
        );
        
        // 设置生成参数
        spawner.setSpawnInterval(newSpawnRate);
        spawner.setDifficultyLevel(Math.min(10, this.wave));
        
        // 增加敌机类型权重
        const weights = {
            basic: Math.max(10, 40 - this.wave * 2),
            fast: Math.min(30, 20 + this.wave),
            tough: Math.min(25, 15 + this.wave),
            shooter: Math.min(20, 15 + this.wave),
            zigzag: Math.min(10, 5 + Math.floor(this.wave / 2)),
            sine: Math.min(10, 5 + Math.floor(this.wave / 2))
        };
        
        spawner.setEnemyTypeWeights(weights);
    }

    // 更新无尽模式状态
    update(deltaTime) {
        if (!this.isActive) return;

        // 更新生存时间
        this.survivalTime = Date.now() - this.startTime;
        
        // 检查波次完成条件
        this.checkWaveCompletion();
        
        // 更新UI显示
        this.updateEndlessUI();
    }

    // 检查波次完成
    checkWaveCompletion() {
        const currentTime = Date.now();
        const waveElapsed = currentTime - this.waveStartTime;
        
        // 波次完成条件：击杀足够敌机或时间到
        if (this.enemiesKilledThisWave >= this.enemiesRequiredThisWave || waveElapsed >= this.waveDuration) {
            this.completeWave();
        }
    }

    // 完成当前波次
    completeWave() {
        // 给予波次奖励
        const bonus = Math.floor(this.waveBonus * Math.pow(this.waveBonusMultiplier, this.wave - 1));
        this.gameManager.addScore(bonus);
        
        // 显示波次完成提示
        this.showWaveCompleteNotification(bonus);
        
        // 进入下一波
        this.wave++;
        
        // 短暂延迟后开始下一波
        setTimeout(() => {
            if (this.isActive) {
                this.startWave();
            }
        }, 2000);
    }

    // 敌机被击杀回调
    onEnemyKilled(enemy) {
        if (!this.isActive) return;

        this.enemiesKilledThisWave++;
        this.totalEnemiesKilled++;
        
        // 应用分数倍数
        if (this.scoreMultiplier > 1) {
            const bonusScore = Math.floor(enemy.getScoreValue() * (this.scoreMultiplier - 1));
            this.gameManager.addScore(bonusScore);
        }
    }

    // 获取当前状态
    getStatus() {
        return {
            isActive: this.isActive,
            wave: this.wave,
            survivalTime: this.survivalTime,
            enemiesKilledThisWave: this.enemiesKilledThisWave,
            enemiesRequiredThisWave: this.enemiesRequiredThisWave,
            totalEnemiesKilled: this.totalEnemiesKilled,
            scoreMultiplier: this.scoreMultiplier,
            formattedSurvivalTime: this.formatTime(this.survivalTime)
        };
    }

    // 格式化时间
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${remainingSeconds}s`;
        }
    }

    // 更新无尽模式UI
    updateEndlessUI() {
        // 更新关卡显示为波次
        const currentLevelElement = document.getElementById('currentLevel');
        if (currentLevelElement) {
            currentLevelElement.textContent = `第${this.wave}波`;
        }

        // 更新状态显示
        const levelStatusElement = document.getElementById('levelStatus');
        if (levelStatusElement) {
            levelStatusElement.textContent = `敌机: ${this.enemiesKilledThisWave}/${this.enemiesRequiredThisWave}`;
        }

        // 更新时间显示为生存时间
        const levelTimeElement = document.getElementById('levelTime');
        if (levelTimeElement) {
            levelTimeElement.textContent = `生存: ${this.formatTime(this.survivalTime)}`;
        }
    }

    // 显示模式开始通知
    showModeStartNotification() {
        this.showNotification(
            '🚀 无尽模式开始！',
            '挑战你的极限，看看能坚持多久！\n敌机会越来越多，难度会越来越高！',
            '#4CAF50'
        );
    }

    // 显示波次开始通知
    showWaveStartNotification() {
        this.showNotification(
            `⚡ 第${this.wave}波开始！`,
            `目标击杀: ${this.enemiesRequiredThisWave}个敌机\n分数倍数: x${this.scoreMultiplier.toFixed(1)}`,
            '#2196F3'
        );
    }

    // 显示波次完成通知
    showWaveCompleteNotification(bonus) {
        this.showNotification(
            `✅ 第${this.wave}波完成！`,
            `波次奖励: +${bonus}分\n击杀: ${this.enemiesKilledThisWave}/${this.enemiesRequiredThisWave}`,
            '#FF9800'
        );
    }

    // 显示无尽模式统计
    showEndlessStats() {
        const stats = this.getStatus();
        const message = `
            🏆 无尽模式结束！
            
            📊 最终统计:
            • 生存时间: ${stats.formattedSurvivalTime}
            • 完成波次: ${this.wave - 1}波
            • 击杀敌机: ${stats.totalEnemiesKilled}个
            • 最高倍数: x${stats.scoreMultiplier.toFixed(1)}
            
            ${this.wave >= 10 ? '🎉 恭喜坚持到第10波！' : ''}
            ${this.wave >= 20 ? '👑 你是真正的无尽模式大师！' : ''}
        `;
        
        this.showNotification('无尽模式结束', message, '#9C27B0', 8000);
    }

    // 显示通知
    showNotification(title, message, color = '#4CAF50', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'endless-notification';
        notification.innerHTML = `
            <div class="endless-title">${title}</div>
            <div class="endless-message">${message}</div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 15%;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            min-width: 300px;
            text-align: center;
            font-family: Arial, sans-serif;
            animation: endlessSlideIn 0.5s ease-out;
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes endlessSlideIn {
                from { transform: translateX(-50%) translateY(-50px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            .endless-title {
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 10px;
            }
            .endless-message {
                font-size: 14px;
                line-height: 1.4;
                white-space: pre-line;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        // 点击关闭
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        });
        
        // 自动关闭
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, duration);
    }

    // 获取无尽模式记录
    getRecord() {
        return {
            wave: this.wave - 1,
            survivalTime: this.survivalTime,
            totalEnemiesKilled: this.totalEnemiesKilled,
            maxScoreMultiplier: this.scoreMultiplier,
            date: new Date()
        };
    }

    // 重置无尽模式
    reset() {
        this.isActive = false;
        this.wave = 1;
        this.startTime = 0;
        this.survivalTime = 0;
        this.totalEnemiesKilled = 0;
        this.enemiesKilledThisWave = 0;
        this.enemiesRequiredThisWave = 0;
        this.scoreMultiplier = 1.0;
    }

    // 销毁无尽模式管理器
    destroy() {
        this.stop();
        console.log('无尽模式管理器已销毁');
    }
}