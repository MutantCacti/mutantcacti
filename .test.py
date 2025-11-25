from flask import Flask, send_from_directory, send_file
import os

app = Flask(__name__, static_folder='.')

@app.route('/')
def home():
    return send_file('index.html')

@app.route('/about.html')
def about():
    return send_file('about.html')

@app.route('/contact.html')
def contact():
    return send_file('contact.html')

@app.route('/journal.html')
def journal():
    return send_file('journal.html')

@app.route('/O.html')
def o_page():
    return send_file('O.html')

@app.route('/O/<path:filename>')
def o_files(filename):
    return send_from_directory('O', filename)

@app.route('/css/<path:filename>')
def css_files(filename):
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def js_files(filename):
    return send_from_directory('js', filename)

@app.route('/res/<path:filename>')
def res_files(filename):
    return send_from_directory('res', filename)

@app.route('/journal/<path:filename>')
def journal_files(filename):
    return send_from_directory('journal', filename)

@app.route('/test')
def test():
    return {'status': 'ok', 'message': 'Test endpoint'}

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
