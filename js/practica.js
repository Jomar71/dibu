(function () {
    const canvas = document.getElementById('practice-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const INK = '#2b2b2f';
    const GUIDE_DASH = 'rgba(148, 163, 184, 0.6)';
    const GUIDE_SOLID = 'rgba(148, 163, 184, 0.9)';
    const STORE_KEY = 'dominaElLapiz_practica';

    let mode = 'line';
    let guide = null;
    let strokes = [];
    let coverage = [0, 0, 0, 0, 0];
    let drawing = false;
    let currentStroke = null;

    const TIPS = {
        line: 'Traza la línea de un solo movimiento, rápido y confiado. Dibuja con el hombro, no con la muñeca.',
        arc: 'Imagina la curva como un arco de flecha: entra suave, describe la curva en el centro y sal suave.',
        circle: 'Dibuja el círculo en un solo trazo continuo, sin levantar el lápiz. Rota el hombro, no la muñeca.',
        value: 'Rellena cada casilla hasta igualar el tono guía. Cuantas menos pasadas le des, mejor es tu control.',
        hatch: 'Cubre la zona con líneas paralelas y parejas, con la misma inclinación que la guía. Trama sin cruces.',
        crosshatch: 'Trama primero en una dirección y después cruza con otra capa en la dirección perpendicular. Cuanto más parejas, mejor.'
    };

    const VALUE_CELLS = [0.12, 0.34, 0.55, 0.74, 0.92].map((target, i) => ({
        target: target,
        x: 90 + i * 130,
        y: 200,
        size: 100
    }));

    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    function randPoint(xMin, xMax, yMin, yMax) {
        return { x: rand(xMin, xMax), y: rand(yMin, yMax) };
    }

    function dist(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function bezier(t, p0, p1, p2) {
        const u = 1 - t;
        return {
            x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
            y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
        };
    }

    function loadStats() {
        try {
            return JSON.parse(localStorage.getItem(STORE_KEY)) || { attempts: 0 };
        } catch (e) {
            return { attempts: 0 };
        }
    }

    function saveStats(stats) {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(stats));
        } catch (e) {
            /* almacenamiento no disponible */
        }
    }

    function updateAttempts() {
        const el = document.getElementById('practice-attempts');
        if (el) el.textContent = loadStats().attempts;
    }

    function newGuide() {
        strokes = [];
        coverage = [0, 0, 0, 0, 0];
        if (mode === 'line') {
            let p1, p2;
            do {
                p1 = randPoint(110, W - 110, 90, H - 90);
                p2 = randPoint(110, W - 110, 90, H - 90);
            } while (dist(p1, p2) < W * 0.45);
            guide = { p1: p1, p2: p2 };
        } else if (mode === 'arc') {
            let p0, p2;
            do {
                p0 = randPoint(110, W - 110, 90, H - 90);
                p2 = randPoint(110, W - 110, 90, H - 90);
            } while (dist(p0, p2) < W * 0.4);
            const mx = (p0.x + p2.x) / 2;
            const my = (p0.y + p2.y) / 2;
            const dx = p2.x - p0.x;
            const dy = p2.y - p0.y;
            const len = Math.hypot(dx, dy) || 1;
            const offset = rand(0.35 * len, 0.65 * len) * (Math.random() < 0.5 ? -1 : 1);
            const p1 = { x: mx - (dy / len) * offset, y: my + (dx / len) * offset };
            guide = { p0: p0, p1: p1, p2: p2 };
        } else if (mode === 'circle') {
            guide = {
                cx: rand(210, W - 210),
                cy: rand(140, H - 140),
                r: rand(45, 90)
            };
        } else if (mode === 'hatch' || mode === 'crosshatch') {
            const half = 120;
            guide = {
                cx: rand(170 + half, W - 170 - half),
                cy: rand(130 + half, H - 130 - half),
                half: half,
                dir: rand(15, 75)
            };
        } else {
            guide = { cells: VALUE_CELLS };
        }
        render();
    }

    function render() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);

        if (mode === 'value') {
            renderValue();
        } else {
            renderGuide();
        }

        ctx.strokeStyle = INK;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (const s of strokes) {
            if (s.points.length < 2) continue;
            ctx.beginPath();
            ctx.moveTo(s.points[0].x, s.points[0].y);
            for (let i = 1; i < s.points.length; i++) {
                ctx.lineTo(s.points[i].x, s.points[i].y);
            }
            ctx.stroke();
        }
    }

    function renderGuide() {
        ctx.save();
        ctx.setLineDash([7, 6]);
        ctx.strokeStyle = GUIDE_DASH;
        ctx.lineWidth = 2;
        if (mode === 'line') {
            ctx.beginPath();
            ctx.moveTo(guide.p1.x, guide.p1.y);
            ctx.lineTo(guide.p2.x, guide.p2.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = GUIDE_SOLID;
            ctx.beginPath();
            ctx.arc(guide.p1.x, guide.p1.y, 5, 0, Math.PI * 2);
            ctx.arc(guide.p2.x, guide.p2.y, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (mode === 'arc') {
            ctx.beginPath();
            ctx.moveTo(guide.p0.x, guide.p0.y);
            for (let t = 1; t <= 30; t++) {
                const p = bezier(t / 30, guide.p0, guide.p1, guide.p2);
                ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = GUIDE_SOLID;
            ctx.beginPath();
            ctx.arc(guide.p0.x, guide.p0.y, 5, 0, Math.PI * 2);
            ctx.arc(guide.p2.x, guide.p2.y, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (mode === 'circle') {
            ctx.beginPath();
            ctx.arc(guide.cx, guide.cy, guide.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = GUIDE_SOLID;
            ctx.beginPath();
            ctx.arc(guide.cx, guide.cy, 3, 0, Math.PI * 2);
            ctx.fill();
        } else if (mode === 'hatch' || mode === 'crosshatch') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(guide.cx - guide.half, guide.cy - guide.half, guide.half * 2, guide.half * 2);
            ctx.strokeStyle = '#c4b5fd';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 5]);
            ctx.strokeRect(guide.cx - guide.half, guide.cy - guide.half, guide.half * 2, guide.half * 2);
            ctx.setLineDash([]);
            if (mode === 'crosshatch') {
                drawHatchLines(guide.cx, guide.cy, guide.half, guide.dir + 90, 34, 'rgba(168, 85, 247, 0.28)', 2);
            }
            drawHatchLines(guide.cx, guide.cy, guide.half, guide.dir, 34, 'rgba(168, 85, 247, 0.5)', 2.5);

            drawExample();

            ctx.save();
            ctx.fillStyle = '#6b7280';
            ctx.font = '600 15px Outfit, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(mode === 'crosshatch'
                ? 'Rellena la zona con una capa de líneas en cada dirección, como el ejemplo'
                : 'Rellena la zona con líneas paralelas, con la inclinación del ejemplo', W / 2, 40);
            ctx.fillStyle = '#9ca3af';
            ctx.font = '500 13px Outfit, Arial, sans-serif';
            ctx.fillText(mode === 'crosshatch'
                ? 'Unas líneas en un sentido y otras cruzadas encima'
                : 'Todas con la misma inclinación y a una distancia pareja', W / 2, 60);
            ctx.fillStyle = '#6b7280';
            ctx.font = '600 13px Outfit, Arial, sans-serif';
            ctx.fillText('Tu zona de práctica', guide.cx, guide.cy - guide.half - 14);
            ctx.restore();
        }
        ctx.restore();
    }

    function drawExample() {
        const ex = { x: 28, y: 160, size: 130 };
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ex.x - 8, ex.y - 8, ex.size + 16, ex.size + 16);
        ctx.beginPath();
        ctx.rect(ex.x - 8, ex.y - 8, ex.size + 16, ex.size + 16);
        ctx.clip();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        drawHatchLines(ex.x + ex.size / 2, ex.y + ex.size / 2, ex.size / 2 + 8, guide.dir, 11, '#334155', 2);
        if (mode === 'crosshatch') {
            drawHatchLines(ex.x + ex.size / 2, ex.y + ex.size / 2, ex.size / 2 + 8, guide.dir + 90, 11, '#334155', 2);
        }
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ex.x, ex.y, ex.size, ex.size);
        ctx.fillStyle = '#6b7280';
        ctx.font = '600 13px Outfit, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Ejemplo: así debe quedar', ex.x + ex.size / 2, ex.y - 20);
        ctx.restore();
    }

    function drawHatchLines(cx, cy, half, dir, spacing, color, width) {
        const rad = dir * Math.PI / 180;
        const ux = Math.cos(rad), uy = Math.sin(rad);
        const vx = -uy, vy = ux;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        for (let off = -half; off <= half; off += spacing) {
            const px = cx + ux * off;
            const py = cy + uy * off;
            ctx.beginPath();
            ctx.moveTo(px + vx * half * 1.7, py + vy * half * 1.7);
            ctx.lineTo(px - vx * half * 1.7, py - vy * half * 1.7);
            ctx.stroke();
        }
        ctx.restore();
    }

    function renderValue() {
        ctx.fillStyle = '#fafaf7';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '600 15px Outfit, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Cada casilla en blanco es un lienzo: rellénala hasta igualar su muestra de arriba', W / 2, 40);

        VALUE_CELLS.forEach((cell, i) => {
            const sx = cell.x + cell.size / 2;

            ctx.fillStyle = 'rgba(0,0,0,' + cell.target + ')';
            ctx.fillRect(sx - 23, 76, 46, 46);
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(sx - 23, 76, 46, 46);
            ctx.fillStyle = '#6b7280';
            ctx.font = '600 14px Outfit, Arial, sans-serif';
            ctx.fillText(Math.round(cell.target * 100) + '%', sx, 76 + 46 + 18);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cell.x, cell.y, cell.size, cell.size);
            if (coverage[i] > 0) {
                ctx.fillStyle = 'rgba(0,0,0,' + Math.min(0.92, coverage[i] * 0.9) + ')';
                ctx.fillRect(cell.x, cell.y, cell.size, cell.size);
            }
            ctx.setLineDash([6, 5]);
            ctx.strokeStyle = '#c4b5fd';
            ctx.lineWidth = 2;
            ctx.strokeRect(cell.x, cell.y, cell.size, cell.size);
            ctx.setLineDash([]);
        });
    }

    function getPos(e) {
        const r = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * (W / r.width),
            y: (e.clientY - r.top) * (H / r.height)
        };
    }

    function valuePaint(x, y) {
        let changed = false;
        VALUE_CELLS.forEach((cell, i) => {
            if (x >= cell.x && x <= cell.x + cell.size && y >= cell.y && y <= cell.y + cell.size) {
                coverage[i] = Math.min(1, coverage[i] + 0.012);
                changed = true;
            }
        });
        if (changed) render();
    }

    function lastStroke() {
        return strokes[strokes.length - 1] || null;
    }

    function distToSegment(p, a, b) {
        const abx = b.x - a.x;
        const aby = b.y - a.y;
        const len2 = abx * abx + aby * aby || 1;
        let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / len2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
    }

    function showFeedback(grade, title, detail) {
        const box = document.getElementById('practice-feedback');
        if (!box) return;
        const palette = {
            S: 'bg-emerald-50 border-emerald-300 text-emerald-900',
            A: 'bg-blue-50 border-blue-300 text-blue-900',
            B: 'bg-amber-50 border-amber-300 text-amber-900',
            C: 'bg-rose-50 border-rose-300 text-rose-900'
        };
        const label = { S: 'Excelente', A: 'Muy bien', B: 'Regular', C: 'A practicar' };
        box.innerHTML =
            '<div class="rounded-xl border p-4 ' + palette[grade] + '">' +
            '<p class="font-bold">' + label[grade] + ' (' + grade + ')</p>' +
            '<p class="text-sm mt-1">' + title + '</p>' +
            (detail ? '<p class="text-sm mt-1 opacity-80">' + detail + '</p>' : '') +
            '</div>';
    }

    function verify() {
        const stats = loadStats();
        stats.attempts = (stats.attempts || 0) + 1;
        saveStats(stats);
        updateAttempts();

        if (mode === 'value') {
            verifyValue();
            return;
        }
        if (mode === 'hatch' || mode === 'crosshatch') {
            verifyHatch();
            return;
        }
        const stroke = lastStroke();
        if (!stroke || stroke.points.length < 4) {
            showFeedback('C', 'Aún no has dibujado nada.',
                'Haz tu trazo sobre la guía y pulsa "Comprobar" de nuevo.');
            return;
        }
        if (mode === 'line') verifyLine(stroke);
        else if (mode === 'arc') verifyArc(stroke);
        else verifyCircle(stroke);
    }

    function strokeAngle(stroke) {
        const a = stroke.points[0];
        const b = stroke.points[stroke.points.length - 1];
        if (a.x === b.x && a.y === b.y) return 0;
        const deg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        return ((deg % 180) + 180) % 180;
    }

    function angleDiff(a, b) {
        const d = Math.abs(a - b) % 180;
        return d > 90 ? 180 - d : d;
    }

    function verifyHatch() {
        const usable = strokes.filter(function (s) {
            return s.points.length >= 4;
        });
        if (usable.length < 2) {
            showFeedback('C', 'Necesitas al menos dos líneas para evaluar la trama.',
                'Dibuja varias pasadas paralelas y pulsa "Comprobar" de nuevo.');
            return;
        }
        const dirs = mode === 'crosshatch' ? [guide.dir, guide.dir + 90] : [guide.dir];
        const devs = usable.map(function (s) {
            const angle = strokeAngle(s);
            return Math.min.apply(null, dirs.map(function (d) { return angleDiff(angle, d); }));
        });
        const mean = devs.reduce(function (a, b) { return a + b; }, 0) / devs.length;
        const grade = mean < 6 ? 'S' : mean < 12 ? 'A' : mean < 22 ? 'B' : 'C';
        if (mode === 'crosshatch') {
            const nearA = devs.filter(function (d) { return d < 30; }).length;
            const inA = usable.filter(function (s) {
                return angleDiff(strokeAngle(s), guide.dir) < 30;
            }).length;
            const inB = usable.filter(function (s) {
                return angleDiff(strokeAngle(s), guide.dir + 90) < 30;
            }).length;
            const hasBoth = inA > 0 && inB > 0;
            const detail = hasBoth
                ? 'Promedio de desviación: ' + mean.toFixed(1) + '°. ' + inA + ' líneas en la primera dirección y ' + inB + ' en la cruzada.'
                : 'Recuerda cruzar en la dirección perpendicular: casi todas tus líneas van en la misma dirección (' + nearA + ' de ' + usable.length + ').';
            showFeedback(hasBoth ? grade : 'C', 'Desviación media de ' + mean.toFixed(1) + '° respecto a las dos direcciones guía.', detail);
            return;
        }
        showFeedback(grade, 'Desviación media de ' + mean.toFixed(1) + '° respecto a la dirección guía.',
            'Las líneas paralelas deben mantener la misma inclinación. Menos de 12° es muy parejo.');
    }

    function verifyLine(stroke) {
        const len = dist(guide.p1, guide.p2);
        let maxD = 0;
        for (const p of stroke.points) {
            const d = distToSegment(p, guide.p1, guide.p2);
            if (d > maxD) maxD = d;
        }
        const pct = (maxD / len) * 100;
        const grade = pct < 3 ? 'S' : pct < 6 ? 'A' : pct < 12 ? 'B' : 'C';
        showFeedback(grade, 'Desviación máxima del ' + pct.toFixed(1) + '% de la longitud de la guía.',
            'Menos del 6% es un buen pulso. Intenta un solo trazo decidido.');
    }

    function verifyArc(stroke) {
        const samples = [];
        for (let t = 0; t <= 40; t++) {
            samples.push(bezier(t / 40, guide.p0, guide.p1, guide.p2));
        }
        let maxD = 0;
        for (const p of stroke.points) {
            let best = Infinity;
            for (const s of samples) {
                const d = Math.hypot(p.x - s.x, p.y - s.y);
                if (d < best) best = d;
            }
            if (best > maxD) maxD = best;
        }
        const grade = maxD < 5 ? 'S' : maxD < 9 ? 'A' : maxD < 16 ? 'B' : 'C';
        showFeedback(grade, 'Tu curva se desvía hasta ' + maxD.toFixed(1) + ' px de la guía.',
            'Menos de 9 px indica un arco muy limpio.');
    }

    function verifyCircle(stroke) {
        const dists = stroke.points.map(function (p) {
            return Math.hypot(p.x - guide.cx, p.y - guide.cy);
        });
        const mean = dists.reduce(function (a, b) { return a + b; }, 0) / dists.length;
        const variance = dists.reduce(function (a, d) { return a + (d - mean) * (d - mean); }, 0) / dists.length;
        const ratio = (Math.sqrt(variance) / mean) * 100;
        const sizeErr = Math.abs(mean - guide.r) / guide.r;
        const grade = ratio < 12 ? 'S' : ratio < 20 ? 'A' : ratio < 32 ? 'B' : 'C';
        let extra = '';
        if (sizeErr > 0.3) {
            extra = ' Además, revisa el tamaño: tu círculo es ' +
                (mean < guide.r ? 'más pequeño' : 'más grande') + ' que la guía.';
        }
        showFeedback(grade, 'Consistencia del trazo: ' + ratio.toFixed(0) + '% de variación en el radio.', extra);
    }

    function verifyValue() {
        let perfect = 0;
        let close = 0;
        const parts = [];
        VALUE_CELLS.forEach(function (cell, i) {
            const diff = Math.abs(coverage[i] - cell.target);
            if (diff < 0.15) {
                perfect++;
                parts.push('casilla ' + (i + 1) + ': ' + Math.round(cell.target * 100) + '% ✓');
            } else if (diff < 0.3) {
                close++;
                parts.push('casilla ' + (i + 1) + ': ' + Math.round(cell.target * 100) + '% ≈');
            } else {
                parts.push('casilla ' + (i + 1) + ': ' + Math.round(cell.target * 100) + '% ✗');
            }
        });
        const grade = perfect === 5 ? 'S' : perfect >= 4 ? 'A' : perfect >= 3 || close >= 4 ? 'B' : 'C';
        const msg = perfect + ' de 5 casillas en su tono exacto' +
            (close > 0 ? ' (y ' + close + ' muy cerca)' : '') + '.';
        showFeedback(grade, msg, 'Detalle: ' + parts.join(' · '));
    }

    canvas.addEventListener('pointerdown', function (e) {
        drawing = true;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
        const p = getPos(e);
        if (mode === 'value') {
            valuePaint(p.x, p.y);
        } else {
            currentStroke = { points: [p] };
            strokes.push(currentStroke);
        }
    });

    canvas.addEventListener('pointermove', function (e) {
        if (!drawing) return;
        const p = getPos(e);
        if (mode === 'value') {
            valuePaint(p.x, p.y);
        } else {
            const last = currentStroke.points[currentStroke.points.length - 1];
            if (Math.hypot(p.x - last.x, p.y - last.y) > 2) {
                currentStroke.points.push(p);
                render();
            }
        }
    });

    function stopDraw() { drawing = false; }
    canvas.addEventListener('pointerup', stopDraw);
    canvas.addEventListener('pointercancel', stopDraw);

    document.querySelectorAll('[data-mode]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            mode = btn.dataset.mode;
            document.querySelectorAll('[data-mode]').forEach(function (b) {
                b.classList.toggle('active', b === btn);
            });
            const tip = document.getElementById('practice-tip');
            if (tip) tip.textContent = TIPS[mode];
            newGuide();
        });
    });

    const newBtn = document.getElementById('practice-new');
    if (newBtn) newBtn.addEventListener('click', newGuide);

    const clearBtn = document.getElementById('practice-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () {
        strokes = [];
        coverage = [0, 0, 0, 0, 0];
        render();
    });

    const verifyBtn = document.getElementById('practice-verify');
    if (verifyBtn) verifyBtn.addEventListener('click', verify);

    document.querySelector('[data-mode="line"]').classList.add('active');
    updateAttempts();
    newGuide();
})();
