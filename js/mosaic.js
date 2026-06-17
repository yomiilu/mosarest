(function() {
    'use strict';
    
    // ===== ЖДЁМ ПОЛНОЙ ЗАГРУЗКИ DOM =====
    function initMosaic() {
        
        // ===== ПРОВЕРКА: есть ли сетка на странице =====
        var canvas_grid = document.getElementById('canvas_grid');
        if (!canvas_grid) {
            console.log('Сетка не найдена на странице');
            return;
        }

        console.log('Мозаичная сетка инициализирована');

        // ===== КОНФИГУРАЦИЯ =====
        var COLS = 14;
        var ROWS = 13;
        var TOTAL = COLS * ROWS;
        var cells = [];
        var active_pattern = 'square';
        var active_color = '#9CE246';
        var is_drawing = false;
        var draw_mode = 'paint';

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

        // ===== ЗАПОЛНЯЕМ МАССИВ =====
        for (var k = 0; k < TOTAL; k++) {
            cells.push(null);
        }

        // ===== СОЗДАЁМ СЕТКУ =====
        function createGrid() {
            // Очищаем контейнер
            canvas_grid.innerHTML = '';
            
            for (var i = 0; i < TOTAL; i++) {
                var cell = document.createElement('div');
                cell.className = 'canvas_cell';
                cell.dataset.i = i;
                canvas_grid.appendChild(cell);
            }
            
            console.log('Создано ячеек: ' + TOTAL);
        }

        // ===== SVG ГЕНЕРАТОР =====
        function svg_for(pattern, color) {
            var stroke = color === '#FAFAF6' ? '#1a1a1a' : 'none';
            var sw = stroke === 'none' ? 0 : 1;
            
            var svg = '';
            if (pattern === 'square') {
                svg = '<rect x="2" y="2" width="16" height="16" rx="2" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
            } else if (pattern === 'triangle') {
                svg = '<polygon points="10,2 18,18 2,18" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
            } else if (pattern === 'diamond') {
                svg = '<rect x="2" y="2" width="16" height="16" rx="1" transform="rotate(45 10 10)" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
            } else if (pattern === 'circle') {
                svg = '<circle cx="10" cy="10" r="8" fill="' + color + '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
            }
            
            return svg ? '<svg viewBox="0 0 20 20">' + svg + '</svg>' : '';
        }

        // ===== ОТРИСОВКА ЯЧЕЙКИ =====
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

        // ===== ОБНОВЛЕНИЕ ИНФО =====
        function update_info() {
            var p_name = pattern_names[active_pattern] || active_pattern;
            var c_name = color_names[active_color] || '';
            
            var infoText = document.getElementById('toolbar_info_text');
            var dot = document.getElementById('toolbar_dot');
            
            if (infoText) infoText.textContent = p_name + ' — ' + c_name;
            if (dot) dot.style.background = active_color;
        }

        // ===== ДЕЙСТВИЯ =====
        function paint_cell(i) {
            cells[i] = { pattern: active_pattern, color: active_color };
            render_cell(i);
        }

        function erase_cell(i) {
            cells[i] = null;
            render_cell(i);
        }

        // ===== СОЗДАЁМ СЕТКУ =====
        createGrid();

        // ===== НАВЕШИВАЕМ СОБЫТИЯ =====
        // Рисование
        canvas_grid.addEventListener('mousedown', function(e) {
            var cell_el = e.target.closest('.canvas_cell');
            if (!cell_el) return;
            
            e.preventDefault();
            is_drawing = true;
            
            var idx = parseInt(cell_el.dataset.i);
            var already = cells[idx] && cells[idx].pattern === active_pattern && cells[idx].color === active_color;
            draw_mode = (e.button === 2 || e.shiftKey || already) ? 'erase' : 'paint';
            
            if (draw_mode === 'erase') {
                erase_cell(idx);
            } else {
                paint_cell(idx);
            }
            update_info();
        });

        canvas_grid.addEventListener('mouseover', function(e) {
            if (!is_drawing) return;
            
            var cell_el = e.target.closest('.canvas_cell');
            if (!cell_el) return;
            
            var idx = parseInt(cell_el.dataset.i);
            if (draw_mode === 'erase') {
                erase_cell(idx);
            } else {
                paint_cell(idx);
            }
        });

        canvas_grid.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        window.addEventListener('mouseup', function() {
            is_drawing = false;
        });

        // ===== ПАТТЕРНЫ =====
        var patternCards = document.querySelectorAll('.pattern_card');
        console.log('Найдено паттернов: ' + patternCards.length);
        
        patternCards.forEach(function(card) {
            card.addEventListener('click', function() {
                document.querySelectorAll('.pattern_card').forEach(function(c) {
                    c.classList.remove('active');
                });
                card.classList.add('active');
                active_pattern = card.dataset.pattern;
                update_info();
                console.log('Выбран паттерн: ' + active_pattern);
            });
        });

        // ===== ЦВЕТА =====
        var colorSwatches = document.querySelectorAll('.color_sw');
        console.log('Найдено цветов: ' + colorSwatches.length);
        
        colorSwatches.forEach(function(sw) {
            sw.addEventListener('click', function() {
                document.querySelectorAll('.color_sw').forEach(function(s) {
                    s.classList.remove('active');
                });
                sw.classList.add('active');
                active_color = sw.dataset.color;
                update_info();
                console.log('Выбран цвет: ' + active_color);
            });
        });

        // ===== КНОПКИ =====
        var toolClear = document.getElementById('tool_clear');
        if (toolClear) {
            toolClear.addEventListener('click', function() {
                for (var i = 0; i < TOTAL; i++) {
                    cells[i] = null;
                    render_cell(i);
                }
                console.log('Сетка очищена');
            });
        } else {
            console.warn('Кнопка tool_clear не найдена');
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
                            color: cols[Math.floor(Math.random() * cols.length)]
                        };
                    } else {
                        cells[i] = null;
                    }
                    render_cell(i);
                }
                update_info();
                console.log('Случайное заполнение');
            });
        }

        var toolErase = document.getElementById('tool_erase');
        if (toolErase) {
            toolErase.addEventListener('click', function() {
                draw_mode = 'erase';
                console.log('Режим ластика');
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

        // Кнопка корзины
        var cartBtn = document.getElementById('cart_btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', function() {
                var count = cells.filter(function(c) { return c !== null; }).length;
                if (count === 0) {
                    alert('Сначала нарисуйте дизайн!');
                } else {
                    alert('Товар добавлен в корзину! (' + count + ' ячеек)');
                }
            });
        }

        // Обновляем информацию
        update_info();
        console.log('Мозаичная сетка готова к работе!');
    }

    // ===== ЖДЁМ ЗАГРУЗКИ =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMosaic);
    } else {
        initMosaic();
    }

})();