import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy import text, inspect as sa_inspect
from werkzeug.middleware.proxy_fix import ProxyFix

db = SQLAlchemy()

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")


def create_app(test_config: dict | None = None):
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(DATA_DIR, 'db.sqlite3')}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB upload limit

    if test_config:
        app.config.update(test_config)

    CORS(app)
    db.init_app(app)

    os.makedirs(UPLOADS_DIR, exist_ok=True)

    from routes.auth import auth_bp
    from routes.containers import containers_bp
    from routes.items import items_bp
    from routes.photos import photos_bp
    from routes.search import search_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(containers_bp)
    app.register_blueprint(items_bp)
    app.register_blueprint(photos_bp)
    app.register_blueprint(search_bp)

    with app.app_context():
        db.create_all()
        _migrate(db)

    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    return app


def _migrate(db):
    """Apply additive schema migrations that db.create_all() won't handle."""
    inspector = sa_inspect(db.engine)
    container_cols = [c["name"] for c in inspector.get_columns("containers")]
    if "user_id" not in container_cols:
        db.session.execute(
            text("ALTER TABLE containers ADD COLUMN user_id INTEGER REFERENCES users(id)")
        )
        db.session.commit()


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
