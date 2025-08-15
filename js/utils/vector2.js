// Vector2 - 2D向量类，用于位置和速度计算
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    // 向量加法
    add(vector) {
        if (vector instanceof Vector2) {
            return new Vector2(this.x + vector.x, this.y + vector.y);
        }
        throw new Error('参数必须是Vector2实例');
    }

    // 向量减法
    subtract(vector) {
        if (vector instanceof Vector2) {
            return new Vector2(this.x - vector.x, this.y - vector.y);
        }
        throw new Error('参数必须是Vector2实例');
    }

    // 向量乘以标量
    multiply(scalar) {
        if (typeof scalar === 'number') {
            return new Vector2(this.x * scalar, this.y * scalar);
        }
        throw new Error('参数必须是数字');
    }

    // 向量除以标量
    divide(scalar) {
        if (typeof scalar === 'number' && scalar !== 0) {
            return new Vector2(this.x / scalar, this.y / scalar);
        }
        throw new Error('参数必须是非零数字');
    }

    // 获取向量长度
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    // 获取向量长度的平方（避免开方运算，用于性能优化）
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y;
    }

    // 归一化向量（单位向量）
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vector2(0, 0);
        }
        return this.divide(mag);
    }

    // 计算两个向量的距离
    distance(vector) {
        if (vector instanceof Vector2) {
            return this.subtract(vector).magnitude();
        }
        throw new Error('参数必须是Vector2实例');
    }

    // 计算两个向量距离的平方
    distanceSquared(vector) {
        if (vector instanceof Vector2) {
            return this.subtract(vector).magnitudeSquared();
        }
        throw new Error('参数必须是Vector2实例');
    }

    // 向量点积
    dot(vector) {
        if (vector instanceof Vector2) {
            return this.x * vector.x + this.y * vector.y;
        }
        throw new Error('参数必须是Vector2实例');
    }

    // 复制向量
    clone() {
        return new Vector2(this.x, this.y);
    }

    // 设置向量值
    set(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }

    // 检查向量是否为零向量
    isZero() {
        return this.x === 0 && this.y === 0;
    }

    // 转换为字符串
    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }

    // 静态方法：创建零向量
    static zero() {
        return new Vector2(0, 0);
    }

    // 静态方法：创建单位向量
    static one() {
        return new Vector2(1, 1);
    }

    // 静态方法：创建上方向向量
    static up() {
        return new Vector2(0, -1);
    }

    // 静态方法：创建下方向向量
    static down() {
        return new Vector2(0, 1);
    }

    // 静态方法：创建左方向向量
    static left() {
        return new Vector2(-1, 0);
    }

    // 静态方法：创建右方向向量
    static right() {
        return new Vector2(1, 0);
    }
}

// Bounds - 边界矩形类，用于碰撞检测
class Bounds {
    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    // 获取左边界
    get left() {
        return this.x;
    }

    // 获取右边界
    get right() {
        return this.x + this.width;
    }

    // 获取上边界
    get top() {
        return this.y;
    }

    // 获取下边界
    get bottom() {
        return this.y + this.height;
    }

    // 获取中心点
    get center() {
        return new Vector2(
            this.x + this.width / 2,
            this.y + this.height / 2
        );
    }

    // 检查是否与另一个边界相交
    intersects(other) {
        if (!(other instanceof Bounds)) {
            throw new Error('参数必须是Bounds实例');
        }

        return !(
            this.right < other.left ||
            this.left > other.right ||
            this.bottom < other.top ||
            this.top > other.bottom
        );
    }

    // 检查是否包含某个点
    contains(point) {
        if (point instanceof Vector2) {
            return (
                point.x >= this.left &&
                point.x <= this.right &&
                point.y >= this.top &&
                point.y <= this.bottom
            );
        }
        throw new Error('参数必须是Vector2实例');
    }

    // 检查是否完全包含另一个边界
    containsBounds(other) {
        if (!(other instanceof Bounds)) {
            throw new Error('参数必须是Bounds实例');
        }

        return (
            this.left <= other.left &&
            this.right >= other.right &&
            this.top <= other.top &&
            this.bottom >= other.bottom
        );
    }

    // 复制边界
    clone() {
        return new Bounds(this.x, this.y, this.width, this.height);
    }

    // 设置边界值
    set(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    }

    // 转换为字符串
    toString() {
        return `Bounds(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
    }
}