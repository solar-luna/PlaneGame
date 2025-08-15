// Particle - 粒子类
class Particle {
    constructor(x, y, vx, vy, life, color, size = 2) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(vx, vy);
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.alpha = 1.0;
        this.gravity = 0;
        this.active = true;
    }

    // 更新粒子
    update(deltaTime) {
        if (!this.active) return;

        // 更新位置
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // 应用重力
        this.velocity.y += this.gravity * deltaTime;
        
        // 更新生命值
        this.life -= deltaTime;
        
        // 计算透明度
        this.alpha = Math.max(0, this.life / this.maxLife);
        
        // 检查是否死亡
        if (this.life <= 0) {
            this.active = false;
        }
    }

    // 渲染粒子
    render(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    // 检查是否存活
    isAlive() {
        return this.active;
    }
}

// ParticleSystem - 粒子系统管理器
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500; // 最大粒子数量
        this.particlePool = []; // 粒子对象池
        
        // 预创建粒子池
        this.initParticlePool();
        
        console.log('粒子系统初始化完成');
    }

    // 初始化粒子对象池
    initParticlePool() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(new Particle(0, 0, 0, 0, 0, '#ffffff'));
        }
    }

    // 从对象池获取粒子
    getParticle() {
        for (let particle of this.particlePool) {
            if (!particle.active) {
                return particle;
            }
        }
        return null; // 池子满了
    }

    // 创建爆炸效果
    createExplosion(x, y, color = '#ff6600', particleCount = 15) {
        for (let i = 0; i < particleCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;

            // 随机方向和速度
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = 100 + Math.random() * 150;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            // 重置粒子属性
            particle.position.set(x, y);
            particle.velocity.set(vx, vy);
            particle.life = 0.5 + Math.random() * 0.5;
            particle.maxLife = particle.life;
            particle.color = color;
            particle.size = 2 + Math.random() * 3;
            particle.alpha = 1.0;
            particle.gravity = 50;
            particle.active = true;

            this.particles.push(particle);
        }
    }

    // 创建推进器火焰效果
    createThrusterFlame(x, y, direction = new Vector2(0, 1)) {
        const particle = this.getParticle();
        if (!particle) return;

        // 火焰粒子属性
        const spread = 0.3;
        const vx = direction.x * -80 + (Math.random() - 0.5) * spread * 100;
        const vy = direction.y * -80 + (Math.random() - 0.5) * spread * 100;

        particle.position.set(x + (Math.random() - 0.5) * 8, y);
        particle.velocity.set(vx, vy);
        particle.life = 0.2 + Math.random() * 0.3;
        particle.maxLife = particle.life;
        particle.color = Math.random() > 0.5 ? '#ff6600' : '#ffaa00';
        particle.size = 1 + Math.random() * 2;
        particle.alpha = 1.0;
        particle.gravity = 0;
        particle.active = true;

        this.particles.push(particle);
    }

    // 创建子弹轨迹效果
    createBulletTrail(x, y, color = '#ffffff') {
        const particle = this.getParticle();
        if (!particle) return;

        particle.position.set(x + (Math.random() - 0.5) * 4, y + (Math.random() - 0.5) * 4);
        particle.velocity.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
        particle.life = 0.1 + Math.random() * 0.2;
        particle.maxLife = particle.life;
        particle.color = color;
        particle.size = 1;
        particle.alpha = 1.0;
        particle.gravity = 0;
        particle.active = true;

        this.particles.push(particle);
    }

    // 创建星空背景粒子
    createStarField(canvasWidth, canvasHeight, starCount = 50) {
        for (let i = 0; i < starCount; i++) {
            const particle = this.getParticle();
            if (!particle) break;

            particle.position.set(Math.random() * canvasWidth, Math.random() * canvasHeight);
            particle.velocity.set(0, 20 + Math.random() * 30); // 向下移动
            particle.life = 10; // 长生命周期
            particle.maxLife = particle.life;
            particle.color = '#ffffff';
            particle.size = Math.random() * 2;
            particle.alpha = 0.3 + Math.random() * 0.7;
            particle.gravity = 0;
            particle.active = true;

            this.particles.push(particle);
        }
    }

    // 创建击中效果
    createHitEffect(x, y, color = '#ffff00') {
        for (let i = 0; i < 8; i++) {
            const particle = this.getParticle();
            if (!particle) break;

            const angle = (Math.PI * 2 * i) / 8;
            const speed = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            particle.position.set(x, y);
            particle.velocity.set(vx, vy);
            particle.life = 0.3 + Math.random() * 0.2;
            particle.maxLife = particle.life;
            particle.color = color;
            particle.size = 1 + Math.random() * 2;
            particle.alpha = 1.0;
            particle.gravity = 0;
            particle.active = true;

            this.particles.push(particle);
        }
    }

    // 更新所有粒子
    update(deltaTime) {
        // 更新活跃粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            // 移除死亡的粒子
            if (!particle.isAlive()) {
                this.particles.splice(i, 1);
            }
        }

        // 星空粒子循环
        this.updateStarField();
    }

    // 更新星空背景
    updateStarField() {
        for (let particle of this.particles) {
            if (particle.color === '#ffffff' && particle.maxLife === 10) {
                // 这是星空粒子
                if (particle.position.y > GameConfig.CANVAS_HEIGHT) {
                    // 重置到顶部
                    particle.position.y = -10;
                    particle.position.x = Math.random() * GameConfig.CANVAS_WIDTH;
                }
            }
        }
    }

    // 渲染所有粒子
    render(ctx) {
        this.particles.forEach(particle => {
            particle.render(ctx);
        });
    }

    // 清理所有粒子
    clear() {
        this.particles.forEach(particle => {
            particle.active = false;
        });
        this.particles = [];
    }

    // 获取粒子数量
    getParticleCount() {
        return this.particles.length;
    }

    // 获取活跃粒子数量
    getActiveParticleCount() {
        return this.particles.filter(p => p.active).length;
    }

    // 销毁粒子系统
    destroy() {
        this.clear();
        this.particlePool = [];
        console.log('粒子系统已销毁');
    }
}