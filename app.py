from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Sample data for posts and comments
posts = [
    {"id": 1, "title": "First Post", "content": "This is the first post."},
    {"id": 2, "title": "Second Post", "content": "This is the second post."},
]

comments = {
    1: [{"author": "Alice", "comment": "Great post!"}, {"author": "Bob", "comment": "I agree!"}],
    2: [{"author": "Charlie", "comment": "Very informative!"}],
}

@app.route('/')
def home():
    return render_template('home.html', posts=posts)

@app.route('/post/<int:post_id>')
def post(post_id):
    post = next((p for p in posts if p['id'] == post_id), None)
    post_comments = comments.get(post_id, [])
    return render_template('post.html', post=post, comments=post_comments)

@app.route('/create', methods=['GET', 'POST'])
def create_post():
    if request.method == 'POST':
        title = request.form['title']
        content = request.form['content']
        new_post = {"id": len(posts) + 1, "title": title, "content": content}
        posts.append(new_post)
        return redirect(url_for('home'))
    return render_template('create_post.html')

if __name__ == '__main__':
    app.run(debug=True)
