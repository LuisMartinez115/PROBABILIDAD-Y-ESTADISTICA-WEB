const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileDetails = document.getElementById('fileDetails');
const reloadBtn = document.getElementById('reloadBtn');
const showCalcOptionsBtn = document.getElementById('showCalcOptionsBtn');
const calculationOptions = document.getElementById('calculationOptions');
const headerCheckbox = document.getElementById('header');
const independentVar = document.getElementById('independentVar');
const dependentVar = document.getElementById('dependentVar');
const equationResult = document.getElementById('equationResult');
const equation = document.getElementById('equation');
const chartContainer = document.getElementById('chartContainer');
const adjustmentChart = document.getElementById('adjustmentChart').getContext('2d');
let workbook;
let chart;

dropArea.addEventListener(' click', () => fileInput.click());
fileInput.addEventListener('change', () => handleFile(fileInput.files));
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    handleFile(e.dataTransfer.files);
});

reloadBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileInfo.style.display = 'none';
    calculationOptions.style.display = 'none';
    equationResult.style.display = 'none';
    chartContainer.style.display = 'none';
    dropArea.style.display = 'block';
});

showCalcOptionsBtn.addEventListener('click', () => {
    calculationOptions.style.display = 'block';
    populateVariableOptions();
});

function handleFile(files) {
    const file = files[0];
    if (file) {
        fileName.textContent = `Archivo: ${file.name}`;
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            const totalRows = range.e.r + 1;
            const totalCols = range.e.c + 1;
            fileDetails.textContent = `Total de filas: ${totalRows}, Total de columnas: ${totalCols}`;
            dropArea.style.display = 'none';
            fileInfo.style.display = 'block';
            console.log('Archivo leído correctamente:', workbook);
        };
        reader.readAsArrayBuffer(file);
    }
}

function populateVariableOptions() {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
    independentVar.innerHTML = '';
    dependentVar.innerHTML = '';
    headers.forEach((header, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = header;
        independentVar.appendChild(option.cloneNode(true));
        dependentVar.appendChild(option.cloneNode(true));
    });
}

function calculateLinearLeastSquares() {
    const columns = [parseInt(independentVar.value), parseInt(dependentVar.value)];
    const rows = document.getElementById('rows').value.split('-').map(Number);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const xValues = [];
    const yValues = [];
    const startRow = headerCheckbox.checked ? rows[0] : rows[0] - 1;
    for (let i = startRow; i <= rows[1] - 1; i++) {
        const xValue = parseFloat(data[i][columns[0]]);
        const yValue = parseFloat(data[i][columns[1]]);
        if (!isNaN(xValue) && !isNaN(yValue)) {
            xValues.push(xValue);
            yValues.push(yValue);
        }
    }
    console.log('Vectores X:', xValues);
    console.log('Vectores Y:', yValues);
    const regression = linearRegression(xValues, yValues);
    console.log('Regresión:', regression);
    displayRegressionTable(xValues, yValues, regression, 'linear');
    displayEquation(regression, 'linear');
    displayChart(xValues, yValues, regression, 'linear');
    calculationOptions.style.display = 'none';
    equationResult.style.display = 'block';
    chartContainer.style.display = 'block';
}

function calculateQuadraticLeastSquares() {
    const columns = [parseInt(independentVar.value), parseInt(dependentVar.value)];
    const rows = document.getElementById('rows').value.split('-').map(Number);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const xValues = [];
    const yValues = [];
    const startRow = headerCheckbox.checked ? rows[0] : rows[0] - 1;
    for (let i = startRow; i <= rows[1] - 1; i++) {
        const xValue = parseFloat(data[i][columns[0]]);
        const yValue = parseFloat(data[i][columns[1]]);
        if (!isNaN(xValue) && !isNaN(yValue)) {
            xValues.push(xValue);
            yValues.push(yValue);
        }
    }
    console.log('Vectores X:', xValues);
    console.log('Vectores Y:', yValues);
    const regression = quadraticRegression(xValues, yValues);
    console.log('Regresión:', regression);
    displayRegressionTable(xValues, yValues, regression, 'quadratic');
    displayEquation(regression, 'quadratic');
    displayChart(xValues, yValues, regression, 'quadratic');
    calculationOptions.style.display = 'none';
    equationResult.style.display = 'block';
    chartContainer.style.display = 'block';
}

function calculateCubicLeastSquares() {
    const columns = [parseInt(independentVar.value), parseInt(dependentVar.value)];
    const rows = document.getElementById('rows').value.split('-').map(Number);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const xValues = [];
    const yValues = [];
    const startRow = headerCheckbox.checked ? rows[0] : rows[0] - 1;
    for (let i = startRow; i <= rows[1] - 1; i++) {
        const xValue = parseFloat(data[i][columns[0]]);
        const yValue = parseFloat(data[i][columns[1]]);
        if (!isNaN(xValue) && !isNaN(yValue)) {
            xValues.push(xValue);
            yValues.push(yValue);
        }
    }
    console.log('Vectores X:', xValues);
    console.log('Vectores Y:', yValues);
    const regression = cubicRegression(xValues, yValues);
    console.log('Regresión:', regression);
    displayRegressionTable(xValues, yValues, regression, 'cubic');
    displayEquation(regression, 'cubic');
    displayChart(xValues, yValues, regression, 'cubic');
    calculationOptions.style.display = 'none';
    equationResult.style.display = 'block';
    chartContainer.style.display = 'block';
}

function linearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

function quadraticRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumX3 = x.reduce((sum, xi) => sum + xi * xi * xi, 0);
    const sumX4 = x.reduce((sum, xi) => sum + xi * xi * xi * xi, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2Y = x.reduce((sum, xi, i) => sum + xi * xi * y[i], 0);

    console.log('n:', n);
    console.log('sumX:', sumX);
    console.log('sumY:', sumY);
    console.log('sumX2:', sumX2);
    console.log('sumX3:', sumX3);
    console.log('sumX4:', sumX4);
    console.log('sumXY:', sumXY);
    console.log('sumX2Y:', sumX2Y);

    // Construct the matrix A and vector B for the normal equations
    const A = [
        [n , sumX , sumX2],
        [sumX , sumX2 , sumX3 ],
        [sumX2 , sumX3 , sumX4 ]
    ];
    const B =[ [sumY], [sumXY], [sumX2Y]];

    console.log('Matrix A:', JSON.parse(JSON.stringify(A))); // Deep copy for logging
    console.log('Matrix B:', JSON.parse(JSON.stringify(B))); // Deep copy for logging

    // Solve the linear system A * [a, b, c] = B to find the coefficients
    const [c, b, a] = solveLinearSystem(A, B); // Note the order change
    console.log('Coefficients:', { a, b, c });
    return { a, b, c };
}

function cubicRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumX3 = x.reduce((sum, xi) => sum + xi * xi * xi, 0);
    const sumX4 = x.reduce((sum, xi) => sum + xi * xi * xi * xi, 0);
    const sumX5 = x.reduce((sum, xi) => sum + xi * xi * xi * xi * xi, 0);
    const sumX6 = x.reduce((sum, xi) => sum + xi * xi * xi * xi * xi * xi, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2Y = x.reduce((sum, xi, i) => sum + xi * xi * y[i], 0);
    const sumX3Y = x.reduce((sum, xi, i) => sum + xi * xi * xi * y[i], 0);

    console.log('sumX:', sumX);
    console.log('sumY:', sumY);
    console.log('sumX2:', sumX2);
    console.log('sumX3:', sumX3);
    console.log('sumX4:', sumX4);
    console.log('sumX5:', sumX5);
    console.log('sumX6:', sumX6);
    console.log('sumXY:', sumXY);
    console.log('sumX2Y:', sumX2Y);
    console.log('sumX3Y:', sumX3Y);

    // Construct the matrix A and vector B for the normal equations
    const A = [
        [n, sumX, sumX2, sumX3],
        [sumX, sumX2, sumX3, sumX4],
        [sumX2, sumX3, sumX4, sumX5],
        [sumX3, sumX4, sumX5, sumX6]
    ];
    const B = [sumY, sumXY, sumX2Y, sumX3Y];

    console.log('Matrix A:', A);
    console.log('Matrix B:', B);

    // Solve the linear system A * [a, b, c, d] = B to find the coefficients
    const [d, c, b, a] = solveLinearSystem(A, B); // Note the order change
    console.log('Coefficients:', { a, b, c, d });
    return { a, b, c, d };
}

function solveLinearSystem(A, B) {
    const n = A.length;
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
                maxRow = k;
            }
        }
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [B[i], B[maxRow]] = [B[maxRow], B[i]];

        for (let k = i + 1; k < n; k++) {
            const factor = A[k][i] / A[i][i];
            for (let j = i; j < n; j++) {
                A[k][j] -= factor * A[i][j];
            }
            B[k] -= factor * B[i];
        }
    }

    console.log('Matriz A después de la eliminación gaussiana:', JSON.parse(JSON.stringify(A))); // Deep copy for logging
    console.log('Vector B después de la eliminación gaussiana:', JSON.parse(JSON.stringify(B))); // Deep copy for logging

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = B[i] / A[i][i];
        for (let k = i - 1; k >= 0; k--) {
            B[k] -= A[k][i] * x[i];
        }
    }
    return x;
}

function displayRegressionTable(x, y, regression, type) {
    const table = x.map((xi, i) => {
        let yCalc;
        if (type === 'linear') {
            yCalc = regression.slope * xi + regression.intercept;
        } else if (type === 'quadratic') {
            yCalc = regression.a * xi * xi + regression.b * xi + regression.c;
        } else if (type === 'cubic') {
            yCalc = regression.a * xi * xi * xi + regression.b * xi * xi + regression.c * xi + regression.d;
        }
        return { X: xi, Y: y[i], 'Y Calculado': yCalc };
    });
    console.table(table);
}

function displayEquation(regression, type) {
    if (type === 'linear') {
        equation.textContent = `Y = ${regression.slope.toFixed(3)}X + ${regression.intercept.toFixed(3)}`;
    } else if (type === 'quadratic') {
        equation.textContent = `Y = ${regression.a.toFixed(3)}X² + ${regression.b.toFixed(3)}X + ${regression.c.toFixed(3)}`;
    } else if (type === 'cubic') {
        equation.textContent = `Y = ${regression.a.toFixed(3)}X³ + ${regression.b.toFixed(3)}X² + ${regression.c.toFixed(3)}X + ${regression.d.toFixed(3)}`;
    }
}

function displayChart(xValues, yValues, regression, type) {
    let regressionLine;
    if (type === 'linear') {
        regressionLine = xValues.map(x => regression.slope * x + regression.intercept);
    } else if (type === 'quadratic') {
        regressionLine = xValues.map(x => regression.a * x * x + regression.b * x + regression.c);
    } else if (type === 'cubic') {
        regressionLine = xValues.map(x => regression.a * x * x * x + regression.b * x * x + regression.c * x + regression.d);
    }
    const xLabel = independentVar.options[independentVar.selectedIndex].text.toUpperCase();
    const yLabel = dependentVar.options[dependentVar.selectedIndex].text.toUpperCase();
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(adjustmentChart, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Datos',
                data: xValues.map((x, i) => ({ x, y: yValues[i] })),
                backgroundColor: 'rgba(0, 123, 255, 0.5)'
            }, {
                label: 'Ajuste de Mínimos Cuadrados',
                data: xValues.map((x, i) => ({ x, y: regressionLine[i] })),
                type: 'line',
                borderColor: 'rgba(255, 99, 132, 0.5)',
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: xLabel
                    }
                },
                y: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: yLabel
                    }
                }
            }
        }
    });
}
