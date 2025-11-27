from flask import Blueprint, request, jsonify, current_app
from models import db, Task, User
import jwt
from functools import wraps

task_bp = Blueprint("tasks", __name__)

# Decorator para rotas que exigem autenticação
def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"message": "Token não fornecido"}), 401

        token = parts[1]

        try:
            payload = jwt.decode(
                token,
                current_app.config["SECRET_KEY"],
                algorithms=["HS256"]
            )
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token inválido"}), 401

        user = User.query.get(payload["user_id"])
        if not user:
            return jsonify({"message": "Utilizador não encontrado"}), 401

        # guardar o utilizador no request
        request.current_user = user

        return f(*args, **kwargs)
    return wrapper


# GET /tasks/  -> lista tarefas do utilizador autenticado
@task_bp.route("/", methods=["GET"])
@auth_required
def list_tasks():
    user = request.current_user
    tasks = Task.query.filter_by(user_id=user.id).all()

    return jsonify([
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "done": t.done
        } for t in tasks
    ])


# POST /tasks/  -> cria tarefa para o utilizador autenticado
@task_bp.route("/", methods=["POST"])
@auth_required
def create_task():
    user = request.current_user
    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    done = data.get("done", False)

    if not title:
        return jsonify({"message": "Título é obrigatório"}), 400

    task = Task(
        title=title,
        description=description,
        done=done,
        user_id=user.id
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({"id": task.id}), 201


# PUT /tasks/<id>  -> atualizar tarefa do utilizador autenticado
@task_bp.route("/<int:task_id>", methods=["PUT"])
@auth_required
def update_task(task_id):
    user = request.current_user

    task = Task.query.filter_by(id=task_id, user_id=user.id).first()

    if not task:
        return jsonify({"message": "Tarefa não encontrada"}), 404

    data = request.get_json()

    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.done = data.get("done", task.done)

    db.session.commit()

    return jsonify({"message": "Tarefa atualizada com sucesso"})


# DELETE /tasks/<id>  -> apagar tarefa do utilizador autenticado
@task_bp.route("/<int:task_id>", methods=["DELETE"])
@auth_required
def delete_task(task_id):
    user = request.current_user

    task = Task.query.filter_by(id=task_id, user_id=user.id).first()

    if not task:
        return jsonify({"message": "Tarefa não encontrada"}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "Tarefa eliminada com sucesso"})