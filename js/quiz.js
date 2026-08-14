(function () {
    const container = document.getElementById('quiz-container');
    const resultBox = document.getElementById('quiz-result');
    if (!container || !resultBox) return;

    const STORE_KEY = 'dominaElLapiz_quiz';

    const QUESTIONS = {
        materiales: [
            {
                q: '¿Qué lápiz usarías para las sombras más profundas?',
                options: [
                    { text: '2H (duro y claro)', correct: false },
                    { text: '6B (blando y oscuro)', correct: true },
                    { text: 'HB (de dureza media)', correct: false }
                ],
                explanation: 'El 6B es muy blando y deja trazos muy oscuros, ideal para sombras profundas. El 2H se usa para líneas claras y el HB para el trazo general.'
            },
            {
                q: '¿Qué herramienta permite aclarar o corregir un tono sin dañar el papel?',
                options: [
                    { text: 'El difumino', correct: false },
                    { text: 'La goma moldeable', correct: true },
                    { text: 'El sacapuntas', correct: false }
                ],
                explanation: 'La goma moldeable se presiona sobre el grafito y lo levanta de forma controlada, sin borrar el papel como una goma dura.'
            },
            {
                q: 'Para suavizar y difuminar el grafito sin usar el dedo, ¿qué usas?',
                options: [
                    { text: 'La goma dura', correct: false },
                    { text: 'El difumino (esfumino)', correct: true },
                    { text: 'Una regla', correct: false }
                ],
                explanation: 'El difumino integra el grafito en el papel creando degradados suaves y sin transferir grasa (como sí hace el dedo).'
            }
        ],
        sombreado: [
            {
                q: '¿Qué es la técnica de trama (hatching)?',
                options: [
                    { text: 'Líneas paralelas en una sola dirección', correct: true },
                    { text: 'Manchas difusas con el dedo', correct: false },
                    { text: 'Puntos aleatorios sin dirección', correct: false }
                ],
                explanation: 'La trama usa líneas paralelas. Cruzarlas con otra capa (cross-hatching) permite oscurecer el tono.'
            },
            {
                q: '¿Qué técnica da acabados más suaves y realistas?',
                options: [
                    { text: 'La trama', correct: false },
                    { text: 'El esfumado (difuminado)', correct: true },
                    { text: 'El puntillismo', correct: false }
                ],
                explanation: 'El esfumado difumina los bordes entre tonos y produce transiciones suaves, muy usado en retrato realista.'
            },
            {
                q: 'Para oscurecer un área con trama, ¿qué debes hacer?',
                options: [
                    { text: 'Apretar el lápiz muy fuerte', correct: false },
                    { text: 'Añadir más capas de líneas juntas', correct: true },
                    { text: 'Borrar las líneas anteriores', correct: false }
                ],
                explanation: 'Apilar capas de líneas cercanas acumula grafito y oscurece de forma gradual y controlable.'
            }
        ],
        color: [
            {
                q: '¿Cuáles son los colores primarios sustractivos (en pintura)?',
                options: [
                    { text: 'Rojo, verde y azul', correct: false },
                    { text: 'Cian, magenta y amarillo', correct: true },
                    { text: 'Naranja, morado y verde', correct: false }
                ],
                explanation: 'En pigmentos los primarios son cian, magenta y amarillo. Rojo, verde y azul son los primarios de la luz (pantallas).'
            },
            {
                q: 'Para aclarar un color en pintura, lo más común es mezclarlo con…',
                options: [
                    { text: 'Negro', correct: false },
                    { text: 'Blanco (o un análogo claro)', correct: true },
                    { text: 'Gris neutro', correct: false }
                ],
                explanation: 'Añadir blanco aclara el color. Un tono análogo claro lo aclara manteniendo más vivacidad; el negro solo lo ensucia.'
            },
            {
                q: 'Para sombrear un objeto rojo de forma armónica, conviene usar…',
                options: [
                    { text: 'Verde (su complementario)', correct: true },
                    { text: 'Amarillo', correct: false },
                    { text: 'Azul claro', correct: false }
                ],
                explanation: 'El complementario (verde) oscurece sin ensuciar tanto el color original y produce sombras más vivas.'
            }
        ],
        anatomia: [
            {
                q: 'Según la regla de las 8 cabezas, ¿a qué cabeza está la entrepierna?',
                options: [
                    { text: 'A la 2ª', correct: false },
                    { text: 'A la 4ª', correct: true },
                    { text: 'A la 6ª', correct: false }
                ],
                explanation: 'La mitad del cuerpo cae en la cuarta cabeza: ahí se encuentra la entrepierna.'
            },
            {
                q: '¿Por qué dibujar un retrato boca abajo mejora el parecido?',
                options: [
                    { text: 'Porque relaja el pulso', correct: false },
                    { text: 'El cerebro deja de ver "símbolos" y copia las formas reales', correct: true },
                    { text: 'Porque se ven mejor los colores', correct: false }
                ],
                explanation: 'Boca abajo, el cerebro no reconoce un "ojo" o una "boca" y copia las luces, líneas y sombras tal como son.'
            },
            {
                q: 'En un retrato iluminado desde arriba, el labio superior suele verse…',
                options: [
                    { text: 'Más claro', correct: false },
                    { text: 'Más oscuro (en sombra)', correct: true },
                    { text: 'Del mismo tono que el inferior', correct: false }
                ],
                explanation: 'La luz llega desde arriba y el labio superior se inclina hacia abajo, por lo que queda en sombra.'
            }
        ],
        perspectiva: [
            {
                q: '¿A la altura de qué se encuentra la línea de horizonte?',
                options: [
                    { text: 'De tus ojos', correct: true },
                    { text: 'De tu barbilla', correct: false },
                    { text: 'Del suelo', correct: false }
                ],
                explanation: 'La línea de horizonte coincide siempre con la altura de tus ojos en la escena.'
            },
            {
                q: '¿Qué perspectiva usarías para un pasillo o unas vías de tren?',
                options: [
                    { text: '1 punto de fuga', correct: true },
                    { text: '2 puntos de fuga', correct: false },
                    { text: '3 puntos de fuga', correct: false }
                ],
                explanation: 'Un solo punto de fuga al frente es ideal para pasillos, vías y carreteras.'
            },
            {
                q: 'En perspectiva de 2 puntos, las líneas verticales…',
                options: [
                    { text: 'Se dirigen a uno de los puntos de fuga', correct: false },
                    { text: 'Se mantienen rectas', correct: true },
                    { text: 'Se curvan hacia el centro', correct: false }
                ],
                explanation: 'En 2 puntos las verticales permanecen perpendiculares al horizonte; solo las líneas horizontales apuntan a los puntos de fuga.'
            }
        ]
    };

    const TITLES = {
        materiales: 'Materiales',
        sombreado: 'Sombreado',
        color: 'Color',
        anatomia: 'Anatomía',
        perspectiva: 'Perspectiva'
    };

    function loadStats() {
        try {
            return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveStats(stats) {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(stats));
        } catch (e) {
            /* almacenamiento no disponible */
        }
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        }
        return a;
    }

    function buildQuiz(moduleId) {
        const questions = QUESTIONS[moduleId].map(function (item) {
            return {
                q: item.q,
                explanation: item.explanation,
                options: shuffle(item.options)
            };
        });

        let html = '<form id="quiz-form" class="space-y-8">';
        questions.forEach(function (item, i) {
            html += '<fieldset class="pb-6" data-idx="' + i + '">';
            html += '<legend class="font-bold text-art-900 mb-4">' + (i + 1) + '. ' + item.q + '</legend>';
            html += '<div class="space-y-2.5">';
            item.options.forEach(function (op, oi) {
                html +=
                    '<label class="quiz-option flex items-start gap-3 bg-art-50 border border-art-200 rounded-xl px-4 py-3 cursor-pointer hover:border-art-accent transition-colors">' +
                    '<input type="radio" name="q' + i + '" value="' + oi + '" class="accent-blue-600 w-4 h-4 mt-0.5 shrink-0">' +
                    '<span class="text-art-700 text-sm">' + op.text + '</span>' +
                    '</label>';
            });
            html += '</div>';
            html += '<p class="q-feedback text-sm mt-3 hidden"></p>';
            html += '</fieldset>';
        });
        html +=
            '<button type="submit" class="w-full sm:w-auto px-8 py-3 bg-art-950 text-white rounded-full font-bold hover:bg-art-800 transition-colors inline-flex items-center gap-2">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
            'Ver resultado</button>';
        html += '</form>';

        container.innerHTML = html;

        const form = document.getElementById('quiz-form');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            gradeQuiz(questions);
        });

        return questions;
    }

    function gradeQuiz(questions) {
        let correctCount = 0;
        questions.forEach(function (item, i) {
            const sel = formChecked(i);
            const fb = document.querySelector('[data-idx="' + i + '"] .q-feedback');
            const inputs = document.querySelectorAll('[data-idx="' + i + '"] input');
            inputs.forEach(function (inp) { inp.disabled = true; });

            const chosen = sel !== null ? item.options[sel] : null;
            if (chosen && chosen.correct) {
                correctCount++;
                fb.innerHTML = '<b class="text-emerald-600">✓ Correcto.</b> ' + item.explanation;
            } else {
                fb.innerHTML = '<b class="text-rose-600">✗ Incorrecto.</b> ' + item.explanation;
                inputs.forEach(function (inp, oi) {
                    const opt = item.options[oi];
                    if (opt.correct) {
                        inp.closest('.quiz-option').classList.add('border-emerald-400', 'bg-emerald-50');
                    }
                    if (sel === oi) {
                        inp.closest('.quiz-option').classList.add('border-rose-300', 'bg-rose-50');
                    }
                });
            }
            fb.classList.remove('hidden');
        });

        const pct = Math.round((correctCount / questions.length) * 100);
        showResult(pct, correctCount, questions.length);
    }

    function formChecked(i) {
        const el = document.querySelector('input[name="q' + i + '"]:checked');
        return el ? parseInt(el.value, 10) : null;
    }

    function showResult(pct, correct, total) {
        const moduleId = currentModule;
        const stats = loadStats();
        const prev = stats[moduleId] || { best: 0, attempts: 0 };
        stats[moduleId] = {
            best: Math.max(prev.best, pct),
            attempts: (prev.attempts || 0) + 1
        };
        saveStats(stats);

        document.getElementById('quiz-pct').textContent = pct + '%';
        document.getElementById('quiz-msg').textContent =
            pct >= 90 ? '¡Excelente! Dominas ' + TITLES[moduleId] :
            pct >= 66 ? '¡Muy bien! Solo te falta un repaso rápido.' :
            pct >= 33 ? 'Buen comienzo: repasa el módulo y vuelve a intentarlo.' :
            'Vale la pena repasar este módulo con calma.';
        document.getElementById('quiz-stats').textContent =
            correct + ' de ' + total + ' correctas · Mejor puntuación: ' +
            stats[moduleId].best + '% · Intentos: ' + stats[moduleId].attempts;

        resultBox.classList.remove('hidden');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    let currentModule = null;

    function startQuiz(moduleId) {
        currentModule = moduleId;
        resultBox.classList.add('hidden');
        buildQuiz(moduleId);
    }

    document.querySelectorAll('.quiz-tab').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.quiz-tab').forEach(function (b) {
                b.classList.toggle('active-tab', b === btn);
            });
            startQuiz(btn.dataset.quiz);
        });
    });

    const retryBtn = document.getElementById('quiz-retry');
    if (retryBtn) {
        retryBtn.addEventListener('click', function () {
            if (currentModule) startQuiz(currentModule);
        });
    }
})();
