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

    def to_dict(self, include_subtasks=True):
        task_dict = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'parent_id': self.parent_id,
            'user_id': self.user_id,
        }
        if include_subtasks:
            for subtask in self.subtasks:
                task_dict['subtasks'] = [subtask.to_dict()]
                if len(subtask.subtasks) > 0:
                    task_dict['subtasks']['subsubtasks'] = [subsubtask.to_dict() for subsubtask in subtask['subtasks']]
        return task_dict

    @property
    def subtasks(self):
        return Task.query.filter_by(parent_id=self.id).all()