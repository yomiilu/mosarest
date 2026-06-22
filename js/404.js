(function () {
    'use strict';

    var COLS = 30;
    var ROWS = 12;
    var TOTAL = COLS * ROWS;

    var COLORS = ['#9CE246', '#FFEC1A', '#F5A6B0'];
    var PATTERNS = ['square', 'triangle', 'diamond', 'circle'];

    var DIGIT_MAPS = {
        '4': [
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [1,0,0,1,0,0,0,0,0],
            [1,0,0,1,0,0,0,0,0],
            [1,0,0,1,0,0,0,0,0],
            [1,1,1,1,1,1,1,0,0],
            [0,0,0,1,0,0,0,0,0],
            [0,0,0,1,0,0,0,0,0],
            [0,0,0,1,0,0,0,0,0],
            [0,0,0,1,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
        ],
        '0': [
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,0,0],
            [1,1,0,0,0,0,1,1,0],
            [1,0,0,0,0,0,0,1,0],
            [1,0,0,0,0,0,0,1,0],
            [1,0,0,0,0,0,0,1,0],
            [1,0,0,0,0,0,0,1,0],
            [1,1,0,0,0,0,1,1,0],
            [0,1,1,1,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0],
        ]
    };

    function build404Map() {
        var map = [];
        for (var r = 0; r < ROWS; r++) {
            map.push(new Array(COLS).fill(0));
        }

        // 3 цифры по 8 реальных колонок + отступы между 2 = итого 28, по 1 с краёв = 30
        var layout = [
            { digit: '4', startCol: 2  },
            { digit: '0', startCol: 11 },
            { digit: '4', startCol: 21 },
        ];

        layout.forEach(function(item) {
            var dmap = DIGIT_MAPS[item.digit];
            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < 9; c++) {
                    if (dmap[r] && dmap[r][c]) {
                        map[r][item.startCol + c] = 1;
                    }
                }
            }
        });

        return map;
    }

    function svg_for(pattern, color) {
        var stroke = color === '#FAFAF6' ? '#1a1a1a' : 'none';
        var sw = stroke === 'none' ? 0 : 1;
        var inner = '';

        if (pattern === 'square') {
            inner = '<rect x="2" y="2" width="16" height="16" rx="2" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
        } else if (pattern === 'triangle') {
            inner = '<polygon points="10,2 18,18 2,18" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
        } else if (pattern === 'diamond') {
            inner = '<rect x="2" y="2" width="16" height="16" rx="1" transform="rotate(45 10 10)" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
        } else if (pattern === 'circle') {
            inner = '<circle cx="10" cy="10" r="8" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
        }

        return inner ? '<svg viewBox="0 0 20 20">' + inner + '</svg>' : '';
    }

    function rndColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    function rndPattern() {
        return PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
    }

    function init() {
        var grid = document.getElementById('err_grid');
        if (!grid) return;

        var map = build404Map();

        var cellEls = [];
        for (var i = 0; i < TOTAL; i++) {
            var cell = document.createElement('div');
            cell.className = 'err_cell';
            grid.appendChild(cell);
            cellEls.push(cell);
        }

        var toAnimate = [];
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (map[r][c]) {
                    toAnimate.push(r * COLS + c);
                }
            }
        }

        toAnimate.sort(function() { return Math.random() - 0.5; });

        toAnimate.forEach(function(idx) {
            var el = cellEls[idx];
            el.innerHTML = svg_for(rndPattern(), rndColor());
        });

        toAnimate.forEach(function(idx, order) {
            var svgEl = cellEls[idx].querySelector('svg');
            if (!svgEl) return;
            setTimeout(function() {
                svgEl.classList.add('visible');
            }, 80 + order * 18);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();