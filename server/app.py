from flask import Flask
from flask_login import LoginManager, login_required
from models import db, User, Task, Subtask, SubSubtask

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kanban.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Bind the instance of SQLAlchemy (db) to this specific Flask app
db.init_app(app)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def hello():
    return "Hello, World!"

@app.route('/account')
@login_required
def account():
    return 'This is the account page.'

if __name__ == '__main__':
    with app.app_context():
        # Create the database tables if they don't exist
        db.create_all()
    app.run(debug=True)
