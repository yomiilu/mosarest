(function() {
    'use strict';
    
    function initMosaic() {
        
        var canvas_grid = document.getElementById('canvas_grid');
        if (!canvas_grid) {
            console.log('Сетка не найдена на странице');
            return;
        }

        console.log('Мозаичная сетка инициализирована');

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

        for (var k = 0; k < TOTAL; k++) {
            cells.push(null);
        }

        function createGrid() {
            canvas_grid.innerHTML = '';
            
            for (var i = 0; i < TOTAL; i++) {
                var cell = document.createElement('div');
                cell.className = 'canvas_cell';
                cell.dataset.i = i;
                canvas_grid.appendChild(cell);
            }
            
            console.log('Создано ячеек: ' + TOTAL);
        }

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
            updateButtons();
        }

        function erase_cell(i) {
            cells[i] = null;
            render_cell(i);
            updateButtons();
        }

        function getFilledCount() {
            return cells.filter(function(c) { return c !== null; }).length;
        }

        // ===== ФУНКЦИЯ ОЧИСТКИ СЕТКИ =====
        function clearGrid() {
            for (var i = 0; i < TOTAL; i++) {
                cells[i] = null;
                render_cell(i);
            }
            var doneBtn = document.getElementById('done_btn');
            if (doneBtn) {
                doneBtn.classList.remove('done-pressed');
            }
            updateButtons();
            console.log('Сетка очищена');
        }

        function updateButtons() {
            var cartBtn = document.getElementById('cart_btn');
            var doneBtn = document.getElementById('done_btn');
            
            if (!cartBtn || !doneBtn) return;
            
            var filledCount = getFilledCount();
            var hasShapes = filledCount > 0;
            var isDonePressed = doneBtn.classList.contains('done-pressed');
            
            if (!hasShapes) {
                doneBtn.classList.remove('done-pressed');
                
                cartBtn.classList.remove('active-btn');
                cartBtn.classList.add('inactive');
                doneBtn.classList.remove('active-btn');
                doneBtn.classList.add('inactive');
                return;
            }
            
            if (hasShapes && !isDonePressed) {
                cartBtn.classList.remove('active-btn');
                cartBtn.classList.add('inactive');
                doneBtn.classList.remove('inactive');
                doneBtn.classList.add('active-btn');
                return;
            }
            
            if (isDonePressed) {
                cartBtn.classList.remove('inactive');
                cartBtn.classList.add('active-btn');
                doneBtn.classList.remove('active-btn');
                doneBtn.classList.add('inactive');
            }
        }

        function setupDoneButton() {
            var doneBtn = document.getElementById('done_btn');
            if (!doneBtn) return;
            
            doneBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var filledCount = getFilledCount();
                
                if (filledCount === 0) {
                    alert('Сначала нарисуйте фигуры на поле!');
                    return;
                }
                
                if (this.classList.contains('done-pressed')) {
                    return;
                }
                
                this.classList.add('done-pressed');
                updateButtons();
                console.log('Дизайн закончен! Количество ячеек: ' + filledCount);
            });
        }

        function setupCartButton() {
            var cartBtn = document.getElementById('cart_btn');
            if (!cartBtn) return;
            
            cartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                var doneBtn = document.getElementById('done_btn');
                var isDonePressed = doneBtn && doneBtn.classList.contains('done-pressed');
                
                if (!isDonePressed) {
                    alert('Сначала завершите дизайн, нажав кнопку "Закончено"!');
                    return;
                }
                
                var filledCount = getFilledCount();
                if (filledCount === 0) {
                    alert('Поле пустое. Нарисуйте дизайн!');
                    return;
                }
                
                alert('Дизайн добавлен в корзину! (' + filledCount + ' ячеек)');
                console.log('Добавлено в корзину: ' + filledCount + ' ячеек');
            });
        }

        // ===== ФУНКЦИЯ ДЛЯ КНОПКИ TRASH =====
        function setupTrashButton() {
            var trashBtn = document.querySelector('.trash');
            if (!trashBtn) {
                console.warn('Кнопка trash не найдена');
                return;
            }
            
            trashBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Спрашиваем подтверждение перед очисткой
                if (getFilledCount() > 0) {
                    if (confirm('Вы уверены, что хотите очистить всё поле?')) {
                        clearGrid();
                    }
                } else {
                    alert('Поле уже пустое!');
                }
            });
        }

        createGrid();

        canvas_grid.addEventListener('mousedown', function(e) {
            var cell_el = e.target.closest('.canvas_cell');
            if (!cell_el) return;
            
            e.preventDefault();
            is_drawing = true;
            
            var idx = parseInt(cell_el.dataset.i);
            var already = cells[idx] && cells[idx].pattern === active_pattern && cells[idx].color === active_color;
            draw_mode = (e.button === 2 || e.shiftKey || already) ? 'erase' : 'paint';
            
            var doneBtn = document.getElementById('done_btn');
            if (doneBtn) {
                doneBtn.classList.remove('done-pressed');
            }
            
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

        var patternCards = document.querySelectorAll('.pattern_card');
        patternCards.forEach(function(card) {
            card.addEventListener('click', function() {
                document.querySelectorAll('.pattern_card').forEach(function(c) {
                    c.classList.remove('active');
                });
                card.classList.add('active');
                active_pattern = card.dataset.pattern;
                update_info();
            });
        });

        var colorSwatches = document.querySelectorAll('.color_sw');
        colorSwatches.forEach(function(sw) {
            sw.addEventListener('click', function() {
                document.querySelectorAll('.color_sw').forEach(function(s) {
                    s.classList.remove('active');
                });
                sw.classList.add('active');
                active_color = sw.dataset.color;
                update_info();
            });
        });

        var toolClear = document.getElementById('tool_clear');
        if (toolClear) {
            toolClear.addEventListener('click', function() {
                if (getFilledCount() > 0) {
                    if (confirm('Вы уверены, что хотите очистить всё поле?')) {
                        clearGrid();
                    }
                } else {
                    alert('Поле уже пустое!');
                }
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
                            color: cols[Math.floor(Math.random() * cols.length)]
                        };
                    } else {
                        cells[i] = null;
                    }
                    render_cell(i);
                }
                var doneBtn = document.getElementById('done_btn');
                if (doneBtn) {
                    doneBtn.classList.remove('done-pressed');
                }
                updateButtons();
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

        setupDoneButton();
        setupCartButton();
        setupTrashButton(); // Добавляем настройку кнопки trash

        update_info();
        updateButtons();
        console.log('Мозаичная сетка готова к работе!');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMosaic);
    } else {
        initMosaic();
    }

})();