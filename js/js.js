document.addEventListener("DOMContentLoaded", function () {

    const progressBar = document.querySelector('.progress');
    function updateProgress() {
        if (!progressBar) return;
        const st = window.pageYOffset;
        const sh = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (sh > 0 ? st / sh * 100 : 0) + '%';
    }

    const canvas = document.getElementById('mask-canvas');
    const ctx    = canvas ? canvas.getContext('2d') : null;
    const section = document.querySelector('.section1');

    const DPR = window.devicePixelRatio || 1;
    let logW = 0, logH = 0;

    function resizeCanvas() {
        if (!canvas) return;
        logW = canvas.offsetWidth  || window.innerWidth;
        logH = canvas.offsetHeight || window.innerHeight;
        canvas.width  = Math.round(logW * DPR);
        canvas.height = Math.round(logH * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    const TEXT        = 'MOSAREST';
    const FONT_WEIGHT = '900';
    const FONT_FAMILY = '"Unb-SB", "Arial Black", sans-serif';
    const TEXT_Y_FRAC = 0.8;
    const MAX_ALPHA   = 0.65;
    const LERP_SPEED  = 0.07;

    let cachedMaxSize = 0;

    function computeMaxFontSize() {
        const probe = 600;
        ctx.font = `${FONT_WEIGHT} ${probe}px ${FONT_FAMILY}`;
        const w = ctx.measureText(TEXT).width;
        return (probe * logW / w) * 0.9;
    }

    function getMaxSize() {
        if (!cachedMaxSize) cachedMaxSize = computeMaxFontSize();
        return cachedMaxSize;
    }

    function getMinSize() { return getMaxSize() * 0.38; }

    function getScrollProgress() {
        if (!section) return 0;
        const scrolled = window.pageYOffset - section.offsetTop;
        const range    = section.offsetHeight - window.innerHeight;
        return range > 0 ? Math.max(0, Math.min(1, scrolled / range)) : 0;
    }

    function lerp(a, b, t) { return a + (b - a) * t; }
    function easeInOutCubic(t) {
        return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
    }
    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function drawFrame(fontSize, overlayAlpha) {
        if (!ctx) return;
        ctx.clearRect(0, 0, logW, logH);
        if (overlayAlpha < 0.002) return;

        ctx.save();
        ctx.globalAlpha = overlayAlpha;
        ctx.fillStyle   = '#ffffff';
        ctx.fillRect(0, 0, logW, logH);
        ctx.restore();

        if (fontSize < 2) return;

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.font         = `${FONT_WEIGHT} ${fontSize}px ${FONT_FAMILY}`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(TEXT, logW / 2, logH * TEXT_Y_FRAC);
        ctx.restore();

        const gAlpha = Math.min(overlayAlpha / MAX_ALPHA, 1);

        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';

        const sweep = ctx.createLinearGradient(
            logW * -0.1, logH * 0.05,
            logW * 0.85, logH * 0.75
        );
        sweep.addColorStop(0.00, `rgba(255,255,255,0)`);
        sweep.addColorStop(0.30, `rgba(255,255,255,0)`);
        sweep.addColorStop(0.42, `rgba(240,245,255,${0.32 * gAlpha})`);
        sweep.addColorStop(0.50, `rgba(255,255,255,${0.20 * gAlpha})`);
        sweep.addColorStop(0.60, `rgba(255,255,255,0)`);
        sweep.addColorStop(1.00, `rgba(255,255,255,0)`);
        ctx.fillStyle = sweep;
        ctx.fillRect(0, 0, logW, logH);

        const spec = ctx.createLinearGradient(
            logW * 0.08, logH * 0.00,
            logW * 0.70, logH * 0.65
        );
        spec.addColorStop(0.00, `rgba(255,255,255,0)`);
        spec.addColorStop(0.44, `rgba(255,255,255,0)`);
        spec.addColorStop(0.48, `rgba(255,255,255,${0.55 * gAlpha})`);
        spec.addColorStop(0.52, `rgba(230,240,255,${0.25 * gAlpha})`);
        spec.addColorStop(0.56, `rgba(255,255,255,0)`);
        spec.addColorStop(1.00, `rgba(255,255,255,0)`);
        ctx.fillStyle = spec;
        ctx.fillRect(0, 0, logW, logH);

        const rim = ctx.createLinearGradient(
            logW * 0.20, logH * 0.80,
            logW * 0.80, logH * 0.45
        );
        rim.addColorStop(0.00, `rgba(255,255,255,0)`);
        rim.addColorStop(0.55, `rgba(200,220,255,${0.18 * gAlpha})`);
        rim.addColorStop(0.70, `rgba(255,255,255,${0.10 * gAlpha})`);
        rim.addColorStop(1.00, `rgba(255,255,255,0)`);
        ctx.fillStyle = rim;
        ctx.fillRect(0, 0, logW, logH);

        ctx.restore();
    }

    let curAlpha = 0, curSize = 0;
    let tgtAlpha = 0, tgtSize = 0;
    let isLooping = false;

    function computeTargets() {
        const p   = getScrollProgress();
        const max = getMaxSize();
        const min = getMinSize();

        tgtAlpha = easeInOutCubic(Math.min(p / 0.35, 1)) * MAX_ALPHA;
        tgtSize = min + (max - min) * easeOutExpo(p);
    }

    function loop() {
        computeTargets();
        curAlpha = lerp(curAlpha, tgtAlpha, LERP_SPEED);
        curSize  = lerp(curSize,  tgtSize,  LERP_SPEED);
        drawFrame(curSize, curAlpha);
        updateProgress();

        const settled = Math.abs(curAlpha - tgtAlpha) < 0.0008 &&
                        Math.abs(curSize  - tgtSize)  < 0.15;
        if (settled) {
            drawFrame(tgtSize, tgtAlpha);
            isLooping = false;
        } else {
            requestAnimationFrame(loop);
        }
    }

    function startLoop() {
        if (!isLooping) { isLooping = true; requestAnimationFrame(loop); }
    }

    function init() {
        resizeCanvas();
        cachedMaxSize = 0;
        curAlpha = 0;
        curSize  = 0;
        drawFrame(0, 0);
    }

    document.fonts.ready.then(() => { cachedMaxSize = 0; init(); });
    window.addEventListener('scroll', startLoop, { passive: true });
    window.addEventListener('resize', () => {
        cachedMaxSize = 0;
        resizeCanvas();
        computeTargets();
        curAlpha = tgtAlpha;
        curSize  = tgtSize;
        drawFrame(curSize, curAlpha);
    });

    init();
    updateProgress();

    document.querySelectorAll('#opener1 .opener_btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var item = btn.parentElement;
            var wasOpen = item.classList.contains('open');

            document.querySelectorAll('#opener1 .opener_item').forEach(function(it) {
                it.classList.remove('open');
                it.querySelector('.opener_body').style.maxHeight = '0px';
            });

            if (!wasOpen) {
                item.classList.add('open');
                var body = item.querySelector('.opener_body');
                var inner = item.querySelector('.opener_inner');
                body.style.maxHeight = inner.scrollHeight + 'px';
            }
        });
    });

    var first = document.querySelector('#opener1 .opener_item.open');
    if (first) {
        var b = first.querySelector('.opener_body');
        b.style.maxHeight = first.querySelector('.opener_inner').scrollHeight + 'px';
    }
    

 (function () {
    const COLORS = ['#94CD4D', '#FFF59F', '#FE969D'];

function pickColor(grid, col, row) {
        const forbidden = new Set();
        if (col > 0 && grid[col - 1]?.[row]) forbidden.add(grid[col - 1][row]);
        if (row > 0 && grid[col]?.[row - 1])  forbidden.add(grid[col][row - 1]);
        const available = COLORS.filter(c => !forbidden.has(c));
        return available[Math.floor(Math.random() * available.length)];
    }

    function initBtn(btn) {
        const canvas = btn.querySelector('.squares-canvas');

        function buildSquares() {
            canvas.innerHTML = '';

            const cols   = 4;
            const sqSize = btn.offsetHeight / 2;

            canvas.style.gridAutoColumns = sqSize + 'px';
            canvas.style.width = (sqSize * cols) + 'px';

            const GREEN_FILL_DURATION = 0.2;
            const grid = {};

            grid[0] = { 0: '#FFF59F', 1: '#FE969D' };

            for (let col = 0; col < cols; col++) {
                if (col > 0) grid[col] = {};
                for (let row = 0; row < 2; row++) {
                    const color = col === 0 ? grid[0][row] : pickColor(grid, col, row);
                    if (col > 0) grid[col][row] = color;

                    const sq = document.createElement('div');
                    sq.className = 'sq';
                    sq.style.background = color;
                    sq.style.width      = sqSize + 'px';
                    sq.style.height     = sqSize + 'px';

                    sq.dataset.enterDelay = (GREEN_FILL_DURATION + col * 0.05 + row * 0.02) + 's';
                    sq.dataset.leaveDelay = ((cols - col - 1) * 0.03) + 's';

                    canvas.appendChild(sq);
                }
            }
        }

        buildSquares();
        window.addEventListener('resize', buildSquares);

        btn.addEventListener('mouseenter', () => {
            canvas.querySelectorAll('.sq').forEach(sq => {
                sq.style.transitionDelay = sq.dataset.enterDelay;
            });
        });

        btn.addEventListener('mouseleave', () => {
            canvas.querySelectorAll('.sq').forEach(sq => {
                sq.style.transitionDelay = sq.dataset.leaveDelay;
            });
        });

        // navigation
        const href = btn.dataset.href;
        if (href) {
            btn.addEventListener('click', () => {
                window.location.href = href;
            });
        }
    }

    document.querySelectorAll('.btn-animated').forEach(initBtn);
})();
for(let i = 1; i <= 5; i++) {

    const shortCard = document.querySelector(`.otzyv${i}`);
    const fullCard = document.querySelector(`.otzyv${i}_2`);

    const readBtn = shortCard.querySelector('.read_more_btn');
    const closeBtn = fullCard.querySelector('.collapse_btn');

    readBtn.addEventListener('click', () => {
        shortCard.style.opacity = '0';
        shortCard.style.pointerEvents = 'none';

        fullCard.style.opacity = '1';
        fullCard.style.pointerEvents = 'auto';
    });

    closeBtn.addEventListener('click', () => {
        fullCard.style.opacity = '0';
        fullCard.style.pointerEvents = 'none';

        shortCard.style.opacity = '1';
        shortCard.style.pointerEvents = 'auto';
    });

}



});