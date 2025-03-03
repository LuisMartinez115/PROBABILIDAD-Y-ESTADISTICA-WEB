document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('dropArea').addEventListener('drop', handleDrop);
document.getElementById('dropArea').addEventListener('dragover', (e) => e.preventDefault());
document.getElementById('dropArea').addEventListener('click', () => document.getElementById('fileInput').click());
document.getElementById('reloadBtn').addEventListener('click', reloadFile);
document.getElementById('showCalcOptionsBtn').addEventListener('click', showCalculationOptions);

let parsedData = [];

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
        reader.onload = function(e) {
            const text = e.target.result;
            processCSV(text, file.name);
        };
        reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx')) {
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            processCSV(csv, file.name);
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Unsupported file format. Please upload a .csv or .xlsx file.');
    }
}

function processCSV(csv, fileName) {
    // Process the CSV data
    console.log(csv);
    // Add your CSV processing logic here
    parsedData = parseCSV(csv);
    displayFileInfo(fileName);
}

function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    parseFile(file);
    displayFileInfo(file.name);
}

function parseFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = event.target.result;
        parsedData = parseCSV(data);
    };
    reader.readAsText(file);
}

function parseCSV(data) {
    const rows = data.split('\n');
    return rows.map(row => {
        const values = [];
        let inQuotes = false;
        let value = '';

        for (let char of row) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(parseFloat(value.replace(',', '.')));
                value = '';
            } else {
                value += char;
            }
        }
        values.push(parseFloat(value.replace(',', '.')));
        return values;
    });
}

function displayFileInfo(fileName) {
    document.getElementById('dropArea').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('fileName').textContent = `Archivo cargado: ${fileName}`;
    document.getElementById('fileInput').style.display = 'none'; // Hide the file input
}

function reloadFile() {
    document.getElementById('dropArea').style.display = 'flex';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('calculationOptions').style.display = 'none';
    document.getElementById('showCalcOptionsBtn').style.display = 'inline-block';
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInput').style.display = 'block'; // Show the file input
    parsedData = [];
}

function showCalculationOptions() {
    document.getElementById('calculationOptions').style.display = 'block';
    document.getElementById('showCalcOptionsBtn').style.display = 'none';
}

function getSelectedData() {
    const columns = document.getElementById('columns').value.split(',').map(Number);
    const rows = document.getElementById('rows').value.split('-').map(Number);
    const selectedData = [];

    for (let i = rows[0] - 1; i < rows[1]; i++) {
        const row = [];
        for (const col of columns) {
            row.push(parsedData[i][col - 1]);
        }
        selectedData.push(row);
    }
    return selectedData;
}

function calculateMean() {
    const data = getSelectedData().flat();
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    alert(`Media: ${mean}`);
}

function calculateMode() {
    const data = getSelectedData().flat();
    const frequency = {};
    data.forEach(value => frequency[value] = (frequency[value] || 0) + 1);
    const mode = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
    alert(`Moda: ${mode}`);
}

function calculateMedian() {
    const data = getSelectedData().flat().sort((a, b) => a - b);
    const mid = Math.floor(data.length / 2);
    const median = data.length % 2 !== 0 ? data[mid] : (data[mid - 1] + data[mid]) / 2;
    alert(`Mediana: ${median}`);
}

function calculateVariance() {
    const data = getSelectedData().flat();
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    alert(`Varianza: ${variance}`);
}

function calculateStdDev() {
    const data = getSelectedData().flat();
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    alert(`Desviación Estándar: ${stdDev}`);
}

function showLoadedData() {
    console.log('Datos cargados:', parsedData);
}
