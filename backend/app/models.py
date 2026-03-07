import uuid
from datetime import datetime

from sqlalchemy import Column, JSON
from sqlmodel import SQLModel, Field


# ---- Store ----


class StoreCreate(SQLModel):
    name: str


class StoreUpdate(SQLModel):
    genre: str | None = None
    menu_description: str | None = None
    description: str | None = None


class Store(SQLModel, table=True):
    __tablename__ = "stores"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str
    genre: str | None = None
    photo_url: str | None = None
    menu_description: str | None = None
    description: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ---- BaseImage ----


class BaseImageUpdate(SQLModel):
    is_active: bool


class BaseImage(SQLModel, table=True):
    __tablename__ = "base_images"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    store_id: str = Field(foreign_key="stores.id")
    image_url: str
    segments: dict | None = Field(default=None, sa_column=Column(JSON))
    generation_input: dict | None = Field(default=None, sa_column=Column(JSON))
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
