(function () {
    'use strict';

    (function() {
    'use strict';
    
    var canvas_grid = document.getElementById('canvas_grid');
    if (!canvas_grid) return;
    
    var active_pattern = 'square';
    var active_color = '#9CE246';
    var is_drawing = false;
    var draw_mode = 'paint';
    var COLS = 14;
    var ROWS = 13;
    var TOTAL = COLS * ROWS;
    var cells = [];

    var pattern_names = {
        square:   'Квадраты',
        triangle: 'Треугольники',
        diamond:  'Ромбы',
        circle:   'Точки'
    };

    var color_names = {
        '#9CE246': 'зелёный',
        '#FFEC1A': 'жёлтый',
        '#0A0A0A': 'чёрный',
        '#FAFAF6': 'белый',
        '#F5A6B0': 'розовый'
    };

    for (var k = 0; k < TOTAL; k++) { cells.push(null); }

    canvas_grid.innerHTML = '';

    for (var i = 0; i < TOTAL; i++) {
        var cell = document.createElement('div');
        cell.className = 'canvas_cell';
        cell.dataset.i = i;
        canvas_grid.appendChild(cell);
    }

    function svg_for(pattern, color) {
        var stroke = color === '#FAFAF6' ? '#1a1a1a' : 'none';
        var sw = stroke === 'none' ? 0 : 1;
        if (pattern === 'square') {
            return '<svg viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="2" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/></svg>';
        }
        if (pattern === 'triangle') {
            return '<svg viewBox="0 0 20 20"><polygon points="10,2 18,18 2,18" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/></svg>';
        }
        if (pattern === 'diamond') {
            return '<svg viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" rx="1" transform="rotate(45 10 10)" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/></svg>';
        }
        if (pattern === 'circle') {
            return '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/></svg>';
        }
        return '';
    }

    function render_cell(i) {
        var cell_el = canvas_grid.children[i];
        if (!cell_el) return;
        if (!cells[i]) {
            cell_el.innerHTML = '';
            cell_el.style.background = '';
        } else {
            cell_el.innerHTML = svg_for(cells[i].pattern, cells[i].color);
        }
    }

    function update_info() {
        var p_name = pattern_names[active_pattern] || active_pattern;
        var c_name = color_names[active_color] || '';
        var infoText = document.getElementById('toolbar_info_text');
        var dot = document.getElementById('toolbar_dot');
        if (infoText) infoText.textContent = p_name + ' — ' + c_name;
        if (dot) dot.style.background = active_color;
    }

    function paint_cell(i) {
        cells[i] = { pattern: active_pattern, color: active_color };
        render_cell(i);
    }

    function erase_cell(i) {
        cells[i] = null;
        render_cell(i);
    }

    canvas_grid.addEventListener('mousedown', function(e) {
        var cell_el = e.target.closest('.canvas_cell');
        if (!cell_el) return;
        e.preventDefault();
        is_drawing = true;
        var idx = parseInt(cell_el.dataset.i);
        var already = cells[idx] && cells[idx].pattern === active_pattern && cells[idx].color === active_color;
        draw_mode = (e.button === 2 || e.shiftKey || already) ? 'erase' : 'paint';
        if (draw_mode === 'erase') erase_cell(idx); else paint_cell(idx);
        update_info();
    });

    canvas_grid.addEventListener('mouseover', function(e) {
        if (!is_drawing) return;
        var cell_el = e.target.closest('.canvas_cell');
        if (!cell_el) return;
        var idx = parseInt(cell_el.dataset.i);
        if (draw_mode === 'erase') erase_cell(idx); else paint_cell(idx);
    });

    window.addEventListener('mouseup', function() { is_drawing = false; });
    canvas_grid.addEventListener('contextmenu', function(e) { e.preventDefault(); });

    document.querySelectorAll('.pattern_card').forEach(function(card) {
        card.addEventListener('click', function() {
            document.querySelectorAll('.pattern_card').forEach(function(c) { c.classList.remove('active'); });
            card.classList.add('active');
            active_pattern = card.dataset.pattern;
            update_info();
        });
    });

    document.querySelectorAll('.color_sw').forEach(function(sw) {
        sw.addEventListener('click', function() {
            document.querySelectorAll('.color_sw').forEach(function(s) { s.classList.remove('active'); });
            sw.classList.add('active');
            active_color = sw.dataset.color;
            update_info();
        });
    });

    var toolClear = document.getElementById('tool_clear');
    if (toolClear) {
        toolClear.addEventListener('click', function() {
            for (var i = 0; i < TOTAL; i++) { cells[i] = null; render_cell(i); }
        });
    }

    var toolRandom = document.getElementById('tool_random');
    if (toolRandom) {
        toolRandom.addEventListener('click', function() {
            var pats = ['square', 'triangle', 'diamond', 'circle'];
            var cols = ['#9CE246', '#FFEC1A', '#F5A6B0', '#0A0A0A'];
            for (var i = 0; i < TOTAL; i++) {
                if (Math.random() < 0.55) {
                    cells[i] = {
                        pattern: pats[Math.floor(Math.random() * pats.length)],
                        color:   cols[Math.floor(Math.random() * cols.length)]
                    };
                } else {
                    cells[i] = null;
                }
                render_cell(i);
            }
            update_info();
        });
    }

    var toolErase = document.getElementById('tool_erase');
    if (toolErase) {
        toolErase.addEventListener('click', function() {
            draw_mode = 'erase';
        });
    }

    var backBtn = document.getElementById('canvas_back_btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            history.back();
        });
    }

    var confirmBtn = document.getElementById('canvas_confirm_btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            var count = cells.filter(function(c) { return c !== null; }).length;
            alert('Дизайн из ' + count + ' ячеек подтверждён!');
        });
    }

    update_info();
})();

    const TILE    = 72;
    const COLOR   = '#FFF59F';
    const T_FILL  = 800;
    const T_FADE  = 1000;

    function buildTiles(W, H) {
        const cols = Math.max(2, Math.round(W / TILE));
        const rows = Math.max(2, Math.round(H / TILE));
        const tw = W / cols, th = H / rows;
        const list = [];
        for (let r = 0; r < rows; r++)
            for (let c = 0; c < cols; c++)
                list.push({ r, c, rows, cols, tw, th, d: r + c });
        list.sort((a, b) => a.d - b.d);
        return { list, maxD: list[list.length - 1].d };
    }

    function drawFilledCell(ctx, t, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = COLOR;
        ctx.fillRect(
            Math.floor(t.c * t.tw) - 1,
            Math.floor(t.r * t.th) - 1,
            Math.ceil(t.tw) + 2,
            Math.ceil(t.th) + 2
        );
        ctx.restore();
    }

    function waveAlpha(progress, d, maxD, dir) {
        const v = (progress * (maxD + 1.5) - d) / 1.5;
        const a = Math.max(0, Math.min(1, v));
        return dir > 0 ? a : 1 - a;
    }

    function makeScene() {
        const DPR = window.devicePixelRatio || 1;
        const W = window.innerWidth, H = window.innerHeight;
        const cv = document.createElement('canvas');
        cv.width  = Math.round(W * DPR);
        cv.height = Math.round(H * DPR);
        cv.style.cssText =
            'position:fixed;top:0;left:0;width:100%;height:100%;' +
            'pointer-events:none;z-index:99999;';
        document.body.appendChild(cv);
        const ctx = cv.getContext('2d');
        ctx.scale(DPR, DPR);
        return { cv, ctx, W, H, ...buildTiles(W, H) };
    }

    function leave(href) {
        const s = makeScene();
        sessionStorage.setItem('_mt', '1');

        requestAnimationFrame(() => {
        const t0 = performance.now();

        (function frame(now) {
            const e = now - t0;
            s.ctx.clearRect(0, 0, s.W, s.H);

            if (e < T_FILL) {
                const p = e / T_FILL;
                s.list.forEach(t => {
                    const a = waveAlpha(p, t.d, s.maxD, 1);
                    if (a > 0) drawFilledCell(s.ctx, t, a);
                });
            } else {
                s.ctx.clearRect(0, 0, s.W, s.H);
                s.ctx.fillStyle = COLOR;
                s.ctx.fillRect(0, 0, s.W, s.H);

                sessionStorage.setItem('_mt_tiles_data', JSON.stringify({
                    list: s.list.map(t => ({ r: t.r, c: t.c, d: t.d })),
                    maxD: s.maxD,
                    W: s.W,
                    H: s.H,
                    rows: s.list[0]?.rows,
                    cols: s.list[0]?.cols,
                    tw: s.list[0]?.tw,
                    th: s.list[0]?.th
                }));

                window.location.href = href;
                return;
            }
            requestAnimationFrame(frame);
        })(t0);
        });
    }

    function enter() {
        // if (sessionStorage.getItem('_mt') !== '1') {
        //     return;
        // }
    
        sessionStorage.removeItem('_mt');

        let tilesData = null;
        try {
            const data = sessionStorage.getItem('_mt_tiles_data');
            if (data) {
                tilesData = JSON.parse(data);
                sessionStorage.removeItem('_mt_tiles_data');
            }
        } catch(e) {}

        let cv = document.querySelector('canvas[style*="z-index: 99999"]');

        if (!cv) {
            const s = makeScene();
            s.ctx.fillStyle = COLOR;
            s.ctx.fillRect(0, 0, s.W, s.H);
            cv = s.cv;

            if (!tilesData && s.list) {
                tilesData = {
                    list: s.list.map(t => ({ r: t.r, c: t.c, d: t.d })),
                    maxD: s.maxD,
                    W: s.W,
                    H: s.H,
                    rows: s.list[0]?.rows,
                    cols: s.list[0]?.cols,
                    tw: s.list[0]?.tw,
                    th: s.list[0]?.th
                };
            }
        }

        if (!tilesData) {
            cv.style.transition = 'opacity 1s ease-out';
            cv.style.opacity = '0';
            setTimeout(() => cv.remove(), 1100);
            return;
        }

        const list = tilesData.list.map(t => ({
            ...t,
            rows: tilesData.rows,
            cols: tilesData.cols,
            tw: tilesData.tw,
            th: tilesData.th
        }));
        const maxD = tilesData.maxD;
        const ctx = cv.getContext('2d');
        const W = tilesData.W;
        const H = tilesData.H;

        const t0 = performance.now();

        (function frame(now) {
            const e = now - t0;
            ctx.clearRect(0, 0, W, H);

            if (e < T_FADE) {
                const p = e / T_FADE;
                list.forEach(t => {
                    const a = waveAlpha(p, t.d, maxD, -1);
                    if (a > 0) {
                        drawFilledCell(ctx, t, a);
                    }
                });
                requestAnimationFrame(frame);
            } else {
                cv.remove();
                return;
            }
        })(t0);
    }

    document.addEventListener('click', e => {
        const a = e.target.closest('a[href]');
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const href = a.getAttribute('href');
        if (!href || href.startsWith('#') || a.target === '_blank'
            || /^(mailto|tel):/.test(href)) return;
        if (/^https?:\/\//.test(href) && !href.startsWith(location.origin)) return;
        e.preventDefault();
        leave(href);
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enter);
    } else {
        enter();
    }

})();


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
        const probe = 10000;
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

    (function() {
        const canvas2  = document.getElementById('mask-canvas-workers');
        if (!canvas2) return;
        const ctx2     = canvas2.getContext('2d');
        const section2 = document.querySelector('.section1_workers');

        const DPR2 = window.devicePixelRatio || 1;
        let logW2 = 0, logH2 = 0;

        function resizeCanvas2() {
            logW2 = canvas2.offsetWidth  || window.innerWidth;
            logH2 = canvas2.offsetHeight || window.innerHeight;
            canvas2.width  = Math.round(logW2 * DPR2);
            canvas2.height = Math.round(logH2 * DPR2);
            ctx2.setTransform(DPR2, 0, 0, DPR2, 0, 0);
        }

        const TEXT2        = 'КОМАНДА';
        const FONT_WEIGHT2 = '900';
        const FONT_FAMILY2 = '"Unb-SB", "Arial Black", sans-serif';
        const TEXT_Y_FRAC2 = 0.8;
        const MAX_ALPHA2   = 0.65;
        const LERP_SPEED2  = 0.07;
        let cachedMaxSize2 = 0;

        function computeMaxFontSize2() {
            const probe = 10000;
            ctx2.font = `${FONT_WEIGHT2} ${probe}px ${FONT_FAMILY2}`;
            const w = ctx2.measureText(TEXT2).width;
            return (probe * logW2 / w) * 0.9;
        }
        function getMaxSize2() {
            if (!cachedMaxSize2) cachedMaxSize2 = computeMaxFontSize2();
            return cachedMaxSize2;
        }
        function getMinSize2() { return getMaxSize2() * 0.38; }

        function getScrollProgress2() {
            if (!section2) return 0;
            const scrolled = window.pageYOffset - section2.offsetTop;
            const range    = section2.offsetHeight - window.innerHeight;
            return range > 0 ? Math.max(0, Math.min(1, scrolled / range)) : 0;
        }

        function lerp2(a, b, t) { return a + (b - a) * t; }
        function easeInOutCubic2(t) {
            return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
        }
        function easeOutExpo2(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function drawFrame2(fontSize, overlayAlpha) {
            ctx2.clearRect(0, 0, logW2, logH2);
            if (overlayAlpha < 0.002) return;

            ctx2.save();
            ctx2.globalAlpha = overlayAlpha;
            ctx2.fillStyle   = '#ffffff';
            ctx2.fillRect(0, 0, logW2, logH2);
            ctx2.restore();

            if (fontSize < 2) return;

            ctx2.save();
            ctx2.globalCompositeOperation = 'destination-out';
            ctx2.font         = `${FONT_WEIGHT2} ${fontSize}px ${FONT_FAMILY2}`;
            ctx2.textAlign    = 'center';
            ctx2.textBaseline = 'alphabetic';
            ctx2.fillText(TEXT2, logW2 / 2, logH2 * TEXT_Y_FRAC2);
            ctx2.restore();

            const gAlpha = Math.min(overlayAlpha / MAX_ALPHA2, 1);

            ctx2.save();
            ctx2.globalCompositeOperation = 'destination-over';

            const sweep = ctx2.createLinearGradient(logW2*-0.1, logH2*0.05, logW2*0.85, logH2*0.75);
            sweep.addColorStop(0.00, `rgba(255,255,255,0)`);
            sweep.addColorStop(0.30, `rgba(255,255,255,0)`);
            sweep.addColorStop(0.42, `rgba(240,245,255,${0.32*gAlpha})`);
            sweep.addColorStop(0.50, `rgba(255,255,255,${0.20*gAlpha})`);
            sweep.addColorStop(0.60, `rgba(255,255,255,0)`);
            sweep.addColorStop(1.00, `rgba(255,255,255,0)`);
            ctx2.fillStyle = sweep;
            ctx2.fillRect(0, 0, logW2, logH2);

            const spec = ctx2.createLinearGradient(logW2*0.08, logH2*0.00, logW2*0.70, logH2*0.65);
            spec.addColorStop(0.00, `rgba(255,255,255,0)`);
            spec.addColorStop(0.44, `rgba(255,255,255,0)`);
            spec.addColorStop(0.48, `rgba(255,255,255,${0.55*gAlpha})`);
            spec.addColorStop(0.52, `rgba(230,240,255,${0.25*gAlpha})`);
            spec.addColorStop(0.56, `rgba(255,255,255,0)`);
            spec.addColorStop(1.00, `rgba(255,255,255,0)`);
            ctx2.fillStyle = spec;
            ctx2.fillRect(0, 0, logW2, logH2);

            const rim = ctx2.createLinearGradient(logW2*0.20, logH2*0.80, logW2*0.80, logH2*0.45);
            rim.addColorStop(0.00, `rgba(255,255,255,0)`);
            rim.addColorStop(0.55, `rgba(200,220,255,${0.18*gAlpha})`);
            rim.addColorStop(0.70, `rgba(255,255,255,${0.10*gAlpha})`);
            rim.addColorStop(1.00, `rgba(255,255,255,0)`);
            ctx2.fillStyle = rim;
            ctx2.fillRect(0, 0, logW2, logH2);

            ctx2.restore();
        }

        let curAlpha2 = 0, curSize2 = 0;
        let tgtAlpha2 = 0, tgtSize2 = 0;
        let isLooping2 = false;

        function computeTargets2() {
            const p   = getScrollProgress2();
            const max = getMaxSize2();
            const min = getMinSize2();
            tgtAlpha2 = easeInOutCubic2(Math.min(p / 0.35, 1)) * MAX_ALPHA2;
            tgtSize2  = min + (max - min) * easeOutExpo2(p);
        }

        function loop2() {
            computeTargets2();
            curAlpha2 = lerp2(curAlpha2, tgtAlpha2, LERP_SPEED2);
            curSize2  = lerp2(curSize2,  tgtSize2,  LERP_SPEED2);
            drawFrame2(curSize2, curAlpha2);

            const settled = Math.abs(curAlpha2 - tgtAlpha2) < 0.0008 &&
                            Math.abs(curSize2  - tgtSize2)  < 0.15;
            if (settled) { drawFrame2(tgtSize2, tgtAlpha2); isLooping2 = false; }
            else requestAnimationFrame(loop2);
        }

        function startLoop2() {
            if (!isLooping2) { isLooping2 = true; requestAnimationFrame(loop2); }
        }

        function init2() {
            resizeCanvas2();
            cachedMaxSize2 = 0;
            curAlpha2 = 0; curSize2 = 0;
            drawFrame2(0, 0);
        }

        document.fonts.ready.then(() => { cachedMaxSize2 = 0; init2(); });
        window.addEventListener('scroll', startLoop2, { passive: true });
        window.addEventListener('resize', () => {
            cachedMaxSize2 = 0;
            resizeCanvas2();
            computeTargets2();
            curAlpha2 = tgtAlpha2;
            curSize2  = tgtSize2;
            drawFrame2(curSize2, curAlpha2);
        });

        init2();
    })();

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
            body.style.maxHeight = item.querySelector('.opener_inner').scrollHeight + 'px';
        }

        var items = [...document.querySelectorAll('#opener1 .opener_item')];
        var activeItem = document.querySelector('#opener1 .opener_item.open');
        var idx = items.indexOf(activeItem);
        document.querySelectorAll('.opener_photo').forEach((p, i) => {
            p.classList.toggle('active', i === idx);
        });
    });
});
    

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



(function () {
    'use strict';

    const TILE = 22;
    const GAP  = 3;

    const SHAPES = ['square', 'circle', 'diamond', 'triangle'];
    const PAT = [
        [0, 1, 2, 3],
        [2, 3, 0, 1],
        [3, 0, 1, 2],
        [1, 2, 3, 0],
    ];

    function getShape(r, c, rows, cols) {
        if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) return 'square';
        return SHAPES[PAT[r % 4][c % 4]];
    }

    function renderMosaic(cv, img) {
        const W = img.offsetWidth, H = img.offsetHeight;
        if (!W || !H) return false;

        const DPR = window.devicePixelRatio || 1;
        cv.width  = Math.round(W * DPR);
        cv.height = Math.round(H * DPR);
        const ctx = cv.getContext('2d');
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        ctx.fillStyle = getComputedStyle(img.closest('section')).backgroundColor;
        ctx.fillRect(0, 0, W, H);


        const cols  = Math.max(2, Math.round(W / TILE));
        const rows  = Math.max(2, Math.round(H / TILE));
        const tileW = W / cols;
        const tileH = H / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const shape = getShape(r, c, rows, cols);

                const sx = c * tileW + GAP / 2;
                const sy = r * tileH + GAP / 2;
                const sw = tileW - GAP;
                const sh = tileH - GAP;
                
                const s  = Math.min(sw, sh);
                const ox = sx + (sw - s) / 2;
                const oy = sy + (sh - s) / 2;
                const cx = ox + s / 2;
                const cy = oy + s / 2;

                ctx.save();
                ctx.beginPath();

                switch (shape) {
                    case 'square':
                        ctx.rect(sx, sy, sw, sh);
                        break;
                    case 'circle':
                        ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
                        break;
                    case 'diamond':
                        ctx.moveTo(cx, oy); ctx.lineTo(ox + s, cy);
                        ctx.lineTo(cx, oy + s); ctx.lineTo(ox, cy);
                        ctx.closePath();
                        break;
                    default:
                        ctx.moveTo(cx, oy);
                        ctx.lineTo(ox + s, oy + s);
                        ctx.lineTo(ox,     oy + s);
                        ctx.closePath();
                }

                ctx.clip();
                ctx.drawImage(img, 0, 0, W, H);
                ctx.restore();
            }
        }
        return true;
    }

    function setup(phEl) {
        if (phEl._mosaicInit) return;
        phEl._mosaicInit = true;

        const img = phEl.tagName === 'IMG' ? phEl : phEl.querySelector('img');
        if (!img) return;

        const host = phEl.tagName === 'IMG' ? phEl.parentElement : phEl;
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';

        const cv = document.createElement('canvas');
        cv.style.cssText =
            'position:absolute;pointer-events:none;opacity:0;transition:opacity .45s ease;';
        host.appendChild(cv);

        function positionCanvas() {
            if (phEl.tagName !== 'IMG') {
                cv.style.top = '0'; cv.style.left = '0';
                cv.style.width = '100%'; cv.style.height = '100%';
            } else {
                const hr = host.getBoundingClientRect();
                const ir = img.getBoundingClientRect();
                cv.style.left   = (ir.left - hr.left) + 'px';
                cv.style.top    = (ir.top  - hr.top)  + 'px';
                cv.style.width  = ir.width  + 'px';
                cv.style.height = ir.height + 'px';
            }
        }

        let dirty = true;

        function tryDraw() {
            positionCanvas();
            if (!dirty) return true;
            if (!img.complete || !img.naturalWidth) return false;
            const ok = renderMosaic(cv, img);
            if (ok) dirty = false;
            return ok;
        }

        phEl.addEventListener('mouseenter', () => { if (tryDraw()) cv.style.opacity = '1'; });
        phEl.addEventListener('mouseleave', () => { cv.style.opacity = '0'; });
        window.addEventListener('resize',   () => { dirty = true; });
        img.addEventListener('load',        () => { dirty = true; });
    }

    function init() {
        document.querySelectorAll('[class]').forEach(el => {
            if (/\bph\d+\b/.test(el.className)) setup(el);
        });
    }

    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', init)
        : init();
})();

document.querySelectorAll('.clickable').forEach(el => {
    el.addEventListener('click', () => {
        const href = el.getAttribute('data-href');
        if (href) window.location.href = href;
    });
});
(function() {
    const groups = [
        { container: '.image_swap1', showImg: true },
        { container: '.image_swap2', showImg: false },
        { container: '.image_swap3', showImg: true },
        { container: '.image_swap4', showImg: false }
    ];
    
    groups.forEach(group => {
        const container = document.querySelector(group.container);
        if (!container) return;
        
        const img = container.querySelector('img');
        const div = container.querySelector('div');
        
        if (group.showImg) {
            img.style.zIndex = '2';
            div.style.zIndex = '1';
        } else {
            img.style.zIndex = '1';
            div.style.zIndex = '2';
        }
        
        group.img = img;
        group.div = div;
    });
    
    setInterval(() => {
        groups.forEach(group => {
            if (group.showImg) {
                group.img.style.zIndex = '1';
                group.div.style.zIndex = '2';
            } else {
                group.img.style.zIndex = '2';
                group.div.style.zIndex = '1';
            }
            
            group.showImg = !group.showImg;
        });
    }, 2000);
})();

function selectDate(card) {
    document.querySelectorAll('.date-card.selected').forEach(function(c) {
        c.classList.remove('selected');
    });
    card.classList.add('selected');
}



});

var evCurrent = 0;
var evTotal = 3;

function eventShow(n) {
    for (var i = 0; i < evTotal; i++) {
        document.getElementById('event-' + i).style.display = 'none';
    }
    document.getElementById('event-' + n).style.display = 'block';
}

function eventNext() {
    evCurrent = (evCurrent + 1) % evTotal;
    eventShow(evCurrent);
}

function eventPrev() {
    evCurrent = (evCurrent - 1 + evTotal) % evTotal;
    eventShow(evCurrent);
}

function selectColor(el) {
    document.querySelectorAll('.color_dot').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
}

function selectSize(el) {
    el.closest('.merch2_sizes').querySelectorAll('.size_btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
}

function changeQty(delta) {
    const el = document.getElementById('qty');
    let v = parseInt(el.textContent) + delta;
    if (v < 1) v = 1;
    el.textContent = v;
}


function initWorkersAnimation() {
    const cards = [
        { el: document.querySelector('.cur1'), fromX: '-9.4vw', fromY: '0',  delay: 0   },
        { el: document.querySelector('.cur2'), fromX: '0',      fromY: '8vw', delay: 180 },
        { el: document.querySelector('.cur3'), fromX: '0',      fromY: '8vw', delay: 360 },
        { el: document.querySelector('.cur4'), fromX: '9.4vw',  fromY: '0',  delay: 0   },
        { el: document.querySelector('.cur5'), fromX: '-9.4vw', fromY: '0',  delay: 0   },
        { el: document.querySelector('.cur6'), fromX: '0',      fromY: '8vw', delay: 180 },
        { el: document.querySelector('.cur7'), fromX: '9.4vw',  fromY: '0',  delay: 360 },
    ];

    cards.forEach(card => {
        if (!card.el) return;
        card.el.style.transition = 'none';
        card.el.style.opacity = '0';
        card.el.style.transform = `translate(${card.fromX}, ${card.fromY})`;
    });

    const section = document.querySelector('.section2_workers');
    if (!section) return;

    let triggered = false;

    function checkScroll() {
        if (triggered) return;
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.4) {
            triggered = true;
            cards.forEach(card => {
                if (!card.el) return;
                setTimeout(() => {
                    card.el.style.transition = 'transform 2.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.8s ease';
                    card.el.style.transform = 'translate(0, 0)';
                    card.el.style.opacity = '1';
                }, card.delay);
            });
            window.removeEventListener('scroll', checkScroll);
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll();
}

document.addEventListener('DOMContentLoaded', initWorkersAnimation);


function initSection2Animation() {
    const photos = [
        { el: document.querySelector('.ph1'), fromX: '-6vw', fromY: '0',   delay: 0   },
        { el: document.querySelector('.ph2'), fromX: '6vw',  fromY: '0',   delay: 120 },
        { el: document.querySelector('.ph3'), fromX: '0',    fromY: '6vw', delay: 0   },
        { el: document.querySelector('.ph4'), fromX: '0',    fromY: '6vw', delay: 120 },
        { el: document.querySelector('.ph5'), fromX: '-6vw', fromY: '0',   delay: 240 },
        { el: document.querySelector('.ph6'), fromX: '6vw',  fromY: '0',   delay: 0   },
        { el: document.querySelector('.ph7'), fromX: '0',    fromY: '6vw', delay: 120 },
        { el: document.querySelector('.ph8'), fromX: '-6vw', fromY: '0',   delay: 240 },
    ];

    photos.forEach(photo => {
        if (!photo.el) return;
        photo.el.style.transition = 'none';
        photo.el.style.opacity = '0';
        photo.el.style.transform = `translate(${photo.fromX}, ${photo.fromY})`;
    });

    const section = document.querySelector('.section2');
    if (!section) return;

    let triggered = false;

    function checkScroll() {
        if (triggered) return;
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.4) {
            triggered = true;
            photos.forEach(photo => {
                if (!photo.el) return;
                setTimeout(() => {
                    photo.el.style.transition = 'transform 2.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.8s ease';
                    photo.el.style.transform = 'translate(0, 0)';
                    photo.el.style.opacity = '1';
                }, photo.delay);
            });
            window.removeEventListener('scroll', checkScroll);
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll();
}

document.addEventListener('DOMContentLoaded', initSection2Animation);

function initMerchAnimation() {
    const items = [
        { el: document.querySelector('.tovar4'),  fromX: '-8vw', fromY: '0',    delay: 0   },
        { el: document.querySelector('.tovar5'),  fromX: '0',    fromY: '-8vw', delay: 150 },
        { el: document.querySelector('.tovar6'),  fromX: '8vw',  fromY: '0',    delay: 300 },
        { el: document.querySelector('.tovar7'),  fromX: '0',    fromY: '8vw',  delay: 450 },
        { el: document.querySelector('.tovar8'),  fromX: '-8vw', fromY: '0',    delay: 100 },
        { el: document.querySelector('.tovar9'),  fromX: '0',    fromY: '-8vw', delay: 250 },
        { el: document.querySelector('.tovar10'), fromX: '8vw',  fromY: '0',    delay: 400 },
        { el: document.querySelector('.tovar11'), fromX: '-8vw', fromY: '0',    delay: 0   },
        { el: document.querySelector('.tovar12'), fromX: '8vw',  fromY: '0',    delay: 200 },
    ];

    items.forEach(item => {
        if (!item.el) return;
        item.el.style.transition = 'none';
        item.el.style.opacity = '0';
        item.el.style.transform = `translate(${item.fromX}, ${item.fromY})`;
    });

    const section1 = document.querySelector('.section1_merch');
    const section2 = document.querySelector('.section2_merch');

    function animateGroup(els) {
        els.forEach(item => {
            if (!item.el) return;
            setTimeout(() => {
                item.el.style.transition = 'transform 2.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.8s ease';
                item.el.style.transform = 'translate(0, 0)';
                item.el.style.opacity = '1';
            }, item.delay);
        });
    }

    const group1 = items.slice(0, 7);
    const group2 = items.slice(7);
    let triggered1 = false;
    let triggered2 = false;

    function checkScroll() {
        if (!triggered1 && section1) {
            const rect = section1.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.4) {
                triggered1 = true;
                animateGroup(group1);
            }
        }
        if (!triggered2 && section2) {
            const rect = section2.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.4) {
                triggered2 = true;
                animateGroup(group2);
            }
        }
        if (triggered1 && triggered2) {
            window.removeEventListener('scroll', checkScroll);
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll();
}


document.addEventListener('DOMContentLoaded', initMerchAnimation);

document.addEventListener('DOMContentLoaded', function() {
    const firstItem = document.querySelector('.opener_wrap_tarifs .opener_item');
    if (firstItem) {
        firstItem.classList.add('open');
        const body = firstItem.querySelector('.opener_body');
        if (body) {
            body.style.maxHeight = body.querySelector('.opener_inner').scrollHeight + 'px';
        }
        const firstPhoto = document.querySelector('.opener_wrap_tarifs .opener_photo');
        if (firstPhoto) {
            firstPhoto.classList.add('active');
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const firstItem = document.querySelector('#opener1 .opener_item');
    if (firstItem) {
        firstItem.classList.add('open');
        const body = firstItem.querySelector('.opener_body');
        if (body) {
            body.style.maxHeight = body.querySelector('.opener_inner').scrollHeight + 'px';
        }
        const firstPhoto = document.querySelector('.opener_wrap .opener_photo');
        if (firstPhoto) {
            firstPhoto.classList.add('active');
        }
    }
});