// 游戏配置常量
const GameConfig = {
    // 画布尺寸
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // 游戏对象速度 (像素/秒)
    PLAYER_SPEED: 250,
    BULLET_SPEED: 400,
    ENEMY_SPEED: 120,
    
    // 游戏参数
    PLAYER_LIVES: 3,
    BULLET_INTERVAL: 150,        // 射击间隔 (毫秒)
    ENEMY_SPAWN_INTERVAL: 2000,  // 敌机生成间隔 (毫秒)
    ENEMY_SCORE: 10,             // 击毁敌机得分
    
    // 游戏对象尺寸
    PLAYER_WIDTH: 40,
    PLAYER_HEIGHT: 40,
    ENEMY_WIDTH: 35,
    ENEMY_HEIGHT: 35,
    BULLET_WIDTH: 4,
    BULLET_HEIGHT: 10,
    
    // 颜色配置
    COLORS: {
        PLAYER: '#00ff00',      // 绿色玩家飞机
        ENEMY: '#ff4444',       // 红色敌机
        BULLET: '#ffff00',      // 黄色子弹
        BACKGROUND: '#000000',   // 黑色背景
        UI_TEXT: '#ffffff'      // 白色UI文字
    },
    
    // 游戏状态
    GAME_STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over'
    },
    
    // 输入键位映射
    KEYS: {
        UP: ['ArrowUp', 'KeyW'],
        DOWN: ['ArrowDown', 'KeyS'],
        LEFT: ['ArrowLeft', 'KeyA'],
        RIGHT: ['ArrowRight', 'KeyD'],
        PAUSE: ['Space', 'KeyP']
    }
};

// 游戏状态枚举
const GameStates = GameConfig.GAME_STATES;