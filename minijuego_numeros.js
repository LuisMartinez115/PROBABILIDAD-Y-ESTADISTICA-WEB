const form = document.getElementById('formDado');
const resultadosDiv = document.getElementById('resultados');
const graficaContainer = document.getElementById('grafica-container');
const animacionDiv = document.getElementById('animacionDado');
let chartInstance = null;

form.caras.addEventListener('input', function() {
    const caras = parseInt(form.caras.value, 10);
    form.objetivo.max = caras || 1;
    if (parseInt(form.objetivo.value, 10) > caras) {
        form.objetivo.value = caras;
    }
});

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const caras = parseInt(form.caras.value, 10);
    const repeticiones = parseInt(form.repeticiones.value, 10);
    const objetivo = parseInt(form.objetivo.value, 10);

    if (objetivo < 1 || objetivo > caras) {
        alert('El número objetivo debe estar entre 1 y el número de caras.');
        return;
    }

    resultadosDiv.innerHTML = '';
    graficaContainer.style.display = 'none';
    animacionDiv.innerHTML = '';

    // Animación de lanzamientos
    let resultados = [];
    let conteo = Array(caras).fill(0);
    let aciertos = 0;

    for (let i = 0; i < repeticiones; i++) {
        animacionDiv.innerHTML = `<div class="lanzando-text">Lanzamiento ${i+1} de ${repeticiones}</div>`;
        // Simula el dado girando antes de mostrar el resultado
        let valorAnimado = Math.floor(Math.random() * caras) + 1;
        animacionDiv.innerHTML += `<div class="dado-animacion"><div class="cara-dado">${valorAnimado}</div></div>`;
        await new Promise(res => setTimeout(res, Math.max(200, 600 / Math.sqrt(repeticiones))));
        animacionDiv.innerHTML = '';
        const lanzamiento = Math.floor(Math.random() * caras) + 1;
        resultados.push(lanzamiento);
        conteo[lanzamiento - 1]++;
        if (lanzamiento === objetivo) aciertos++;
    }

    // Mostrar resultados
    resultadosDiv.innerHTML = `
        <p>De ${repeticiones} lanzamientos, el número <b>${objetivo}</b> salió <b>${aciertos}</b> veces.</p>
        <ul>
            ${conteo.map((c, i) => `<li>Cara ${i+1}: ${c} veces</li>`).join('')}
        </ul>
        <button class="reiniciar-btn" onclick="location.reload()">Reiniciar</button>
    `;

    // Mostrar gráfica
    graficaContainer.style.display = 'block';
    const labels = Array.from({length: caras}, (_, i) => `Cara ${i+1}`);
    const dataExperimental = conteo.map(c => c / repeticiones);
    const dataTeorica = Array(caras).fill(1 / caras);

    if (chartInstance) chartInstance.destroy();
    const ctx = document.getElementById('grafica').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Probabilidad Experimental',
                    data: dataExperimental,
                    backgroundColor: '#2196F3'
                },
                {
                    label: 'Probabilidad Teórica',
                    data: dataTeorica,
                    backgroundColor: '#ff9800'
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: { display: true, text: 'Probabilidad' }
                }
            }
        }
    });
});

// Mostrar el minijuego de jarrón si corresponde
function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
}

// Oculta el minijuego de dados y muestra solo el de la distribución seleccionada
const dist = getQueryParam('dist');
if (dist === 'binomial') {
    document.querySelector('.container').innerHTML = document.querySelector('#minijuego-binomial').outerHTML;
    document.getElementById('minijuego-binomial').style.display = 'block';

    document.getElementById('formBinomial').addEventListener('submit', function(e) {
        e.preventDefault();

        const n = 12; // Número de lanzamientos
        const k = 5;  // Número de caras buscadas
        const p = 0.5; // Probabilidad de obtener cara
        const reps = parseInt(document.getElementById('reps_binomial').value, 10);

        if (isNaN(reps) || reps <= 0) {
            alert('Por favor, ingresa un número válido de repeticiones.');
            return;
        }

        let conteo = Array(n + 1).fill(0);
        for (let i = 0; i < reps; i++) {
            let caras = 0;
            for (let j = 0; j < n; j++) {
                if (Math.random() < p) caras++;
            }
            conteo[caras]++;
        }

        // Probabilidad experimental de obtener k caras
        const probExp = conteo[k] / reps;

        // Probabilidad teórica binomial
        function binomial(n, k, p) {
            function factorial(x) {
                let f = 1;
                for (let i = 2; i <= x; i++) f *= i;
                return f;
            }
            return (factorial(n) / (factorial(k) * factorial(n - k))) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        }
        const probTeo = binomial(n, k, p);

        // Mostrar resultados
        document.getElementById('resultadosBinomial').innerHTML = `
            <p>Probabilidad experimental de obtener exactamente <b>${k}</b> caras en <b>${n}</b> lanzamientos: <b>${probExp.toFixed(4)}</b></p>
            <p>Probabilidad teórica: <b>${probTeo.toFixed(4)}</b></p>
            <ul>
                ${conteo.map((c, i) => `<li>${i} caras: ${c} veces</li>`).join('')}
            </ul>
            <button class="reiniciar-btn" onclick="location.reload()">Reiniciar</button>
        `;

        // Mostrar gráfica
        document.getElementById('graficaBinomial-container').style.display = 'block';
        const labels = Array.from({ length: n + 1 }, (_, i) => `${i} caras`);
        const dataExperimental = conteo.map(c => c / reps);
        const dataTeorica = labels.map((_, i) => binomial(n, i, p));

        if (window.chartBinomial) window.chartBinomial.destroy();
        const ctx = document.getElementById('graficaBinomial').getContext('2d');
        window.chartBinomial = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Probabilidad Experimental',
                        data: dataExperimental,
                        backgroundColor: '#2196F3'
                    },
                    {
                        label: 'Probabilidad Teórica',
                        data: dataTeorica,
                        backgroundColor: '#ff9800'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    tooltip: { enabled: true }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        title: { display: true, text: 'Probabilidad' }
                    }
                }
            }
        });
    });
} else if (dist === 'hipergeometrica') {
    document.querySelector('.container').innerHTML = document.querySelector('#minijuego-hipergeometrica').outerHTML;
    document.getElementById('minijuego-hipergeometrica').style.display = 'block';

    document.getElementById('formJarron').addEventListener('submit', function(e) {
        e.preventDefault();
        const n = parseInt(document.getElementById('n_pelotas').value, 10);
        const m = parseInt(document.getElementById('m_sacar').value, 10);
        const reps = parseInt(document.getElementById('reps_jarron').value, 10);
        const operacion = document.getElementById('operacion_jarron').value;
        const comparador = document.getElementById('comparador_jarron').value;
        const valorComparar = parseFloat(document.getElementById('valorComparar_jarron').value);

        if (m > n) {
            alert('No puedes sacar más pelotas de las que hay en el jarrón.');
            return;
        }
        let resultados = {};
        let cumpleCondicion = 0;
        for (let i = 0; i < reps; i++) {
            let pelotas = Array.from({length: n}, (_, i) => i + 1);
            for (let j = pelotas.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [pelotas[j], pelotas[k]] = [pelotas[k], pelotas[j]];
            }
            const seleccionadas = pelotas.slice(0, m);
            let valor;
            if (operacion === "suma") valor = seleccionadas.reduce((a, b) => a + b, 0);
            else if (operacion === "diferencia") valor = seleccionadas.reduce((a, b) => a - b);
            else if (operacion === "multiplicacion") valor = seleccionadas.reduce((a, b) => a * b, 1);
            else if (operacion === "division") valor = seleccionadas.reduce((a, b) => a / b);
            resultados[valor] = (resultados[valor] || 0) + 1;
            // Evaluar condición
            let cumple = false;
            if (comparador === "igual") cumple = valor === valorComparar;
            else if (comparador === "mayor") cumple = valor > valorComparar;
            else if (comparador === "menor") cumple = valor < valorComparar;
            else if (comparador === "mayor_igual") cumple = valor >= valorComparar;
            else if (comparador === "menor_igual") cumple = valor <= valorComparar;
            if (cumple) cumpleCondicion++;
        }
        // Probabilidad teórica (todas las combinaciones posibles)
        function getAllCombinations(arr, k) {
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
        const universo = Array.from({length: n}, (_, i) => i + 1);
        const combinaciones = getAllCombinations(universo, m);
        const resultadosTeoricos = {};
        let totalTeorico = combinaciones.length;
        let cumpleCondicionTeorico = 0;
        combinaciones.forEach(comb => {
            let valor;
            if (operacion === "suma") valor = comb.reduce((a, b) => a + b, 0);
            else if (operacion === "diferencia") valor = comb.reduce((a, b) => a - b);
            else if (operacion === "multiplicacion") valor = comb.reduce((a, b) => a * b, 1);
            else if (operacion === "division") valor = comb.reduce((a, b) => a / b);
            resultadosTeoricos[valor] = (resultadosTeoricos[valor] || 0) + 1;
            // Evaluar condición
            let cumple = false;
            if (comparador === "igual") cumple = valor === valorComparar;
            else if (comparador === "mayor") cumple = valor > valorComparar;
            else if (comparador === "menor") cumple = valor < valorComparar;
            else if (comparador === "mayor_igual") cumple = valor >= valorComparar;
            else if (comparador === "menor_igual") cumple = valor <= valorComparar;
            if (cumple) cumpleCondicionTeorico++;
        });

        // Unir todos los valores posibles
        const todosValores = Array.from(
            new Set([...Object.keys(resultadosTeoricos), ...Object.keys(resultados)])
        ).map(Number).sort((a, b) => a - b);

        // Mostrar resultados
        const resultadosDiv = document.getElementById('resultadosJarron');
        resultadosDiv.innerHTML = `<p>Simulaciones: <b>${reps}</b>. Probabilidad experimental de cumplir la condición: <b>${(cumpleCondicion/reps).toFixed(3)}</b><br>
            Probabilidad teórica de cumplir la condición: <b>${(cumpleCondicionTeorico/totalTeorico).toFixed(3)}</b></p>
            <ul>${todosValores.map(v => 
                `<li>Valor ${v}: ${resultados[v] || 0} veces (Experimental), ${resultadosTeoricos[v] || 0} combinaciones (Teórica)</li>`
            ).join('')}</ul>
            <button class="reiniciar-btn" onclick="location.reload()">Reiniciar</button>`;

        // Gráfica
        const graficaContainer = document.getElementById('graficaJarron-container');
        graficaContainer.style.display = 'block';
        const labels = todosValores.map(String);
        const dataExperimental = todosValores.map(v => (resultados[v] || 0) / reps);
        const dataTeorica = todosValores.map(v => (resultadosTeoricos[v] || 0) / totalTeorico);

        if (window.chartJarron) window.chartJarron.destroy();
        const ctx = document.getElementById('graficaJarron').getContext('2d');
        window.chartJarron = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Probabilidad Experimental',
                        data: dataExperimental,
                        backgroundColor: '#2196F3'
                    },
                    {
                        label: 'Probabilidad Teórica',
                        data: dataTeorica,
                        backgroundColor: '#ff9800'
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        title: { display: true, text: 'Probabilidad' }
                    }
                }
            }
        });
    });
} else if (dist === 'uniforme' || dist === undefined || dist === null) {
    // Por defecto muestra el de dados
    document.getElementById('formDado').style.display = 'block';
    document.getElementById('titulo-principal').style.display = 'block';
    document.getElementById('explicacion-principal').style.display = 'block';
} else {
    // Oculta el de dados si no corresponde
    document.getElementById('formDado').style.display = 'none';
    document.getElementById('titulo-principal').style.display = 'none';
    document.getElementById('explicacion-principal').style.display = 'none';
}