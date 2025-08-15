// Achievement - 成就类
class Achievement {
    constructor(id, name, description, condition, reward = 0) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.condition = condition; // 完成条件函数
        this.reward = reward; // 奖励分数
        this.unlocked = false;
        this.progress = 0;
        this.maxProgress = condition.target || 1;
        this.unlockedTime = null;
        this.category = condition.category || 'general';
    }

    // 检查成就是否完成
    checkProgress(gameStats) {
        if (this.unlocked) return false;

        const newProgress = this.condition.check(gameStats);
        const progressChanged = newProgress !== this.progress;
        this.progress = newProgress;

        // 检查是否达成
        if (this.progress >= this.maxProgress && !this.unlocked) {
            this.unlock();
            return true;
        }

        return false; // 只有解锁时才返回true，避免频繁触发
    }

    // 解锁成就
    unlock() {
        if (this.unlocked) return;

        this.unlocked = true;
        this.unlockedTime = Date.now();
        this.progress = this.maxProgress;
        
        console.log(`成就解锁: ${this.name}`);
    }

    // 获取进度百分比
    getProgressPercent() {
        return Math.min(100, (this.progress / this.maxProgress) * 100);
    }

    // 获取成就数据
    getData() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            unlocked: this.unlocked,
            progress: this.progress,
            maxProgress: this.maxProgress,
            progressPercent: this.getProgressPercent(),
            reward: this.reward,
            unlockedTime: this.unlockedTime,
            category: this.category
        };
    }
}

// AchievementManager - 成就管理器
class AchievementManager {
    constructor() {
        this.achievements = new Map();
        this.gameStats = {
            score: 0,
            enemiesKilled: 0,
            levelsCompleted: 0,
            bossesKilled: 0,
            powerUpsCollected: 0,
            weaponUpgrades: 0,
            survivalTime: 0,
            maxCombo: 0,
            currentCombo: 0,
            totalPlayTime: 0,
            gamesPlayed: 0,
            perfectLevels: 0, // 无伤通关的关卡数
            maxLevel: 1
        };

        this.listeners = [];
        this.storageKey = 'thunderFighter_achievements';

        // 防抖机制
        this.lastCheckTime = 0;
        this.checkCooldown = 100; // 100ms冷却时间

        // 初始化成就
        this.initializeAchievements();

        // 加载保存的数据
        this.loadData();

        console.log('成就系统初始化完成');
    }

    // 初始化所有成就
    initializeAchievements() {
        const achievements = [
            // 基础成就
            new Achievement('first_kill', '初次击杀', '击毁第一个敌机', {
                check: (stats) => stats.enemiesKilled,
                target: 1,
                category: 'basic'
            }, 100),

            new Achievement('rookie_pilot', '新手飞行员', '完成第1关', {
                check: (stats) => stats.levelsCompleted,
                target: 1,
                category: 'basic'
            }, 200),

            new Achievement('veteran_pilot', '老兵飞行员', '完成第5关', {
                check: (stats) => stats.levelsCompleted,
                target: 5,
                category: 'basic'
            }, 500),

            new Achievement('ace_pilot', '王牌飞行员', '完成第10关', {
                check: (stats) => stats.levelsCompleted,
                target: 10,
                category: 'basic'
            }, 1000),

            // 击杀成就
            new Achievement('enemy_hunter', '敌机猎手', '击毁100个敌机', {
                check: (stats) => stats.enemiesKilled,
                target: 100,
                category: 'combat'
            }, 500),

            new Achievement('destroyer', '毁灭者', '击毁500个敌机', {
                check: (stats) => stats.enemiesKilled,
                target: 500,
                category: 'combat'
            }, 1500),

            new Achievement('annihilator', '歼灭者', '击毁1000个敌机', {
                check: (stats) => stats.enemiesKilled,
                target: 1000,
                category: 'combat'
            }, 3000),

            // BOSS成就
            new Achievement('boss_slayer', 'BOSS杀手', '击败第一个BOSS', {
                check: (stats) => stats.bossesKilled,
                target: 1,
                category: 'boss'
            }, 300),

            new Achievement('boss_master', 'BOSS大师', '击败5个BOSS', {
                check: (stats) => stats.bossesKilled,
                target: 5,
                category: 'boss'
            }, 1000),

            // 分数成就
            new Achievement('high_scorer', '高分玩家', '获得10000分', {
                check: (stats) => stats.score,
                target: 10000,
                category: 'score'
            }, 500),

            new Achievement('score_master', '分数大师', '获得50000分', {
                check: (stats) => stats.score,
                target: 50000,
                category: 'score'
            }, 2000),

            // 道具成就
            new Achievement('collector', '收集家', '收集50个道具', {
                check: (stats) => stats.powerUpsCollected,
                target: 50,
                category: 'items'
            }, 300),

            new Achievement('weapon_expert', '武器专家', '武器升级20次', {
                check: (stats) => stats.weaponUpgrades,
                target: 20,
                category: 'items'
            }, 400),

            // 连击成就
            new Achievement('combo_starter', '连击新手', '达成10连击', {
                check: (stats) => stats.maxCombo,
                target: 10,
                category: 'combo'
            }, 200),

            new Achievement('combo_master', '连击大师', '达成50连击', {
                check: (stats) => stats.maxCombo,
                target: 50,
                category: 'combo'
            }, 800),

            // 特殊成就
            new Achievement('perfectionist', '完美主义者', '无伤通关3个关卡', {
                check: (stats) => stats.perfectLevels,
                target: 3,
                category: 'special'
            }, 1000),

            new Achievement('survivor', '生存专家', '单局生存300秒', {
                check: (stats) => stats.survivalTime,
                target: 300000, // 5分钟，以毫秒为单位
                category: 'special'
            }, 600),

            new Achievement('dedicated', '专注玩家', '游戏总时长达到1小时', {
                check: (stats) => stats.totalPlayTime,
                target: 3600000, // 1小时，以毫秒为单位
                category: 'special'
            }, 500)
        ];

        // 添加成就到管理器
        achievements.forEach(achievement => {
            this.achievements.set(achievement.id, achievement);
        });
    }

    // 更新游戏统计
    updateStats(statName, value, operation = 'set') {
        // 记录旧值，用于判断是否有变化
        const oldValue = this.gameStats[statName];

        switch (operation) {
            case 'set':
                this.gameStats[statName] = value;
                break;
            case 'add':
                this.gameStats[statName] = (this.gameStats[statName] || 0) + value;
                break;
            case 'max':
                this.gameStats[statName] = Math.max(this.gameStats[statName] || 0, value);
                break;
        }

        // 只有当值发生变化时才检查成就
        if (this.gameStats[statName] !== oldValue) {
            // 只检查与该统计相关的成就
            this.checkAchievementsForStat(statName);
        }
    }

    // 检查与特定统计相关的成就
    checkAchievementsForStat(statName) {
        // 防抖检查
        const currentTime = Date.now();
        if (currentTime - this.lastCheckTime < this.checkCooldown) {
            return;
        }
        this.lastCheckTime = currentTime;

        // 映射统计名称到相关的成就类别
        const statToCategory = {
            'enemiesKilled': ['basic', 'combat'],
            'levelsCompleted': ['basic'],
            'bossesKilled': ['boss'],
            'score': ['score'],
            'powerUpsCollected': ['items'],
            'weaponUpgrades': ['items'],
            'maxCombo': ['combo'],
            'perfectLevels': ['special'],
            'survivalTime': ['special'],
            'totalPlayTime': ['special'],
            'maxLevel': ['basic']
        };

        // 获取相关类别
        const categories = statToCategory[statName] || [];

        // 如果没有找到相关类别，检查所有成就
        if (categories.length === 0) {
            this.checkAchievements();
            return;
        }

        // 只检查相关类别的成就
        for (const achievement of this.achievements.values()) {
            if (!achievement.unlocked && categories.includes(achievement.category)) {
                if (achievement.checkProgress(this.gameStats)) {
                    this.onAchievementUnlocked(achievement);
                }
            }
        }
    }

    // 检查所有成就
    checkAchievements() {
        for (const achievement of this.achievements.values()) {
            if (!achievement.unlocked && achievement.checkProgress(this.gameStats)) {
                this.onAchievementUnlocked(achievement);
            }
        }
    }

    // 成就解锁回调
    onAchievementUnlocked(achievement) {
        // 给予奖励
        if (achievement.reward > 0 && window.gameManager) {
            window.gameManager.addScore(achievement.reward);
        }

        // 显示成就通知
        this.showAchievementNotification(achievement);

        // 通知监听器
        this.listeners.forEach(listener => {
            try {
                listener(achievement);
            } catch (error) {
                console.error('成就监听器执行错误:', error);
            }
        });

        // 保存数据
        this.saveData();
    }

    // 显示成就通知
    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">成就解锁！</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                ${achievement.reward > 0 ? `<div class="achievement-reward">+${achievement.reward}分</div>` : ''}
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 10%;
            right: 20px;
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #333;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
            z-index: 1000;
            min-width: 300px;
            animation: slideInRight 0.5s ease-out, slideOutRight 0.5s ease-in 4.5s;
            display: flex;
            align-items: center;
            font-family: Arial, sans-serif;
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .achievement-icon {
                font-size: 24px;
                margin-right: 12px;
            }
            .achievement-title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 4px;
            }
            .achievement-name {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 2px;
            }
            .achievement-desc {
                font-size: 12px;
                opacity: 0.8;
                margin-bottom: 4px;
            }
            .achievement-reward {
                font-size: 12px;
                color: #ff6600;
                font-weight: bold;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 5000);
    }

    // 添加成就监听器
    addListener(listener) {
        if (typeof listener === 'function') {
            this.listeners.push(listener);
        }
    }

    // 移除成就监听器
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // 获取成就列表
    getAchievements() {
        return Array.from(this.achievements.values()).map(achievement => achievement.getData());
    }

    // 获取已解锁的成就
    getUnlockedAchievements() {
        return this.getAchievements().filter(achievement => achievement.unlocked);
    }

    // 获取成就统计
    getStats() {
        const total = this.achievements.size;
        const unlocked = this.getUnlockedAchievements().length;
        const totalReward = this.getUnlockedAchievements().reduce((sum, ach) => sum + ach.reward, 0);

        return {
            total,
            unlocked,
            progress: total > 0 ? (unlocked / total) * 100 : 0,
            totalReward,
            gameStats: { ...this.gameStats }
        };
    }

    // 保存数据到本地存储
    saveData() {
        try {
            const data = {
                achievements: {},
                gameStats: this.gameStats
            };

            // 保存成就数据
            for (const [id, achievement] of this.achievements) {
                data.achievements[id] = {
                    unlocked: achievement.unlocked,
                    progress: achievement.progress,
                    unlockedTime: achievement.unlockedTime
                };
            }

            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('保存成就数据失败:', error);
        }
    }

    // 从本地存储加载数据
    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return;

            const parsed = JSON.parse(data);

            // 加载游戏统计
            if (parsed.gameStats) {
                this.gameStats = { ...this.gameStats, ...parsed.gameStats };
            }

            // 加载成就数据
            if (parsed.achievements) {
                for (const [id, achievementData] of Object.entries(parsed.achievements)) {
                    const achievement = this.achievements.get(id);
                    if (achievement) {
                        achievement.unlocked = achievementData.unlocked || false;
                        achievement.progress = achievementData.progress || 0;
                        achievement.unlockedTime = achievementData.unlockedTime || null;
                    }
                }
            }

            console.log('成就数据加载完成');
        } catch (error) {
            console.error('加载成就数据失败:', error);
        }
    }

    // 重置所有成就（调试用）
    resetAchievements() {
        for (const achievement of this.achievements.values()) {
            achievement.unlocked = false;
            achievement.progress = 0;
            achievement.unlockedTime = null;
        }

        this.gameStats = {
            score: 0,
            enemiesKilled: 0,
            levelsCompleted: 0,
            bossesKilled: 0,
            powerUpsCollected: 0,
            weaponUpgrades: 0,
            survivalTime: 0,
            maxCombo: 0,
            currentCombo: 0,
            totalPlayTime: 0,
            gamesPlayed: 0,
            perfectLevels: 0,
            maxLevel: 1
        };

        this.saveData();
        console.log('所有成就已重置');
    }

    // 销毁成就管理器
    destroy() {
        this.saveData();
        this.listeners = [];
        console.log('成就系统已销毁');
    }
}