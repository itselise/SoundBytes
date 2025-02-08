from flask import Flask, render_template, request, redirect, url_for
import os
import time
from werkzeug.utils import secure_filename
import base64

app = Flask(__name__)

# Dummy users dictionary (replace with database in a real app)
users = {
    "elise": "BobDylan"  # Hardcoded user credentials
}
# Sample data for posts and comments
posts = [
    {"id": 1, "title": "stallion!", "audio": "../static/audio/sample1.mp3"},
    {"id": 2, "title": "from my poem", "audio": "../static/audio/sample2.mp3"},
]

comments = {
    1: [{"author": "Alice", "audio": "../static/audio/comment1.mp3"}],
    2: [{"author": "Charlie", "audio": "../static/audio/comment2.mp3"}],
}

ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_audio_file(audio_file):
    filename = secure_filename(audio_file.filename)
    timestamp = str(int(time.time()))  # Use timestamp for uniqueness
    filepath = os.path.join(app.static_folder, 'audio', f"{timestamp}_{filename}")
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    audio_file.save(filepath)
    print(f"Audio file saved at: {filepath}")  # Debugging line
    return f"audio/{timestamp}_{filename}"  # This ensures the path is accessible through the static folder


# Home route - shows the posts
@app.route('/')
def login():
    return render_template('login.html')

# Login form submission handler
@app.route('/submit_login', methods=['POST'])
def submit_login():
    username = request.form['username']
    password = request.form['password']

    # Check if the credentials match
    if users.get(username) == password:
        return redirect(url_for('home'))  # Redirect to home page after successful login
    
    # If login fails, show an error message
    error_message = "Invalid username or password"
    return render_template('login.html', error_message=error_message)

# Home page route after login
@app.route('/home')
def home():
    return render_template('home.html', posts=posts)

# Sign up route for new users
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Save the new user credentials (you should ideally store this in a database)
        if username not in users:  # Check if username already exists
            users[username] = password
            return redirect(url_for('login'))  # Redirect to login after sign-up
        else:
            error_message = "Username already exists"
            return render_template('signup.html', error_message=error_message)
    
    return render_template('signup.html')  # Render the sign-up page on GET request


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
