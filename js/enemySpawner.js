// EnemySpawner - 敌机生成器类
class EnemySpawner {
    constructor() {
        // 生成参数
        this.spawnInterval = GameConfig.ENEMY_SPAWN_INTERVAL;
        this.lastSpawnTime = 0;
        this.isActive = false;

        // 生成位置配置
        this.spawnY = -GameConfig.ENEMY_HEIGHT;
        this.spawnMargin = 20; // 距离屏幕边缘的最小距离

        // 当前关卡信息
        this.currentLevel = 1;
        this.levelManager = null;

        // 基础敌机类型权重配置
        this.baseEnemyTypeWeights = {
            basic: 40,      // 基础敌机 40%
            fast: 20,       // 快速敌机 20%
            tough: 15,      // 坚固敌机 15%
            shooter: 15,    // 射击敌机 15%
            zigzag: 5,      // 锯齿敌机 5%
            sine: 5         // 正弦敌机 5%
        };

        // 当前敌机类型权重（会根据关卡调整）
        this.enemyTypeWeights = { ...this.baseEnemyTypeWeights };

        // 难度调节
        this.difficultyLevel = 1;
        this.maxDifficultyLevel = 10;
        this.difficultyIncreaseInterval = 30000; // 30秒增加一次难度
        this.lastDifficultyIncreaseTime = 0;

        // 对象池管理
        this.enemyPool = [];
        this.maxPoolSize = 50;
        this.activeEnemies = [];

        // 统计信息
        this.totalSpawned = 0;
        this.spawnStats = {};

        console.log('敌机生成器初始化完成');
    }

    // 开始生成敌机
    start() {
        this.isActive = true;
        this.lastSpawnTime = Date.now();
        this.lastDifficultyIncreaseTime = Date.now();
        console.log('敌机生成器启动');
    }

    // 停止生成敌机
    stop() {
        this.isActive = false;
        console.log('敌机生成器停止');
    }

    // 更新敌机生成器
    update(deltaTime) {
        if (!this.isActive) return;

        const currentTime = Date.now();
        
        // 更新难度
        this.updateDifficulty(currentTime);
        
        // 检查是否需要生成敌机
        if (currentTime - this.lastSpawnTime >= this.getAdjustedSpawnInterval()) {
            this.spawnEnemy();
            this.lastSpawnTime = currentTime;
        }
        
        // 更新活跃敌机列表
        this.updateActiveEnemies();
    }

    // 生成敌机
    spawnEnemy() {
        // 获取生成位置
        const spawnX = this.getRandomSpawnX();
        
        // 选择敌机类型
        const enemyType = this.selectEnemyType();
        
        // 创建敌机
        const enemy = this.createEnemyByType(enemyType, spawnX, this.spawnY);
        
        if (enemy) {
            // 根据难度调整敌机属性
            this.adjustEnemyForDifficulty(enemy);
            
            // 添加到活跃敌机列表
            this.activeEnemies.push(enemy);
            
            // 更新统计
            this.totalSpawned++;
            this.spawnStats[enemyType] = (this.spawnStats[enemyType] || 0) + 1;
            
            console.log(`生成敌机: ${enemyType} at (${spawnX}, ${this.spawnY})`);
            return enemy;
        }
        
        return null;
    }

    // 获取随机生成X坐标
    getRandomSpawnX() {
        const minX = this.spawnMargin;
        const maxX = GameConfig.CANVAS_WIDTH - GameConfig.ENEMY_WIDTH - this.spawnMargin;
        return Math.random() * (maxX - minX) + minX;
    }

    // 选择敌机类型
    selectEnemyType() {
        // 根据关卡调整敌机类型权重
        this.updateEnemyTypesForLevel();

        const totalWeight = Object.values(this.enemyTypeWeights).reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (const [type, weight] of Object.entries(this.enemyTypeWeights)) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }

        return 'basic'; // 默认返回基础敌机
    }

    // 根据关卡更新敌机类型权重
    updateEnemyTypesForLevel() {
        // 重置权重
        this.enemyTypeWeights = { ...this.baseEnemyTypeWeights };

        // 根据关卡逐步引入新敌机类型
        if (this.currentLevel >= 2) {
            // 第2关开始增加快速敌机
            this.enemyTypeWeights.fast = 25;
        }

        if (this.currentLevel >= 3) {
            // 第3关开始增加坚固敌机
            this.enemyTypeWeights.tough = 20;
        }

        if (this.currentLevel >= 4) {
            // 第4关开始增加射击敌机
            this.enemyTypeWeights.shooter = 20;
            this.enemyTypeWeights.basic = 30; // 减少基础敌机
        }

        if (this.currentLevel >= 6) {
            // 第6关开始增加锯齿敌机
            this.enemyTypeWeights.zigzag = 10;
            this.enemyTypeWeights.sine = 10;
        }

        if (this.currentLevel >= 8) {
            // 第8关开始增加正弦敌机
            this.enemyTypeWeights.sine = 15;
        }

        if (this.currentLevel >= 10) {
            // 第10关开始引入激光敌机
            this.enemyTypeWeights.laser = 8;
            this.enemyTypeWeights.basic = 25; // 进一步减少基础敌机
        }

        if (this.currentLevel >= 12) {
            // 第12关开始引入等离子敌机
            this.enemyTypeWeights.plasma = 6;
            this.enemyTypeWeights.laser = 12;
        }

        if (this.currentLevel >= 14) {
            // 第14关开始引入隐形敌机
            this.enemyTypeWeights.stealth = 5;
            this.enemyTypeWeights.plasma = 10;
            this.enemyTypeWeights.basic = 15; // 大幅减少基础敌机
        }

        // 高级关卡增加高级敌机比例
        if (this.currentLevel >= 15) {
            this.enemyTypeWeights.laser = 15;
            this.enemyTypeWeights.plasma = 12;
            this.enemyTypeWeights.stealth = 8;
            this.enemyTypeWeights.basic = 10;
        }

        // 超高级关卡引入终极敌机
        if (this.currentLevel >= 16) {
            this.enemyTypeWeights.quantum = 4;
            this.enemyTypeWeights.laser = 12;
            this.enemyTypeWeights.plasma = 10;
            this.enemyTypeWeights.stealth = 6;
            this.enemyTypeWeights.basic = 8;
        }

        if (this.currentLevel >= 18) {
            this.enemyTypeWeights.void = 3;
            this.enemyTypeWeights.quantum = 6;
            this.enemyTypeWeights.crystal = 4;
            this.enemyTypeWeights.basic = 5;
        }

        if (this.currentLevel >= 20) {
            // 终极关卡配置
            this.enemyTypeWeights.void = 5;
            this.enemyTypeWeights.quantum = 8;
            this.enemyTypeWeights.crystal = 6;
            this.enemyTypeWeights.laser = 10;
            this.enemyTypeWeights.plasma = 8;
            this.enemyTypeWeights.stealth = 5;
            this.enemyTypeWeights.basic = 3;
        }
    }

    // 根据类型创建敌机
    createEnemyByType(type, x, y) {
        switch (type) {
            case 'basic':
                return Enemy.createBasicEnemy(x, y);
            case 'fast':
                return Enemy.createFastEnemy(x, y);
            case 'tough':
                return Enemy.createToughEnemy(x, y);
            case 'shooter':
                return Enemy.createShooterEnemy(x, y);
            case 'zigzag':
                return Enemy.createZigzagEnemy(x, y);
            case 'sine':
                return Enemy.createSineEnemy(x, y);
            case 'laser':
                return Enemy.createLaserEnemy(x, y);
            case 'plasma':
                return Enemy.createPlasmaEnemy(x, y);
            case 'stealth':
                return Enemy.createStealthEnemy(x, y);
            case 'quantum':
                return Enemy.createQuantumEnemy(x, y);
            case 'void':
                return Enemy.createVoidEnemy(x, y);
            case 'crystal':
                return Enemy.createCrystalEnemy(x, y);
            default:
                return Enemy.createBasicEnemy(x, y);
        }
    }

    // 根据难度调整敌机属性
    adjustEnemyForDifficulty(enemy) {
        const difficultyMultiplier = 1 + (this.difficultyLevel - 1) * 0.1;
        
        // 增加速度
        const newSpeed = enemy.speed * difficultyMultiplier;
        enemy.setSpeed(newSpeed);
        
        // 增加分数值
        const newScore = Math.floor(enemy.getScoreValue() * difficultyMultiplier);
        enemy.setScoreValue(newScore);
        
        // 高难度时增加生命值
        if (this.difficultyLevel >= 5) {
            const healthBonus = Math.floor(this.difficultyLevel / 5);
            enemy.setHealth(enemy.health + healthBonus);
        }
        
        // 高难度时增加射击敌机的比例
        if (this.difficultyLevel >= 3 && Math.random() < 0.3) {
            enemy.setCanShoot(true, 1500 - this.difficultyLevel * 100);
        }
    }

    // 更新难度
    updateDifficulty(currentTime) {
        if (currentTime - this.lastDifficultyIncreaseTime >= this.difficultyIncreaseInterval) {
            if (this.difficultyLevel < this.maxDifficultyLevel) {
                this.difficultyLevel++;
                this.lastDifficultyIncreaseTime = currentTime;
                
                // 调整生成间隔
                this.spawnInterval = Math.max(500, this.spawnInterval * 0.9);
                
                console.log(`难度提升到: ${this.difficultyLevel}, 生成间隔: ${this.spawnInterval}ms`);
            }
        }
    }

    // 获取调整后的生成间隔
    getAdjustedSpawnInterval() {
        return this.spawnInterval;
    }

    // 更新活跃敌机列表
    updateActiveEnemies() {
        this.activeEnemies = this.activeEnemies.filter(enemy => enemy && enemy.isAlive());
    }

    // 设置敌机类型权重
    setEnemyTypeWeights(weights) {
        this.enemyTypeWeights = { ...this.enemyTypeWeights, ...weights };
    }

    // 设置生成间隔
    setSpawnInterval(interval) {
        this.spawnInterval = Math.max(100, interval);
    }

    // 设置难度等级
    setDifficultyLevel(level) {
        this.difficultyLevel = Math.max(1, Math.min(this.maxDifficultyLevel, level));
    }

    // 获取活跃敌机列表
    getActiveEnemies() {
        return this.activeEnemies.slice(); // 返回副本
    }

    // 获取活跃敌机数量
    getActiveEnemyCount() {
        return this.activeEnemies.length;
    }

    // 清理所有敌机
    clearAllEnemies() {
        this.activeEnemies.forEach(enemy => {
            if (enemy && enemy.isAlive()) {
                enemy.destroy();
            }
        });
        this.activeEnemies = [];
    }

    // 重置生成器
    reset() {
        this.stop();
        this.clearAllEnemies();
        this.difficultyLevel = 1;
        this.spawnInterval = GameConfig.ENEMY_SPAWN_INTERVAL;
        this.totalSpawned = 0;
        this.spawnStats = {};
        this.lastSpawnTime = 0;
        this.lastDifficultyIncreaseTime = 0;
        console.log('敌机生成器已重置');
    }

    // 设置当前关卡
    setCurrentLevel(level) {
        this.currentLevel = level;
        // 更新敌机类型权重
        this.updateEnemyTypesForLevel();
        console.log(`敌机生成器设置为第${level}关`);
    }

    // 设置关卡管理器
    setLevelManager(levelManager) {
        this.levelManager = levelManager;
    }

    // 获取统计信息
    getStats() {
        return {
            isActive: this.isActive,
            difficultyLevel: this.difficultyLevel,
            spawnInterval: this.spawnInterval,
            totalSpawned: this.totalSpawned,
            activeCount: this.getActiveEnemyCount(),
            spawnStats: { ...this.spawnStats }
        };
    }

    // 设置生成位置边距
    setSpawnMargin(margin) {
        this.spawnMargin = Math.max(0, margin);
    }

    // 批量生成敌机（用于特殊事件）
    spawnWave(count, enemyType = null) {
        const enemies = [];
        
        for (let i = 0; i < count; i++) {
            const spawnX = this.getRandomSpawnX();
            const spawnY = this.spawnY - i * (GameConfig.ENEMY_HEIGHT + 20); // 错开Y位置
            
            const type = enemyType || this.selectEnemyType();
            const enemy = this.createEnemyByType(type, spawnX, spawnY);
            
            if (enemy) {
                this.adjustEnemyForDifficulty(enemy);
                this.activeEnemies.push(enemy);
                enemies.push(enemy);
                
                this.totalSpawned++;
                this.spawnStats[type] = (this.spawnStats[type] || 0) + 1;
            }
        }
        
        console.log(`生成敌机波次: ${count}个敌机`);
        return enemies;
    }

    // 检查是否可以生成敌机（避免屏幕过于拥挤）
    canSpawn() {
        const maxEnemiesOnScreen = 8 + this.difficultyLevel;
        return this.getActiveEnemyCount() < maxEnemiesOnScreen;
    }

    // 强制生成特定类型的敌机
    forceSpawn(enemyType, x = null, y = null) {
        const spawnX = x !== null ? x : this.getRandomSpawnX();
        const spawnY = y !== null ? y : this.spawnY;
        
        const enemy = this.createEnemyByType(enemyType, spawnX, spawnY);
        
        if (enemy) {
            this.adjustEnemyForDifficulty(enemy);
            this.activeEnemies.push(enemy);
            
            this.totalSpawned++;
            this.spawnStats[enemyType] = (this.spawnStats[enemyType] || 0) + 1;
            
            return enemy;
        }
        
        return null;
    }

    // 调试信息
    debugPrint() {
        console.log('=== 敌机生成器状态 ===');
        console.log('激活状态:', this.isActive);
        console.log('难度等级:', this.difficultyLevel);
        console.log('生成间隔:', this.spawnInterval);
        console.log('活跃敌机数:', this.getActiveEnemyCount());
        console.log('总生成数:', this.totalSpawned);
        console.log('生成统计:', this.spawnStats);
        console.log('==================');
    }
}