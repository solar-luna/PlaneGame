// Boss - BOSS基类
class Boss extends Enemy {
    constructor(x, y, health = 50) {
        super(x, y, 50); // BOSS移动较慢
        
        // BOSS属性
        this.width = 120;
        this.height = 80;
        this.health = health;
        this.maxHealth = health;
        this.scoreValue = 1000;
        
        // BOSS特殊属性
        this.phase = 1; // 战斗阶段
        this.maxPhase = 3;
        this.attackPattern = 0;
        this.attackTimer = 0;
        this.attackInterval = 2000;
        this.isInvulnerable = false;
        this.invulnerableTime = 0;
        
        // 移动模式
        this.movePattern = 'boss_hover';
        this.hoverCenterX = x;
        this.hoverAmplitude = 30; // 减小悬停幅度
        this.targetY = 100; // BOSS停留的Y位置
        this.hasReachedPosition = false;
        
        // 设置标签
        this.tag = 'boss';
        this.setCanShoot(true, 1000);
        
        console.log('BOSS创建完成');
    }

    // 更新BOSS状态
    update(deltaTime) {
        if (!this.active) return;

        // 更新BOSS移动逻辑
        this.updateBossMovement(deltaTime);
        
        // 更新基类（但不包括默认的向下移动）
        this.age += deltaTime;
        if (this.maxAge > 0 && this.age >= this.maxAge) {
            this.destroy();
        }
        
        // 更新战斗阶段
        this.updatePhase();
        
        // 更新攻击模式
        this.updateAttackPattern(deltaTime);
        
        // 更新无敌状态
        this.updateInvulnerability(deltaTime);
        
        // 更新子弹
        this.updateBullets(deltaTime);
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

    // 更新BOSS移动逻辑
    updateBossMovement(deltaTime) {
        if (!this.hasReachedPosition) {
            // BOSS向下移动到目标位置
            if (this.position.y < this.targetY) {
                this.position.y += this.speed * deltaTime;
            } else {
                this.hasReachedPosition = true;
                this.velocity.set(0, 0); // 停止向下移动
            }
        } else {
            // BOSS在目标位置悬停
            const time = Date.now() * 0.001;
            this.position.x = this.hoverCenterX + Math.sin(time) * this.hoverAmplitude;
            
            // 确保BOSS不会移出屏幕
            this.position.x = Math.max(0, Math.min(this.position.x, GameConfig.CANVAS_WIDTH - this.width));
        }
    }

    // 更新战斗阶段
    updatePhase() {
        const healthPercent = this.health / this.maxHealth;
        
        if (healthPercent > 0.66) {
            this.phase = 1;
        } else if (healthPercent > 0.33) {
            this.phase = 2;
        } else {
            this.phase = 3;
        }
    }

    // 更新攻击模式
    updateAttackPattern(deltaTime) {
        this.attackTimer += deltaTime * 1000;
        
        if (this.attackTimer >= this.attackInterval) {
            this.executeAttack();
            this.attackTimer = 0;
            
            // 根据阶段调整攻击间隔
            this.attackInterval = Math.max(500, 2000 - this.phase * 300);
        }
    }

    // 执行攻击
    executeAttack() {
        switch (this.phase) {
            case 1:
                this.phase1Attack();
                break;
            case 2:
                this.phase2Attack();
                break;
            case 3:
                this.phase3Attack();
                break;
        }
    }

    // 第一阶段攻击
    phase1Attack() {
        // 单发射击
        this.shoot();
    }

    // 第二阶段攻击
    phase2Attack() {
        // 三连发
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (this.isAlive()) {
                    this.shoot();
                }
            }, i * 200);
        }
    }

    // 第三阶段攻击
    phase3Attack() {
        // 散射攻击
        const bullets = Bullet.createSpreadBullets(
            this.position.x + this.width / 2,
            this.position.y + this.height,
            5,
            Math.PI / 3,
            'enemy'
        );
        
        bullets.forEach(bullet => {
            this.bullets.push(bullet);
        });
    }

    // 更新无敌状态
    updateInvulnerability(deltaTime) {
        if (this.isInvulnerable) {
            this.invulnerableTime += deltaTime * 1000;
            if (this.invulnerableTime >= 1000) { // 1秒无敌
                this.isInvulnerable = false;
                this.invulnerableTime = 0;
                this.alpha = 1.0;
            }
        }
    }

    // 受到伤害
    takeDamage(damage = 1) {
        if (this.isInvulnerable) return false;
        
        const result = super.takeDamage(damage);
        
        if (result && this.isAlive()) {
            // BOSS受伤后短暂无敌
            this.isInvulnerable = true;
            this.invulnerableTime = 0;
            this.alpha = 0.5;
        }
        
        return result;
    }

    // 渲染BOSS
    render(ctx) {
        if (!this.visible || !this.active) return;

        // 渲染BOSS本体
        this.renderBoss(ctx);
        
        // 渲染子弹
        this.bullets.forEach(bullet => bullet.render(ctx));
        
        // 渲染血量条
        this.renderBossHealthBar(ctx);
        
        // 渲染阶段指示器
        this.renderPhaseIndicator(ctx);
    }

    // 渲染BOSS血量条
    renderBossHealthBar(ctx) {
        if (!this.hasReachedPosition) return; // 只有BOSS到达位置后才显示血条
        
        const barWidth = GameConfig.CANVAS_WIDTH - 100;
        const barHeight = 20;
        const barX = 50;
        const barY = 30;
        
        // 保存绘图状态
        ctx.save();
        
        // 背景
        ctx.fillStyle = '#333333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // 血量
        const healthPercent = this.health / this.maxHealth;
        const healthWidth = barWidth * healthPercent;
        
        // 根据血量变色
        if (healthPercent > 0.6) {
            ctx.fillStyle = '#ff4444';
        } else if (healthPercent > 0.3) {
            ctx.fillStyle = '#ff8844';
        } else {
            ctx.fillStyle = '#ffaa44';
        }
        
        ctx.fillRect(barX, barY, healthWidth, barHeight);
        
        // 边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // 文字
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`BOSS - ${Math.ceil(healthPercent * 100)}%`, GameConfig.CANVAS_WIDTH / 2, barY + 15);
        
        // 恢复绘图状态
        ctx.restore();
    }

    // 渲染阶段指示器
    renderPhaseIndicator(ctx) {
        ctx.fillStyle = '#ffff00';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`阶段 ${this.phase}/${this.maxPhase}`, GameConfig.CANVAS_WIDTH - 20, 70);
    }

    // 渲染BOSS（基类实现）
    renderBoss(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const centerX = this.position.x + this.width / 2;
        const centerY = this.position.y + this.height / 2;
        
        // 基础BOSS外观
        ctx.fillStyle = '#aa0000';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // 装甲板
        ctx.fillStyle = '#660000';
        ctx.fillRect(this.position.x + 10, this.position.y + 10, this.width - 20, this.height - 20);
        
        // 核心
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 毁灭者BOSS
class BossDestroyer extends Boss {
    constructor(x, y) {
        super(x, y, 30);
        this.bossType = 'destroyer';
    }

    renderBoss(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const centerX = this.position.x + this.width / 2;
        const centerY = this.position.y + this.height / 2;
        
        // 主体 - 三角形战舰
        ctx.fillStyle = '#aa0000';
        ctx.beginPath();
        ctx.moveTo(centerX, this.position.y);
        ctx.lineTo(this.position.x, this.position.y + this.height);
        ctx.lineTo(this.position.x + this.width, this.position.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // 装甲
        ctx.fillStyle = '#660000';
        ctx.fillRect(this.position.x + 20, this.position.y + 40, this.width - 40, 20);
        
        // 武器系统
        ctx.fillStyle = '#ff4444';
        for (let i = 0; i < 3; i++) {
            const weaponX = this.position.x + 30 + i * 20;
            ctx.fillRect(weaponX, this.position.y + this.height - 10, 8, 15);
        }
        
        ctx.restore();
    }
}

// 要塞BOSS
class BossFortress extends Boss {
    constructor(x, y) {
        super(x, y, 50);
        this.bossType = 'fortress';
    }

    renderBoss(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // 主体 - 矩形要塞
        ctx.fillStyle = '#444444';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // 装甲板
        ctx.fillStyle = '#666666';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                ctx.fillRect(
                    this.position.x + 10 + i * 35,
                    this.position.y + 10 + j * 30,
                    25, 20
                );
            }
        }
        
        // 炮塔
        ctx.fillStyle = '#aa0000';
        const turrets = [
            { x: 20, y: 20 },
            { x: 60, y: 20 },
            { x: 100, y: 20 },
            { x: 40, y: 50 },
            { x: 80, y: 50 }
        ];
        
        turrets.forEach(turret => {
            ctx.beginPath();
            ctx.arc(
                this.position.x + turret.x,
                this.position.y + turret.y,
                8, 0, Math.PI * 2
            );
            ctx.fill();
        });
        
        ctx.restore();
    }

    // 要塞特殊攻击
    phase2Attack() {
        // 多炮塔齐射
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                if (this.isAlive()) {
                    const bulletX = this.position.x + 20 + i * 20;
                    const bulletY = this.position.y + this.height;
                    const bullet = new Bullet(bulletX, bulletY, 'enemy');
                    this.bullets.push(bullet);
                }
            }, i * 100);
        }
    }
}

// 母舰BOSS
class BossMothership extends Boss {
    constructor(x, y) {
        super(x, y, 80);
        this.bossType = 'mothership';
        this.width = 150;
        this.height = 100;
    }

    renderBoss(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const centerX = this.position.x + this.width / 2;
        const centerY = this.position.y + this.height / 2;
        
        // 主体 - 椭圆形母舰
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 上层结构
        ctx.fillStyle = '#555555';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 20, this.width / 3, this.height / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 发光核心
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // 能量环
        const time = Date.now() * 0.005;
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 + 0.5 * Math.sin(time)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30 + 10 * Math.sin(time), 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    // 母舰特殊攻击 - 生成小型敌机
    phase3Attack() {
        // 释放小型战斗机
        for (let i = 0; i < 2; i++) {
            const enemyX = this.position.x + 30 + i * 60;
            const enemyY = this.position.y + this.height;
            
            // 这里需要通过游戏管理器添加敌机
            // 暂时用子弹代替
            const bullet = new Bullet(enemyX, enemyY, 'enemy');
            bullet.setSpeed(100);
            this.bullets.push(bullet);
        }
    }
}

// 泰坦BOSS
class BossTitan extends Boss {
    constructor(x, y) {
        super(x, y, 120);
        this.bossType = 'titan';
        this.width = 180;
        this.height = 120;
    }

    renderBoss(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // 巨大的机械BOSS
        ctx.fillStyle = '#222222';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // 装甲层
        ctx.fillStyle = '#444444';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                ctx.fillRect(
                    this.position.x + 10 + i * 40,
                    this.position.y + 10 + j * 35,
                    30, 25
                );
            }
        }
        
        // 主炮
        ctx.fillStyle = '#aa0000';
        ctx.fillRect(
            this.position.x + this.width / 2 - 15,
            this.position.y + this.height - 20,
            30, 25
        );
        
        // 副炮
        ctx.fillStyle = '#ff4444';
        for (let i = 0; i < 6; i++) {
            const gunX = this.position.x + 20 + i * 25;
            ctx.fillRect(gunX, this.position.y + this.height - 10, 8, 15);
        }
        
        ctx.restore();
    }
}

// 终极BOSS
class BossUltimate extends Boss {
    constructor(x, y) {
        super(x, y, 200);
        this.bossType = 'ultimate';
        this.width = 200;
        this.height = 150;
        this.maxPhase = 4;
    }

    renderBoss(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const centerX = this.position.x + this.width / 2;
        const centerY = this.position.y + this.height / 2;
        const time = Date.now() * 0.01;
        
        // 主体 - 复杂的终极战舰
        ctx.fillStyle = '#111111';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // 能量核心
        ctx.fillStyle = `rgba(255, 0, 255, ${0.8 + 0.2 * Math.sin(time)})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // 旋转的能量环
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, 40 + i * 15, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 武器阵列
        ctx.fillStyle = '#ff0000';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time;
            const weaponX = centerX + Math.cos(angle) * 60;
            const weaponY = centerY + Math.sin(angle) * 40;
            ctx.beginPath();
            ctx.arc(weaponX, weaponY, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    // 终极BOSS的超级攻击
    phase3Attack() {
        // 全屏弹幕
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const bullet = new Bullet(
                this.position.x + this.width / 2,
                this.position.y + this.height / 2,
                'enemy'
            );
            bullet.setDirection(new Vector2(Math.cos(angle), Math.sin(angle)));
            this.bullets.push(bullet);
        }
    }
}