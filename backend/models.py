from datetime import datetime
from app import db


class Container(db.Model):
    __tablename__ = "containers"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    barcode_uuid = db.Column(db.Text, unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship("Item", backref="container", cascade="all, delete-orphan")
    photos = db.relationship("Photo", backref="container", cascade="all, delete-orphan")

    def to_dict(self, include_related=False):
        d = {
            "id": self.id,
            "name": self.name,
            "barcode_uuid": self.barcode_uuid,
            "created_at": self.created_at.isoformat(),
        }
        if include_related:
            d["items"] = [i.to_dict() for i in self.items]
            d["photos"] = [p.to_dict() for p in self.photos]
        return d


class Item(db.Model):
    __tablename__ = "items"

    id = db.Column(db.Integer, primary_key=True)
    container_id = db.Column(db.Integer, db.ForeignKey("containers.id"), nullable=False)
    name = db.Column(db.Text, nullable=False)
    quantity = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "container_id": self.container_id,
            "name": self.name,
            "quantity": self.quantity,
            "created_at": self.created_at.isoformat(),
        }


class Photo(db.Model):
    __tablename__ = "photos"

    id = db.Column(db.Integer, primary_key=True)
    container_id = db.Column(db.Integer, db.ForeignKey("containers.id"), nullable=False)
    filename = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "container_id": self.container_id,
            "filename": self.filename,
            "created_at": self.created_at.isoformat(),
        }
