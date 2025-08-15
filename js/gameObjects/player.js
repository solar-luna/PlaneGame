// Player - 玩家飞机类
class Player extends GameObject {
    constructor(x, y) {
        super(
            x, 
            y, 
            GameConfig.PLAYER_WIDTH, 
            GameConfig.PLAYER_HEIGHT
        );
        
        // 玩家属性
        this.lives = GameConfig.PLAYER_LIVES;
        this.maxLives = GameConfig.PLAYER_LIVES;
        this.speed = GameConfig.PLAYER_SPEED;
        
        // 射击相关
        this.lastShotTime = 0;
        this.shotInterval = GameConfig.BULLET_INTERVAL;
        this.bullets = [];
        
        // 武器系统
        this.weaponLevel = 1;
        this.maxWeaponLevel = 8;
        this.weaponTypes = {
            1: 'single',    // 单发
            2: 'double',    // 双发
            3: 'triple',    // 三发
            4: 'spread',    // 散射
            5: 'laser',     // 激光
            6: 'plasma',    // 等离子
            7: 'beam',      // 光束
            8: 'ultimate'   // 终极武器
        };
        
        // 无敌时间（受伤后的保护时间）
        this.invulnerable = false;
        this.invulnerableTime = 0;
        this.invulnerableDuration = 2000; // 2秒无敌时间
        
        // 护盾系统
        this.hasShield = false;
        this.shieldTime = 0;
        this.shieldDuration = 0;
        
        // 移动状态
        this.moveDirection = new Vector2(0, 0);
        
        // 渲染属性
        this.color = GameConfig.COLORS.PLAYER;
        this.tag = 'player';
        
        // 闪烁效果（无敌时使用）
        this.blinkTimer = 0;
        this.blinkInterval = 100; // 闪烁间隔
    }

    // 更新玩家状态
    update(deltaTime) {
        if (!this.active) return;

        // 更新基类
        super.update(deltaTime);
        
        // 更新移动
        this.updateMovement(deltaTime);
        
        // 更新射击
        this.updateShooting(deltaTime);
        
        // 更新无敌状态
        this.updateInvulnerability(deltaTime);
        
        // 更新子弹
        this.updateBullets(deltaTime);
        
        // 创建推进器火焰效果
        this.updateThrusterEffect(deltaTime);
        
        // 限制在屏幕边界内
        this.clampToScreen();
    }

    // 更新移动
    updateMovement(deltaTime) {
        if (this.moveDirection.isZero()) return;

        // 计算移动距离
        const moveDistance = this.speed * deltaTime;
        const movement = this.moveDirection.normalize().multiply(moveDistance);
        
        // 应用移动
        this.position = this.position.add(movement);
    }

    // 更新射击
    updateShooting(deltaTime) {
        const currentTime = Date.now();
        
        // 检查是否可以射击
        if (currentTime - this.lastShotTime >= this.shotInterval) {
            this.shoot();
            this.lastShotTime = currentTime;
        }
    }

    // 更新无敌状态
    updateInvulnerability(deltaTime) {
        if (this.invulnerable) {
            this.invulnerableTime += deltaTime * 1000; // 转换为毫秒
            this.blinkTimer += deltaTime * 1000; // 转换为毫秒

            // 检查无敌时间是否结束
            if (this.invulnerableTime >= this.invulnerableDuration) {
                this.invulnerable = false;
                this.invulnerableTime = 0;
                this.alpha = 1.0; // 恢复完全不透明
                console.log('玩家无敌状态结束');
            }
        }
        
        // 更新护盾状态
        if (this.hasShield) {
            this.shieldTime += deltaTime * 1000; // 转换为毫秒
            
            if (this.shieldTime >= this.shieldDuration) {
                this.hasShield = false;
                this.shieldTime = 0;
                console.log('护盾效果结束');
            }
        }
    }

    // 更新子弹
    updateBullets(deltaTime) {
        // 更新所有子弹
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(deltaTime);
            
            // 移除超出屏幕的子弹
            if (bullet.isOutOfBounds() || !bullet.isAlive()) {
                this.bullets.splice(i, 1);
            }
        }
    }

    // 渲染玩家
    render(ctx) {
        if (!this.visible || !this.active) return;

        // 无敌时的闪烁效果
        if (this.invulnerable) {
            if (this.blinkTimer >= this.blinkInterval) {
                this.alpha = this.alpha === 1.0 ? 0.3 : 1.0;
                this.blinkTimer = 0;
            }
        }

        // 渲染玩家飞机（飞机形状）
        this.renderPlayerAircraft(ctx);
        
        // 渲染子弹
        this.bullets.forEach(bullet => bullet.render(ctx));
    }

    // 渲染玩家飞机形状
    renderPlayerAircraft(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const centerX = this.position.x + this.width / 2;
        const centerY = this.position.y + this.height / 2;
        
        // 绘制飞机主体
        ctx.fillStyle = '#00ff00'; // 绿色
        ctx.beginPath();
        // 机身
        ctx.moveTo(centerX, this.position.y);
        ctx.lineTo(centerX - 8, this.position.y + 25);
        ctx.lineTo(centerX - 15, this.position.y + 20);
        ctx.lineTo(centerX - 12, this.position.y + 35);
        ctx.lineTo(centerX - 4, this.position.y + 40);
        ctx.lineTo(centerX, this.position.y + 35);
        ctx.lineTo(centerX + 4, this.position.y + 40);
        ctx.lineTo(centerX + 12, this.position.y + 35);
        ctx.lineTo(centerX + 15, this.position.y + 20);
        ctx.lineTo(centerX + 8, this.position.y + 25);
        ctx.closePath();
        ctx.fill();
        
        // 绘制机翼
        ctx.fillStyle = '#00cc00';
        ctx.beginPath();
        ctx.moveTo(centerX - 15, this.position.y + 20);
        ctx.lineTo(centerX - 25, this.position.y + 15);
        ctx.lineTo(centerX - 20, this.position.y + 30);
        ctx.lineTo(centerX - 12, this.position.y + 35);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 15, this.position.y + 20);
        ctx.lineTo(centerX + 25, this.position.y + 15);
        ctx.lineTo(centerX + 20, this.position.y + 30);
        ctx.lineTo(centerX + 12, this.position.y + 35);
        ctx.closePath();
        ctx.fill();
        
        // 绘制驾驶舱
        ctx.fillStyle = '#0088ff';
        ctx.beginPath();
        ctx.arc(centerX, this.position.y + 15, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制引擎喷火效果
        if (this.velocity.magnitude() > 0) {
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(centerX - 3, this.position.y + 40);
            ctx.lineTo(centerX, this.position.y + 45 + Math.random() * 5);
            ctx.lineTo(centerX + 3, this.position.y + 40);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.moveTo(centerX - 2, this.position.y + 40);
            ctx.lineTo(centerX, this.position.y + 43 + Math.random() * 3);
            ctx.lineTo(centerX + 2, this.position.y + 40);
            ctx.closePath();
            ctx.fill();
        }
        
        // 绘制护盾效果
        if (this.hasShield) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.7;
            
            // 绘制护盾圆环
            ctx.beginPath();
            ctx.arc(centerX, centerY, this.width / 2 + 8, 0, Math.PI * 2);
            ctx.stroke();
            
            // 绘制护盾粒子效果
            const time = Date.now() * 0.005;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + time;
                const radius = this.width / 2 + 10;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                ctx.fillStyle = '#00ffff';
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }

    // 设置移动方向
    setMoveDirection(direction) {
        if (direction instanceof Vector2) {
            this.moveDirection = direction.clone();
        } else {
            this.moveDirection.set(direction.x || 0, direction.y || 0);
        }
        return this;
    }

    // 移动控制方法
    moveUp() {
        this.moveDirection.y = -1;
        return this;
    }

    moveDown() {
        this.moveDirection.y = 1;
        return this;
    }

    moveLeft() {
        this.moveDirection.x = -1;
        return this;
    }

    moveRight() {
        this.moveDirection.x = 1;
        return this;
    }

    stopVertical() {
        this.moveDirection.y = 0;
        return this;
    }

    stopHorizontal() {
        this.moveDirection.x = 0;
        return this;
    }

    stopMoving() {
        this.moveDirection.set(0, 0);
        return this;
    }

    // 射击
    shoot() {
        if (!this.active) return null;

        const bullets = [];
        const weaponType = this.weaponTypes[this.weaponLevel];
        
        switch (weaponType) {
            case 'single':
                bullets.push(this.createBullet(0, 0));
                break;
            case 'double':
                bullets.push(this.createBullet(-8, 0));
                bullets.push(this.createBullet(8, 0));
                break;
            case 'triple':
                bullets.push(this.createBullet(-12, 0));
                bullets.push(this.createBullet(0, 0));
                bullets.push(this.createBullet(12, 0));
                break;
            case 'spread':
                bullets.push(this.createBullet(-15, 0, -0.3));
                bullets.push(this.createBullet(-8, 0, -0.15));
                bullets.push(this.createBullet(0, 0, 0));
                bullets.push(this.createBullet(8, 0, 0.15));
                bullets.push(this.createBullet(15, 0, 0.3));
                break;
            case 'laser':
                const laser = this.createLaserBullet();
                if (laser) bullets.push(laser);
                break;
            case 'plasma':
                const plasma1 = this.createPlasmaBullet(-6);
                const plasma2 = this.createPlasmaBullet(6);
                if (plasma1) bullets.push(plasma1);
                if (plasma2) bullets.push(plasma2);
                break;
            case 'beam':
                const beam = this.createBeamBullet();
                if (beam) bullets.push(beam);
                break;
            case 'ultimate':
                // 终极武器：激光+等离子+散射
                const ultimateLaser = this.createLaserBullet();
                const ultimatePlasma1 = this.createPlasmaBullet(-10);
                const ultimatePlasma2 = this.createPlasmaBullet(10);
                bullets.push(this.createBullet(-20, 0, -0.4));
                bullets.push(this.createBullet(20, 0, 0.4));
                if (ultimateLaser) bullets.push(ultimateLaser);
                if (ultimatePlasma1) bullets.push(ultimatePlasma1);
                if (ultimatePlasma2) bullets.push(ultimatePlasma2);
                break;
        }
        
        // 添加子弹到数组
        bullets.forEach(bullet => {
            if (bullet) this.bullets.push(bullet);
        });
        
        // 播放射击音效
        if (window.audioManager) {
            window.audioManager.playShootSound();
        }
        
        // 创建子弹轨迹粒子效果
        if (window.gameManager && window.gameManager.particleSystem) {
            bullets.forEach(bullet => {
                if (bullet) {
                    window.gameManager.particleSystem.createBulletTrail(
                        bullet.position.x + bullet.width / 2,
                        bullet.position.y + bullet.height / 2,
                        '#ffffff'
                    );
                }
            });
        }
        
        return bullets;
    }

    // 创建普通子弹
    createBullet(offsetX = 0, offsetY = 0, angleOffset = 0) {
        const bulletX = this.position.x + this.width / 2 - GameConfig.BULLET_WIDTH / 2 + offsetX;
        const bulletY = this.position.y - GameConfig.BULLET_HEIGHT + offsetY;
        
        const bullet = new Bullet(bulletX, bulletY, 'player');
        const speed = GameConfig.BULLET_SPEED;
        const vx = speed * Math.sin(angleOffset);
        const vy = -speed * Math.cos(angleOffset);
        
        bullet.setVelocity(vx, vy);
        return bullet;
    }

    // 创建激光子弹
    createLaserBullet() {
        const bulletX = this.position.x + this.width / 2 - GameConfig.BULLET_WIDTH / 2;
        const bulletY = this.position.y - GameConfig.BULLET_HEIGHT;

        const bullet = new Bullet(bulletX, bulletY, 'player');
        bullet.setVelocity(0, -GameConfig.BULLET_SPEED * 1.5);

        // 激光子弹特殊属性
        bullet.damage = 2;
        bullet.color = '#00ffff';
        bullet.width = GameConfig.BULLET_WIDTH * 2;
        bullet.isLaser = true;

        return bullet;
    }

    // 创建等离子子弹
    createPlasmaBullet(offsetX = 0) {
        const bulletX = this.position.x + this.width / 2 - 3 + offsetX;
        const bulletY = this.position.y - 6;

        const bullet = new Bullet(bulletX, bulletY, 'player');
        bullet.setVelocity(0, -GameConfig.BULLET_SPEED * 1.2);

        // 等离子子弹特殊属性
        bullet.damage = 3;
        bullet.color = '#ff00ff';
        bullet.width = 6;
        bullet.height = 6;
        bullet.isPlasma = true;

        return bullet;
    }

    // 创建光束子弹
    createBeamBullet() {
        const bulletX = this.position.x + this.width / 2 - 1;
        const bulletY = this.position.y - 30;

        const bullet = new Bullet(bulletX, bulletY, 'player');
        bullet.setVelocity(0, -GameConfig.BULLET_SPEED * 2);

        // 光束子弹特殊属性
        bullet.damage = 4;
        bullet.color = '#ffffff';
        bullet.width = 2;
        bullet.height = 30;
        bullet.isBeam = true;

        return bullet;
    }

    // 升级武器
    upgradeWeapon() {
        if (this.weaponLevel < this.maxWeaponLevel) {
            this.weaponLevel++;

            // 根据武器等级调整射击间隔
            this.updateWeaponStats();

            console.log(`武器升级到等级 ${this.weaponLevel}: ${this.weaponTypes[this.weaponLevel]}`);
            return true;
        }
        return false;
    }

    // 更新武器属性
    updateWeaponStats() {
        // 根据武器等级调整射击间隔（等级越高射击越快）
        const baseInterval = GameConfig.BULLET_INTERVAL;
        const intervalReduction = (this.weaponLevel - 1) * 30; // 每级减少30ms
        this.shotInterval = Math.max(100, baseInterval - intervalReduction);

        console.log(`武器等级 ${this.weaponLevel} 射击间隔: ${this.shotInterval}ms`);
    }

    // 获取武器等级
    getWeaponLevel() {
        return this.weaponLevel;
    }

    // 获取武器类型
    getWeaponType() {
        return this.weaponTypes[this.weaponLevel];
    }

    // 添加护盾
    addShield(duration) {
        this.hasShield = true;
        this.shieldTime = 0;
        this.shieldDuration = duration;
        console.log(`护盾激活，持续时间: ${duration}ms`);
    }

    // 检查是否有护盾
    isShielded() {
        return this.hasShield;
    }

    // 受到伤害
    takeDamage(damage = 1) {
        if (this.invulnerable || !this.active) {
            console.log(`玩家受到攻击但未扣血 - 无敌状态: ${this.invulnerable}, 激活状态: ${this.active}`);
            return false;
        }

        // 护盾可以阻挡伤害
        if (this.hasShield) {
            console.log('护盾阻挡了伤害！');
            return false;
        }

        const oldLives = this.lives;
        this.lives -= damage;

        console.log(`玩家受到${damage}点伤害，生命值从${oldLives}变为${this.lives}`);

        // 触发无敌状态
        if (this.lives > 0) {
            this.invulnerable = true;
            this.invulnerableTime = 0;
            console.log('玩家进入无敌状态');
        }

        // 检查是否死亡
        if (this.lives <= 0) {
            this.lives = 0;
            this.die();
        }

        return true;
    }

    // 恢复生命
    heal(amount = 1) {
        this.lives = Math.min(this.maxLives, this.lives + amount);
        return this;
    }

    // 死亡
    die() {
        this.destroy();
        this.onDeath();
    }

    // 死亡回调
    onDeath() {
        // 子类或游戏管理器可以重写此方法
        console.log('玩家死亡');
    }

    // 重置玩家状态
    reset() {
        this.lives = this.maxLives;
        this.invulnerable = false;
        this.invulnerableTime = 0;
        this.alpha = 1.0;
        this.bullets = [];
        this.moveDirection.set(0, 0);
        this.active = true;
        this.visible = true;
        
        // 重置武器等级
        this.weaponLevel = 1;
        
        // 重置到初始位置
        this.setPosition(
            GameConfig.CANVAS_WIDTH / 2 - this.width / 2,
            GameConfig.CANVAS_HEIGHT - this.height - 50
        );
        
        return this;
    }

    // 获取所有子弹
    getBullets() {
        return this.bullets.slice(); // 返回副本
    }

    // 清除所有子弹
    clearBullets() {
        this.bullets = [];
        return this;
    }

    // 检查是否存活
    isAlive() {
        return this.active && this.lives > 0;
    }

    // 检查是否无敌
    isInvulnerable() {
        return this.invulnerable;
    }

    // 获取生命值
    getLives() {
        return this.lives;
    }

    // 设置生命值
    setLives(lives) {
        this.lives = Math.max(0, Math.min(this.maxLives, lives));
        return this;
    }

    // 碰撞处理
    onCollision(other) {
        super.onCollision(other);

        // 与敌机碰撞
        if (other.hasTag('enemy')) {
            this.takeDamage(1);
        }

        // 与敌机子弹碰撞
        if (other.hasTag('enemy_bullet')) {
            const damage = other.getDamage ? other.getDamage() : 1;
            this.takeDamage(damage);
        }
    }

    // 设置射击间隔
    setShotInterval(interval) {
        this.shotInterval = Math.max(50, interval); // 最小50ms间隔
        return this;
    }

    // 设置移动速度
    setSpeed(speed) {
        this.speed = Math.max(0, speed);
        return this;
    }

    // 获取状态信息
    getStatus() {
        return {
            lives: this.lives,
            maxLives: this.maxLives,
            position: this.position.clone(),
            invulnerable: this.invulnerable,
            bulletCount: this.bullets.length,
            isAlive: this.isAlive()
        };
    }

    // 更新推进器火焰效果
    updateThrusterEffect(deltaTime) {
        // 只有在移动时才产生推进器效果
        if (!this.moveDirection.isZero() && window.gameManager && window.gameManager.particleSystem) {
            // 创建推进器火焰粒子
            const centerX = this.position.x + this.width / 2;
            const thrusterY = this.position.y + this.height;
            
            // 根据移动方向调整推进器位置
            window.gameManager.particleSystem.createThrusterFlame(
                centerX + (Math.random() - 0.5) * 6,
                thrusterY,
                new Vector2(0, 1) // 向下的方向
            );
        }
    }

    // 销毁时清理资源
    onDestroy() {
        super.onDestroy();
        this.clearBullets();
    }
}