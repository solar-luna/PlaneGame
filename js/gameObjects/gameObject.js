// GameObject - 所有游戏对象的基类
class GameObject {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        // 位置和尺寸
        this.position = new Vector2(x, y);
        this.width = width;
        this.height = height;
        
        // 速度
        this.velocity = new Vector2(0, 0);
        
        // 状态
        this.active = true;
        this.visible = true;
        
        // 生命周期
        this.age = 0;
        this.maxAge = -1; // -1表示无限生命
        
        // 渲染属性
        this.color = '#ffffff';
        this.alpha = 1.0;
        
        // 标识
        this.id = GameObject.generateId();
        this.tag = '';
    }

    // 更新游戏对象状态
    update(deltaTime) {
        if (!this.active) return;

        // 更新位置
        this.position = this.position.add(this.velocity.multiply(deltaTime));
        
        // 更新年龄
        this.age += deltaTime;
        
        // 检查生命周期
        if (this.maxAge > 0 && this.age >= this.maxAge) {
            this.destroy();
        }
    }

    // 渲染游戏对象
    render(ctx) {
        if (!this.visible || !this.active) return;

        // 保存当前绘图状态
        ctx.save();
        
        // 设置透明度
        ctx.globalAlpha = this.alpha;
        
        // 设置颜色
        ctx.fillStyle = this.color;
        
        // 绘制矩形（默认实现）
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // 恢复绘图状态
        ctx.restore();
    }

    // 获取碰撞边界
    getBounds() {
        return new Bounds(
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    // 获取中心点
    getCenter() {
        return new Vector2(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        );
    }

    // 设置位置
    setPosition(x, y) {
        if (x instanceof Vector2) {
            this.position = x.clone();
        } else {
            this.position.set(x, y);
        }
        return this;
    }

    // 设置速度
    setVelocity(x, y) {
        if (x instanceof Vector2) {
            this.velocity = x.clone();
        } else {
            this.velocity.set(x, y);
        }
        return this;
    }

    // 移动到指定位置
    moveTo(x, y) {
        return this.setPosition(x, y);
    }

    // 相对移动
    moveBy(x, y) {
        if (x instanceof Vector2) {
            this.position = this.position.add(x);
        } else {
            this.position.x += x;
            this.position.y += y;
        }
        return this;
    }

    // 检查是否超出屏幕边界
    isOutOfBounds(screenWidth = GameConfig.CANVAS_WIDTH, screenHeight = GameConfig.CANVAS_HEIGHT) {
        const bounds = this.getBounds();
        return (
            bounds.right <= 0 ||
            bounds.left >= screenWidth ||
            bounds.bottom <= 0 ||
            bounds.top >= screenHeight
        );
    }

    // 限制在屏幕边界内
    clampToScreen(screenWidth = GameConfig.CANVAS_WIDTH, screenHeight = GameConfig.CANVAS_HEIGHT) {
        this.position.x = Math.max(0, Math.min(this.position.x, screenWidth - this.width));
        this.position.y = Math.max(0, Math.min(this.position.y, screenHeight - this.height));
        return this;
    }

    // 检查与另一个对象的碰撞
    collidesWith(other) {
        if (!(other instanceof GameObject)) {
            return false;
        }
        
        if (!this.active || !other.active) {
            return false;
        }

        return this.getBounds().intersects(other.getBounds());
    }

    // 计算与另一个对象的距离
    distanceTo(other) {
        if (!(other instanceof GameObject)) {
            throw new Error('参数必须是GameObject实例');
        }
        
        return this.getCenter().distance(other.getCenter());
    }

    // 销毁对象
    destroy() {
        this.active = false;
        this.visible = false;
        this.onDestroy();
    }

    // 销毁时的回调（子类可重写）
    onDestroy() {
        // 子类可以重写此方法来处理销毁逻辑
    }

    // 碰撞时的回调（子类可重写）
    onCollision(other) {
        // 子类可以重写此方法来处理碰撞逻辑
    }

    // 设置标签
    setTag(tag) {
        this.tag = tag;
        return this;
    }

    // 检查标签
    hasTag(tag) {
        return this.tag === tag;
    }

    // 设置颜色
    setColor(color) {
        this.color = color;
        return this;
    }

    // 设置透明度
    setAlpha(alpha) {
        this.alpha = Math.max(0, Math.min(1, alpha));
        return this;
    }

    // 设置最大生命周期
    setMaxAge(maxAge) {
        this.maxAge = maxAge;
        return this;
    }

    // 检查是否存活
    isAlive() {
        return this.active;
    }

    // 检查是否可见
    isVisible() {
        return this.visible && this.active;
    }

    // 显示对象
    show() {
        this.visible = true;
        return this;
    }

    // 隐藏对象
    hide() {
        this.visible = false;
        return this;
    }

    // 激活对象
    activate() {
        this.active = true;
        return this;
    }

    // 停用对象
    deactivate() {
        this.active = false;
        return this;
    }

    // 转换为字符串
    toString() {
        return `GameObject(id: ${this.id}, pos: ${this.position.toString()}, size: ${this.width}x${this.height})`;
    }

    // 静态方法：生成唯一ID
    static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // 静态方法：检查两个对象是否碰撞
    static checkCollision(obj1, obj2) {
        if (!(obj1 instanceof GameObject) || !(obj2 instanceof GameObject)) {
            return false;
        }
        return obj1.collidesWith(obj2);
    }
}