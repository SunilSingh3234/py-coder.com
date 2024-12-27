let cellCounter = 0;

function addCell() {
    const cellsDiv = document.getElementById('cells');
    const cellId = `cell-${cellCounter++}`;
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    cellDiv.innerHTML = `
        <textarea id="${cellId}-code" class="code-editor"></textarea>
        <button onclick="runCode('${cellId}')">Run</button>
        <pre id="${cellId}-output" class="output"></pre>
    `;
    cellsDiv.appendChild(cellDiv);

    // Initialize CodeMirror
    CodeMirror.fromTextArea(document.getElementById(`${cellId}-code`), {
        lineNumbers: true,
        mode: "python",
        theme: "default",
    });
}

async function runCode(cellId) {
    const editor = document.getElementById(`${cellId}-code`).nextSibling.CodeMirror;
    const code = editor.getValue();
    const outputDiv = document.getElementById(`${cellId}-output`);

    outputDiv.textContent = "Running...";

    try {
        const response = await fetch('/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });

        const result = await response.json();
        outputDiv.textContent = result.error || result.output;
    } catch (error) {
        outputDiv.textContent = `Error: ${error.message}`;
    }
}

async function saveFile() {
    const filename = document.getElementById('filename').value;
    if (!filename) {
        alert("Please enter a filename.");
        return;
    }

    const allCode = Array.from(document.querySelectorAll('.code-editor')).map(editor => 
        editor.nextSibling.CodeMirror.getValue()
    ).join('\n\n'); // Combine code from all cells

    try {
        const response = await fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, code: allCode }),
        });

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function deleteFile() {
    const filename = document.getElementById('filename').value;
    if (!filename) {
        alert("Please enter a filename to delete.");
        return;
    }

    try {
        const response = await fetch('/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename }),
        });

        const result = await response.json();
        if (result.error) {
            alert(result.error);
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

async function listFiles() {
    try {
        const response = await fetch('/files');
        const files = await response.json();
        const filesList = document.getElementById('files-list');
        filesList.innerHTML = '<h3>Saved Files:</h3>';
        filesList.innerHTML += files.map(file => `<p>${file}</p>`).join('');
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}
