const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileDetails = document.getElementById('fileDetails');
const reloadBtn = document.getElementById('reloadBtn');
const showCalcOptionsBtn = document.getElementById('showCalcOptionsBtn');
const calculationOptions = document.getElementById('calculationOptions');
const headerCheckbox = document.getElementById('header');
const equationResult = document.getElementById('equationResult');
const equation = document.getElementById('equation');
let workbook;

dropArea.addEventListener('click', () => fileInput.click());
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
    dropArea.style.display = 'block';
});

showCalcOptionsBtn.addEventListener('click', () => {
    calculationOptions.style.display = 'block';
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

function calculateLeastSquares() {
    const columns = document.getElementById('columns').value.split(',').map(Number);
    const rows = document.getElementById('rows').value.split('-').map(Number);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const xValues = [];
    const yValues = [];
    const startRow = headerCheckbox.checked ? rows[0] : rows[0] - 1;
    for (let i = startRow; i <= rows[1] - 1; i++) {
        const xValue = parseFloat(data[i][columns[0] - 1]);
        const yValue = parseFloat(data[i][columns[1] - 1]);
        if (!isNaN(xValue) && !isNaN(yValue)) {
            xValues.push(xValue);
            yValues.push(yValue);
        }
    }
    console.log('Vectores X:', xValues);
    console.log('Vectores Y:', yValues);
    const regression = linearRegression(xValues, yValues);
    console.log('Regresión:', regression);
    displayRegressionTable(xValues, yValues, regression);
    displayEquation(regression);
    calculationOptions.style.display = 'none';
    equationResult.style.display = 'block';
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

function displayRegressionTable(x, y, regression) {
    const table = x.map((xi, i) => ({
        X: xi,
        Y: y[i],
        'Y Calculado': regression.slope * xi + regression.intercept
    }));
    console.table(table);
}

function displayEquation(regression) {
    equation.textContent = `Y = ${regression.slope.toFixed(3)}X + ${regression.intercept.toFixed(3)}`;
}
