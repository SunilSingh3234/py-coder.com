from flask import Flask, request, jsonify, render_template # type: ignore
import os
from io import StringIO
import sys

app = Flask(__name__)

# Directory to save files
SAVE_DIR = "saved_files"
os.makedirs(SAVE_DIR, exist_ok=True)  # Ensure the directory exists

# A global dictionary to maintain execution context
execution_context = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/run', methods=['POST'])
def run_code():
    global execution_context
    code = request.json.get('code', '')

    # Capture stdout and stderr
    output = StringIO()
    sys.stdout = output
    sys.stderr = output

    try:
        # Execute the code in the shared context
        exec(code, execution_context)
        response = {
            'output': output.getvalue(),
            'error': None
        }
    except Exception as e:
        response = {
            'output': output.getvalue(),
            'error': str(e)
        }
    finally:
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__

    return jsonify(response)

@app.route('/save', methods=['POST'])
def save_file():
    """Save code as a file."""
    filename = request.json.get('filename', 'untitled.py')
    code = request.json.get('code', '')

    # Save the file to the SAVE_DIR
    filepath = os.path.join(SAVE_DIR, filename)
    with open(filepath, 'w') as f:
        f.write(code)

    return jsonify({'message': f'File {filename} saved successfully!', 'filepath': filepath})

@app.route('/delete', methods=['POST'])
def delete_file():
    """Delete a saved file."""
    filename = request.json.get('filename', '')

    # Delete the file from the SAVE_DIR
    filepath = os.path.join(SAVE_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return jsonify({'message': f'File {filename} deleted successfully!'})
    else:
        return jsonify({'error': f'File {filename} not found.'}), 404

@app.route('/files', methods=['GET'])
def list_files():
    """List all saved files."""
    files = os.listdir(SAVE_DIR)
    return jsonify(files)

if __name__ == '__main__':
    app.run(debug=True)
