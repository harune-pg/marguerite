import uuid
from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import Column, Integer, JSON
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

    id: int = Field(default=None, sa_column=Column(Integer, primary_key=True, autoincrement=True))
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
    store_id: int = Field(foreign_key="stores.id")
    image_url: str
    segments: dict | None = Field(default=None, sa_column=Column(JSON))
    generation_input: dict | None = Field(default=None, sa_column=Column(JSON))
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BaseImageRead(BaseModel):
    # `base_image_id` is the externally visible key (mapped from the DB `id`)
    base_image_id: str
    store_id: int
    image_url: str
    segments: dict | None = None
    generation_input: dict | None = None
    is_active: bool
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }
