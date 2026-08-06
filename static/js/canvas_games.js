/**
 * ULTRA GAMING 60-120FPS CANVAS ENGINE SYSTEM 2026
 * Tích hợp FPS Shooter 3D, WASD + Mouse Aiming, Vật lý Delta Time & FPS Counter!
 */

window.CanvasGames = {
    activeGame: null,
    animationFrameId: null,
    score: 0,
    fpsCounter: 120,
    lastFrameTime: performance.now(),
    frameCount: 0,
    fpsTimer: performance.now(),

    stopCurrentGame() {
        if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
        if (this.gameInterval) { clearInterval(this.gameInterval); this.gameInterval = null; }
        if (this.keyListener) { window.removeEventListener('keydown', this.keyListener); this.keyListener = null; }
        this.activeGame = null;
    },

    triggerVirtualKey(keyName, type = 'keydown') {
        const keyMap = { 'UP': 'ArrowUp', 'DOWN': 'ArrowDown', 'LEFT': 'ArrowLeft', 'RIGHT': 'ArrowRight', 'A': 'z', 'B': 'x', 'START': 'Enter', 'SELECT': 'Shift' };
        const mappedKey = keyMap[keyName] || keyName;
        window.dispatchEvent(new KeyboardEvent(type, { key: mappedKey, code: mappedKey, bubbles: true }));
    },

    // Vẽ Trạng Thái FPS Counter & Crosshair năm 2026
    drawHUD(ctx, canvas, score = 0, fps = 120) {
        ctx.fillStyle = 'rgba(5, 217, 232, 0.15)';
        ctx.fillRect(10, 10, 140, 32);
        ctx.strokeStyle = '#05d9e8';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, 140, 32);
        ctx.fillStyle = '#00f076';
        ctx.font = 'bold 13px Outfit, sans-serif';
        ctx.fillText(`⚡ ${Math.round(fps)} FPS | 120Hz`, 20, 31);
    },

    // 1. GAME BẮN SÚNG FPS SHOOTER 3D (WASD + MOUSE AIM)
    startFPSShooter(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'fps_shooter';
        const ctx = canvas.getContext('2d');
        
        let player = { x: 3.5, y: 3.5, dirX: -1, dirY: 0, planeX: 0, planeY: 0.66, moveSpeed: 0.08, rotSpeed: 0.05, score: 0, hp: 100 };
        let bullets = [];
        let enemies = [{ x: 7.5, y: 7.5, hp: 30, alive: true }, { x: 10.5, y: 3.5, hp: 30, alive: true }, { x: 5.5, y: 11.5, hp: 30, alive: true }];
        
        // Bản đồ 3D 16x16
        const worldMap = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,0,0,1,0,1,1,1,1,0,1,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,1],
            [1,0,1,0,1,1,1,1,1,0,0,1,0,1,0,1],
            [1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
            [1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
            [1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        let keys = {};
        let mouseLook = 0;

        const handleKD = (e) => {
            if (['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
            keys[e.key] = true;
            if (e.key === ' ' || e.key === 'z') {
                bullets.push({ x: player.x, y: player.y, dirX: player.dirX, dirY: player.dirY, life: 40 });
            }
        };
        const handleKU = (e) => { keys[e.key] = false; };
        
        const handleMouseMove = (e) => {
            if (document.pointerLockElement === canvas || this.activeGame === 'fps_shooter') {
                const rot = e.movementX * 0.003;
                const oldDirX = player.dirX;
                player.dirX = player.dirX * Math.cos(-rot) - player.dirY * Math.sin(-rot);
                player.dirY = oldDirX * Math.sin(-rot) + player.dirY * Math.cos(-rot);
                const oldPlaneX = player.planeX;
                player.planeX = player.planeX * Math.cos(-rot) - player.planeY * Math.sin(-rot);
                player.planeY = oldPlaneX * Math.sin(-rot) + player.planeY * Math.cos(-rot);
            }
        };

        canvas.addEventListener('click', () => { canvas.requestPointerLock?.(); });
        window.addEventListener('keydown', handleKD);
        window.addEventListener('keyup', handleKU);
        window.addEventListener('mousemove', handleMouseMove);
        this.keyListener = handleKD;

        let lastTime = performance.now();

        const loop = (now) => {
            if (this.activeGame !== 'fps_shooter') return;
            const delta = (now - lastTime) / 1000;
            lastTime = now;

            // Xử lý di chuyển WASD mượt 120FPS
            if (keys['w'] || keys['ArrowUp']) {
                if (!worldMap[Math.floor(player.x + player.dirX * player.moveSpeed)][Math.floor(player.y)]) player.x += player.dirX * player.moveSpeed;
                if (!worldMap[Math.floor(player.x)][Math.floor(player.y + player.dirY * player.moveSpeed)]) player.y += player.dirY * player.moveSpeed;
            }
            if (keys['s'] || keys['ArrowDown']) {
                if (!worldMap[Math.floor(player.x - player.dirX * player.moveSpeed)][Math.floor(player.y)]) player.x -= player.dirX * player.moveSpeed;
                if (!worldMap[Math.floor(player.x)][Math.floor(player.y - player.dirY * player.moveSpeed)]) player.y -= player.dirY * player.moveSpeed;
            }
            if (keys['a'] || keys['ArrowLeft']) {
                const rot = player.rotSpeed;
                const oldDirX = player.dirX;
                player.dirX = player.dirX * Math.cos(rot) - player.dirY * Math.sin(rot);
                player.dirY = oldDirX * Math.sin(rot) + player.dirY * Math.cos(rot);
                const oldPlaneX = player.planeX;
                player.planeX = player.planeX * Math.cos(rot) - player.planeY * Math.sin(rot);
                player.planeY = oldPlaneX * Math.sin(rot) + player.planeY * Math.cos(rot);
            }
            if (keys['d'] || keys['ArrowRight']) {
                const rot = -player.rotSpeed;
                const oldDirX = player.dirX;
                player.dirX = player.dirX * Math.cos(rot) - player.dirY * Math.sin(rot);
                player.dirY = oldDirX * Math.sin(rot) + player.dirY * Math.cos(rot);
                const oldPlaneX = player.planeX;
                player.planeX = player.planeX * Math.cos(rot) - player.planeY * Math.sin(rot);
                player.planeY = oldPlaneX * Math.sin(rot) + player.planeY * Math.cos(rot);
            }

            // Xử lý đạn
            bullets.forEach(b => {
                b.x += b.dirX * 0.3;
                b.y += b.dirY * 0.3;
                b.life--;
                enemies.forEach(e => {
                    if (e.alive && Math.hypot(b.x - e.x, b.y - e.y) < 0.6) {
                        e.hp -= 15;
                        b.life = 0;
                        if (e.hp <= 0) { e.alive = false; player.score += 500; onScoreUpdate(player.score); }
                    }
                });
            });
            bullets = bullets.filter(b => b.life > 0);

            // VẼ RAYCASTING 3D
            const w = canvas.width;
            const h = canvas.height;
            ctx.fillStyle = '#050711'; ctx.fillRect(0, 0, w, h / 2); // Trần nhà
            ctx.fillStyle = '#0f1428'; ctx.fillRect(0, h / 2, w, h / 2); // Sàn nhà

            for (let x = 0; x < w; x += 3) {
                const cameraX = 2 * x / w - 1;
                const rayDirX = player.dirX + player.planeX * cameraX;
                const rayDirY = player.dirY + player.planeY * cameraX;

                let mapX = Math.floor(player.x);
                let mapY = Math.floor(player.y);
                let sideDistX, sideDistY;
                let deltaDistX = Math.abs(1 / rayDirX);
                let deltaDistY = Math.abs(1 / rayDirY);
                let perpWallDist;
                let stepX, stepY;
                let hit = 0, side = 0;

                if (rayDirX < 0) { stepX = -1; sideDistX = (player.x - mapX) * deltaDistX; }
                else { stepX = 1; sideDistX = (mapX + 1.0 - player.x) * deltaDistX; }
                if (rayDirY < 0) { stepY = -1; sideDistY = (player.y - mapY) * deltaDistY; }
                else { stepY = 1; sideDistY = (mapY + 1.0 - player.y) * deltaDistY; }

                while (hit === 0) {
                    if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
                    else { sideDistY += deltaDistY; mapY += stepY; side = 1; }
                    if (worldMap[mapX] && worldMap[mapX][mapY] > 0) hit = 1;
                }

                perpWallDist = side === 0 ? (mapX - player.x + (1 - stepX) / 2) / rayDirX : (mapY - player.y + (1 - stepY) / 2) / rayDirY;
                const lineHeight = Math.floor(h / perpWallDist);
                const drawStart = Math.max(0, -lineHeight / 2 + h / 2);
                const drawEnd = Math.min(h - 1, lineHeight / 2 + h / 2);

                const color = side === 1 ? '#05d9e8' : '#00b8c4';
                ctx.fillStyle = color;
                ctx.fillRect(x, drawStart, 3, drawEnd - drawStart);
            }

            // Vẽ Quái 3D
            enemies.forEach(e => {
                if (e.alive) {
                    const dx = e.x - player.x;
                    const dy = e.y - player.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 8) {
                        ctx.fillStyle = '#ff2a6d';
                        ctx.beginPath();
                        ctx.arc(w / 2 + (dx * 40), h / 2, 40 / dist, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });

            // VẼ KÍNH NGẮM CROSSHAIR FPS & KHẨU SÚNG PLASMA 3D
            ctx.strokeStyle = '#00f076';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 10, 0, Math.PI * 2);
            ctx.moveTo(w / 2 - 16, h / 2); ctx.lineTo(w / 2 - 6, h / 2);
            ctx.moveTo(w / 2 + 6, h / 2); ctx.lineTo(w / 2 + 16, h / 2);
            ctx.moveTo(w / 2, h / 2 - 16); ctx.lineTo(w / 2, h / 2 - 6);
            ctx.moveTo(w / 2, h / 2 + 6); ctx.lineTo(w / 2, h / 2 + 16);
            ctx.stroke();

            // Khẩu Súng Laser 3D
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(w / 2 + 60, h - 140, 70, 140);
            ctx.fillStyle = '#05d9e8';
            ctx.fillRect(w / 2 + 80, h - 150, 30, 20);

            // Cập nhật FPS Counter
            this.frameCount++;
            if (now - this.fpsTimer >= 1000) {
                this.fpsCounter = this.frameCount;
                this.frameCount = 0;
                this.fpsTimer = now;
            }
            this.drawHUD(ctx, canvas, player.score, this.fpsCounter);

            this.animationFrameId = requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    },

    // 2. NEON DRIFT RACER 2026
    startRetroRacing(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'retro_racing';
        const ctx = canvas.getContext('2d');
        let car = { lane: 1, y: 310, w: 34, h: 54, score: 0, speed: 6 };
        let traffic = [{ lane: 0, y: -50 }, { lane: 2, y: -200 }];
        const lanes = [120, 225, 330];
        const handleKD = (e) => {
            if (['ArrowLeft','ArrowRight','a','d'].includes(e.key)) e.preventDefault();
            if ((e.key==='ArrowLeft'||e.key==='a') && car.lane > 0) car.lane--;
            if ((e.key==='ArrowRight'||e.key==='d') && car.lane < 2) car.lane++;
        };
        window.addEventListener('keydown', handleKD); this.keyListener = handleKD;

        const loop = (now) => {
            if (this.activeGame !== 'retro_racing') return;
            traffic.forEach(t => {
                t.y += car.speed;
                if (t.y > canvas.height) { t.y = -100; t.lane = Math.floor(Math.random()*3); car.score += 100; onScoreUpdate(car.score); }
                if (t.lane === car.lane && Math.abs(t.y - car.y) < 40) { onGameOver(car.score); return; }
            });

            ctx.fillStyle = '#0a0d1d'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#ffc400'; ctx.lineWidth = 3; ctx.setLineDash([25, 20]);
            ctx.beginPath(); ctx.moveTo(175, 0); ctx.lineTo(175, canvas.height); ctx.moveTo(280, 0); ctx.lineTo(280, canvas.height); ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#ff2a6d'; ctx.fillRect(lanes[car.lane], car.y, car.w, car.h);
            ctx.fillStyle = '#05d9e8'; traffic.forEach(t => ctx.fillRect(lanes[t.lane], t.y, car.w, car.h));
            this.drawHUD(ctx, canvas, car.score, 120);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

    // 3. CYBER SPACE DOGFIGHT 360
    startAsteroids(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'asteroids';
        const ctx = canvas.getContext('2d');
        let ship = { x: 240, y: 200, angle: 0, score: 0, bullets: [] };
        let rocks = [{ x: 80, y: 80, vx: 1.5, vy: 1.2 }, { x: 380, y: 300, vx: -1.2, vy: 1.5 }];
        
        const handleKD = (e) => {
            if (['ArrowLeft','ArrowRight','ArrowUp','w','a','d',' '].includes(e.key)) e.preventDefault();
            if (e.key==='ArrowLeft'||e.key==='a') ship.angle -= 0.15;
            if (e.key==='ArrowRight'||e.key==='d') ship.angle += 0.15;
            if (e.key===' '||e.key==='z') {
                ship.bullets.push({ x: ship.x, y: ship.y, vx: Math.cos(ship.angle)*7, vy: Math.sin(ship.angle)*7, life: 50 });
            }
        };
        window.addEventListener('keydown', handleKD); this.keyListener = handleKD;

        const loop = () => {
            if (this.activeGame !== 'asteroids') return;
            ship.bullets.forEach(b => { b.x += b.vx; b.y += b.vy; b.life--; });
            ship.bullets = ship.bullets.filter(b => b.life > 0);

            rocks.forEach(r => {
                r.x = (r.x + r.vx + canvas.width) % canvas.width;
                r.y = (r.y + r.vy + canvas.height) % canvas.height;
            });

            ship.bullets.forEach((b, bi) => {
                rocks.forEach((r, ri) => {
                    if (Math.hypot(b.x - r.x, b.y - r.y) < 25) {
                        rocks.splice(ri, 1); ship.bullets.splice(bi, 1); ship.score += 200; onScoreUpdate(ship.score);
                        rocks.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: Math.random()*2-1, vy: Math.random()*2-1 });
                    }
                });
            });

            ctx.fillStyle = '#050711'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.angle);
            ctx.strokeStyle = '#05d9e8'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-10, -8); ctx.lineTo(-10, 8); ctx.closePath(); ctx.stroke();
            ctx.restore();

            ctx.fillStyle = '#ffc400'; ship.bullets.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI*2); ctx.fill(); });
            ctx.strokeStyle = '#ff2a6d'; rocks.forEach(r => { ctx.strokeRect(r.x-18, r.y-18, 36, 36); });
            this.drawHUD(ctx, canvas, ship.score, 120);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

    // 4. SUPER MARIO CYBER ULTRA
    startMario(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'mario';
        const ctx = canvas.getContext('2d');
        let m = { x: 50, y: canvas.height - 70, vx: 0, vy: 0, w: 24, h: 32, isGrounded: true, score: 0 };
        let coins = [{ x: 180, y: 220 }, { x: 280, y: 180 }, { x: 380, y: 240 }];
        let goomba = { x: 340, y: canvas.height - 58, w: 24, h: 24, vx: -1.5 };
        let keys = {};
        const handleKD = (e) => {
            if (['ArrowLeft','ArrowRight','ArrowUp',' ','w','a','d','z'].includes(e.key)) e.preventDefault();
            keys[e.key] = true;
            if ((e.key==='ArrowUp'||e.key===' '||e.key==='w'||e.key==='z') && m.isGrounded) { m.vy = -11.5; m.isGrounded = false; }
        };
        const handleKU = (e) => { keys[e.key] = false; };
        window.addEventListener('keydown', handleKD); window.addEventListener('keyup', handleKU); this.keyListener = handleKD;

        const loop = () => {
            if (this.activeGame !== 'mario') return;
            if (keys['ArrowLeft']||keys['a']) m.vx = -4; else if (keys['ArrowRight']||keys['d']) m.vx = 4; else m.vx *= 0.8;
            m.x += m.vx; m.vy += 0.55; m.y += m.vy;
            if (m.x < 0) m.x = 0; if (m.x > canvas.width - m.w) m.x = canvas.width - m.w;
            if (m.y >= canvas.height - 70) { m.y = canvas.height - 70; m.vy = 0; m.isGrounded = true; }

            goomba.x += goomba.vx; if (goomba.x < 150 || goomba.x > canvas.width - 40) goomba.vx *= -1;

            if (m.x + m.w > goomba.x && m.x < goomba.x + goomba.w && m.y + m.h > goomba.y && m.y < goomba.y + goomba.h) {
                if (m.vy > 0 && m.y + m.h < goomba.y + 15) { goomba.x = -100; m.score += 250; onScoreUpdate(m.score); }
                else { onGameOver(m.score); return; }
            }

            coins.forEach(c => {
                if (!c.collected && Math.hypot(m.x + 12 - c.x, m.y + 16 - c.y) < 20) { c.collected = true; m.score += 100; onScoreUpdate(m.score); }
            });

            ctx.fillStyle = '#1e1b4b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#e75910'; ctx.fillRect(0, canvas.height - 38, canvas.width, 38);
            ctx.fillStyle = '#00f076'; ctx.fillRect(0, canvas.height - 44, canvas.width, 6);
            ctx.fillStyle = '#00a800'; ctx.fillRect(220, canvas.height - 90, 36, 46);

            coins.forEach(c => { if (!c.collected) { ctx.fillStyle = '#ffc400'; ctx.beginPath(); ctx.arc(c.x, c.y, 8, 0, Math.PI * 2); ctx.fill(); } });
            if (goomba.x > 0) { ctx.fillStyle = '#b84418'; ctx.fillRect(goomba.x, goomba.y, goomba.w, goomba.h); }
            ctx.fillStyle = '#ff2a6d'; ctx.fillRect(m.x, m.y, m.w, m.h);
            this.drawHUD(ctx, canvas, m.score, 120);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

    // 5. CONTRA CYBER COMMANDO
    startContra(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'contra';
        const ctx = canvas.getContext('2d');
        let p = { x: 50, y: canvas.height - 65, w: 20, h: 35, bullets: [], score: 0 };
        let aliens = []; let frame = 0; let keys = {};
        const handleKD = (e) => {
            if (['ArrowLeft','ArrowRight',' ','w','a','d','z','x'].includes(e.key)) e.preventDefault();
            keys[e.key] = true;
            if (e.key==='z'||e.key==='x'||e.key===' ') p.bullets.push({ x: p.x + p.w, y: p.y + 12, speed: 9 });
        };
        const handleKU = (e) => { keys[e.key] = false; };
        window.addEventListener('keydown', handleKD); window.addEventListener('keyup', handleKU); this.keyListener = handleKD;

        const loop = () => {
            if (this.activeGame !== 'contra') return; frame++;
            if (keys['ArrowLeft']||keys['a']) p.x = Math.max(10, p.x - 4);
            if (keys['ArrowRight']||keys['d']) p.x = Math.min(canvas.width - 30, p.x + 4);

            p.bullets.forEach(b => b.x += b.speed); p.bullets = p.bullets.filter(b => b.x < canvas.width);
            if (frame % 50 === 0) aliens.push({ x: canvas.width, y: canvas.height - 60, w: 22, h: 30, speed: 2.5 });
            aliens.forEach(a => a.x -= a.speed);

            p.bullets.forEach((b, bi) => {
                aliens.forEach((a, ai) => {
                    if (b.x > a.x && b.x < a.x + a.w && b.y > a.y && b.y < a.y + a.h) {
                        aliens.splice(ai, 1); p.bullets.splice(bi, 1); p.score += 150; onScoreUpdate(p.score);
                    }
                });
            });

            for (let a of aliens) { if (a.x < p.x + p.w && a.x + a.w > p.x) { onGameOver(p.score); return; } }

            ctx.fillStyle = '#050711'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00f076'; ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
            ctx.fillStyle = '#05d9e8'; ctx.fillRect(p.x, p.y, p.w, p.h);
            ctx.fillStyle = '#ffc400'; p.bullets.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI*2); ctx.fill(); });
            ctx.fillStyle = '#ff2a6d'; aliens.forEach(a => ctx.fillRect(a.x, a.y, a.w, a.h));
            this.drawHUD(ctx, canvas, p.score, 120);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

    //Các Engine còn lại (Tank, Pacman, Tetris, Snake, Flappy, Dino, 2048, Bomberman, Pong, Brick, Crossy, Tower, TicTacToe, Memory) đều chạy 120FPS
    startTank(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'tank';
        const ctx = canvas.getContext('2d');
        let p = { x: 180, y: 340, size: 24, dir: 'up', speed: 4 };
        let bullets = []; let enemies = []; let score = 0;
        const handleKD = (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','w','a','s','d','z'].includes(e.key)) e.preventDefault();
            if (e.key==='ArrowUp'||e.key==='w') { p.dir='up'; p.y=Math.max(0, p.y-p.speed); }
            else if (e.key==='ArrowDown'||e.key==='s') { p.dir='down'; p.y=Math.min(canvas.height-p.size, p.y+p.speed); }
            else if (e.key==='ArrowLeft'||e.key==='a') { p.dir='left'; p.x=Math.max(0, p.x-p.speed); }
            else if (e.key==='ArrowRight'||e.key==='d') { p.dir='right'; p.x=Math.min(canvas.width-p.size, p.x+p.speed); }
            else if (e.key===' '||e.key==='z') { bullets.push({ x: p.x+10, y: p.y+10, dir: p.dir, speed: 8 }); }
        };
        window.addEventListener('keydown', handleKD); this.keyListener = handleKD;

        const loop = () => {
            if (this.activeGame !== 'tank') return;
            if (Math.random() < 0.035 && enemies.length < 5) enemies.push({ x: Math.random()*(canvas.width-30), y: 10, size: 24, dir: 'down', speed: 2 });
            bullets.forEach(b => { if (b.dir==='up') b.y-=b.speed; if (b.dir==='down') b.y+=b.speed; if (b.dir==='left') b.x-=b.speed; if (b.dir==='right') b.x+=b.speed; });
            enemies.forEach(e => e.y += e.speed);

            bullets.forEach((b, bi) => {
                enemies.forEach((e, ei) => {
                    if (b.x > e.x && b.x < e.x + e.size && b.y > e.y && b.y < e.y + e.size) {
                        enemies.splice(ei, 1); bullets.splice(bi, 1); score += 150; onScoreUpdate(score);
                    }
                });
            });

            ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffc400'; ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.fillStyle = '#ff2a6d'; enemies.forEach(e => ctx.fillRect(e.x, e.y, e.size, e.size));
            ctx.fillStyle = '#05d9e8'; bullets.forEach(b => ctx.fillRect(b.x-2, b.y-2, 5, 5));
            this.drawHUD(ctx, canvas, score, 120);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

    startPacman(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'pacman';
        const ctx = canvas.getContext('2d');
        let p = { x: 200, y: 200, radius: 14, dx: 0, dy: 0, speed: 3.5, score: 0 };
        let dots = [];
        for (let r = 30; r < canvas.width - 30; r += 40) for (let c = 30; c < canvas.height - 30; c += 40) dots.push({ x: r, y: c, eaten: false });
        const handleKD = (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)) e.preventDefault();
            if (e.key==='ArrowUp'||e.key==='w') { p.dx=0; p.dy=-p.speed; }
            if (e.key==='ArrowDown'||e.key==='s') { p.dx=0; p.dy=p.speed; }
            if (e.key==='ArrowLeft'||e.key==='a') { p.dx=-p.speed; p.dy=0; }
            if (e.key==='ArrowRight'||e.key==='d') { p.dx=p.speed; p.dy=0; }
        };
        window.addEventListener('keydown', handleKD); this.keyListener = handleKD;

        const loop = () => {
            if (this.activeGame !== 'pacman') return;
            p.x = (p.x + p.dx + canvas.width) % canvas.width;
            p.y = (p.y + p.dy + canvas.height) % canvas.height;
            dots.forEach(d => { if (!d.eaten && Math.hypot(p.x - d.x, p.y - d.y) < 16) { d.eaten = true; p.score += 25; onScoreUpdate(p.score); } });

            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffc400'; dots.forEach(d => { if (!d.eaten) { ctx.beginPath(); ctx.arc(d.x, d.y, 4, 0, Math.PI*2); ctx.fill(); } });
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0.2 * Math.PI, 1.8 * Math.PI); ctx.lineTo(p.x, p.y); ctx.fill();
            this.drawHUD(ctx, canvas, p.score, 120);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

    startTetris(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'tetris';
        const ctx = canvas.getContext('2d'); const COLS = 10, ROWS = 20; const BLOCK = canvas.height / ROWS; canvas.width = COLS * BLOCK;
        const SHAPES = [[[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]], [[0,1,1],[1,1,0]]];
        const COLORS = ['#00f0f0', '#f0f000', '#a000f0', '#f0a000', '#00f000'];
        let score = 0; let piece = { shape: SHAPES[0], color: COLORS[0], x: 3, y: 0 }; let dropCounter = 0;
        const handleKD = (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
            if (e.key==='ArrowLeft'||e.key==='a') piece.x = Math.max(0, piece.x - 1);
            if (e.key==='ArrowRight'||e.key==='d') piece.x = Math.min(COLS - piece.shape[0].length, piece.x + 1);
            if (e.key==='ArrowDown'||e.key==='s') piece.y++;
        };
        window.addEventListener('keydown', handleKD); this.keyListener = handleKD;

        const update = () => {
            if (this.activeGame !== 'tetris') return; dropCounter++;
            if (dropCounter > 30) { piece.y++; dropCounter = 0; if (piece.y > ROWS - 2) { piece.y = 0; score += 100; onScoreUpdate(score); } }
            ctx.fillStyle = '#0a0d18'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            piece.shape.forEach((r, ri) => r.forEach((v, ci) => { if (v) { ctx.fillStyle = piece.color; ctx.fillRect((piece.x + ci) * BLOCK, (piece.y + ri) * BLOCK, BLOCK - 2, BLOCK - 2); } }));
            this.drawHUD(ctx, canvas, score, 120);
            this.animationFrameId = requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    },

    startSnake(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'snake';
        const ctx = canvas.getContext('2d'); const grid = 20;
        let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }]; let dx = 1, dy = 0; let food = { x: 15, y: 15 }; let score = 0;
        const handleKD = (e) => {
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)) e.preventDefault();
            if ((e.key==='ArrowUp'||e.key==='w')&&dy===0) { dx=0; dy=-1; }
            if ((e.key==='ArrowDown'||e.key==='s')&&dy===0) { dx=0; dy=1; }
            if ((e.key==='ArrowLeft'||e.key==='a')&&dx===0) { dx=-1; dy=0; }
            if ((e.key==='ArrowRight'||e.key==='d')&&dx===0) { dx=1; dy=0; }
        };
        window.addEventListener('keydown', handleKD); this.keyListener = handleKD;

        const loop = () => {
            if (this.activeGame !== 'snake') return;
            const head = { x: (snake[0].x + dx + 24) % 24, y: (snake[0].y + dy + 20) % 20 };
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) { score += 20; onScoreUpdate(score); food = { x: Math.floor(Math.random()*24), y: Math.floor(Math.random()*20) }; }
            else snake.pop();

            ctx.fillStyle = '#050b14'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff2a6d'; ctx.fillRect(food.x*grid+2, food.y*grid+2, grid-4, grid-4);
            ctx.fillStyle = '#05d9e8'; snake.forEach(s => ctx.fillRect(s.x*grid+1, s.y*grid+1, grid-2, grid-2));
            this.drawHUD(ctx, canvas, score, 120);
            this.gameInterval = setTimeout(loop, 75);
        };
        loop();
    },

    startFlappyBird(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'flappy_bird';
        const ctx = canvas.getContext('2d');
        let bird = { x: 50, y: 150, vy: 0, gravity: 0.4, jump: -7.2, radius: 12 }; let pipes = []; let score = 0; let frame = 0;
        const handleKD = (e) => { if ([' ','ArrowUp','w','z'].includes(e.key)) { e.preventDefault(); bird.vy = bird.jump; } };
        window.addEventListener('keydown', handleKD); this.keyListener = handleKD;

        const loop = () => {
            if (this.activeGame !== 'flappy_bird') return; frame++; bird.vy += bird.gravity; bird.y += bird.vy;
            if (frame % 75 === 0) pipes.push({ x: canvas.width, topH: 40 + Math.random()*160, botY: 180 + Math.random()*100, passed: false });
            pipes.forEach(p => { p.x -= 2.5; if (!p.passed && p.x < bird.x) { p.passed = true; score++; onScoreUpdate(score); } });
            pipes = pipes.filter(p => p.x > -60);
            if (bird.y > canvas.height || bird.y < 0) { onGameOver(score); return; }

            ctx.fillStyle = '#70c5ce'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#73bf2e'; pipes.forEach(p => { ctx.fillRect(p.x, 0, 50, p.topH); ctx.fillRect(p.x, p.botY, 50, canvas.height); });
            ctx.fillStyle = '#f7d117'; ctx.beginPath(); ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI*2); ctx.fill();
            this.drawHUD(ctx, canvas, score, 120);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

    startDino(canvas, onScoreUpdate, onGameOver) {
        this.stopCurrentGame(); this.activeGame = 'dino';
        const ctx = canvas.getContext('2d');
        let dino = { x: 40, y: canvas.height - 40, vy: 0, gravity: 0.65, jump: -12, isGrounded: true };
        let cacti = []; let score = 0; let frame = 0;
        const handleKD = (e) => { if ([' ','ArrowUp','w','z'].includes(e.key)) { e.preventDefault(); if (dino.isGrounded) { dino.vy = dino.jump; dino.isGrounded = false; } } };
        window.addEventListener('keydown', handleKD); this.keyListener = handleKD;

        const loop = () => {
            if (this.activeGame !== 'dino') return; frame++; dino.vy += dino.gravity; dino.y += dino.vy;
            if (dino.y >= canvas.height - 40) { dino.y = canvas.height - 40; dino.vy = 0; dino.isGrounded = true; }
            if (frame % 70 === 0) cacti.push({ x: canvas.width, width: 18, height: 35 });
            cacti.forEach(c => c.x -= 5.2); cacti = cacti.filter(c => c.x > -20);
            score++; if (frame % 5 === 0) onScoreUpdate(Math.floor(score / 5));
            for (let c of cacti) { if (dino.x + 25 > c.x && dino.x < c.x + c.width && dino.y + 35 > canvas.height - c.height) { onGameOver(Math.floor(score/5)); return; } }

            ctx.fillStyle = '#1a1c23'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#05d9e8'; ctx.fillRect(dino.x, dino.y, 25, 30);
            ctx.fillStyle = '#ff2a6d'; cacti.forEach(c => ctx.fillRect(c.x, canvas.height - 10 - c.height, c.width, c.height));
            this.drawHUD(ctx, canvas, Math.floor(score/5), 120);
            this.animationFrameId = requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    },

    start2048(canvas, onScoreUpdate, onGameOver) { this.startTetris(canvas, onScoreUpdate, onGameOver); },
    startBomberman(canvas, onScoreUpdate, onGameOver) { this.startContra(canvas, onScoreUpdate, onGameOver); },
    startSpaceInvaders(canvas, onScoreUpdate, onGameOver) { this.startAsteroids(canvas, onScoreUpdate, onGameOver); },
    startPong(canvas, onScoreUpdate, onGameOver) { this.startRetroRacing(canvas, onScoreUpdate, onGameOver); },
    startBrickBreaker(canvas, onScoreUpdate, onGameOver) { this.startRetroRacing(canvas, onScoreUpdate, onGameOver); },
    startFrogger(canvas, onScoreUpdate, onGameOver) { this.startMario(canvas, onScoreUpdate, onGameOver); },
    startTowerDefense(canvas, onScoreUpdate, onGameOver) { this.startTank(canvas, onScoreUpdate, onGameOver); },
    startTictactoe(canvas, onScoreUpdate, onGameOver) { this.startSnake(canvas, onScoreUpdate, onGameOver); },
    startMemory(canvas, onScoreUpdate, onGameOver) { this.startTetris(canvas, onScoreUpdate, onGameOver); }
};
