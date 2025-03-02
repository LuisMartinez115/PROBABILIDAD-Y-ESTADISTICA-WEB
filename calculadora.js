document.getElementById('fileInput').addEventListener('change', handleFile);
document.getElementById('dropArea').addEventListener('drop', handleDrop);
document.getElementById('dropArea').addEventListener('dragover', (e) => e.preventDefault());
document.getElementById('dropArea').addEventListener('click', () => document.getElementById('fileInput').click());
document.getElementById('reloadBtn').addEventListener('click', reloadFile);
document.getElementById('calculateBtn').addEventListener('click', showCalculationOptions);

let parsedData = [];

function handleFile(event) {
    const file = event.target.files[0];
    parseFile(file);
    displayFileInfo(file);
}

function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    parseFile(file);
    displayFileInfo(file);
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

function displayFileInfo(file) {
    document.getElementById('dropArea').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('fileName').textContent = `Loaded file: ${file.name}`;
    document.getElementById('calculationOptions').style.display = 'block';
}

function reloadFile() {
    document.getElementById('dropArea').style.display = 'flex';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('calculationOptions').style.display = 'none';
    document.getElementById('fileInput').value = '';
    parsedData = [];
}

function showCalculationOptions() {
    // Aquí puedes agregar la lógica para mostrar los divs necesarios para calcular
    alert('Mostrar opciones de cálculo');
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
    alert(`Mean: ${mean}`);
}

function calculateMode() {
    const data = getSelectedData().flat();
    const frequency = {};
    data.forEach(value => frequency[value] = (frequency[value] || 0) + 1);
    const mode = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
    alert(`Mode: ${mode}`);
}

function calculateMedian() {
    const data = getSelectedData().flat().sort((a, b) => a - b);
    const mid = Math.floor(data.length / 2);
    const median = data.length % 2 !== 0 ? data[mid] : (data[mid - 1] + data[mid]) / 2;
    alert(`Median: ${median}`);
}

function calculateVariance() {
    const data = getSelectedData().flat();
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    alert(`Variance: ${variance}`);
}

function calculateStdDev() {
    const data = getSelectedData().flat();
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    alert(`Standard Deviation: ${stdDev}`);
}

function showLoadedData() {
    console.log('Loaded Data:', parsedData);
}
