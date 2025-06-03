document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formNumerosAleatorios');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const maximo = parseInt(document.getElementById('maximo').value, 10);
        const repeticiones = parseInt(document.getElementById('repeticiones').value, 10);
        const pelotasASacar = parseInt(document.getElementById('pelotas').value, 10);
        const operacion = document.getElementById('operacion').value;
        const comparador = document.getElementById('comparador').value;
        const valorComparar = parseFloat(document.getElementById('valorComparar').value);

        form.style.display = 'none';
        const minijuegoDiv = document.getElementById('minijuego');
        let resultados = [];

        function generarNumerosUnicos(n) {
            // Genera un arreglo con los números del 1 al n y los desordena (Fisher-Yates)
            let arr = [];
            for (let i = 1; i <= n; i++) arr.push(i);
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function getAllCombinations(arr, k) {
            // Devuelve todas las combinaciones posibles de k elementos de arr
            let results = [];
            function combine(start, combo) {
                if (combo.length === k) {
                    results.push(combo.slice());
                    return;
                }
                for (let i = start; i < arr.length; i++) {
                    combo.push(arr[i]);
                    combine(i + 1, combo);
                    combo.pop();
                }
            }
            combine(0, []);
            return results;
        }

        function operar(arr, op) {
            if (op === "suma") return arr.reduce((a, b) => a + b, 0);
            if (op === "diferencia") return arr.reduce((a, b) => a - b);
            if (op === "multiplicacion") return arr.reduce((a, b) => a * b, 1);
            if (op === "division") return arr.reduce((a, b) => a / b);
            return null;
        }

        function compararResultado(valor, comp, ref) {
            if (comp === "igual") return valor === ref;
            if (comp === "mayor") return valor > ref;
            if (comp === "menor") return valor < ref;
            if (comp === "mayor_igual") return valor >= ref;
            if (comp === "menor_igual") return valor <= ref;
            return false;
        }

        function mostrarResultadosFinales() {
            let html = "<h2>Resultados</h2><ol>";
            resultados.forEach((res, idx) => {
                html += `<li>Ronda ${idx + 1}: [${res.seleccion.join(", ")}] → ${res.valorCalculado} (${res.cumple ? "Cumple" : "No cumple"})</li>`;
            });
            html += "</ol>";

            // Calcular frecuencias y probabilidades empíricas
            const freq = {};
            resultados.forEach(res => {
                const val = res.valorCalculado;
                freq[val] = (freq[val] || 0) + 1;
            });
            const total = resultados.length;

            // Calcular todas las combinaciones posibles y sus probabilidades teóricas
            const maximo = parseInt(document.getElementById('maximo').value, 10);
            const pelotasASacar = parseInt(document.getElementById('pelotas').value, 10);
            const operacion = document.getElementById('operacion').value;

            const universo = [];
            for (let i = 1; i <= maximo; i++) universo.push(i);
            const combinaciones = getAllCombinations(universo, pelotasASacar);

            // Mapear combinaciones a resultados
            const resultadoTeorico = {};
            combinaciones.forEach(comb => {
                let val = operar(comb, operacion);
                resultadoTeorico[val] = (resultadoTeorico[val] || 0) + 1;
            });
            const totalTeorico = combinaciones.length;
            const labels = Object.keys(resultadoTeorico).sort((a, b) => a - b);
            const dataTeorica = labels.map(val => resultadoTeorico[val] / totalTeorico);
            const dataEmpirica = labels.map(val => (freq[val] || 0) / total);
            const dataTeoricaFraccion = labels.map(val => `${resultadoTeorico[val]}/${totalTeorico}`);

            html += `
                <h3>Probabilidad teórica y experimental de cada resultado</h3>
                <div style="max-width:500px;margin:auto;">
                    <canvas id="probChart"></canvas>
                </div>
                <p style="font-size:14px;color:#555;">Azul: Probabilidad teórica, Naranja: Experimental</p>
            `;

            html += "<button id='reiniciarJuego'>Reiniciar</button>";
            minijuegoDiv.innerHTML = html;
            document.getElementById('reiniciarJuego').onclick = function() {
                location.reload();
            };

            // Crear el gráfico de barras
            setTimeout(() => {
                const ctx = document.getElementById('probChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Teórica',
                                data: dataTeorica,
                                backgroundColor: '#2196F3'
                            },
                            {
                                label: 'Experimental',
                                data: dataEmpirica,
                                backgroundColor: '#ff9800'
                            }
                        ]
                    },
                    options: {
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        if (context.dataset.label === 'Teórica') {
                                            const idx = context.dataIndex;
                                            return `Teórica: ${dataTeoricaFraccion[idx]} (${dataTeorica[idx].toFixed(3)})`;
                                        } else {
                                            return `Experimental: ${(dataEmpirica[context.dataIndex]).toFixed(3)}`;
                                        }
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 1,
                                title: { display: true, text: 'Probabilidad' }
                            },
                            x: {
                                title: { display: true, text: 'Resultado' },
                                ticks: {
                                    callback: function(value, index) {
                                        // Muestra la fracción debajo del valor
                                        return labels[index] + '\n' + dataTeoricaFraccion[index];
                                    }
                                }
                            }
                        }
                    }
                });
            }, 100);
        }

        function mostrarJuego(rep) {
            if (rep > repeticiones) {
                mostrarResultadosFinales();
                return;
            }
            // Generar números únicos para las pelotas
            const valoresPelotas = generarNumerosUnicos(maximo);
            let seleccionadas = [];
            let pelotasHtml = '';
            for (let i = 0; i < maximo; i++) {
                // Animación de rebote con delay incremental
                pelotasHtml += `<button class="pelota" data-idx="${i}" style="animation: bounce 0.7s ${i*0.07}s cubic-bezier(.68,-0.55,.27,1.55);">?</button>`;
            }
            minijuegoDiv.innerHTML = `<h3>Repetición ${rep} de ${repeticiones}</h3>
                <div id="pelotasContainer">${pelotasHtml}</div>
                <div id="seleccionInfo" style="margin:10px 0;">Selecciona ${pelotasASacar} pelotas</div>
                <button id="siguienteRonda" style="display:none;">Siguiente</button>`;

            const pelotasBtns = document.querySelectorAll('.pelota');
            pelotasBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const idx = parseInt(this.getAttribute('data-idx'), 10);
                    if (seleccionadas.length < pelotasASacar && !seleccionadas.includes(idx)) {
                        this.textContent = valoresPelotas[idx];
                        this.classList.add('seleccionada');
                        this.disabled = true;
                        // Efecto de "pop" al seleccionar
                        this.style.transform = "scale(1.18)";
                        setTimeout(() => { this.style.transform = "scale(1.08)"; }, 120);
                        seleccionadas.push(idx);
                        if (seleccionadas.length === pelotasASacar) {
                            // Calcular resultado de la ronda
                            const valoresSeleccionados = seleccionadas.map(i => valoresPelotas[i]);
                            const valorCalculado = operar(valoresSeleccionados, operacion);
                            const cumple = compararResultado(valorCalculado, comparador, valorComparar);
                            resultados.push({
                                seleccion: valoresSeleccionados,
                                valorCalculado,
                                cumple
                            });
                            document.getElementById('seleccionInfo').textContent = `¡Listo! Has seleccionado ${pelotasASacar} pelotas.`;
                            document.getElementById('siguienteRonda').style.display = 'inline-block';
                            // Deshabilitar todas las pelotas restantes
                            pelotasBtns.forEach(b => b.disabled = true);
                        } else {
                            document.getElementById('seleccionInfo').textContent = `Selecciona ${pelotasASacar - seleccionadas.length} pelotas más`;
                        }
                    }
                });
            });
            document.getElementById('siguienteRonda').onclick = function() {
                mostrarJuego(rep + 1);
            };
        }
        mostrarJuego(1);
        minijuegoDiv.style.display = 'block';
    });
});

// Animación de rebote para las pelotas
const style = document.createElement('style');
style.innerHTML = `
@keyframes bounce {
    0%   { transform: translateY(-60px) scale(0.7);}
    60%  { transform: translateY(10px) scale(1.1);}
    80%  { transform: translateY(-8px) scale(0.95);}
    100% { transform: translateY(0) scale(1);}
}
`;
document.head.appendChild(style);
