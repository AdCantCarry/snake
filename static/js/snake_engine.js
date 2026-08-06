/**
 * SNAKE CONSOLE ENGINE
 * Engine Game Rắn Săn Mồi Hiện Đại Dành Cho Máy Chơi Game Handheld
 */

window.SnakeEngine = {
    canvas: null,
    ctx: null,
    activeSkin: 'cyan_cyber',
    score: 0,
    level: 1,
    particles: [],
    isPlaying: false,

    skinsData: {
        'cyan_cyber': { name: 'Cyan', head: '#06b6d4', body: '#10b981', glow: '#06b6d4' },
        'magma_fire': { name: 'Magma', head: '#f43f5e', body: '#f59e0b', glow: '#f43f5e' },
        'toxic_green': { name: 'Toxic', head: '#10b981', body: '#06b6d4', glow: '#10b981' },
        'golden_king': { name: 'Gold', head: '#f59e0b', body: '#ffffff', glow: '#f59e0b' },
        'rainbow_quantum': { name: 'Rainbow', head: '#a855f7', body: '#06b6d4', glow: '#a855f7' }
    },

    audioCtx: new (window.AudioContext || window.webkitAudioContext)(),
    playSynthBeep(freq = 440, duration = 0.08) {
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'square'; osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
            osc.connect(gain); gain.connect(this.audioCtx.destination);
            osc.start(); osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {}
    },

    init(canvasElement, onScoreCB, onGameOverCB) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.onScore = onScoreCB;
        this.onGameOver = onGameOverCB;
    },

    stop() {
        if (this.gameInterval) { clearInterval(this.gameInterval); this.gameInterval = null; }
        if (this.keyListener) { window.removeEventListener('keydown', this.keyListener); this.keyListener = null; }
        this.isPlaying = false;
    },

    triggerVirtualKey(keyName) {
        const keyMap = { 'UP': 'ArrowUp', 'DOWN': 'ArrowDown', 'LEFT': 'ArrowLeft', 'RIGHT': 'ArrowRight' };
        const mappedKey = keyMap[keyName] || keyName;
        window.dispatchEvent(new KeyboardEvent('keydown', { key: mappedKey, code: mappedKey, bubbles: true }));
    },

    spawnParticles(x, y, color = '#06b6d4', count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                radius: 2 + Math.random() * 3,
                alpha: 1
            });
        }
    },

    startMasterpieceGame() {
        this.stop();
        this.isPlaying = true;
        this.score = 0;
        this.level = 1;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        const grid = 20;
        const countX = Math.floor(canvas.width / grid);
        const countY = Math.floor(canvas.height / grid);

        let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        let dx = 1, dy = 0;
        let food = { x: 15, y: 15, type: 'normal' };
        let speed = 75;

        const spawnFood = () => {
            const rand = Math.random();
            let fType = 'normal';
            if (rand < 0.2) fType = 'gold';

            food = {
                x: Math.floor(Math.random() * countX),
                y: Math.floor(Math.random() * countY),
                type: fType
            };
        };

        const handleKD = (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d',' '].includes(e.key)) e.preventDefault();
            if ((e.key==='ArrowUp'||e.key==='w') && dy===0) { dx=0; dy=-1; }
            else if ((e.key==='ArrowDown'||e.key==='s') && dy===0) { dx=0; dy=1; }
            else if ((e.key==='ArrowLeft'||e.key==='a') && dx===0) { dx=-1; dy=0; }
            else if ((e.key==='ArrowRight'||e.key==='d') && dx===0) { dx=1; dy=0; }
        };
        window.addEventListener('keydown', handleKD); this.keyListener = handleKD;

        // Cảm ứng vuốt trên Canvas
        let touchStartX = 0, touchStartY = 0;
        canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        canvas.addEventListener('touchend', (e) => {
            const diffX = e.changedTouches[0].clientX - touchStartX;
            const diffY = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 30 && dx === 0) { dx = 1; dy = 0; }
                else if (diffX < -30 && dx === 0) { dx = -1; dy = 0; }
            } else {
                if (diffY > 30 && dy === 0) { dx = 0; dy = 1; }
                else if (diffY < -30 && dy === 0) { dx = 0; dy = -1; }
            }
        }, { passive: true });

        const loop = () => {
            if (!this.isPlaying) return;

            const skin = this.skinsData[this.activeSkin] || this.skinsData['cyan_cyber'];
            const head = { x: (snake[0].x + dx + countX) % countX, y: (snake[0].y + dy + countY) % countY };

            for (let seg of snake) {
                if (head.x === seg.x && head.y === seg.y) {
                    this.playSynthBeep(180, 0.4);
                    this.isPlaying = false;
                    this.onGameOver(this.score);
                    return;
                }
            }

            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                let pts = food.type === 'gold' ? 30 : 10;
                let color = food.type === 'gold' ? '#f59e0b' : skin.glow;

                this.score += pts;
                this.level = Math.floor(this.score / 100) + 1;
                this.onScore(this.score, this.level);
                this.playSynthBeep(520 + pts * 4, 0.08);
                this.spawnParticles(food.x * grid + 10, food.y * grid + 10, color, 14);
                spawnFood();
            } else {
                snake.pop();
            }

            ctx.fillStyle = '#040711';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Lưới mờ
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += grid) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += grid) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            }

            // Hạt nổ
            this.particles.forEach((p) => {
                p.x += p.vx; p.y += p.vy; p.alpha -= 0.03;
                ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1.0;
            });
            this.particles = this.particles.filter(p => p.alpha > 0);

            // Mồi
            let fColor = food.type === 'gold' ? '#f59e0b' : '#f43f5e';
            ctx.shadowBlur = 14; ctx.shadowColor = fColor;
            ctx.fillStyle = fColor;
            ctx.fillRect(food.x * grid + 3, food.y * grid + 3, grid - 6, grid - 6);

            // Rắn
            ctx.shadowColor = skin.glow;
            snake.forEach((seg, i) => {
                ctx.fillStyle = i === 0 ? skin.head : skin.body;
                ctx.fillRect(seg.x * grid + 1, seg.y * grid + 1, grid - 2, grid - 2);
            });
            ctx.shadowBlur = 0;

            this.gameInterval = setTimeout(loop, Math.max(45, speed - (this.level * 2)));
        };

        spawnFood();
        loop();
    }
};
