// LevelManager - 关卡管理器
class LevelManager {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 15; // 总共15关
        this.levelData = this.initializeLevelData();
        this.levelStartTime = 0;
        this.levelDuration = 60000; // 每关60秒
        this.enemiesKilled = 0;
        this.enemiesRequired = 0;
        this.isLevelComplete = false;
        this.isBossLevel = false;
        this.boss = null;
        
        console.log('关卡管理器初始化完成');
    }

    // 初始化关卡数据
    initializeLevelData() {
        const levels = {};
        
        for (let i = 1; i <= this.maxLevel; i++) {
            const isBoss = i % 3 === 0; // 每3关一个BOSS
            
            levels[i] = {
                name: isBoss ? `第${i}关 - BOSS战` : `第${i}关`,
                description: isBoss ? '击败强大的BOSS！' : `消灭${10 + i * 2}个敌机`,
                enemiesRequired: isBoss ? 1 : 10 + i * 2, // BOSS关只需击败1个BOSS
                duration: isBoss ? 120000 : 60000, // BOSS关2分钟
                enemySpawnRate: Math.max(500, 2000 - i * 100), // 敌机生成速度递增
                enemyTypes: this.getLevelEnemyTypes(i),
                difficulty: Math.min(10, Math.floor(i / 2) + 1),
                isBoss: isBoss,
                bossType: isBoss ? this.getBossType(i) : null,
                reward: {
                    score: isBoss ? 1000 : 500,
                    bonus: isBoss ? '生命值+1' : '分数奖励'
                }
            };
        }
        
        return levels;
    }

    // 获取关卡敌机类型
    getLevelEnemyTypes(level) {
        const baseTypes = ['basic'];
        
        // 逐步解锁更强的敌机类型
        if (level >= 2) baseTypes.push('fast');
        if (level >= 3) baseTypes.push('tough');
        if (level >= 4) baseTypes.push('shooter');
        if (level >= 6) baseTypes.push('zigzag');
        if (level >= 8) baseTypes.push('sine');
        if (level >= 10) baseTypes.push('laser');    // 激光敌机
        if (level >= 12) baseTypes.push('plasma');   // 等离子敌机
        if (level >= 14) baseTypes.push('stealth');  // 隐形敌机
        
        return baseTypes;
    }

    // 获取BOSS类型
    getBossType(level) {
        const bossTypes = ['destroyer', 'fortress', 'mothership', 'titan', 'ultimate'];
        const bossIndex = Math.floor((level - 1) / 3) % bossTypes.length;
        return bossTypes[bossIndex];
    }

    // 开始关卡
    startLevel(levelNumber = null) {
        if (levelNumber) {
            this.currentLevel = levelNumber;
        }
        
        const levelInfo = this.levelData[this.currentLevel];
        if (!levelInfo) {
            console.error('关卡不存在:', this.currentLevel);
            return false;
        }

        this.levelStartTime = Date.now();
        this.levelDuration = levelInfo.duration;
        this.enemiesKilled = 0;
        this.enemiesRequired = levelInfo.enemiesRequired;
        this.isLevelComplete = false;
        this.isBossLevel = levelInfo.isBoss;
        this.boss = null;
        this.preBossEnemiesSpawned = false; // 重置BOSS前小兵生成标志

        console.log(`开始${levelInfo.name} - 目标: ${levelInfo.description}`);
        console.log(`关卡开始时间: ${this.levelStartTime}, 需要击杀: ${this.enemiesRequired}`);
        return true;
    }

    // 更新关卡状态
    update(deltaTime, gameManager) {
        if (this.isLevelComplete) return;

        const currentTime = Date.now();
        const elapsed = currentTime - this.levelStartTime;

        // 确保关卡已经开始了至少1秒才检查完成条件
        if (elapsed < 1000) return;

        // 检查关卡完成条件
        if (this.isBossLevel) {
            // BOSS关：击败BOSS
            if (this.boss && !this.boss.isAlive()) {
                this.completeLevel(gameManager);
            } else if (!this.boss && elapsed > 2000 && elapsed < 3000) {
                // 2秒后开始生成BOSS前小兵
                if (!this.preBossEnemiesSpawned) {
                    this.spawnPreBossEnemies(gameManager);
                    this.preBossEnemiesSpawned = true;
                }
            } else if (!this.boss && elapsed > 8000) {
                // 8秒后生成BOSS（给玩家更多时间升级武器）
                this.spawnBoss(gameManager);
            }
        } else {
            // 普通关：只有击败足够敌机才能完成，移除时间限制
            if (this.enemiesKilled >= this.enemiesRequired) {
                console.log(`关卡完成条件满足: ${this.enemiesKilled}/${this.enemiesRequired}`);
                this.completeLevel(gameManager);
            }
        }
    }

    // 生成BOSS
    spawnBoss(gameManager) {
        const levelInfo = this.levelData[this.currentLevel];
        const bossX = GameConfig.CANVAS_WIDTH / 2 - 60; // BOSS比较大
        const bossY = -100;

        this.boss = this.createBoss(levelInfo.bossType, bossX, bossY);
        gameManager.addEnemy(this.boss);

        // 显示BOSS警告
        this.showBossWarning();

        console.log(`BOSS ${levelInfo.bossType} 出现！`);
    }

    // 生成BOSS前的小兵（帮助玩家升级武器）
    spawnPreBossEnemies(gameManager) {
        const enemyCount = 3 + Math.floor(this.currentLevel / 3); // 根据关卡增加小兵数量

        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => {
                if (gameManager.enemySpawner) {
                    // 强制生成基础敌机，确保掉落武器升级道具
                    const enemy = gameManager.enemySpawner.forceSpawn('basic');
                    if (enemy) {
                        // 增加道具掉落概率
                        enemy.dropChance = 0.8; // 80%概率掉落道具
                        console.log(`生成BOSS前小兵 ${i + 1}/${enemyCount}`);
                    }
                }
            }, i * 800); // 每0.8秒生成一个
        }

        console.log(`开始生成${enemyCount}个BOSS前小兵`);
    }

    // 显示BOSS警告
    showBossWarning() {
        const warning = document.createElement('div');
        warning.className = 'boss-warning';
        warning.textContent = '警告！BOSS出现！';
        document.body.appendChild(warning);
        
        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
        }, 2000);
    }

    // 创建BOSS
    createBoss(bossType, x, y) {
        let boss;
        
        switch (bossType) {
            case 'destroyer':
                boss = new BossDestroyer(x, y);
                break;
            case 'fortress':
                boss = new BossFortress(x, y);
                break;
            case 'mothership':
                boss = new BossMothership(x, y);
                break;
            case 'titan':
                boss = new BossTitan(x, y);
                break;
            case 'ultimate':
                boss = new BossUltimate(x, y);
                break;
            default:
                boss = new BossDestroyer(x, y);
        }
        
        return boss;
    }

    // 敌机被击毁
    onEnemyKilled(enemy) {
        if (enemy.hasTag('boss')) {
            // BOSS被击败
            this.enemiesKilled = this.enemiesRequired;
            console.log(`BOSS被击败！关卡完成条件满足`);
        } else {
            this.enemiesKilled++;
            console.log(`敌机被击毁，当前击杀数: ${this.enemiesKilled}/${this.enemiesRequired}`);
        }
    }

    // 完成关卡
    completeLevel(gameManager) {
        if (this.isLevelComplete) return;
        
        this.isLevelComplete = true;
        const levelInfo = this.levelData[this.currentLevel];
        
        // 给予奖励
        gameManager.addScore(levelInfo.reward.score);
        
        if (this.isBossLevel && gameManager.player) {
            // BOSS关奖励额外生命
            gameManager.player.heal(1);
            gameManager.lives = gameManager.player.getLives();
        }
        
        // 解锁下一关
        if (this.currentLevel < this.maxLevel) {
            this.unlockLevel(this.currentLevel + 1);
        }
        
        console.log(`${levelInfo.name}完成！获得${levelInfo.reward.score}分`);
        
        // 更新成就统计
        if (gameManager.achievementSystem) {
            gameManager.achievementSystem.updateStats('levelsCompleted', this.currentLevel, 'max');
            gameManager.achievementSystem.updateStats('maxLevel', this.currentLevel, 'max');
        }
        
        // 显示关卡完成界面
        this.showLevelComplete(gameManager);
    }

    // 显示关卡完成界面
    showLevelComplete(gameManager) {
        // 显示完成界面
        setTimeout(() => {
            if (this.currentLevel >= this.maxLevel) {
                // 游戏通关
                this.showGameComplete(gameManager);
            } else {
                // 进入下一关
                this.showNextLevelPrompt(gameManager);
            }
        }, 1000);
    }

    // 显示下一关提示
    showNextLevelPrompt(gameManager) {
        const nextLevel = this.currentLevel + 1;
        const nextLevelInfo = this.levelData[nextLevel];

        // 直接进入下一关，不显示弹窗
        console.log(`${this.levelData[this.currentLevel].name}完成！自动进入${nextLevelInfo.name}`);

        // 重置游戏对象但保持分数和生命值
        gameManager.resetForNextLevel();
        // 开始下一关（直接传入下一关的关卡号）
        this.startLevel(nextLevel);

        console.log(`成功进入第${this.currentLevel}关`);
    }

    // 显示游戏通关
    showGameComplete(gameManager) {
        alert('恭喜！您已通关所有关卡！\n您是真正的雷霆战机王牌飞行员！');
        gameManager.returnToLevelSelect();
    }

    // 进入下一关
    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.currentLevel++;
            return true;
        }
        return false;
    }

    // 获取当前关卡信息
    getCurrentLevelInfo() {
        return this.levelData[this.currentLevel];
    }

    // 获取关卡进度
    getLevelProgress() {
        if (this.isBossLevel) {
            return this.boss ? (this.boss.isAlive() ? 0 : 1) : 0;
        } else {
            return Math.min(1, this.enemiesKilled / this.enemiesRequired);
        }
    }

    // 获取剩余时间
    getRemainingTime() {
        const elapsed = Date.now() - this.levelStartTime;
        return Math.max(0, this.levelDuration - elapsed);
    }

    // 获取关卡状态文本
    getLevelStatusText() {
        const levelInfo = this.getCurrentLevelInfo();
        
        if (this.isBossLevel) {
            if (this.boss) {
                const healthPercent = Math.floor((this.boss.health / this.boss.maxHealth) * 100);
                return `BOSS血量: ${healthPercent}%`;
            } else {
                return 'BOSS即将出现...';
            }
        } else {
            return `敌机: ${this.enemiesKilled}/${this.enemiesRequired}`;
        }
    }

    // 重置关卡
    reset() {
        this.currentLevel = 1;
        this.levelStartTime = 0;
        this.enemiesKilled = 0;
        this.enemiesRequired = 0;
        this.isLevelComplete = false;
        this.isBossLevel = false;
        this.boss = null;
        console.log('关卡管理器已重置');
    }

    // 获取所有关卡信息（用于关卡选择界面）
    getAllLevels() {
        return this.levelData;
    }

    // 检查关卡是否解锁
    isLevelUnlocked(levelNumber) {
        // 所有关卡都解锁，让玩家自由选择
        return true;
    }

    // 从本地存储获取已解锁的关卡数
    getUnlockedLevelsFromStorage() {
        try {
            const saved = localStorage.getItem('thunderFighter_unlockedLevels');
            return saved ? parseInt(saved) : 1; // 默认只解锁第一关
        } catch (error) {
            console.error('读取解锁关卡失败:', error);
            return 1;
        }
    }

    // 解锁关卡到本地存储
    unlockLevel(levelNumber) {
        try {
            const currentUnlocked = this.getUnlockedLevelsFromStorage();
            const newUnlocked = Math.max(currentUnlocked, levelNumber);
            localStorage.setItem('thunderFighter_unlockedLevels', newUnlocked.toString());
            console.log(`关卡${levelNumber}已解锁`);
        } catch (error) {
            console.error('保存解锁关卡失败:', error);
        }
    }
}