// Bullet - 子弹类
class Bullet extends GameObject {
    constructor(x, y, owner = 'player') {
        super(
            x, 
            y, 
            GameConfig.BULLET_WIDTH, 
            GameConfig.BULLET_HEIGHT
        );
        
        // 子弹属性
        this.owner = owner; // 'player' 或 'enemy'
        this.damage = 1;
        this.speed = GameConfig.BULLET_SPEED;
        
        // 设置标签和颜色
        this.tag = owner === 'player' ? 'player_bullet' : 'enemy_bullet';
        this.color = GameConfig.COLORS.BULLET;
        
        // 子弹默认向上移动（玩家子弹）
        if (owner === 'player') {
            this.setVelocity(0, -this.speed);
        } else {
            this.setVelocity(0, this.speed);
            this.color = '#ff8888'; // 敌方子弹用红色
        }
        
        // 设置生命周期（防止子弹永远存在）
        this.setMaxAge(5); // 5秒后自动销毁
    }

    // 更新子弹状态
    update(deltaTime) {
        if (!this.active) return;

        // 更新基类（包含位置更新）
        super.update(deltaTime);
        
        // 检查是否超出屏幕边界
        if (this.isOutOfBounds()) {
            this.destroy();
        }
    }

    // 渲染子弹
    render(ctx) {
        if (!this.visible || !this.active) return;

        // 保存绘图状态
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const centerX = this.position.x + this.width / 2;
        const centerY = this.position.y + this.height / 2;
        
        if (this.owner === 'player') {
            // 玩家子弹 - 根据类型渲染不同效果
            if (this.isLaser) {
                this.renderPlayerLaser(ctx, centerX, centerY);
            } else if (this.isPlasma) {
                this.renderPlayerPlasma(ctx, centerX, centerY);
            } else if (this.isBeam) {
                this.renderPlayerBeam(ctx, centerX, centerY);
            } else {
                this.renderPlayerNormal(ctx, centerX, centerY);
            }
        } else {
            // 敌方子弹 - 根据类型渲染不同效果
            if (this.isLaser) {
                this.renderEnemyLaser(ctx, centerX, centerY);
            } else if (this.isPlasma) {
                this.renderEnemyPlasma(ctx, centerX, centerY);
            } else {
                this.renderEnemyNormal(ctx, centerX, centerY);
            }
        }
        
        // 恢复绘图状态
        ctx.restore();
    }

    // 渲染敌方普通子弹
    renderEnemyNormal(ctx, centerX, centerY) {
        // 根据颜色渲染不同样式的子弹
        if (this.color === '#ff8888') {
            // 红色普通子弹
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

            // 边框
            ctx.strokeStyle = '#ff8888';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
        } else if (this.color === '#ffaa00') {
            // 橙色快速子弹
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
            ctx.fill();

            // 发光效果
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 4;
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        } else if (this.color === '#666666') {
            // 灰色隐形子弹
            ctx.globalAlpha *= 0.6;
            ctx.fillStyle = '#444444';
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

            // 隐形效果线条
            ctx.strokeStyle = '#888888';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
            ctx.setLineDash([]);
        } else if (this.color === '#00ffcc' || this.isQuantum) {
            // 量子子弹
            this.renderQuantumBullet(ctx, centerX, centerY);
        } else if (this.color === '#330066' || this.isVoid) {
            // 虚空子弹
            this.renderVoidBullet(ctx, centerX, centerY);
        } else if (this.color === '#88ccff' || this.isCrystal) {
            // 水晶子弹
            this.renderCrystalBullet(ctx, centerX, centerY);
        } else {
            // 默认红色能量球
            ctx.fillStyle = '#ff4400';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
            ctx.fill();

            // 发光效果
            ctx.shadowColor = '#ff4400';
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#ff8844';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 3, 0, Math.PI * 2);
            ctx.fill();

            // 核心
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffaa88';
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 渲染敌方激光子弹
    renderEnemyLaser(ctx, centerX, centerY) {
        // 激光核心
        ctx.fillStyle = '#ff0088';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // 激光光晕效果
        ctx.shadowColor = '#ff0088';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff44aa';
        ctx.fillRect(this.position.x - 1, this.position.y, this.width + 2, this.height);

        // 激光核心光束
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 1, this.position.y, 2, this.height);

        // 激光粒子效果
        const time = Date.now() * 0.01;
        for (let i = 0; i < 3; i++) {
            const y = this.position.y + (i * this.height / 3) + Math.sin(time + i) * 2;
            ctx.fillStyle = '#ffaaff';
            ctx.beginPath();
            ctx.arc(centerX, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 渲染敌方等离子子弹
    renderEnemyPlasma(ctx, centerX, centerY) {
        const time = Date.now() * 0.008;

        // 等离子球体
        ctx.fillStyle = '#8800ff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // 等离子能量波动效果
        const waveSize = 2 + Math.sin(time) * 1;
        ctx.strokeStyle = '#aa44ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2 + waveSize, 0, Math.PI * 2);
        ctx.stroke();

        // 内核
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 3, 0, Math.PI * 2);
        ctx.fill();

        // 能量粒子
        for (let i = 0; i < 4; i++) {
            const angle = time + (i * Math.PI / 2);
            const x = centerX + Math.cos(angle) * (this.width / 3);
            const y = centerY + Math.sin(angle) * (this.width / 3);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 设置子弹方向和速度
    setDirection(direction) {
        if (direction instanceof Vector2) {
            this.velocity = direction.normalize().multiply(this.speed);
        } else if (typeof direction === 'object' && direction.x !== undefined && direction.y !== undefined) {
            const dir = new Vector2(direction.x, direction.y);
            this.velocity = dir.normalize().multiply(this.speed);
        }
        return this;
    }

    // 设置子弹速度
    setSpeed(speed) {
        this.speed = Math.max(0, speed);
        
        // 更新当前速度向量
        if (!this.velocity.isZero()) {
            const direction = this.velocity.normalize();
            this.velocity = direction.multiply(this.speed);
        }
        
        return this;
    }

    // 设置子弹伤害
    setDamage(damage) {
        this.damage = Math.max(0, damage);
        return this;
    }

    // 获取子弹伤害
    getDamage() {
        return this.damage;
    }

    // 获取子弹所有者
    getOwner() {
        return this.owner;
    }

    // 检查是否是玩家子弹
    isPlayerBullet() {
        return this.owner === 'player';
    }

    // 检查是否是敌方子弹
    isEnemyBullet() {
        return this.owner === 'enemy';
    }

    // 碰撞处理
    onCollision(other) {
        super.onCollision(other);
        
        // 子弹碰撞后通常会销毁
        if (this.shouldDestroyOnCollision(other)) {
            this.destroy();
        }
    }

    // 渲染玩家普通子弹
    renderPlayerNormal(ctx, centerX, centerY) {
        // 玩家普通子弹 - 蓝色能量束
        ctx.fillStyle = '#00aaff';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // 发光效果
        ctx.shadowColor = '#00aaff';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#aaeeff';
        ctx.fillRect(this.position.x + 1, this.position.y, this.width - 2, this.height);

        // 核心光束
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 1, this.position.y, 2, this.height);
    }

    // 渲染玩家激光子弹
    renderPlayerLaser(ctx, centerX, centerY) {
        // 激光核心
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // 激光光晕效果
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#aaffff';
        ctx.fillRect(this.position.x - 1, this.position.y, this.width + 2, this.height);

        // 激光核心光束
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 1, this.position.y, 2, this.height);

        // 激光粒子效果
        const time = Date.now() * 0.01;
        for (let i = 0; i < 4; i++) {
            const y = this.position.y + (i * this.height / 4) + Math.sin(time + i) * 1;
            ctx.fillStyle = '#ccffff';
            ctx.beginPath();
            ctx.arc(centerX, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 渲染玩家等离子子弹
    renderPlayerPlasma(ctx, centerX, centerY) {
        const time = Date.now() * 0.008;

        // 等离子球体
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // 等离子能量波动效果
        const waveSize = 1 + Math.sin(time) * 0.5;
        ctx.strokeStyle = '#ff88ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2 + waveSize, 0, Math.PI * 2);
        ctx.stroke();

        // 内核
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 3, 0, Math.PI * 2);
        ctx.fill();

        // 能量粒子
        for (let i = 0; i < 3; i++) {
            const angle = time + (i * Math.PI * 2 / 3);
            const x = centerX + Math.cos(angle) * (this.width / 4);
            const y = centerY + Math.sin(angle) * (this.width / 4);
            ctx.fillStyle = '#ffaaff';
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 渲染玩家光束子弹
    renderPlayerBeam(ctx, centerX, centerY) {
        // 光束核心
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // 光束光晕效果
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ccccff';
        ctx.fillRect(this.position.x - 2, this.position.y, this.width + 4, this.height);

        // 光束能量波动
        const time = Date.now() * 0.02;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#aaaaff';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const offset = Math.sin(time + i) * 1;
            ctx.beginPath();
            ctx.moveTo(this.position.x + offset, this.position.y);
            ctx.lineTo(this.position.x + offset, this.position.y + this.height);
            ctx.stroke();
        }
    }

    // 判断碰撞后是否应该销毁
    shouldDestroyOnCollision(other) {
        // 玩家子弹碰到敌机
        if (this.isPlayerBullet() && other.hasTag('enemy')) {
            return true;
        }
        
        // 敌方子弹碰到玩家
        if (this.isEnemyBullet() && other.hasTag('player')) {
            return true;
        }
        
        // 子弹之间碰撞（可选）
        if (other.hasTag('player_bullet') || other.hasTag('enemy_bullet')) {
            return false; // 子弹之间不相互销毁
        }
        
        return false;
    }

    // 检查是否超出屏幕边界（重写基类方法以提供更精确的检测）
    isOutOfBounds(screenWidth = GameConfig.CANVAS_WIDTH, screenHeight = GameConfig.CANVAS_HEIGHT) {
        const bounds = this.getBounds();
        
        // 子弹完全离开屏幕才算超出边界
        return (
            bounds.right < 0 ||
            bounds.left > screenWidth ||
            bounds.bottom < 0 ||
            bounds.top > screenHeight
        );
    }

    // 创建特殊效果子弹的静态方法
    static createPlayerBullet(x, y) {
        const bullet = new Bullet(x, y, 'player');
        bullet.setVelocity(0, -GameConfig.BULLET_SPEED);
        return bullet;
    }

    static createEnemyBullet(x, y) {
        const bullet = new Bullet(x, y, 'enemy');
        bullet.setVelocity(0, GameConfig.BULLET_SPEED);
        return bullet;
    }

    // 创建追踪子弹（朝向目标）
    static createTrackingBullet(x, y, target, owner = 'enemy') {
        const bullet = new Bullet(x, y, owner);
        
        if (target && target.position) {
            const direction = target.position.subtract(new Vector2(x, y));
            bullet.setDirection(direction);
        }
        
        return bullet;
    }

    // 创建散射子弹
    static createSpreadBullets(x, y, count = 3, spreadAngle = Math.PI / 6, owner = 'enemy') {
        const bullets = [];
        const angleStep = spreadAngle / (count - 1);
        const startAngle = -spreadAngle / 2;
        
        for (let i = 0; i < count; i++) {
            const bullet = new Bullet(x, y, owner);
            const angle = startAngle + angleStep * i;
            
            // 计算方向向量
            const direction = new Vector2(
                Math.sin(angle),
                Math.cos(angle) * (owner === 'player' ? -1 : 1)
            );
            
            bullet.setDirection(direction);
            bullets.push(bullet);
        }
        
        return bullets;
    }

    // 销毁时的特效（可选）
    onDestroy() {
        super.onDestroy();
        // 这里可以添加子弹销毁时的粒子效果
        this.createDestroyEffect();
    }

    // 创建销毁特效（占位方法）
    createDestroyEffect() {
        // 可以在这里添加粒子效果或其他视觉效果
        // 目前只是占位，后续可以扩展
    }

    // 获取子弹状态信息
    getStatus() {
        return {
            owner: this.owner,
            damage: this.damage,
            speed: this.speed,
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            isAlive: this.isAlive(),
            age: this.age
        };
    }

    // 渲染量子子弹
    renderQuantumBullet(ctx, centerX, centerY) {
        const time = Date.now() * 0.01;

        // 量子核心
        ctx.fillStyle = '#00ffcc';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // 量子波动效果
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(this.position.x - 1, this.position.y - 1, this.width + 2, this.height + 2);
        ctx.stroke();

        // 量子粒子
        for (let i = 0; i < 2; i++) {
            const x = centerX + Math.sin(time + i * Math.PI) * 2;
            const y = centerY + Math.cos(time + i * Math.PI) * 2;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 渲染虚空子弹
    renderVoidBullet(ctx, centerX, centerY) {
        // 虚空黑洞效果
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 1,
            centerX, centerY, this.width / 2
        );
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.7, '#330066');
        gradient.addColorStop(1, 'rgba(51, 0, 102, 0.3)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // 虚空能量环
        const time = Date.now() * 0.005;
        ctx.strokeStyle = '#6600cc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2 + Math.sin(time) * 1, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 渲染水晶子弹
    renderCrystalBullet(ctx, centerX, centerY) {
        // 水晶光束
        ctx.fillStyle = '#88ccff';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // 水晶反光效果
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.position.x, this.position.y, 1, this.height);

        // 水晶光晕
        ctx.shadowColor = '#88ccff';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#aaddff';
        ctx.fillRect(this.position.x - 1, this.position.y, this.width + 2, this.height);
        ctx.shadowBlur = 0;
    }

    // 转换为字符串
    toString() {
        return `Bullet(owner: ${this.owner}, pos: ${this.position.toString()}, damage: ${this.damage})`;
    }
}