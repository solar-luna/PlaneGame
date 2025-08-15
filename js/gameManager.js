// GameManager - 游戏管理器类
class GameManager {
    constructor(canvas, ctx) {
        // Canvas相关
        this.canvas = canvas;
        this.ctx = ctx;
        
        // 游戏状态管理
        this.gameState = new GameState();
        
        // 游戏对象管理
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.gameObjects = [];
        
        // 输入处理
        this.inputHandler = new InputHandler();
        
        // 音频管理
        this.audioManager = new AudioManager();
        
        // 游戏数据
        this.score = 0;
        this.lives = GameConfig.PLAYER_LIVES;
        this.level = 1;
        
        // 分数加倍系统
        this.scoreMultiplier = 1;
        this.scoreMultiplierTime = 0;
        this.scoreMultiplierDuration = 0;
        
        // 时间管理
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateTime = 0;
        
        // 游戏循环控制
        this.isRunning = false;
        this.animationFrameId = null;
        
        // 敌机生成器
        this.enemySpawner = new EnemySpawner();
        
        // 关卡管理器
        this.levelManager = new LevelManager();
        
        // 粒子系统
        this.particleSystem = new ParticleSystem();
        
        // 成就系统
        this.achievementSystem = new AchievementManager();
        
        // 排行榜系统
        this.scoreManager = new ScoreManager();
        
        // 无尽模式
        this.endlessMode = new EndlessMode(this);
        
        // 性能监控
        this.performanceStats = {
            updateTime: 0,
            renderTime: 0,
            totalObjects: 0
        };
        
        // 初始化
        this.init();
    }

    // 初始化游戏管理器
    init() {
        try {
            // 创建玩家
            this.createPlayer();

            // 设置敌机生成器的关卡管理器
            this.enemySpawner.setLevelManager(this.levelManager);

            // 绑定状态变化监听器
            this.gameState.addStateChangeListener((from, to) => {
                this.onStateChange(from, to);
            });

            // 绑定全局事件
            this.bindGlobalEvents();

            console.log('游戏管理器初始化完成');
            return true;
        } catch (error) {
            console.error('游戏管理器初始化失败:', error);
            return false;
        }
    }

    // 创建玩家
    createPlayer() {
        const playerX = GameConfig.CANVAS_WIDTH / 2 - GameConfig.PLAYER_WIDTH / 2;
        const playerY = GameConfig.CANVAS_HEIGHT - GameConfig.PLAYER_HEIGHT - 50;
        
        this.player = new Player(playerX, playerY);
        this.addGameObject(this.player);
        
        console.log('玩家创建完成');
    }

    // 开始游戏
    start() {
        if (this.isRunning) {
            console.warn('游戏已经在运行中');
            return;
        }

        // 重置游戏数据
        this.resetGameData();
        
        // 设置游戏状态
        this.gameState.startGame();
        
        // 开始游戏循环
        this.startGameLoop();
        
        // 初始化星空背景粒子
        this.particleSystem.createStarField(GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT, 30);
        
        // 更新成就统计 - 游戏开始
        this.achievementSystem.updateStats('gamesPlayed', 1, 'add');
        this.gameStartTime = Date.now();
        
        console.log('游戏开始');
    }

    // 暂停游戏
    pause() {
        if (!this.gameState.canPause()) {
            console.warn('当前状态无法暂停');
            return;
        }

        this.gameState.pauseGame();
        console.log('游戏暂停');
    }

    // 恢复游戏
    resume() {
        if (!this.gameState.canResume()) {
            console.warn('当前状态无法恢复');
            return;
        }

        this.gameState.resumeGame();
        console.log('游戏恢复');
    }

    // 重新开始游戏
    restart() {
        this.stop();
        this.start();
        console.log('游戏重新开始');
    }

    // 停止游戏
    stop() {
        this.stopGameLoop();
        this.gameState.returnToMenu();
        console.log('游戏停止');
    }

    // 结束游戏
    gameOver() {
        this.stopGameLoop();
        this.gameState.endGame(this.score);
        
        // 更新成就统计 - 游戏结束
        if (this.gameStartTime) {
            const survivalTime = Date.now() - this.gameStartTime;
            this.achievementSystem.updateStats('survivalTime', survivalTime, 'max');
            this.achievementSystem.updateStats('totalPlayTime', survivalTime, 'add');
            
            // 添加分数记录到排行榜
            const enemiesKilled = this.achievementSystem.gameStats.enemiesKilled || 0;
            const recordInfo = this.scoreManager.addScore(
                this.score,
                this.levelManager.currentLevel,
                survivalTime,
                enemiesKilled
            );
            
            // 显示新记录通知
            this.scoreManager.showNewRecordNotification(recordInfo);
        }
        
        // 通知主游戏类
        if (window.game && typeof window.game.onGameOver === 'function') {
            window.game.onGameOver(this.score);
        }
        
        console.log('游戏结束，最终分数:', this.score);
    }

    // 开始游戏循环
    startGameLoop() {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    // 停止游戏循环
    stopGameLoop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    // 主游戏循环
    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // 转换为秒
        this.lastFrameTime = currentTime;
        
        // 限制deltaTime防止大跳跃
        this.deltaTime = Math.min(this.deltaTime, 1/30); // 最大30FPS
        
        // 更新游戏时间
        this.gameTime += this.deltaTime;
        this.frameCount++;
        
        // 更新FPS
        this.updateFPS(currentTime);
        
        // 游戏更新和渲染
        if (this.gameState.isPlaying()) {
            const updateStart = performance.now();
            this.update(this.deltaTime);
            this.performanceStats.updateTime = performance.now() - updateStart;
        }
        
        const renderStart = performance.now();
        this.render();
        this.performanceStats.renderTime = performance.now() - renderStart;
        
        // 请求下一帧
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    // 更新游戏逻辑
    update(deltaTime) {
        // 更新输入
        this.updateInput();
        
        // 更新关卡管理器
        this.levelManager.update(deltaTime, this);
        
        // 更新无尽模式
        if (this.endlessMode.isActive) {
            this.endlessMode.update(deltaTime);
        }
        
        // 更新游戏对象
        this.updateGameObjects(deltaTime);
        
        // 更新粒子系统
        this.particleSystem.update(deltaTime);
        
        // 生成敌机
        this.updateEnemySpawning(deltaTime);
        
        // 碰撞检测
        this.updateCollisions();
        
        // 清理无效对象
        this.cleanupObjects();
        
        // 更新分数加倍效果
        this.updateScoreMultiplier(deltaTime);
        
        // 更新UI
        this.updateUI();
        
        // 检查游戏结束条件
        this.checkGameOverConditions();
    }

    // 更新输入处理
    updateInput() {
        this.inputHandler.update();
        
        if (this.player && this.player.isAlive()) {
            // 获取移动方向
            const moveDirection = this.inputHandler.getMoveDirection();
            this.player.setMoveDirection(moveDirection);
        }
        
        // 检查暂停键
        if (this.inputHandler.isPausePressed()) {
            if (this.gameState.canPause()) {
                this.pause();
            } else if (this.gameState.canResume()) {
                this.resume();
            }
        }
        
        // 检查ESC键
        if (this.inputHandler.isCancelPressed()) {
            if (this.gameState.isPlaying()) {
                this.showPauseMenu();
            } else if (this.gameState.isPaused()) {
                this.hidePauseMenu();
                this.resume();
            }
        }
    }

    // 更新游戏对象
    updateGameObjects(deltaTime) {
        // 更新所有游戏对象
        for (let i = this.gameObjects.length - 1; i >= 0; i--) {
            const obj = this.gameObjects[i];
            if (obj && obj.isAlive()) {
                obj.update(deltaTime);
            }
        }
        
        // 更新性能统计
        this.performanceStats.totalObjects = this.gameObjects.length;
    }

    // 更新敌机生成
    updateEnemySpawning(deltaTime) {
        // 只在非BOSS关生成普通敌机
        if (!this.levelManager.isBossLevel) {
            // 根据当前关卡配置敌机生成器
            const levelInfo = this.levelManager.getCurrentLevelInfo();
            if (levelInfo) {
                this.enemySpawner.setSpawnInterval(levelInfo.enemySpawnRate);
                this.enemySpawner.setDifficultyLevel(levelInfo.difficulty);
            }
            
            // 更新敌机生成器
            this.enemySpawner.update(deltaTime);
            
            // 获取新生成的敌机并添加到游戏中
            const newEnemies = this.enemySpawner.getActiveEnemies();
            newEnemies.forEach(enemy => {
                if (!this.enemies.includes(enemy)) {
                    this.addEnemy(enemy);
                }
            });
        }
    }

    // 更新碰撞检测
    updateCollisions() {
        if (!this.player || !this.player.isAlive()) return;

        // 玩家子弹与敌机碰撞
        const playerBullets = this.player.getBullets();
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const bullet = playerBullets[i];
            if (!bullet.isAlive()) continue;

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (!enemy.isAlive()) continue;

                if (CollisionDetector.checkCollision(bullet, enemy)) {
                    // 处理碰撞
                    bullet.onCollision(enemy);
                    enemy.onCollision(bullet);
                    
                    // 播放爆炸音效
                    this.audioManager.playExplosionSound();
                    
                    // 创建爆炸粒子效果
                    this.particleSystem.createExplosion(
                        enemy.position.x + enemy.width / 2,
                        enemy.position.y + enemy.height / 2,
                        '#ff6600'
                    );
                    
                    // 增加分数
                    this.addScore(enemy.getScoreValue());
                    
                    // 通知关卡管理器敌机被击毁
                    if (!enemy.isAlive()) {
                        this.onEnemyKilled(enemy);
                    }
                    
                    break;
                }
            }
        }

        // 玩家与敌机碰撞
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isAlive()) continue;

            if (CollisionDetector.checkCollision(this.player, enemy)) {
                // 玩家受到伤害
                const wasHit = this.player.takeDamage(1);

                if (wasHit) {
                    // 更新生命值显示
                    this.lives = this.player.getLives();
                    console.log(`玩家生命值更新为: ${this.lives}`);
                    this.updateUI();

                    // 播放受伤音效
                    this.audioManager.playHitSound();

                    // 创建击中粒子效果
                    if (this.particleSystem) {
                        this.particleSystem.createHitEffect(
                            this.player.position.x + this.player.width / 2,
                            this.player.position.y + this.player.height / 2,
                            '#ff0000'
                        );
                    }

                    console.log(`玩家与敌机碰撞，剩余生命：${this.lives}`);
                }

                // 销毁敌机
                enemy.destroy();

                break;
            }
        }

        // 敌机子弹与玩家碰撞
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.isAlive()) continue;

            const enemyBullets = enemy.getBullets();
            for (let j = enemyBullets.length - 1; j >= 0; j--) {
                const bullet = enemyBullets[j];
                if (!bullet.isAlive()) continue;

                if (CollisionDetector.checkCollision(bullet, this.player)) {
                    // 玩家受到伤害
                    const damage = bullet.getDamage ? bullet.getDamage() : 1;
                    const wasHit = this.player.takeDamage(damage);

                    if (wasHit) {
                        // 更新生命值显示
                        this.lives = this.player.getLives();
                        console.log(`玩家生命值更新为: ${this.lives}`);
                        this.updateUI();

                        // 播放受伤音效
                        this.audioManager.playHitSound();

                        // 创建击中粒子效果
                        if (this.particleSystem) {
                            this.particleSystem.createHitEffect(
                                this.player.position.x + this.player.width / 2,
                                this.player.position.y + this.player.height / 2,
                                '#ff4444'
                            );
                        }

                        console.log(`玩家受到${damage}点伤害，剩余生命：${this.lives}`);
                    }

                    // 销毁子弹
                    bullet.destroy();

                    break;
                }
            }
        }

        // 玩家与道具碰撞
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (!powerUp.isAlive()) continue;

            if (CollisionDetector.checkCollision(this.player, powerUp)) {
                // 玩家拾取道具
                powerUp.onPickup(this.player);
                
                // 更新成就统计
                this.achievementSystem.updateStats('powerUpsCollected', 1, 'add');
                
                // 如果是武器升级道具，更新武器升级统计
                if (powerUp.type === 'weapon') {
                    this.achievementSystem.updateStats('weaponUpgrades', 1, 'add');
                }
                
                // 更新生命值显示
                this.lives = this.player.getLives();
                
                break;
            }
        }
    }

    // 清理无效对象
    cleanupObjects() {
        // 清理游戏对象
        this.gameObjects = this.gameObjects.filter(obj => obj && obj.isAlive());
        
        // 清理敌机
        this.enemies = this.enemies.filter(enemy => enemy && enemy.isAlive());
        
        // 清理子弹
        this.bullets = this.bullets.filter(bullet => bullet && bullet.isAlive());
        
        // 清理道具
        this.powerUps = this.powerUps.filter(powerUp => powerUp && powerUp.isAlive());
    }

    // 渲染游戏
    render() {
        // 清屏
        this.clearScreen();
        
        // 只在游戏进行时渲染游戏对象
        if (this.gameState.isPlaying()) {
            this.renderGameObjects();
        }
        
        // 渲染调试信息（可选）
        if (this.shouldShowDebugInfo()) {
            this.renderDebugInfo();
        }
    }

    // 清屏
    clearScreen() {
        this.ctx.fillStyle = GameConfig.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);
    }

    // 渲染游戏对象
    renderGameObjects() {
        // 渲染所有游戏对象
        this.gameObjects.forEach(obj => {
            if (obj && obj.isVisible()) {
                obj.render(this.ctx);
            }
        });
        
        // 渲染粒子效果
        this.particleSystem.render(this.ctx);
    }

    // 添加游戏对象
    addGameObject(obj) {
        if (obj instanceof GameObject) {
            this.gameObjects.push(obj);
        }
    }

    // 移除游戏对象
    removeGameObject(obj) {
        const index = this.gameObjects.indexOf(obj);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }

    // 添加敌机
    addEnemy(enemy) {
        this.enemies.push(enemy);
        this.addGameObject(enemy);
    }

    // 添加子弹
    addBullet(bullet) {
        this.bullets.push(bullet);
        this.addGameObject(bullet);
    }

    // 添加道具
    addPowerUp(powerUp) {
        this.powerUps.push(powerUp);
        this.addGameObject(powerUp);
    }

    // 增加分数
    addScore(points) {
        const finalPoints = Math.floor(points * this.scoreMultiplier);
        this.score += finalPoints;
        
        // 更新成就统计
        this.achievementSystem.updateStats('score', this.score, 'set');
        
        if (this.scoreMultiplier > 1) {
            console.log(`得分: +${points} x${this.scoreMultiplier} = +${finalPoints}, 总分: ${this.score}`);
        } else {
            console.log(`得分: +${finalPoints}, 总分: ${this.score}`);
        }
    }

    // 添加分数加倍效果
    addScoreMultiplier(multiplier, duration) {
        this.scoreMultiplier = multiplier;
        this.scoreMultiplierTime = 0;
        this.scoreMultiplierDuration = duration;
        
        console.log(`分数加倍效果激活: x${multiplier}, 持续时间: ${duration}ms`);
    }

    // 敌机被击毁回调
    onEnemyKilled(enemy) {
        // 通知关卡管理器
        this.levelManager.onEnemyKilled(enemy);
        
        // 更新成就统计
        this.achievementSystem.updateStats('enemiesKilled', 1, 'add');
        
        // 检查是否是BOSS
        if (enemy.hasTag && enemy.hasTag('boss')) {
            this.achievementSystem.updateStats('bossesKilled', 1, 'add');
        }
        
        // 通知无尽模式
        if (this.endlessMode.isActive) {
            this.endlessMode.onEnemyKilled(enemy);
        }
        
        // 随机掉落道具（支持敌机自定义掉落概率）
        this.tryDropPowerUp(enemy.position.x, enemy.position.y, enemy.dropChance);
    }

    // 尝试掉落道具
    tryDropPowerUp(x, y, customDropChance = null) {
        // 如果敌机有自定义掉落概率，使用它
        const totalDropChance = customDropChance || 0.4; // 默认40%掉落概率

        if (Math.random() > totalDropChance) {
            return; // 不掉落任何道具
        }

        const dropChance = Math.random();

        // 道具掉落概率配置（在确定掉落的情况下）
        const dropRates = {
            weapon: 0.4,     // 40% 武器升级
            shield: 0.2,     // 20% 护盾
            health: 0.15,    // 15% 生命恢复
            score: 0.25      // 25% 分数加倍
        };

        let cumulativeChance = 0;

        // 按概率掉落不同道具
        for (const [type, rate] of Object.entries(dropRates)) {
            cumulativeChance += rate;
            if (dropChance <= cumulativeChance) {
                this.dropPowerUp(type, x, y);
                return;
            }
        }

        // 如果没有匹配到任何道具类型，默认掉落武器升级
        this.dropPowerUp('weapon', x, y);
    }

    // 掉落指定类型的道具
    dropPowerUp(type, x, y) {
        let powerUp;
        
        switch (type) {
            case 'weapon':
                powerUp = new WeaponUpgrade(x, y);
                break;
            case 'shield':
                powerUp = new ShieldPowerUp(x, y);
                break;
            case 'health':
                powerUp = new HealthPowerUp(x, y);
                break;
            case 'score':
                powerUp = new ScoreMultiplierPowerUp(x, y);
                break;
            default:
                return;
        }
        
        this.addPowerUp(powerUp);
        console.log(`掉落了${type}道具 at (${x}, ${y})`);
    }

    // 开始指定关卡
    startLevel(levelNumber) {
        this.levelManager.startLevel(levelNumber);

        // 设置敌机生成器的关卡
        this.enemySpawner.setCurrentLevel(levelNumber);

        // 如果游戏还没运行，启动游戏
        if (!this.isRunning) {
            this.gameState.startGame();
            this.startGameLoop();
        }

        // 立即更新HUD显示
        this.updateHUDElements();
    }

    // 返回关卡选择
    returnToLevelSelect() {
        this.stop();
        if (window.game && typeof window.game.showLevelSelect === 'function') {
            window.game.showLevelSelect();
        }
    }

    // 更新UI
    updateUI() {
        if (window.game && typeof window.game.updateUI === 'function') {
            window.game.updateUI(this.score, this.lives);
        }
        
        // 更新关卡HUD
        if (window.game && typeof window.game.updateLevelHUD === 'function') {
            window.game.updateLevelHUD();
        }
        
        // 直接更新HUD元素
        this.updateHUDElements();
    }

    // 直接更新HUD元素
    updateHUDElements() {
        // 更新分数显示
        const scoreElement = document.getElementById('scoreValue');
        if (scoreElement) {
            scoreElement.textContent = this.score || 0;
        }

        // 更新生命值显示
        const livesElement = document.getElementById('livesValue');
        if (livesElement) {
            livesElement.textContent = this.lives || 0;
        }

        // 更新关卡信息
        const currentLevelElement = document.getElementById('currentLevel');
        if (currentLevelElement) {
            currentLevelElement.textContent = this.levelManager.currentLevel;
        }

        // 更新关卡状态
        const levelStatusElement = document.getElementById('levelStatus');
        if (levelStatusElement) {
            levelStatusElement.textContent = this.levelManager.getLevelStatusText();
        }

        // 更新时间
        const levelTimeElement = document.getElementById('levelTime');
        if (levelTimeElement) {
            const remainingTime = Math.ceil(this.levelManager.getRemainingTime() / 1000);
            levelTimeElement.textContent = `时间: ${remainingTime}s`;
        }

        // 更新武器信息
        if (this.player) {
            const weaponLevelElement = document.getElementById('weaponLevel');
            const weaponTypeElement = document.getElementById('weaponType');
            
            if (weaponLevelElement) {
                weaponLevelElement.textContent = `Lv.${this.player.getWeaponLevel()}`;
            }
            
            if (weaponTypeElement) {
                const weaponTypeNames = {
                    'single': '单发',
                    'double': '双发',
                    'triple': '三发',
                    'spread': '散射',
                    'laser': '激光'
                };
                weaponTypeElement.textContent = weaponTypeNames[this.player.getWeaponType()] || '单发';
            }
        }

        // 更新分数加倍信息
        const scoreMultiplierInfo = document.getElementById('scoreMultiplierInfo');
        const scoreMultiplierElement = document.getElementById('scoreMultiplier');
        const multiplierTimeElement = document.getElementById('multiplierTime');
        
        if (this.scoreMultiplier > 1) {
            if (scoreMultiplierInfo) scoreMultiplierInfo.style.display = 'block';
            if (scoreMultiplierElement) scoreMultiplierElement.textContent = `x${this.scoreMultiplier}`;
            if (multiplierTimeElement) {
                const remainingTime = Math.ceil((this.scoreMultiplierDuration - this.scoreMultiplierTime) / 1000);
                multiplierTimeElement.textContent = `${remainingTime}s`;
            }
        } else {
            if (scoreMultiplierInfo) scoreMultiplierInfo.style.display = 'none';
        }
    }

    // 检查游戏结束条件
    checkGameOverConditions() {
        if (this.player && !this.player.isAlive()) {
            this.gameOver();
        }
    }

    // 更新FPS
    updateFPS(currentTime) {
        if (currentTime - this.fpsUpdateTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }

    // 重置游戏数据
    resetGameData() {
        this.score = 0;
        this.lives = GameConfig.PLAYER_LIVES;
        this.level = 1;
        this.gameTime = 0;
        this.frameCount = 0;
        
        // 重置玩家
        if (this.player) {
            this.player.reset();
        }
        
        // 清理所有对象
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.gameObjects = this.player ? [this.player] : [];
        
        // 重置敌机生成器
        this.enemySpawner.reset();

        // 重置关卡管理器
        this.levelManager.reset();

        // 清理粒子系统
        this.particleSystem.clear();
    }

    // 为下一关重置（保持分数和生命值）
    resetForNextLevel() {
        // 保持当前分数和生命值
        const currentScore = this.score;
        const currentLives = this.lives;
        
        // 重置玩家位置和状态
        if (this.player) {
            this.player.reset();
            this.player.setLives(currentLives);
        } else {
            // 如果玩家不存在，重新创建
            this.createPlayer();
            if (this.player) {
                this.player.setLives(currentLives);
            }
        }
        
        // 清理所有敌机和子弹
        this.enemies.forEach(enemy => {
            if (enemy && enemy.destroy) {
                enemy.destroy();
            }
        });
        this.bullets.forEach(bullet => {
            if (bullet && bullet.destroy) {
                bullet.destroy();
            }
        });
        
        this.enemies = [];
        this.bullets = [];
        this.powerUps = [];
        this.gameObjects = this.player ? [this.player] : [];
        
        // 恢复分数和生命值
        this.score = currentScore;
        this.lives = currentLives;
        
        // 重置敌机生成器
        this.enemySpawner.clearAllEnemies();
        this.enemySpawner.lastSpawnTime = Date.now();
        this.enemySpawner.lastDifficultyIncreaseTime = Date.now();
        
        // 重新启动敌机生成器
        this.enemySpawner.start();
        
        // 清理粒子系统并重新初始化星空
        this.particleSystem.clear();
        this.particleSystem.createStarField(GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT, 30);
        
        // 确保游戏状态正确
        if (!this.gameState.isPlaying()) {
            this.gameState.startGame();
        }
        
        console.log(`准备进入下一关，当前分数: ${this.score}, 生命值: ${this.lives}`);
    }

    // 状态变化处理
    onStateChange(fromState, toState) {
        console.log(`游戏管理器处理状态变化: ${fromState} -> ${toState}`);
        
        switch (toState) {
            case GameStates.PLAYING:
                // 开始游戏循环（如果还没开始）
                if (!this.isRunning) {
                    this.startGameLoop();
                }
                // 启动敌机生成器
                this.enemySpawner.start();
                // 开始背景音乐
                this.audioManager.startBackgroundMusic();
                break;
            case GameStates.PAUSED:
                // 暂停时不停止循环，只是不更新游戏逻辑
                // 停止敌机生成
                this.enemySpawner.stop();
                break;
            case GameStates.MENU:
            case GameStates.GAME_OVER:
                // 停止游戏循环
                this.stopGameLoop();
                // 停止并重置敌机生成器
                this.enemySpawner.stop();
                // 停止背景音乐
                this.audioManager.stopBackgroundMusic();
                break;
        }
    }

    // 绑定全局事件
    bindGlobalEvents() {
        // 窗口失焦时自动暂停
        window.addEventListener('blur', () => {
            if (this.gameState.isPlaying()) {
                this.pause();
            }
        });
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.gameState.isPlaying()) {
                this.pause();
            }
        });
    }

    // 是否显示调试信息
    shouldShowDebugInfo() {
        // 可以通过URL参数或其他方式控制
        return new URLSearchParams(window.location.search).has('debug');
    }

    // 渲染调试信息
    renderDebugInfo() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        
        const debugInfo = [
            `FPS: ${this.fps}`,
            `Objects: ${this.performanceStats.totalObjects}`,
            `Update: ${this.performanceStats.updateTime.toFixed(2)}ms`,
            `Render: ${this.performanceStats.renderTime.toFixed(2)}ms`,
            `State: ${this.gameState.getState()}`,
            `Score: ${this.score}`,
            `Lives: ${this.lives}`
        ];
        
        debugInfo.forEach((info, index) => {
            this.ctx.fillText(info, 10, 20 + index * 15);
        });
    }

    // 获取游戏统计信息
    getStats() {
        return {
            score: this.score,
            lives: this.lives,
            level: this.level,
            gameTime: this.gameTime,
            fps: this.fps,
            objects: this.performanceStats.totalObjects,
            state: this.gameState.getState(),
            isRunning: this.isRunning
        };
    }

    // 显示暂停菜单
    showPauseMenu() {
        if (this.gameState.canPause()) {
            this.pause();
            // 游戏状态管理器会自动显示暂停UI
            if (window.game && typeof window.game.updatePauseMenuInfo === 'function') {
                window.game.updatePauseMenuInfo();
            }
        }
    }

    // 隐藏暂停菜单
    hidePauseMenu() {
        if (this.gameState.canResume()) {
            this.resume();
            // 游戏状态管理器会自动隐藏暂停UI
        }
    }

    // 从暂停菜单重新开始游戏
    restartFromPause() {
        this.hidePauseMenu();
        this.restart();
    }

    // 从暂停菜单返回主菜单
    backToMenuFromPause() {
        this.hidePauseMenu();
        this.returnToLevelSelect();
    }

    // 开始无尽模式
    startEndlessMode() {
        if (this.isRunning) {
            console.warn('游戏已经在运行中');
            return;
        }

        // 重置游戏数据
        this.resetGameData();
        
        // 启动无尽模式
        this.endlessMode.start();
        
        // 设置游戏状态
        this.gameState.startGame();
        
        // 开始游戏循环
        this.startGameLoop();
        
        // 初始化星空背景粒子
        this.particleSystem.createStarField(GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT, 30);
        
        // 更新成就统计 - 游戏开始
        this.achievementSystem.updateStats('gamesPlayed', 1, 'add');
        this.gameStartTime = Date.now();
        
        console.log('无尽模式开始');
    }

    // 更新分数加倍效果
    updateScoreMultiplier(deltaTime) {
        if (this.scoreMultiplier > 1) {
            this.scoreMultiplierTime += deltaTime * 1000; // 转换为毫秒
            
            if (this.scoreMultiplierTime >= this.scoreMultiplierDuration) {
                this.scoreMultiplier = 1;
                this.scoreMultiplierTime = 0;
                this.scoreMultiplierDuration = 0;
                console.log('分数加倍效果结束');
            }
        }
    }

    // 销毁游戏管理器
    destroy() {
        this.stopGameLoop();
        
        if (this.inputHandler) {
            this.inputHandler.destroy();
        }
        
        // 清理所有对象
        this.gameObjects = [];
        this.enemies = [];
        this.bullets = [];
        this.player = null;
        
        console.log('游戏管理器已销毁');
    }
}