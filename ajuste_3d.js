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
const chartContainer = document.getElementById('chartContainer');
// const adjustment3DChart = document.getElementById('adjustment3DChart').getContext('2d');
let workbook;
let chart;

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
    // chartContainer.style.display = 'none';
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

function calculate3DLeastSquares() {
    const columns = document.getElementById('columns').value.split(',').map(Number);
    const rows = document.getElementById('rows').value.split('-').map(Number);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const xValues = [];
    const yValues = [];
    const zValues = [];
    const startRow = headerCheckbox.checked ? rows[0] : rows[0] - 1;

    for (let i = startRow; i < rows[1]; i++) {
        const row = data[i];
        if (row) {
            const xValue = parseFloat(row[columns[0] - 1]); // Ajustar índice de columna
            const yValue = parseFloat(row[columns[1] - 1]); // Ajustar índice de columna
            const zValue = parseFloat(row[columns[2] - 1]); // Ajustar índice de columna
            if (!isNaN(xValue) && !isNaN(yValue) && !isNaN(zValue)) {
                xValues.push(xValue);
                yValues.push(yValue);
                zValues.push(zValue);
            }
        }
    }

    console.log('Vectores X:', xValues);
    console.log('Vectores Y:', yValues);
    console.log('Vectores Z:', zValues);

    const regression = calculate3DRegression(xValues, yValues, zValues);
    console.log('Regresión:', regression);
    displayEquation(regression);
    // chartContainer.style.display = 'block';
}

function calculate3DRegression(x, y, z) {
    const degree = parseInt(document.getElementById('polynomialDegree').value); // Obtener grado del polinomio
    const terms = [];

    // Generar términos polinomiales
    for (let i = 0; i <= degree; i++) {
        for (let j = 0; j <= degree - i; j++) {
            terms.push({ xExp: i, yExp: j });
        }
    }

    const A = [];
    const B = [];

    // Construir la matriz A y el vector B
    for (let i = 0; i < x.length; i++) {
        const row = [];
        for (const term of terms) {
            const value = Math.pow(x[i], term.xExp) * Math.pow(y[i], term.yExp);
            row.push(value);
        }
        A.push(row);
        B.push(z[i]);
    }

    console.log('Matriz A:', A);
    console.log('Vector B:', B);

    // Resolver el sistema de ecuaciones A^T * A * coef = A^T * B
    try {
        const AT = math.transpose(A); // Transpuesta de A
        const ATA = math.multiply(AT, A); // A^T * A
        const ATB = math.multiply(AT, B); // A^T * B
        const coef = math.lusolve(ATA, ATB); // Resolver el sistema

        // Construir la ecuación resultante
        const equationTerms = terms.map((term, index) => {
            const coefValue = coef[index]?.[0]?.toFixed(3) || 0; // Manejar coeficientes indefinidos
            const xPart = term.xExp > 0 ? `x^${term.xExp}` : '';
            const yPart = term.yExp > 0 ? `y^${term.yExp}` : '';
            return `${coefValue}${xPart}${yPart}`;
        });

        const equation = `z = ${equationTerms.join(' + ')}`;
        console.log('Ecuación:', equation);

        return { coef: coef.flat(), equation };
    } catch (error) {
        console.error('Error al resolver el sistema de ecuaciones:', error);
        return { coef: [], equation: 'Error al calcular la ecuación' };
    }
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

    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = B[i] / A[i][i];
        for (let k = i - 1; k >= 0; k--) {
            B[k] -= A[k][i] * x[i];
        }
    }
    return x;
}

function displayEquation(regression) {
    equation.textContent = regression.equation;
}

function display3DChart(xValues, yValues, zValues, regression) {
    // Esta función ya no es necesaria, se puede eliminar.
}
