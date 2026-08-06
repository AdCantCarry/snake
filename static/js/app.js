/**
 * RẮN SẮN MỒI CONSOLE EDITION - FRONTEND CORE
 */

document.addEventListener('DOMContentLoaded', () => {
    let currentSkin = 'cyan_cyber';

    const gameCanvas = document.getElementById('gameCanvas');
    const startBtn = document.getElementById('startBtn');
    const scoreVal = document.getElementById('scoreVal');
    const levelVal = document.getElementById('levelVal');
    const skinBtns = document.querySelectorAll('.skin-btn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const leaderboardModal = document.getElementById('leaderboardModal');
    const leaderboardList = document.getElementById('leaderboardList');
    const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');

    // Khởi tạo Game Engine
    window.SnakeEngine.init(gameCanvas, (score, level) => {
        scoreVal.textContent = score;
        levelVal.textContent = level;
    }, async (finalScore) => {
        alert(`🐍 GAME OVER!\nĐiểm số đạt được: ${finalScore}`);
        const name = prompt("Nhập tên người chơi:", "Player1");
        if (name) {
            try {
                await fetch('/api/scores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ player: name, score: finalScore })
                });
                loadLeaderboard();
            } catch (e) {}
        }
    });

    // Chọn Skin Rắn
    skinBtns.forEach(skin => {
        skin.addEventListener('click', () => {
            skinBtns.forEach(s => s.classList.remove('active'));
            skin.classList.add('active');
            currentSkin = skin.getAttribute('data-skin');
            window.SnakeEngine.activeSkin = currentSkin;
        });
    });

    // Nút Bắt đầu / Chơi lại
    startBtn.addEventListener('click', () => {
        window.SnakeEngine.activeSkin = currentSkin;
        window.SnakeEngine.startMasterpieceGame();
        startBtn.textContent = 'RESTART';
    });

    // Tay cầm D-Pad & Nút ảo
    document.querySelectorAll('.pad-btn, .act-btn').forEach(btn => {
        const keyName = btn.getAttribute('data-key');
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (window.SnakeEngine) window.SnakeEngine.triggerVirtualKey(keyName);
        }, { passive: false });
        btn.addEventListener('mousedown', () => {
            if (window.SnakeEngine) window.SnakeEngine.triggerVirtualKey(keyName);
        });
    });

    // Bảng xếp hạng
    async function loadLeaderboard() {
        try {
            const res = await fetch('/api/scores');
            const data = await res.json();
            if (data.status === 'success') {
                leaderboardList.innerHTML = data.scores.length > 0 ? data.scores.map((s, i) => `
                    <div class="score-row">
                        <span class="rank">#${i + 1}</span>
                        <span class="player">${s.player}</span>
                        <span class="score">${s.score} PTS</span>
                    </div>
                `).join('') : '<p>Chưa có kỷ lục nào!</p>';
            }
        } catch (e) {}
    }

    leaderboardBtn.addEventListener('click', () => {
        loadLeaderboard();
        leaderboardModal.classList.add('active');
    });

    closeLeaderboardBtn.addEventListener('click', () => {
        leaderboardModal.classList.remove('active');
    });

    // Tự động khởi chạy ngay khi vừa mở trang web!
    window.SnakeEngine.startMasterpieceGame();
});
