from flask import Flask, render_template, request, redirect, url_for
import os
import time
from werkzeug.utils import secure_filename
import base64

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Sample data for posts and comments
posts = [
    {"id": 1, "title": "First Post", "audio": "static/uploads/sample1.mp3"},
    {"id": 2, "title": "Second Post", "audio": "static/uploads/sample2.mp3"},
]

comments = {
    1: [{"author": "Alice", "audio": "static/uploads/comment1.mp3"}],
    2: [{"author": "Charlie", "audio": "static/uploads/comment2.mp3"}],
}

ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_audio_file(audio_file):
    filename = secure_filename(audio_file.filename)
    timestamp = str(int(time.time()))  # Use timestamp for uniqueness
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{timestamp}_{filename}")
    audio_file.save(filepath)
    print(f"Audio file saved at: {filepath}")  # Debugging line
    return f"uploads/{timestamp}_{filename}"  # Make sure to return the relative path


@app.route('/')
def home():
    return render_template('home.html', posts=posts)

@app.route('/create', methods=['GET', 'POST'])
def create_post():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']

        # Process uploaded file
        audio_file = request.files.get('audio')
        audio_path = None

        if audio_file and audio_file.filename:
            audio_path = save_audio_file(audio_file)  # Save uploaded file
        
        # Handle recorded audio if it's present as Base64 string
        recorded_audio = request.form.get('recorded_audio')
        if recorded_audio:
            timestamp = str(int(time.time()))  # Use timestamp for file name
            filename = f"Recording_{timestamp}.wav"
            audio_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            with open(audio_path, "wb") as f:
                f.write(base64.b64decode(recorded_audio.split(",")[1]))

        # Add post with audio path
        new_post = {"id": len(posts) + 1, "title": title, "content": content, "audio": audio_path}
        posts.append(new_post)

        return redirect(url_for('home'))

    return render_template('create_post.html')





@app.route('/post/<int:post_id>', methods=['GET', 'POST'])
def post(post_id):
    post = next((p for p in posts if p['id'] == post_id), None)
    post_comments = comments.get(post_id, [])

    if request.method == 'POST':
        author = request.form['author']
        audio_file = request.files.get('audio')

        if audio_file and audio_file.filename:
            audio_path = save_audio_file(audio_file)
            comments.setdefault(post_id, []).append({"author": author, "audio": audio_path})

        return redirect(url_for('post', post_id=post_id))

    return render_template('post.html', post=post, comments=post_comments)

if __name__ == '__main__':
    app.run(debug=True)
