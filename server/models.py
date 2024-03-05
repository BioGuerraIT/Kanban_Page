from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    class_year = db.Column(db.String(4), nullable=False)
    tasks = db.relationship('Task', backref='owner', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.String(1024), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='todo')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=True)
    
    subtasks = db.relationship('Task', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status
        }

class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    subsubtasks = db.relationship('SubSubtask', backref='parent_subtask', lazy=True)

class SubSubtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    subtask_id = db.Column(db.Integer, db.ForeignKey('subtask.id'), nullable=False)
