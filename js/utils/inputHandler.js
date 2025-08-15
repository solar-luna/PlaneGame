// InputHandler - 输入处理器类
class InputHandler {
    constructor() {
        // 按键状态映射
        this.keys = new Map();
        this.keyPressed = new Map();
        this.keyReleased = new Map();
        
        // 事件监听器引用（用于清理）
        this.keyDownListener = null;
        this.keyUpListener = null;
        
        // 移动方向缓存
        this.moveDirection = new Vector2(0, 0);
        
        // 初始化
        this.init();
    }

    // 初始化输入处理器
    init() {
        this.bindEvents();
        console.log('输入处理器初始化完成');
    }

    // 绑定键盘事件
    bindEvents() {
        // 创建事件监听器
        this.keyDownListener = (event) => this.onKeyDown(event);
        this.keyUpListener = (event) => this.onKeyUp(event);
        
        // 绑定事件
        document.addEventListener('keydown', this.keyDownListener);
        document.addEventListener('keyup', this.keyUpListener);
        
        // 防止某些按键的默认行为
        document.addEventListener('keydown', (event) => {
            // 防止空格键滚动页面，方向键移动页面等
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
                event.preventDefault();
            }
        });
    }

    // 解绑键盘事件
    unbindEvents() {
        if (this.keyDownListener) {
            document.removeEventListener('keydown', this.keyDownListener);
            this.keyDownListener = null;
        }
        
        if (this.keyUpListener) {
            document.removeEventListener('keyup', this.keyUpListener);
            this.keyUpListener = null;
        }
    }

    // 键盘按下事件处理
    onKeyDown(event) {
        const keyCode = event.code;
        
        // 记录按键状态
        if (!this.keys.get(keyCode)) {
            this.keyPressed.set(keyCode, true);
        }
        this.keys.set(keyCode, true);
        
        // 更新移动方向
        this.updateMoveDirection();
    }

    // 键盘释放事件处理
    onKeyUp(event) {
        const keyCode = event.code;
        
        // 记录按键状态
        this.keys.set(keyCode, false);
        this.keyReleased.set(keyCode, true);
        
        // 更新移动方向
        this.updateMoveDirection();
    }

    // 更新移动方向
    updateMoveDirection() {
        let x = 0;
        let y = 0;
        
        // 检查水平移动
        if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA')) {
            x -= 1;
        }
        if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD')) {
            x += 1;
        }
        
        // 检查垂直移动
        if (this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW')) {
            y -= 1;
        }
        if (this.isKeyPressed('ArrowDown') || this.isKeyPressed('KeyS')) {
            y += 1;
        }
        
        // 更新移动方向
        this.moveDirection.set(x, y);
    }

    // 检查按键是否被按下（持续按下）
    isKeyPressed(keyCode) {
        return this.keys.get(keyCode) || false;
    }

    // 检查按键是否刚被按下（单次触发）
    isKeyJustPressed(keyCode) {
        return this.keyPressed.get(keyCode) || false;
    }

    // 检查按键是否刚被释放（单次触发）
    isKeyJustReleased(keyCode) {
        return this.keyReleased.get(keyCode) || false;
    }

    // 获取移动方向向量
    getMoveDirection() {
        return this.moveDirection.clone();
    }

    // 检查是否有移动输入
    hasMovementInput() {
        return !this.moveDirection.isZero();
    }

    // 检查特定方向的输入
    isMovingUp() {
        return this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW');
    }

    isMovingDown() {
        return this.isKeyPressed('ArrowDown') || this.isKeyPressed('KeyS');
    }

    isMovingLeft() {
        return this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA');
    }

    isMovingRight() {
        return this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD');
    }

    // 检查暂停键
    isPausePressed() {
        return this.isKeyJustPressed('Space') || this.isKeyJustPressed('KeyP');
    }

    // 检查确认键（回车）
    isConfirmPressed() {
        return this.isKeyJustPressed('Enter');
    }

    // 检查取消键（ESC）
    isCancelPressed() {
        return this.isKeyJustPressed('Escape');
    }

    // 更新输入状态（每帧调用）
    update() {
        // 清除单次触发的按键状态
        this.keyPressed.clear();
        this.keyReleased.clear();
    }

    // 重置所有输入状态
    reset() {
        this.keys.clear();
        this.keyPressed.clear();
        this.keyReleased.clear();
        this.moveDirection.set(0, 0);
    }

    // 获取当前按下的所有按键
    getPressedKeys() {
        const pressedKeys = [];
        for (const [key, pressed] of this.keys) {
            if (pressed) {
                pressedKeys.push(key);
            }
        }
        return pressedKeys;
    }

    // 检查按键组合
    isKeyComboPressed(keys) {
        return keys.every(key => this.isKeyPressed(key));
    }

    // 模拟按键（用于测试）
    simulateKeyDown(keyCode) {
        this.onKeyDown({ code: keyCode, preventDefault: () => {} });
    }

    simulateKeyUp(keyCode) {
        this.onKeyUp({ code: keyCode });
    }

    // 获取输入状态信息
    getStatus() {
        return {
            pressedKeys: this.getPressedKeys(),
            moveDirection: this.moveDirection.clone(),
            hasMovement: this.hasMovementInput(),
            isMovingUp: this.isMovingUp(),
            isMovingDown: this.isMovingDown(),
            isMovingLeft: this.isMovingLeft(),
            isMovingRight: this.isMovingRight()
        };
    }

    // 销毁输入处理器
    destroy() {
        this.unbindEvents();
        this.reset();
        console.log('输入处理器已销毁');
    }

    // 静态方法：创建全局输入处理器实例
    static createGlobalInstance() {
        if (!InputHandler.globalInstance) {
            InputHandler.globalInstance = new InputHandler();
        }
        return InputHandler.globalInstance;
    }

    // 静态方法：获取全局输入处理器实例
    static getGlobalInstance() {
        return InputHandler.globalInstance || null;
    }

    // 静态方法：销毁全局输入处理器实例
    static destroyGlobalInstance() {
        if (InputHandler.globalInstance) {
            InputHandler.globalInstance.destroy();
            InputHandler.globalInstance = null;
        }
    }
}

// 全局实例引用
InputHandler.globalInstance = null;