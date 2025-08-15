// PowerUp - 道具基类
class PowerUp extends GameObject {
    constructor(x, y, type) {
        super(x, y, 20, 20); // 道具大小为20x20
        
        this.type = type;
        this.speed = 100; // 道具下落速度
        this.lifeTime = 10000; // 道具存在时间10秒
        this.createdTime = Date.now();
        this.tag = 'powerup';
        
        // 道具颜色配置
        this.colors = {
            weapon: '#ffff00',      // 武器升级 - 黄色
            shield: '#00ffff',      // 护盾 - 青色
            health: '#ff0000',      // 生命 - 红色
            score: '#ff00ff',       // 分数加倍 - 紫色
            speed: '#00ff00'        // 速度提升 - 绿色
        };
        
        this.color = this.colors[type] || '#ffffff';
        
        // 闪烁效果
        this.blinkTimer = 0;
        this.blinkInterval = 500; // 闪烁间隔
        this.isBlinking = false;
    }

    // 更新道具状态
    update(deltaTime) {
        if (!this.active) return;

        // 向下移动
        this.position.y += this.speed * deltaTime;
        
        // 更新闪烁效果
        this.updateBlink(deltaTime);
        
        // 检查是否超出屏幕或超时
        if (this.isOutOfBounds() || this.isExpired()) {
            this.destroy();
        }
        
        super.update(deltaTime);
    }

    // 更新闪烁效果
    updateBlink(deltaTime) {
        this.blinkTimer += deltaTime * 1000;
        
        // 生命周期后期开始闪烁
        const timeLeft = this.lifeTime - (Date.now() - this.createdTime);
        if (timeLeft < 3000) { // 最后3秒开始闪烁
            this.isBlinking = true;
            if (this.blinkTimer >= this.blinkInterval) {
                this.alpha = this.alpha === 1.0 ? 0.3 : 1.0;
                this.blinkTimer = 0;
            }
        }
    }

    // 渲染道具
    render(ctx) {
        if (!this.visible || !this.active) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        const centerX = this.position.x + this.width / 2;
        const centerY = this.position.y + this.height / 2;
        
        // 绘制道具外框
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
        
        // 绘制道具内容
        this.renderPowerUpContent(ctx, centerX, centerY);
        
        ctx.restore();
    }

    // 渲染道具内容（子类重写）
    renderPowerUpContent(ctx, centerX, centerY) {
        // 默认绘制一个圆点
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // 检查是否过期
    isExpired() {
        return Date.now() - this.createdTime >= this.lifeTime;
    }

    // 被玩家拾取
    onPickup(player) {
        this.applyEffect(player);
        this.destroy();
        
        // 播放拾取音效
        if (window.audioManager) {
            window.audioManager.playPickupSound();
        }
        
        console.log(`玩家拾取了${this.type}道具`);
    }

    // 应用道具效果（子类重写）
    applyEffect(player) {
        // 子类实现具体效果
    }

    // 获取道具描述
    getDescription() {
        return `${this.type} 道具`;
    }
}

// 武器升级道具
class WeaponUpgrade extends PowerUp {
    constructor(x, y) {
        super(x, y, 'weapon');
    }

    // 渲染武器升级道具
    renderPowerUpContent(ctx, centerX, centerY) {
        ctx.fillStyle = this.color;
        
        // 绘制向上的箭头
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 6);
        ctx.lineTo(centerX - 4, centerY + 2);
        ctx.lineTo(centerX - 2, centerY + 2);
        ctx.lineTo(centerX - 2, centerY + 6);
        ctx.lineTo(centerX + 2, centerY + 6);
        ctx.lineTo(centerX + 2, centerY + 2);
        ctx.lineTo(centerX + 4, centerY + 2);
        ctx.closePath();
        ctx.fill();
    }

    // 应用武器升级效果
    applyEffect(player) {
        const upgraded = player.upgradeWeapon();
        if (upgraded) {
            // 显示升级提示
            this.showUpgradeNotification(player.getWeaponLevel(), player.getWeaponType());
        } else {
            // 武器已满级，给予分数奖励
            if (window.gameManager) {
                window.gameManager.addScore(500);
                this.showMaxLevelNotification();
            }
        }
    }

    // 显示升级通知
    showUpgradeNotification(level, type) {
        const notification = document.createElement('div');
        notification.className = 'weapon-upgrade-notification';
        notification.textContent = `武器升级！等级 ${level} - ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 0, 0.9);
            color: black;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    // 显示满级通知
    showMaxLevelNotification() {
        const notification = document.createElement('div');
        notification.className = 'weapon-max-notification';
        notification.textContent = '武器已满级！获得500分奖励';
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 215, 0, 0.9);
            color: black;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    getDescription() {
        return '武器升级道具 - 提升火力等级';
    }
}

// 护盾道具
class ShieldPowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y, 'shield');
        this.duration = 5000; // 护盾持续5秒
    }

    // 渲染护盾道具
    renderPowerUpContent(ctx, centerX, centerY) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        
        // 绘制盾牌形状
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 6);
        ctx.quadraticCurveTo(centerX - 6, centerY - 4, centerX - 6, centerY + 2);
        ctx.quadraticCurveTo(centerX - 6, centerY + 6, centerX, centerY + 8);
        ctx.quadraticCurveTo(centerX + 6, centerY + 6, centerX + 6, centerY + 2);
        ctx.quadraticCurveTo(centerX + 6, centerY - 4, centerX, centerY - 6);
        ctx.stroke();
    }

    // 应用护盾效果
    applyEffect(player) {
        // 给玩家添加临时护盾
        player.addShield(this.duration);
        this.showShieldNotification();
    }

    // 显示护盾通知
    showShieldNotification() {
        const notification = document.createElement('div');
        notification.className = 'shield-notification';
        notification.textContent = '护盾激活！5秒无敌时间';
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 255, 255, 0.9);
            color: black;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    getDescription() {
        return '护盾道具 - 临时无敌保护';
    }
}

// 生命恢复道具
class HealthPowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y, 'health');
        this.healAmount = 1;
    }

    // 渲染生命道具
    renderPowerUpContent(ctx, centerX, centerY) {
        ctx.fillStyle = this.color;
        ctx.lineWidth = 2;
        
        // 绘制十字
        ctx.fillRect(centerX - 1, centerY - 6, 2, 12);
        ctx.fillRect(centerX - 6, centerY - 1, 12, 2);
    }

    // 应用生命恢复效果
    applyEffect(player) {
        const healed = player.heal(this.healAmount);
        this.showHealthNotification();
    }

    // 显示生命恢复通知
    showHealthNotification() {
        const notification = document.createElement('div');
        notification.className = 'health-notification';
        notification.textContent = '生命恢复！+1生命值';
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    getDescription() {
        return '生命道具 - 恢复1点生命值';
    }
}

// 分数加倍道具
class ScoreMultiplierPowerUp extends PowerUp {
    constructor(x, y) {
        super(x, y, 'score');
        this.multiplier = 2;
        this.duration = 10000; // 持续10秒
    }

    // 渲染分数加倍道具
    renderPowerUpContent(ctx, centerX, centerY) {
        ctx.fillStyle = this.color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('x2', centerX, centerY + 4);
    }

    // 应用分数加倍效果
    applyEffect(player) {
        // 通过游戏管理器应用分数加倍效果
        if (window.gameManager) {
            window.gameManager.addScoreMultiplier(this.multiplier, this.duration);
            this.showScoreMultiplierNotification();
        }
    }

    // 显示分数加倍通知
    showScoreMultiplierNotification() {
        const notification = document.createElement('div');
        notification.className = 'score-multiplier-notification';
        notification.textContent = '分数加倍！10秒内得分x2';
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 0, 255, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }

    getDescription() {
        return '分数加倍道具 - 10秒内得分翻倍';
    }
}