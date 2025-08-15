// Enemy - 敌方飞机类
class Enemy extends GameObject {
    constructor(x, y, speed = GameConfig.ENEMY_SPEED) {
        super(
            x, 
            y, 
            GameConfig.ENEMY_WIDTH, 
            GameConfig.ENEMY_HEIGHT
        );
        
        // 敌机属性
        this.speed = speed;
        this.scoreValue = GameConfig.ENEMY_SCORE;
        this.health = 1; // 敌机生命值
        this.maxHealth = 1;
        this.enemyType = 'basic'; // 敌机类型
        
        // 移动模式
        this.movePattern = 'straight'; // 'straight', 'zigzag', 'sine'
        this.moveTimer = 0;
        this.moveAmplitude = 50; // 摆动幅度
        this.moveFrequency = 2; // 摆动频率
        this.initialX = x; // 记录初始X位置用于摆动计算
        
        // 射击相关（部分敌机可以射击）
        this.canShoot = false;
        this.lastShotTime = 0;
        this.shotInterval = 2000; // 2秒射击间隔
        this.bullets = [];
        
        // 渲染属性
        this.color = GameConfig.COLORS.ENEMY;
        this.tag = 'enemy';
        
        // 设置默认向下移动
        this.setVelocity(0, this.speed);
    }

    // 更新敌机状态
    update(deltaTime) {
        if (!this.active) return;

        // 更新基类
        super.update(deltaTime);
        
        // 更新移动模式
        this.updateMovement(deltaTime);
        
        // 更新射击
        if (this.canShoot) {
            this.updateShooting(deltaTime);
        }
        
        // 更新子弹
        this.updateBullets(deltaTime);
        
        // 检查是否超出屏幕下边界
        if (this.position.y > GameConfig.CANVAS_HEIGHT) {
            this.destroy();
        }
    }

    // 更新移动模式
    updateMovement(deltaTime) {
        this.moveTimer += deltaTime;
        
        switch (this.movePattern) {
            case 'straight':
                // 直线向下移动（默认行为）
                break;
                
            case 'zigzag':
                // 锯齿形移动
                const zigzagSpeed = 100;
                const zigzagDirection = Math.sin(this.moveTimer * 3) > 0 ? 1 : -1;
                this.velocity.x = zigzagDirection * zigzagSpeed;
                break;
                
            case 'sine':
                // 正弦波移动
                const sineX = this.initialX + Math.sin(this.moveTimer * this.moveFrequency) * this.moveAmplitude;
                this.position.x = sineX;
                break;
        }
        
        // 确保敌机不会移出屏幕左右边界
        this.position.x = Math.max(0, Math.min(this.position.x, GameConfig.CANVAS_WIDTH - this.width));
    }

    // 更新射击
    updateShooting(deltaTime) {
        const currentTime = Date.now();
        
        if (currentTime - this.lastShotTime >= this.shotInterval) {
            this.shoot();
            this.lastShotTime = currentTime;
        }
    }

    // 更新子弹
    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);
            
            // 移除超出屏幕的子弹
            if (bullet.isOutOfBounds() || !bullet.isAlive()) {
                this.bullets.splice(i, 1);
            }
        }
    }

    // 渲染敌机
    render(ctx) {
        if (!this.visible || !this.active) return;

        // 渲染敌机本体（根据类型渲染不同形状）
        this.renderEnemyAircraft(ctx);
        
        // 渲染子弹
        this.bullets.forEach(bullet => bullet.render(ctx));
        
        // 可选：渲染生命值条（如果生命值大于1）
        if (this.maxHealth > 1) {
            this.renderHealthBar(ctx);
        }
    }

    // 渲染敌机飞机形状
    renderEnemyAircraft(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const centerX = this.position.x + this.width / 2;
        const centerY = this.position.y + this.height / 2;
        
        // 根据敌机类型渲染不同形状
        switch (this.enemyType || 'basic') {
            case 'basic':
                this.renderBasicEnemy(ctx, centerX, centerY);
                break;
            case 'fast':
                this.renderFastEnemy(ctx, centerX, centerY);
                break;
            case 'tough':
                this.renderToughEnemy(ctx, centerX, centerY);
                break;
            case 'shooter':
                this.renderShooterEnemy(ctx, centerX, centerY);
                break;
            case 'zigzag':
                this.renderZigzagEnemy(ctx, centerX, centerY);
                break;
            case 'sine':
                this.renderSineEnemy(ctx, centerX, centerY);
                break;
            case 'laser':
                this.renderLaserEnemy(ctx, centerX, centerY);
                break;
            case 'plasma':
                this.renderPlasmaEnemy(ctx, centerX, centerY);
                break;
            case 'stealth':
                this.renderStealthEnemy(ctx, centerX, centerY);
                break;
            case 'quantum':
                this.renderQuantumEnemy(ctx, centerX, centerY);
                break;
            case 'void':
                this.renderVoidEnemy(ctx, centerX, centerY);
                break;
            case 'crystal':
                this.renderCrystalEnemy(ctx, centerX, centerY);
                break;
            default:
                this.renderBasicEnemy(ctx, centerX, centerY);
        }
        
        ctx.restore();
    }

    // 基础敌机 - 三角形战斗机
    renderBasicEnemy(ctx, centerX, centerY) {
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y + this.height);
        ctx.lineTo(centerX - 12, this.position.y);
        ctx.lineTo(centerX - 6, this.position.y + 8);
        ctx.lineTo(centerX, this.position.y + 5);
        ctx.lineTo(centerX + 6, this.position.y + 8);
        ctx.lineTo(centerX + 12, this.position.y);
        ctx.closePath();
        ctx.fill();
        
        // 驾驶舱
        ctx.fillStyle = '#ff8888';
        ctx.beginPath();
        ctx.arc(centerX, this.position.y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // 快速敌机 - 流线型
    renderFastEnemy(ctx, centerX, centerY) {
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y + this.height);
        ctx.lineTo(centerX - 8, this.position.y + 5);
        ctx.lineTo(centerX - 10, this.position.y);
        ctx.lineTo(centerX, this.position.y + 3);
        ctx.lineTo(centerX + 10, this.position.y);
        ctx.lineTo(centerX + 8, this.position.y + 5);
        ctx.closePath();
        ctx.fill();
        
        // 引擎
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(centerX - 2, this.position.y + this.height - 5, 4, 5);
    }

    // 坚固敌机 - 重型轰炸机
    renderToughEnemy(ctx, centerX, centerY) {
        ctx.fillStyle = '#aa0000';
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y + this.height);
        ctx.lineTo(centerX - 15, this.position.y + 10);
        ctx.lineTo(centerX - 18, this.position.y);
        ctx.lineTo(centerX - 8, this.position.y);
        ctx.lineTo(centerX, this.position.y + 5);
        ctx.lineTo(centerX + 8, this.position.y);
        ctx.lineTo(centerX + 18, this.position.y);
        ctx.lineTo(centerX + 15, this.position.y + 10);
        ctx.closePath();
        ctx.fill();
        
        // 装甲
        ctx.fillStyle = '#660000';
        ctx.fillRect(centerX - 12, this.position.y + 8, 24, 6);
        
        // 炮塔
        ctx.fillStyle = '#880000';
        ctx.beginPath();
        ctx.arc(centerX, this.position.y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    // 射击敌机 - 双翼战斗机
    renderShooterEnemy(ctx, centerX, centerY) {
        ctx.fillStyle = '#ff0088';
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y + this.height);
        ctx.lineTo(centerX - 10, this.position.y + 8);
        ctx.lineTo(centerX - 8, this.position.y);
        ctx.lineTo(centerX, this.position.y + 3);
        ctx.lineTo(centerX + 8, this.position.y);
        ctx.lineTo(centerX + 10, this.position.y + 8);
        ctx.closePath();
        ctx.fill();
        
        // 武器系统
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(centerX - 8, this.position.y + 15, 3, 8);
        ctx.fillRect(centerX + 5, this.position.y + 15, 3, 8);
        
        // 雷达
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, this.position.y + 8, 6, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 锯齿敌机 - 隐形战斗机
    renderZigzagEnemy(ctx, centerX, centerY) {
        ctx.fillStyle = '#8800ff';
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y + this.height);
        ctx.lineTo(centerX - 6, this.position.y + 20);
        ctx.lineTo(centerX - 12, this.position.y + 15);
        ctx.lineTo(centerX - 8, this.position.y + 5);
        ctx.lineTo(centerX - 4, this.position.y);
        ctx.lineTo(centerX, this.position.y + 3);
        ctx.lineTo(centerX + 4, this.position.y);
        ctx.lineTo(centerX + 8, this.position.y + 5);
        ctx.lineTo(centerX + 12, this.position.y + 15);
        ctx.lineTo(centerX + 6, this.position.y + 20);
        ctx.closePath();
        ctx.fill();
        
        // 隐形效果
        ctx.fillStyle = 'rgba(136, 0, 255, 0.3)';
        ctx.fill();
    }

    // 正弦敌机 - 圆形UFO
    renderSineEnemy(ctx, centerX, centerY) {
        // 主体
        ctx.fillStyle = '#00ffaa';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 上层
        ctx.fillStyle = '#00ccaa';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 3, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 发光效果
        ctx.fillStyle = '#aaffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 能量环
        const time = Date.now() * 0.01;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + 0.5 * Math.sin(time)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 12 + 3 * Math.sin(time), 0, Math.PI * 2);
        ctx.stroke();
    }

    // 激光敌机 - 高科技外观
    renderLaserEnemy(ctx, centerX, centerY) {
        ctx.fillStyle = '#ff0088';
        
        // 主体 - 六边形
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y);
        ctx.lineTo(this.position.x + this.width - 5, this.position.y + 8);
        ctx.lineTo(this.position.x + this.width - 5, this.position.y + this.height - 8);
        ctx.lineTo(centerX, this.position.y + this.height);
        ctx.lineTo(this.position.x + 5, this.position.y + this.height - 8);
        ctx.lineTo(this.position.x + 5, this.position.y + 8);
        ctx.closePath();
        ctx.fill();
        
        // 激光发射器
        ctx.fillStyle = '#ff44aa';
        ctx.fillRect(centerX - 1, this.position.y + this.height, 2, 12);
        
        // 能量核心
        const time = Date.now() * 0.005;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + 0.2 * Math.sin(time)})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 激光充能效果
        if (this.isChargingLaser) {
            ctx.strokeStyle = '#ff0088';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, this.position.y + this.height);
            ctx.lineTo(centerX, this.position.y + this.height + 20);
            ctx.stroke();
        }
    }

    // 等离子敌机 - 能量外观
    renderPlasmaEnemy(ctx, centerX, centerY) {
        const time = Date.now() * 0.008;
        
        // 主体
        ctx.fillStyle = '#8800ff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 等离子环
        ctx.strokeStyle = `rgba(136, 0, 255, ${0.6 + 0.4 * Math.sin(time)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        // 内核
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // 能量粒子
        for (let i = 0; i < 4; i++) {
            const angle = time + (i * Math.PI / 2);
            const x = centerX + Math.cos(angle) * 12;
            const y = centerY + Math.sin(angle) * 12;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 隐形敌机 - 半透明外观
    renderStealthEnemy(ctx, centerX, centerY) {
        const time = Date.now() * 0.003;
        const alpha = 0.3 + 0.4 * Math.sin(time);

        ctx.globalAlpha *= alpha;
        ctx.fillStyle = '#444444';

        // 隐形战机外形
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y);
        ctx.lineTo(this.position.x + this.width - 8, centerY);
        ctx.lineTo(centerX, this.position.y + this.height);
        ctx.lineTo(this.position.x + 8, centerY);
        ctx.closePath();
        ctx.fill();

        // 隐形效果线条
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(this.position.x + 5, this.position.y + 8 + i * 8);
            ctx.lineTo(this.position.x + this.width - 5, this.position.y + 8 + i * 8);
            ctx.stroke();
        }
    }

    // 量子敌机 - 闪烁分身效果
    renderQuantumEnemy(ctx, centerX, centerY) {
        const time = Date.now() * 0.01;

        // 主体
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y);
        ctx.lineTo(centerX + 15, this.position.y + 10);
        ctx.lineTo(centerX + 10, this.position.y + this.height);
        ctx.lineTo(centerX - 10, this.position.y + this.height);
        ctx.lineTo(centerX - 15, this.position.y + 10);
        ctx.closePath();
        ctx.fill();

        // 量子分身效果
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time);
        ctx.fillStyle = '#00ccff';

        // 左侧分身
        const offsetX = 5 * Math.sin(time);
        ctx.beginPath();
        ctx.moveTo(centerX - offsetX, this.position.y);
        ctx.lineTo(centerX + 15 - offsetX, this.position.y + 10);
        ctx.lineTo(centerX + 10 - offsetX, this.position.y + this.height);
        ctx.lineTo(centerX - 10 - offsetX, this.position.y + this.height);
        ctx.lineTo(centerX - 15 - offsetX, this.position.y + 10);
        ctx.closePath();
        ctx.fill();

        // 右侧分身
        ctx.globalAlpha = 0.5 + 0.5 * Math.cos(time);
        ctx.fillStyle = '#00ffaa';
        ctx.beginPath();
        ctx.moveTo(centerX + offsetX, this.position.y);
        ctx.lineTo(centerX + 15 + offsetX, this.position.y + 10);
        ctx.lineTo(centerX + 10 + offsetX, this.position.y + this.height);
        ctx.lineTo(centerX - 10 + offsetX, this.position.y + this.height);
        ctx.lineTo(centerX - 15 + offsetX, this.position.y + 10);
        ctx.closePath();
        ctx.fill();

        // 量子核心
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();

        // 量子能量环
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6 + 2 * Math.sin(time * 2), 0, Math.PI * 2);
        ctx.stroke();
    }

    // 虚空敌机 - 黑洞效果
    renderVoidEnemy(ctx, centerX, centerY) {
        const time = Date.now() * 0.005;

        // 黑洞效果
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 2,
            centerX, centerY, this.width / 2
        );
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.7, '#330066');
        gradient.addColorStop(1, 'rgba(51, 0, 102, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // 虚空能量环
        for (let i = 0; i < 3; i++) {
            const radius = 5 + i * 4 + 2 * Math.sin(time + i);
            ctx.strokeStyle = `rgba(102, 0, 204, ${0.8 - i * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 虚空粒子
        for (let i = 0; i < 5; i++) {
            const angle = time + i * Math.PI * 2 / 5;
            const distance = 3 + 5 * Math.sin(time * 0.5);
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            ctx.fillStyle = '#9900ff';
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 水晶敌机 - 棱镜效果
    renderCrystalEnemy(ctx, centerX, centerY) {
        const time = Date.now() * 0.003;

        // 水晶主体
        ctx.fillStyle = '#88ccff';
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y);
        ctx.lineTo(centerX + 12, this.position.y + 10);
        ctx.lineTo(centerX + 8, this.position.y + this.height - 5);
        ctx.lineTo(centerX, this.position.y + this.height);
        ctx.lineTo(centerX - 8, this.position.y + this.height - 5);
        ctx.lineTo(centerX - 12, this.position.y + 10);
        ctx.closePath();
        ctx.fill();

        // 水晶棱面反光
        const colors = ['#ffffff', '#ffccff', '#ccffff', '#ffffcc'];
        for (let i = 0; i < 4; i++) {
            const angle = time + i * Math.PI / 2;
            const x1 = centerX;
            const y1 = this.position.y + this.height / 2;
            const x2 = centerX + Math.cos(angle) * 10;
            const y2 = y1 + Math.sin(angle) * 10;

            ctx.strokeStyle = colors[i];
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // 水晶核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, this.position.y + this.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // 水晶光晕
        ctx.globalAlpha = 0.3 + 0.2 * Math.sin(time * 2);
        ctx.fillStyle = '#aaddff';
        ctx.beginPath();
        ctx.arc(centerX, this.position.y + this.height / 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // 渲染生命值条
    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.position.x;
        const barY = this.position.y - barHeight - 2;
        
        // 背景
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 生命值
        const healthPercent = this.health / this.maxHealth;
        const healthWidth = barWidth * healthPercent;
        ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : (healthPercent > 0.25 ? '#ffff00' : '#ff0000');
        ctx.fillRect(barX, barY, healthWidth, barHeight);
    }

    // 射击
    shoot() {
        if (!this.active || !this.canShoot) return null;

        // 根据敌机类型使用不同的攻击方式
        switch (this.enemyType) {
            case 'laser':
                return this.shootLaser();
            case 'plasma':
                return this.shootPlasma();
            case 'stealth':
                return this.shootStealth();
            case 'shooter':
                return this.shootRapid();
            case 'quantum':
                return this.shootQuantum();
            case 'void':
                return this.shootVoid();
            case 'crystal':
                return this.shootCrystal();
            default:
                return this.shootNormal();
        }
    }

    // 普通射击
    shootNormal() {
        const bulletX = this.position.x + this.width / 2 - GameConfig.BULLET_WIDTH / 2;
        const bulletY = this.position.y + this.height;
        
        const bullet = new Bullet(bulletX, bulletY, 'enemy');
        bullet.setVelocity(0, GameConfig.BULLET_SPEED);
        bullet.color = '#ff8888'; // 红色子弹
        
        this.bullets.push(bullet);
        return bullet;
    }

    // 激光射击
    shootLaser() {
        const bulletX = this.position.x + this.width / 2 - 2;
        const bulletY = this.position.y + this.height;
        
        const laser = new Bullet(bulletX, bulletY, 'enemy');
        laser.setVelocity(0, GameConfig.BULLET_SPEED * 1.5);
        laser.width = 4;
        laser.height = 20;
        laser.color = '#ff0088'; // 粉色激光
        laser.damage = 2;
        laser.isLaser = true;
        
        this.bullets.push(laser);
        return laser;
    }

    // 等离子射击
    shootPlasma() {
        const bulletX = this.position.x + this.width / 2 - 3;
        const bulletY = this.position.y + this.height;
        
        const plasma = new Bullet(bulletX, bulletY, 'enemy');
        plasma.setVelocity(0, GameConfig.BULLET_SPEED * 0.8);
        plasma.width = 6;
        plasma.height = 6;
        plasma.color = '#8800ff'; // 紫色等离子
        plasma.damage = 3;
        plasma.isPlasma = true;
        
        this.bullets.push(plasma);
        return plasma;
    }

    // 隐形射击
    shootStealth() {
        const bulletX = this.position.x + this.width / 2 - GameConfig.BULLET_WIDTH / 2;
        const bulletY = this.position.y + this.height;
        
        const bullet = new Bullet(bulletX, bulletY, 'enemy');
        bullet.setVelocity(0, GameConfig.BULLET_SPEED * 1.2);
        bullet.color = '#666666'; // 灰色隐形子弹
        bullet.alpha = 0.6; // 半透明
        
        this.bullets.push(bullet);
        return bullet;
    }

    // 快速射击
    shootRapid() {
        const bullets = [];

        // 三连发
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (this.isAlive()) {
                    const bulletX = this.position.x + this.width / 2 - GameConfig.BULLET_WIDTH / 2;
                    const bulletY = this.position.y + this.height;

                    const bullet = new Bullet(bulletX, bulletY, 'enemy');
                    bullet.setVelocity(0, GameConfig.BULLET_SPEED);
                    bullet.color = '#ffaa00'; // 橙色子弹

                    this.bullets.push(bullet);
                    bullets.push(bullet);
                }
            }, i * 100);
        }

        return bullets;
    }

    // 量子射击 - 分裂子弹
    shootQuantum() {
        const centerX = this.position.x + this.width / 2;
        const bulletY = this.position.y + this.height;

        // 主子弹
        const mainBullet = new Bullet(centerX - 2, bulletY, 'enemy');
        mainBullet.setVelocity(0, GameConfig.BULLET_SPEED * 0.9);
        mainBullet.color = '#00ffcc';
        mainBullet.width = 4;
        mainBullet.height = 8;
        mainBullet.damage = 2;
        mainBullet.isQuantum = true;

        // 分裂效果
        setTimeout(() => {
            if (this.isAlive() && mainBullet.isAlive()) {
                // 分裂成两个子弹
                const leftBullet = new Bullet(mainBullet.position.x - 10, mainBullet.position.y, 'enemy');
                leftBullet.setVelocity(-GameConfig.BULLET_SPEED * 0.3, GameConfig.BULLET_SPEED * 0.8);
                leftBullet.color = '#00ccff';
                leftBullet.damage = 1;

                const rightBullet = new Bullet(mainBullet.position.x + 10, mainBullet.position.y, 'enemy');
                rightBullet.setVelocity(GameConfig.BULLET_SPEED * 0.3, GameConfig.BULLET_SPEED * 0.8);
                rightBullet.color = '#00ccff';
                rightBullet.damage = 1;

                this.bullets.push(leftBullet, rightBullet);
            }
        }, 500);

        this.bullets.push(mainBullet);
        return mainBullet;
    }

    // 虚空射击 - 黑洞效果
    shootVoid() {
        const bulletX = this.position.x + this.width / 2 - 5;
        const bulletY = this.position.y + this.height;

        const voidBullet = new Bullet(bulletX, bulletY, 'enemy');
        voidBullet.setVelocity(0, GameConfig.BULLET_SPEED * 0.6);
        voidBullet.width = 10;
        voidBullet.height = 10;
        voidBullet.color = '#330066';
        voidBullet.damage = 3;
        voidBullet.isVoid = true;

        this.bullets.push(voidBullet);
        return voidBullet;
    }

    // 水晶射击 - 散射光束
    shootCrystal() {
        const bullets = [];
        const centerX = this.position.x + this.width / 2;
        const bulletY = this.position.y + this.height;

        // 发射3道光束
        for (let i = -1; i <= 1; i++) {
            const angle = i * 0.2; // 散射角度
            const bullet = new Bullet(centerX - 1, bulletY, 'enemy');
            bullet.width = 2;
            bullet.height = 12;

            // 设置速度向量
            const speed = GameConfig.BULLET_SPEED * 1.2;
            const vx = speed * Math.sin(angle);
            const vy = speed * Math.cos(angle);
            bullet.setVelocity(vx, vy);

            // 设置颜色和属性
            bullet.color = '#88ccff';
            bullet.damage = 1;
            bullet.isCrystal = true;

            this.bullets.push(bullet);
            bullets.push(bullet);
        }

        return bullets;
    }

    // 受到伤害
    takeDamage(damage = 1) {
        if (!this.active) return false;

        this.health -= damage;
        
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        
        return true;
    }

    // 死亡
    die() {
        this.destroy();
        this.onDeath();
    }

    // 死亡回调
    onDeath() {
        // 可以在这里添加死亡特效
        console.log('敌机被击毁');
    }

    // 获取分数值
    getScoreValue() {
        return this.scoreValue;
    }

    // 设置移动模式
    setMovePattern(pattern, amplitude = 50, frequency = 2) {
        this.movePattern = pattern;
        this.moveAmplitude = amplitude;
        this.moveFrequency = frequency;
        return this;
    }

    // 设置射击能力
    setCanShoot(canShoot, interval = 2000) {
        this.canShoot = canShoot;
        this.shotInterval = interval;
        return this;
    }

    // 设置生命值
    setHealth(health) {
        this.health = health;
        this.maxHealth = health;
        return this;
    }

    // 设置分数值
    setScoreValue(score) {
        this.scoreValue = Math.max(0, score);
        return this;
    }

    // 设置移动速度
    setSpeed(speed) {
        this.speed = Math.max(0, speed);
        this.setVelocity(0, this.speed);
        return this;
    }

    // 获取所有子弹
    getBullets() {
        return this.bullets.slice();
    }

    // 清除所有子弹
    clearBullets() {
        this.bullets = [];
        return this;
    }

    // 检查是否存活
    isAlive() {
        return this.active && this.health > 0;
    }

    // 碰撞处理
    onCollision(other) {
        super.onCollision(other);
        
        // 与玩家子弹碰撞
        if (other.hasTag('player_bullet')) {
            this.takeDamage(other.getDamage());
        }
        
        // 与玩家碰撞
        if (other.hasTag('player')) {
            this.takeDamage(999); // 直接销毁
        }
    }

    // 获取状态信息
    getStatus() {
        return {
            health: this.health,
            maxHealth: this.maxHealth,
            position: this.position.clone(),
            scoreValue: this.scoreValue,
            movePattern: this.movePattern,
            canShoot: this.canShoot,
            bulletCount: this.bullets.length,
            isAlive: this.isAlive()
        };
    }

    // 销毁时清理资源
    onDestroy() {
        super.onDestroy();
        this.clearBullets();
    }

    // 静态工厂方法：创建不同类型的敌机
    static createBasicEnemy(x, y) {
        const enemy = new Enemy(x, y);
        enemy.enemyType = 'basic';
        return enemy;
    }

    static createFastEnemy(x, y) {
        const enemy = new Enemy(x, y, GameConfig.ENEMY_SPEED * 1.5);
        enemy.enemyType = 'fast';
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 1.5);
        return enemy;
    }

    static createToughEnemy(x, y) {
        const enemy = new Enemy(x, y);
        enemy.enemyType = 'tough';
        enemy.setHealth(3);
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 2);
        return enemy;
    }

    static createShooterEnemy(x, y) {
        const enemy = new Enemy(x, y);
        enemy.enemyType = 'shooter';
        enemy.setCanShoot(true, 1500);
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 1.5);
        return enemy;
    }

    static createZigzagEnemy(x, y) {
        const enemy = new Enemy(x, y);
        enemy.enemyType = 'zigzag';
        enemy.setMovePattern('zigzag');
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 1.2);
        return enemy;
    }

    static createSineEnemy(x, y) {
        const enemy = new Enemy(x, y);
        enemy.enemyType = 'sine';
        enemy.setMovePattern('sine', 80, 1.5);
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 1.3);
        return enemy;
    }

    // 高级敌机类型 - 激光敌机
    static createLaserEnemy(x, y) {
        const enemy = new Enemy(x, y, GameConfig.ENEMY_SPEED * 0.8);
        enemy.enemyType = 'laser';
        enemy.setHealth(2);
        enemy.setCanShoot(true, 2500);
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 3);
        enemy.isChargingLaser = false;
        enemy.laserChargeTime = 0;
        return enemy;
    }

    // 等离子敌机
    static createPlasmaEnemy(x, y) {
        const enemy = new Enemy(x, y, GameConfig.ENEMY_SPEED * 0.6);
        enemy.enemyType = 'plasma';
        enemy.setHealth(4);
        enemy.setCanShoot(true, 1800);
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 4);
        return enemy;
    }

    // 隐形敌机
    static createStealthEnemy(x, y) {
        const enemy = new Enemy(x, y, GameConfig.ENEMY_SPEED * 1.2);
        enemy.enemyType = 'stealth';
        enemy.setHealth(2);
        enemy.setCanShoot(true, 2000);
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 3.5);
        return enemy;
    }

    // 量子敌机
    static createQuantumEnemy(x, y) {
        const enemy = new Enemy(x, y, GameConfig.ENEMY_SPEED * 0.9);
        enemy.enemyType = 'quantum';
        enemy.setHealth(3);
        enemy.setCanShoot(true, 1600);
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 4.5);
        enemy.setMovePattern('sine', 60, 2);
        return enemy;
    }

    // 虚空敌机
    static createVoidEnemy(x, y) {
        const enemy = new Enemy(x, y, GameConfig.ENEMY_SPEED * 0.7);
        enemy.enemyType = 'void';
        enemy.setHealth(5);
        enemy.setCanShoot(true, 1400);
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 6);
        return enemy;
    }

    // 水晶敌机
    static createCrystalEnemy(x, y) {
        const enemy = new Enemy(x, y, GameConfig.ENEMY_SPEED * 1.1);
        enemy.enemyType = 'crystal';
        enemy.setHealth(4);
        enemy.setCanShoot(true, 1200);
        enemy.setScoreValue(GameConfig.ENEMY_SCORE * 5);
        enemy.setMovePattern('zigzag');
        return enemy;
    }

    // 随机创建敌机
    static createRandomEnemy(x, y) {
        const enemyTypes = [
            () => Enemy.createBasicEnemy(x, y),
            () => Enemy.createFastEnemy(x, y),
            () => Enemy.createToughEnemy(x, y),
            () => Enemy.createShooterEnemy(x, y),
            () => Enemy.createZigzagEnemy(x, y),
            () => Enemy.createSineEnemy(x, y)
        ];
        
        const randomIndex = Math.floor(Math.random() * enemyTypes.length);
        return enemyTypes[randomIndex]();
    }
}