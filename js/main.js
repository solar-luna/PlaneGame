// 主入口文件
class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameManager = null;
        this.isInitialized = false;
    }

    // 初始化游戏
    init() {
        try {
            // 获取Canvas元素
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('无法找到游戏画布元素');
            }

            // 获取2D渲染上下文
            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('无法获取Canvas 2D上下文');
            }

            // 设置Canvas尺寸
            this.canvas.width = GameConfig.CANVAS_WIDTH;
            this.canvas.height = GameConfig.CANVAS_HEIGHT;

            // 创建游戏管理器
            this.gameManager = new GameManager(this.canvas, this.ctx);
            
            // 设置全局音频管理器引用
            window.audioManager = this.gameManager.audioManager;

            // 绑定UI事件
            this.bindUIEvents();

            // 标记初始化完成
            this.isInitialized = true;

            // 显示主菜单
            this.showMenu();

            console.log('游戏初始化成功');
            return true;

        } catch (error) {
            console.error('游戏初始化失败:', error);
            this.showError('游戏初始化失败: ' + error.message);
            return false;
        }
    }

    // 绑定UI事件
    bindUIEvents() {
        // 开始游戏按钮
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startGame();
            });
        }

        // 关卡选择按钮
        const levelSelectButton = document.getElementById('levelSelectButton');
        if (levelSelectButton) {
            levelSelectButton.addEventListener('click', () => {
                this.showLevelSelect();
            });
        }

        // 无尽模式按钮
        const endlessModeButton = document.getElementById('endlessModeButton');
        if (endlessModeButton) {
            endlessModeButton.addEventListener('click', () => {
                this.startEndlessMode();
            });
        }

        // 返回主菜单按钮
        const backToMenuButton = document.getElementById('backToMenuButton');
        if (backToMenuButton) {
            backToMenuButton.addEventListener('click', () => {
                this.showMenu();
                this.hideLevelSelect();
            });
        }

        // 重新开始按钮
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                this.restartGame();
            });
        }

        // 防止右键菜单
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // 防止选中文本
        this.canvas.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });

        // 静音按钮
        const muteButton = document.getElementById('muteButton');
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                if (this.gameManager && this.gameManager.audioManager) {
                    const isMuted = this.gameManager.audioManager.toggleMute();
                    muteButton.textContent = isMuted ? '🔇' : '🔊';
                }
            });
        }

        // 暂停菜单按钮
        const resumeButton = document.getElementById('resumeButton');
        if (resumeButton) {
            resumeButton.addEventListener('click', () => {
                this.resumeGame();
            });
        }

        const restartFromPauseButton = document.getElementById('restartFromPauseButton');
        if (restartFromPauseButton) {
            restartFromPauseButton.addEventListener('click', () => {
                this.restartFromPause();
            });
        }

        const backToMenuFromPauseButton = document.getElementById('backToMenuFromPauseButton');
        if (backToMenuFromPauseButton) {
            backToMenuFromPauseButton.addEventListener('click', () => {
                this.backToMenuFromPause();
            });
        }

        // 初始化关卡选择界面
        this.initLevelSelect();
    }

    // 开始游戏
    startGame() {
        if (!this.isInitialized) {
            console.error('游戏未初始化');
            return;
        }

        try {
            this.gameManager.start();
            this.hideMenu();
            this.showGameHUD();
            console.log('游戏开始');
        } catch (error) {
            console.error('启动游戏失败:', error);
            this.showError('启动游戏失败: ' + error.message);
        }
    }

    // 重新开始游戏
    restartGame() {
        if (!this.isInitialized) {
            console.error('游戏未初始化');
            return;
        }

        try {
            this.gameManager.restart();
            this.hideGameOver();
            console.log('游戏重新开始');
        } catch (error) {
            console.error('重启游戏失败:', error);
            this.showError('重启游戏失败: ' + error.message);
        }
    }

    // 隐藏菜单
    hideMenu() {
        const menu = document.getElementById('gameMenu');
        if (menu) {
            menu.style.display = 'none';
        }
    }

    // 显示菜单
    showMenu() {
        const menu = document.getElementById('gameMenu');
        if (menu) {
            menu.style.display = 'block';
        }
    }

    // 隐藏游戏结束界面
    hideGameOver() {
        const gameOver = document.getElementById('gameOver');
        if (gameOver) {
            gameOver.style.display = 'none';
        }
    }

    // 显示游戏结束界面
    showGameOver(finalScore) {
        const gameOver = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        
        if (gameOver) {
            gameOver.style.display = 'block';
        }
        
        if (finalScoreElement) {
            finalScoreElement.textContent = finalScore || 0;
        }
    }

    // 更新UI显示
    updateUI(score, lives) {
        const scoreElement = document.getElementById('scoreValue');
        const livesElement = document.getElementById('livesValue');

        if (scoreElement) {
            scoreElement.textContent = score || 0;
        }

        if (livesElement) {
            livesElement.textContent = lives || 0;
        }
    }

    // 显示错误信息
    showError(message) {
        alert(message);
    }

    // 游戏结束回调
    onGameOver(finalScore) {
        this.showGameOver(finalScore);
    }

    // 显示关卡选择界面
    showLevelSelect() {
        this.hideMenu();
        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect) {
            levelSelect.style.display = 'block';
        }
        this.updateLevelGrid();
    }

    // 隐藏关卡选择界面
    hideLevelSelect() {
        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect) {
            levelSelect.style.display = 'none';
        }
    }

    // 初始化关卡选择界面
    initLevelSelect() {
        this.updateLevelGrid();
    }

    // 更新关卡网格
    updateLevelGrid() {
        const levelGrid = document.getElementById('levelGrid');
        if (!levelGrid || !this.gameManager) return;

        levelGrid.innerHTML = '';
        const levelManager = this.gameManager.levelManager;
        const allLevels = levelManager.getAllLevels();

        for (let i = 1; i <= levelManager.maxLevel; i++) {
            const levelInfo = allLevels[i];
            const button = document.createElement('button');
            button.className = 'level-button';
            
            // 设置按钮样式
            if (levelInfo.isBoss) {
                button.classList.add('boss');
            } else {
                button.classList.add('normal');
            }

            // 检查是否解锁
            if (!levelManager.isLevelUnlocked(i)) {
                button.classList.add('locked');
                button.disabled = true;
            }

            // 设置按钮内容
            button.innerHTML = `
                <div class="level-name">${levelInfo.name}</div>
                <div class="level-desc">${levelInfo.description}</div>
            `;

            // 添加点击事件
            if (levelManager.isLevelUnlocked(i)) {
                button.addEventListener('click', () => {
                    this.startLevel(i);
                });
            }

            levelGrid.appendChild(button);
        }
    }

    // 开始指定关卡
    startLevel(levelNumber) {
        if (!this.isInitialized) {
            console.error('游戏未初始化');
            return;
        }

        try {
            this.hideLevelSelect();
            this.gameManager.startLevel(levelNumber);
            this.showGameHUD();
            console.log(`开始第${levelNumber}关`);
        } catch (error) {
            console.error('启动关卡失败:', error);
            this.showError('启动关卡失败: ' + error.message);
        }
    }

    // 显示游戏HUD
    showGameHUD() {
        const gameHud = document.getElementById('gameHud');
        if (gameHud) {
            gameHud.style.display = 'block';
        }
    }

    // 隐藏游戏HUD
    hideGameHUD() {
        const gameHud = document.getElementById('gameHud');
        if (gameHud) {
            gameHud.style.display = 'none';
        }
    }

    // 更新关卡HUD信息
    updateLevelHUD() {
        if (!this.gameManager || !this.gameManager.levelManager) return;

        const levelManager = this.gameManager.levelManager;
        const currentLevelElement = document.getElementById('currentLevel');
        const levelStatusElement = document.getElementById('levelStatus');
        const levelTimeElement = document.getElementById('levelTime');

        if (currentLevelElement) {
            currentLevelElement.textContent = levelManager.currentLevel;
        }

        if (levelStatusElement) {
            levelStatusElement.textContent = levelManager.getLevelStatusText();
        }

        if (levelTimeElement) {
            const remainingTime = Math.ceil(levelManager.getRemainingTime() / 1000);
            levelTimeElement.textContent = `时间: ${remainingTime}s`;
        }
    }

    // 显示暂停菜单
    showPauseMenu() {
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.style.display = 'block';
            
            // 更新暂停菜单中的信息
            this.updatePauseMenuInfo();
        }
        this.hideGameHUD();
    }

    // 隐藏暂停菜单
    hidePauseMenu() {
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) {
            pauseMenu.style.display = 'none';
        }
        this.showGameHUD();
    }

    // 更新暂停菜单信息
    updatePauseMenuInfo() {
        if (!this.gameManager) return;

        const pauseScoreElement = document.getElementById('pauseScore');
        const pauseLevelElement = document.getElementById('pauseLevel');
        const pauseLivesElement = document.getElementById('pauseLives');

        if (pauseScoreElement) {
            pauseScoreElement.textContent = this.gameManager.score || 0;
        }

        if (pauseLevelElement) {
            pauseLevelElement.textContent = this.gameManager.levelManager.currentLevel || 1;
        }

        if (pauseLivesElement) {
            pauseLivesElement.textContent = this.gameManager.lives || 0;
        }
    }

    // 从暂停菜单恢复游戏
    resumeGame() {
        if (this.gameManager) {
            this.gameManager.resume();
            this.hidePauseMenu();
        }
    }

    // 从暂停菜单重新开始游戏
    restartFromPause() {
        if (this.gameManager) {
            this.gameManager.restartFromPause();
        }
    }

    // 从暂停菜单返回主菜单
    backToMenuFromPause() {
        if (this.gameManager) {
            this.gameManager.backToMenuFromPause();
        }
        this.hidePauseMenu();
        this.hideGameHUD();
        this.showMenu();
    }

    // 开始无尽模式
    startEndlessMode() {
        if (!this.isInitialized) {
            console.error('游戏未初始化');
            return;
        }

        try {
            this.hideMenu();
            this.gameManager.startEndlessMode();
            this.showGameHUD();
            console.log('无尽模式开始');
        } catch (error) {
            console.error('启动无尽模式失败:', error);
            this.showError('启动无尽模式失败: ' + error.message);
        }
    }
}

// 全局游戏实例
let game = null;

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    
    if (game.init()) {
        console.log('雷霆战机游戏准备就绪');
    } else {
        console.error('游戏初始化失败');
    }
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (game && game.gameManager) {
        game.gameManager.destroy();
    }
});