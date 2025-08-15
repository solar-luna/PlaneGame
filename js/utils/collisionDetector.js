// CollisionDetector - 碰撞检测系统
class CollisionDetector {
    constructor() {
        // 碰撞检测统计
        this.collisionChecks = 0;
        this.collisionsDetected = 0;
    }

    // 检查两个游戏对象是否碰撞（AABB碰撞检测）
    static checkCollision(obj1, obj2) {
        // 参数验证
        if (!obj1 || !obj2) {
            return false;
        }

        // 检查对象是否激活
        if (!obj1.active || !obj2.active) {
            return false;
        }

        // 获取边界
        const bounds1 = obj1.getBounds();
        const bounds2 = obj2.getBounds();

        // AABB碰撞检测
        return bounds1.intersects(bounds2);
    }

    // 检查点是否在对象内
    static checkPointCollision(point, obj) {
        if (!point || !obj || !obj.active) {
            return false;
        }

        const bounds = obj.getBounds();
        return bounds.contains(point);
    }

    // 检查圆形碰撞（更精确的碰撞检测）
    static checkCircleCollision(obj1, obj2, radius1 = null, radius2 = null) {
        if (!obj1 || !obj2 || !obj1.active || !obj2.active) {
            return false;
        }

        // 获取中心点
        const center1 = obj1.getCenter();
        const center2 = obj2.getCenter();

        // 计算半径（如果未提供则使用对象尺寸的一半）
        const r1 = radius1 || Math.min(obj1.width, obj1.height) / 2;
        const r2 = radius2 || Math.min(obj2.width, obj2.height) / 2;

        // 计算距离
        const distance = center1.distance(center2);

        // 检查是否碰撞
        return distance <= (r1 + r2);
    }

    // 检查对象是否在边界内
    static checkBounds(obj, bounds) {
        if (!obj || !obj.active || !bounds) {
            return false;
        }

        const objBounds = obj.getBounds();
        return bounds.containsBounds(objBounds);
    }

    // 检查对象是否超出边界
    static checkOutOfBounds(obj, screenWidth, screenHeight) {
        if (!obj || !obj.active) {
            return false;
        }

        return obj.isOutOfBounds(screenWidth, screenHeight);
    }

    // 批量碰撞检测：检查一个对象与对象数组的碰撞
    static checkCollisionWithArray(obj, objArray) {
        const collisions = [];

        if (!obj || !obj.active || !Array.isArray(objArray)) {
            return collisions;
        }

        for (let i = 0; i < objArray.length; i++) {
            const other = objArray[i];
            if (other && other !== obj && CollisionDetector.checkCollision(obj, other)) {
                collisions.push({
                    object: other,
                    index: i
                });
            }
        }

        return collisions;
    }

    // 批量碰撞检测：检查两个对象数组之间的碰撞
    static checkCollisionBetweenArrays(array1, array2) {
        const collisions = [];

        if (!Array.isArray(array1) || !Array.isArray(array2)) {
            return collisions;
        }

        for (let i = 0; i < array1.length; i++) {
            const obj1 = array1[i];
            if (!obj1 || !obj1.active) continue;

            for (let j = 0; j < array2.length; j++) {
                const obj2 = array2[j];
                if (!obj2 || !obj2.active) continue;

                if (CollisionDetector.checkCollision(obj1, obj2)) {
                    collisions.push({
                        object1: obj1,
                        index1: i,
                        object2: obj2,
                        index2: j
                    });
                }
            }
        }

        return collisions;
    }

    // 空间分割优化的碰撞检测（用于大量对象）
    static checkCollisionWithSpatialPartitioning(objects, cellSize = 100) {
        const collisions = [];
        const grid = new Map();

        // 将对象分配到网格中
        objects.forEach((obj, index) => {
            if (!obj || !obj.active) return;

            const bounds = obj.getBounds();
            const startX = Math.floor(bounds.left / cellSize);
            const endX = Math.floor(bounds.right / cellSize);
            const startY = Math.floor(bounds.top / cellSize);
            const endY = Math.floor(bounds.bottom / cellSize);

            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    const key = `${x},${y}`;
                    if (!grid.has(key)) {
                        grid.set(key, []);
                    }
                    grid.get(key).push({ object: obj, index });
                }
            }
        });

        // 检查同一网格内的对象碰撞
        for (const cell of grid.values()) {
            for (let i = 0; i < cell.length; i++) {
                for (let j = i + 1; j < cell.length; j++) {
                    const obj1 = cell[i];
                    const obj2 = cell[j];

                    if (CollisionDetector.checkCollision(obj1.object, obj2.object)) {
                        collisions.push({
                            object1: obj1.object,
                            index1: obj1.index,
                            object2: obj2.object,
                            index2: obj2.index
                        });
                    }
                }
            }
        }

        return collisions;
    }

    // 射线投射检测
    static raycast(start, direction, distance, objects) {
        const hits = [];

        if (!start || !direction || !Array.isArray(objects)) {
            return hits;
        }

        const normalizedDirection = direction.normalize();
        const end = start.add(normalizedDirection.multiply(distance));

        objects.forEach((obj, index) => {
            if (!obj || !obj.active) return;

            const bounds = obj.getBounds();
            
            // 简单的射线-AABB相交检测
            if (CollisionDetector.rayIntersectsAABB(start, end, bounds)) {
                const center = obj.getCenter();
                const hitDistance = start.distance(center);
                
                hits.push({
                    object: obj,
                    index: index,
                    distance: hitDistance,
                    point: center
                });
            }
        });

        // 按距离排序
        hits.sort((a, b) => a.distance - b.distance);
        return hits;
    }

    // 射线与AABB相交检测
    static rayIntersectsAABB(rayStart, rayEnd, bounds) {
        const rayDir = rayEnd.subtract(rayStart);
        
        // 计算射线与边界的交点参数
        const tMinX = (bounds.left - rayStart.x) / rayDir.x;
        const tMaxX = (bounds.right - rayStart.x) / rayDir.x;
        const tMinY = (bounds.top - rayStart.y) / rayDir.y;
        const tMaxY = (bounds.bottom - rayStart.y) / rayDir.y;

        const tMin = Math.max(
            Math.min(tMinX, tMaxX),
            Math.min(tMinY, tMaxY)
        );
        const tMax = Math.min(
            Math.max(tMinX, tMaxX),
            Math.max(tMinY, tMaxY)
        );

        return tMax >= 0 && tMin <= tMax && tMin <= 1;
    }

    // 获取碰撞信息（包含碰撞点、法向量等）
    static getCollisionInfo(obj1, obj2) {
        if (!CollisionDetector.checkCollision(obj1, obj2)) {
            return null;
        }

        const bounds1 = obj1.getBounds();
        const bounds2 = obj2.getBounds();
        const center1 = obj1.getCenter();
        const center2 = obj2.getCenter();

        // 计算重叠区域
        const overlapLeft = Math.max(bounds1.left, bounds2.left);
        const overlapRight = Math.min(bounds1.right, bounds2.right);
        const overlapTop = Math.max(bounds1.top, bounds2.top);
        const overlapBottom = Math.min(bounds1.bottom, bounds2.bottom);

        const overlapWidth = overlapRight - overlapLeft;
        const overlapHeight = overlapBottom - overlapTop;

        // 碰撞点（重叠区域的中心）
        const collisionPoint = new Vector2(
            overlapLeft + overlapWidth / 2,
            overlapTop + overlapHeight / 2
        );

        // 碰撞法向量（从obj1指向obj2）
        const normal = center2.subtract(center1).normalize();

        return {
            point: collisionPoint,
            normal: normal,
            overlapWidth: overlapWidth,
            overlapHeight: overlapHeight,
            distance: center1.distance(center2)
        };
    }

    // 分离重叠的对象
    static separateObjects(obj1, obj2) {
        const info = CollisionDetector.getCollisionInfo(obj1, obj2);
        if (!info) return false;

        // 计算分离向量
        let separationVector;
        if (info.overlapWidth < info.overlapHeight) {
            // 水平分离
            separationVector = new Vector2(info.overlapWidth / 2, 0);
            if (obj1.getCenter().x > obj2.getCenter().x) {
                separationVector = separationVector.multiply(-1);
            }
        } else {
            // 垂直分离
            separationVector = new Vector2(0, info.overlapHeight / 2);
            if (obj1.getCenter().y > obj2.getCenter().y) {
                separationVector = separationVector.multiply(-1);
            }
        }

        // 应用分离
        obj1.moveBy(separationVector);
        obj2.moveBy(separationVector.multiply(-1));

        return true;
    }

    // 重置统计信息
    resetStats() {
        this.collisionChecks = 0;
        this.collisionsDetected = 0;
    }

    // 获取统计信息
    getStats() {
        return {
            checks: this.collisionChecks,
            detected: this.collisionsDetected,
            efficiency: this.collisionChecks > 0 ? this.collisionsDetected / this.collisionChecks : 0
        };
    }
}