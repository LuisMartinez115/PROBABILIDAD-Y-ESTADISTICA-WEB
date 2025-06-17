document.getElementById('formBernoulli').addEventListener('submit', function (e) {
    e.preventDefault();

    const numeroObjetivo = parseInt(document.getElementById('numeroObjetivo').value);
    const repeticiones = parseInt(document.getElementById('reps_bernoulli').value);

    let exitos = 0;
    const resultados = [];

    for (let i = 0; i < repeticiones; i++) {
        const lanzamiento = Math.floor(Math.random() * 6) + 1;
        if (lanzamiento === numeroObjetivo) {
            exitos++;
            resultados.push(1); // Éxito
        } else {
            resultados.push(0); // Fracaso
        }
    }

    const probabilidadExperimental = (exitos / repeticiones).toFixed(4);
    const probabilidadTeorica = (1 / 6).toFixed(4);

    document.getElementById('resultadosBernoulli').innerHTML = `
        <p><strong>Resultados:</strong></p>
        <p>Éxitos: ${exitos} (${((exitos / repeticiones) * 100).toFixed(2)}%)</p>
        <p>Fracasos: ${repeticiones - exitos} (${(((repeticiones - exitos) / repeticiones) * 100).toFixed(2)}%)</p>
        <p>Probabilidad Experimental: ${probabilidadExperimental}</p>
        <p>Probabilidad Teórica: ${probabilidadTeorica}</p>
    `;

    // Mostrar gráfica mejorada
    const ctx = document.getElementById('graficaBernoulli').getContext('2d');
    document.getElementById('graficaBernoulli-container').style.display = 'block';
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Éxito (1)', 'Fracaso (0)'],
            datasets: [{
                label: 'Distribución Bernoulli',
                data: [exitos, repeticiones - exitos],
                backgroundColor: ['#4CAF50', '#F44336'],
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
});
