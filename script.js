// 获取画布和其绘图上下文
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

// 设置画布尺寸为窗口大小
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 监听窗口大小变化，随时调整画布大小
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 定义颜色数组
const colors = [
    '#ff0000', '#00ff00', '#0000ff', // 红，绿，蓝
    '#ffff00', '#ff00ff', '#00ffff', // 黄，粉，青
    '#ffa500', '#ffc0cb', '#8a2be2'  // 橙，粉红，紫罗兰
];

// 烟花粒子类
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 2 + 1; // 1-3的随机大小
        this.angle = Math.random() * Math.PI * 2; // 随机角度
        this.speed = Math.random() * 4 + 2; // 2-6的随机速度
        this.vx = Math.cos(this.angle) * this.speed; // x方向速度
        this.vy = Math.sin(this.angle) * this.speed; // y方向速度
        this.gravity = 0.1; // 重力
        this.alpha = 1; // 透明度
        this.decay = Math.random() * 0.01 + 0.005; // 透明度衰减率
    }

    update() {
        // 更新速度（加速度）
        this.vy += this.gravity;
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;
        // 更新透明度
        this.alpha -= this.decay;
    }

    draw() {
        // 设置图形的透明度
        ctx.globalAlpha = this.alpha;
        // 开始绘制路径
        ctx.beginPath();
        // 画圆
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // 设置填充颜色
        ctx.fillStyle = this.color;
        // 填充圆形
        ctx.fill();
        // 重置透明度
        ctx.globalAlpha = 1;
    }

    isDead() {
        // 如果透明度小于0，则粒子“死亡”，需要被移除
        return this.alpha <= 0;
    }
}

// 烟花类
class Firework {
    constructor() {
        // 烟花起始位置在屏幕底部随机位置
        this.x = Math.random() * canvas.width;
        this.y = canvas.height;
        // 随机选择一种颜色
        this.color = colors[Math.floor(Math.random() * colors.length)];
        // 粒子数组
        this.particles = [];
        // 是否已经爆炸
        this.exploded = false;
        // 上升速度
        this.speed = Math.random() * 3 + 7; // 7-10的随机速度
        // 目标高度（随机）
        this.targetY = Math.random() * (canvas.height / 2) + 50;
    }

    update() {
        if (!this.exploded) {
            // 未爆炸，继续上升
            this.y -= this.speed;
            // 如果达到目标高度，则爆炸
            if (this.y <= this.targetY) {
                this.explode();
            }
        } else {
            // 已爆炸，更新所有粒子
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update();
                // 如果粒子“死亡”，则从数组中移除
                if (this.particles[i].isDead()) {
                    this.particles.splice(i, 1);
                }
            }
        }
    }

    draw() {
        if (!this.exploded) {
            // 绘制未爆炸的烟花（上升的亮点）
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        } else {
            // 绘制所有粒子
            for (let particle of this.particles) {
                particle.draw();
            }
        }
    }

    explode() {
        this.exploded = true;
        // 创建100个粒子
        for (let i = 0; i < 100; i++) {
            this.particles.push(new Particle(this.x, this.y, this.color));
        }
    }

    isDead() {
        // 如果烟花已爆炸且没有粒子了，则烟花“死亡”
        return this.exploded && this.particles.length === 0;
    }
}

// 存储所有烟花的数组
let fireworks = [];

// 动画循环函数
function animate() {
    // 用半透明的黑色覆盖整个画布，形成尾迹效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 随机生成新烟花
    if (Math.random() < 0.03) { // 约3%的几率每帧生成一个
        fireworks.push(new Firework());
    }

    // 更新并绘制所有烟花
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw();
        // 如果烟花“死亡”，则从数组中移除
        if (fireworks[i].isDead()) {
            fireworks.splice(i, 1);
        }
    }

    // 请求下一帧动画，形成循环
    requestAnimationFrame(animate);
}

// 点击页面也可以发射烟花
canvas.addEventListener('click', function(e) {
    // 创建一个从底部到点击位置爆炸的烟花
    let fw = new Firework();
    fw.x = e.clientX;
    fw.targetY = e.clientY;
    fireworks.push(fw);
});

// 开始动画循环
animate();