// GameState - 游戏状态管理类
class GameState {
    constructor() {
        this.currentState = GameStates.MENU;
        this.previousState = null;
        this.stateStartTime = Date.now();
        this.stateData = new Map(); // 存储状态相关数据
        
        // 状态转换监听器
        this.stateChangeListeners = [];
        
        console.log('游戏状态管理器初始化完成');
    }

    // 设置游戏状态
    setState(newState, data = null) {
        // 验证状态是否有效
        if (!this.isValidState(newState)) {
            console.error(`无效的游戏状态: ${newState}`);
            return false;
        }

        // 检查状态转换是否合法
        if (!this.isValidTransition(this.currentState, newState)) {
            console.error(`非法的状态转换: ${this.currentState} -> ${newState}`);
            return false;
        }

        // 保存前一个状态
        this.previousState = this.currentState;
        
        // 触发状态退出事件
        this.onStateExit(this.currentState);
        
        // 更新状态
        this.currentState = newState;
        this.stateStartTime = Date.now();
        
        // 存储状态数据
        if (data) {
            this.stateData.set(newState, data);
        }
        
        // 触发状态进入事件
        this.onStateEnter(newState);
        
        // 通知监听器
        this.notifyStateChange(this.previousState, newState);
        
        console.log(`状态转换: ${this.previousState} -> ${newState}`);
        return true;
    }

    // 获取当前状态
    getState() {
        return this.currentState;
    }

    // 获取前一个状态
    getPreviousState() {
        return this.previousState;
    }

    // 获取状态持续时间
    getStateDuration() {
        return Date.now() - this.stateStartTime;
    }

    // 获取状态数据
    getStateData(state = null) {
        const targetState = state || this.currentState;
        return this.stateData.get(targetState);
    }

    // 设置状态数据
    setStateData(state, data) {
        this.stateData.set(state, data);
    }

    // 检查是否为指定状态
    isState(state) {
        return this.currentState === state;
    }

    // 检查是否可以暂停
    canPause() {
        return this.currentState === GameStates.PLAYING;
    }

    // 检查是否可以恢复
    canResume() {
        return this.currentState === GameStates.PAUSED;
    }

    // 检查是否在游戏中
    isPlaying() {
        return this.currentState === GameStates.PLAYING;
    }

    // 检查是否在菜单中
    isInMenu() {
        return this.currentState === GameStates.MENU;
    }

    // 检查是否游戏结束
    isGameOver() {
        return this.currentState === GameStates.GAME_OVER;
    }

    // 检查是否暂停
    isPaused() {
        return this.currentState === GameStates.PAUSED;
    }

    // 验证状态是否有效
    isValidState(state) {
        return Object.values(GameStates).includes(state);
    }

    // 验证状态转换是否合法
    isValidTransition(fromState, toState) {
        // 定义合法的状态转换
        const validTransitions = {
            [GameStates.MENU]: [GameStates.PLAYING],
            [GameStates.PLAYING]: [GameStates.PAUSED, GameStates.GAME_OVER],
            [GameStates.PAUSED]: [GameStates.PLAYING, GameStates.MENU],
            [GameStates.GAME_OVER]: [GameStates.MENU, GameStates.PLAYING]
        };

        const allowedStates = validTransitions[fromState];
        return allowedStates && allowedStates.includes(toState);
    }

    // 状态进入事件
    onStateEnter(state) {
        switch (state) {
            case GameStates.MENU:
                this.onEnterMenu();
                break;
            case GameStates.PLAYING:
                this.onEnterPlaying();
                break;
            case GameStates.PAUSED:
                this.onEnterPaused();
                break;
            case GameStates.GAME_OVER:
                this.onEnterGameOver();
                break;
        }
    }

    // 状态退出事件
    onStateExit(state) {
        switch (state) {
            case GameStates.MENU:
                this.onExitMenu();
                break;
            case GameStates.PLAYING:
                this.onExitPlaying();
                break;
            case GameStates.PAUSED:
                this.onExitPaused();
                break;
            case GameStates.GAME_OVER:
                this.onExitGameOver();
                break;
        }
    }

    // 进入菜单状态
    onEnterMenu() {
        console.log('进入菜单状态');
        // 显示菜单UI
        this.showMenuUI();
    }

    // 退出菜单状态
    onExitMenu() {
        console.log('退出菜单状态');
        // 隐藏菜单UI
        this.hideMenuUI();
    }

    // 进入游戏状态
    onEnterPlaying() {
        console.log('进入游戏状态');
        // 隐藏所有UI覆盖层
        this.hideAllOverlays();
    }

    // 退出游戏状态
    onExitPlaying() {
        console.log('退出游戏状态');
    }

    // 进入暂停状态
    onEnterPaused() {
        console.log('进入暂停状态');
        // 显示暂停UI
        this.showPauseUI();
    }

    // 退出暂停状态
    onExitPaused() {
        console.log('退出暂停状态');
        // 隐藏暂停UI
        this.hidePauseUI();
    }

    // 进入游戏结束状态
    onEnterGameOver() {
        console.log('进入游戏结束状态');
        // 显示游戏结束UI
        this.showGameOverUI();
    }

    // 退出游戏结束状态
    onExitGameOver() {
        console.log('退出游戏结束状态');
        // 隐藏游戏结束UI
        this.hideGameOverUI();
    }

    // UI显示/隐藏方法
    showMenuUI() {
        const menu = document.getElementById('gameMenu');
        if (menu) menu.style.display = 'block';
    }

    hideMenuUI() {
        const menu = document.getElementById('gameMenu');
        if (menu) menu.style.display = 'none';
    }

    showPauseUI() {
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) pauseMenu.style.display = 'block';
        console.log('显示暂停UI');
    }

    hidePauseUI() {
        const pauseMenu = document.getElementById('pauseMenu');
        if (pauseMenu) pauseMenu.style.display = 'none';
        console.log('隐藏暂停UI');
    }

    showGameOverUI() {
        const gameOver = document.getElementById('gameOver');
        if (gameOver) gameOver.style.display = 'block';
    }

    hideGameOverUI() {
        const gameOver = document.getElementById('gameOver');
        if (gameOver) gameOver.style.display = 'none';
    }

    hideAllOverlays() {
        this.hideMenuUI();
        this.hidePauseUI();
        this.hideGameOverUI();
    }

    // 添加状态变化监听器
    addStateChangeListener(listener) {
        if (typeof listener === 'function') {
            this.stateChangeListeners.push(listener);
        }
    }

    // 移除状态变化监听器
    removeStateChangeListener(listener) {
        const index = this.stateChangeListeners.indexOf(listener);
        if (index > -1) {
            this.stateChangeListeners.splice(index, 1);
        }
    }

    // 通知状态变化监听器
    notifyStateChange(fromState, toState) {
        this.stateChangeListeners.forEach(listener => {
            try {
                listener(fromState, toState);
            } catch (error) {
                console.error('状态变化监听器执行错误:', error);
            }
        });
    }

    // 重置状态管理器
    reset() {
        this.currentState = GameStates.MENU;
        this.previousState = null;
        this.stateStartTime = Date.now();
        this.stateData.clear();
        console.log('游戏状态管理器已重置');
    }

    // 获取状态信息
    getStateInfo() {
        return {
            current: this.currentState,
            previous: this.previousState,
            duration: this.getStateDuration(),
            data: this.getStateData(),
            canPause: this.canPause(),
            canResume: this.canResume(),
            isPlaying: this.isPlaying(),
            isInMenu: this.isInMenu(),
            isGameOver: this.isGameOver()
        };
    }

    // 快捷方法：开始游戏
    startGame() {
        return this.setState(GameStates.PLAYING);
    }

    // 快捷方法：暂停游戏
    pauseGame() {
        return this.setState(GameStates.PAUSED);
    }

    // 快捷方法：恢复游戏
    resumeGame() {
        return this.setState(GameStates.PLAYING);
    }

    // 快捷方法：结束游戏
    endGame(finalScore = 0) {
        return this.setState(GameStates.GAME_OVER, { finalScore });
    }

    // 快捷方法：返回菜单
    returnToMenu() {
        return this.setState(GameStates.MENU);
    }

    // 调试方法：打印状态信息
    debugPrint() {
        console.log('=== 游戏状态信息 ===');
        console.log('当前状态:', this.currentState);
        console.log('前一状态:', this.previousState);
        console.log('状态持续时间:', this.getStateDuration(), 'ms');
        console.log('状态数据:', this.getStateData());
        console.log('==================');
    }
}