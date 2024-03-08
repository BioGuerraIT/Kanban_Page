from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Task
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}) 
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kanban.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = '8f8b05ac3f5bd0da74302d19f8578e2e'

jwt = JWTManager(app)
db.init_app(app)

@app.route('/register', methods=['POST'])
def register():
    email = request.json.get('email')
    password = request.json.get('password')
    name = request.json.get('name')
    class_year = request.json.get('classYear')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(email=email, name=name, password=hashed_password, class_year=class_year)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')
    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token), 200

    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    # Fetch only top-level tasks
    tasks = Task.query.filter_by(user_id=user_id, parent_id=None).all()
    # Use the adjusted to_dict method to include subtasks
    return jsonify([task.to_dict() for task in tasks]), 200

# Update a Task
@app.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    data = request.get_json()
    task = Task.query.filter_by(id=task_id, user_id=get_jwt_identity()).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    db.session.commit()
    return jsonify(task.to_dict()), 200

# Delete a Task
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=get_jwt_identity()).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 200

# Helper function to create subtasks
def create_subtasks(subtasks, parent_id):
    for subtask_data in subtasks:
        new_subtask = Task(
            title=subtask_data['title'],
            description=subtask_data.get('description', ''),
            user_id=get_jwt_identity(),
            parent_id=parent_id
        )
        db.session.add(new_subtask)
        db.session.commit()
        # Recursively create nested subtasks
        if 'subtasks' in subtask_data and len(subtask_data['subtasks']) > 0:
            create_subtasks(subtask_data['subtasks'], parent_id=new_subtask.id)

@app.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.get_json()
    new_task = Task(
        user_id=user_id, 
        title=data['title'], 
        description=data.get('description', ''), 
        status='todo',
        parent_id=None  # Top-level task
    )
    db.session.add(new_task)
    db.session.commit()
    # Check if there are subtasks in the request and create them
    if 'subtasks' in data and len(data['subtasks']) > 0:
        create_subtasks(data['subtasks'], parent_id=new_task.id)
    return jsonify(new_task.to_dict()), 201

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
