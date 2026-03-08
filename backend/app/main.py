import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from random import choice
from typing import List

from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import select

from app.database import create_db_and_tables, get_session
from app.models import (
    BaseImage,
    BaseImageRead,
    BaseImageUpdate,
    Store,
    StoreCreate,
    StoreUpdate,
)
from app.pipeline import run_pipeline


BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"
IMAGE_DIR = STATIC_DIR / "images"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
IMAGE_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="まちあいさがし API", lifespan=lifespan)

# Allow everything during development (adjust in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (uploaded photos etc.)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Serve mock image assets under /images for the API (e.g., /images/mock/sample.png)
app.mount("/images", StaticFiles(directory=str(IMAGE_DIR)), name="images")


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/api/stores")
def create_store(store_in: StoreCreate, session=Depends(get_session)):
    store = Store(**store_in.model_dump())
    session.add(store)
    session.commit()
    session.refresh(store)
    # Return a simplified response with store_id for compatibility with TODO.md
    return {"store_id": store.id, "name": store.name}


@app.get("/api/stores/{store_id}")
def get_store(store_id: int, session=Depends(get_session)):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


@app.put("/api/stores/{store_id}")
def update_store(
    store_id: int,
    name: str | None = Form(None),
    genre: str | None = Form(None),
    menu_description: str | None = Form(None),
    description: str | None = Form(None),
    photo: UploadFile | None = File(None),
    session=Depends(get_session),
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    updated = False
    if name is not None:
        store.name = name
        updated = True
    if genre is not None:
        store.genre = genre
        updated = True
    if menu_description is not None:
        store.menu_description = menu_description
        updated = True
    if description is not None:
        store.description = description
        updated = True

    if photo is not None:
        suffix = Path(photo.filename).suffix or ".jpg"
        filename = f"{uuid.uuid4()}{suffix}"
        file_path = UPLOAD_DIR / filename
        with file_path.open("wb") as f:
            f.write(photo.file.read())
        store.photo_url = f"/static/uploads/{filename}"
        updated = True

    if updated:
        store.updated_at = datetime.utcnow()
        session.add(store)
        session.commit()
        session.refresh(store)

    return store


def _as_base_image_read(base_image: BaseImage) -> dict:
    return {
        "base_image_id": base_image.id,
        "store_id": base_image.store_id,
        "image_url": base_image.image_url,
        "segments": base_image.segments,
        "generation_input": base_image.generation_input,
        "is_active": base_image.is_active,
        "created_at": base_image.created_at,
    }


@app.get("/api/stores/{store_id}/base-images", response_model=List[BaseImageRead])
def list_base_images(store_id: int, session=Depends(get_session)):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    statement = select(BaseImage).where(BaseImage.store_id == store_id)
    results = session.exec(statement).all()
    return [_as_base_image_read(r) for r in results]


@app.patch(
    "/api/stores/{store_id}/base-images/{base_image_id}",
    response_model=BaseImageRead,
)
def update_base_image(
    store_id: int,
    base_image_id: str,
    payload: BaseImageUpdate,
    session=Depends(get_session),
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    base_image = session.get(BaseImage, base_image_id)
    if not base_image or base_image.store_id != store_id:
        raise HTTPException(status_code=404, detail="Base image not found")

    base_image.is_active = payload.is_active
    session.add(base_image)
    session.commit()
    session.refresh(base_image)
    return _as_base_image_read(base_image)


@app.post(
    "/api/stores/{store_id}/base-images/generate",
    response_model=BaseImageRead,
)
def generate_base_image(
    store_id: int,
    background_tasks: BackgroundTasks,
    session=Depends(get_session),
):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    store_info = {
        "name": store.name,
        "genre": store.genre or "",
        "photo_description": "",
        "menu_description": store.menu_description or "",
        "description": store.description or "",
    }

    base_image = BaseImage(
        store_id=store_id,
        image_url="",
        segments=None,
        generation_input={
            "store_id": store.id,
            "name": store.name,
            "genre": store.genre,
            "menu_description": store.menu_description,
            "description": store.description,
            "created_at": store.created_at.isoformat(),
            "updated_at": store.updated_at.isoformat(),
        },
        is_active=False,
    )
    session.add(base_image)
    session.commit()
    session.refresh(base_image)

    background_tasks.add_task(run_pipeline, base_image.id, store_info)

    return _as_base_image_read(base_image)


@app.post("/api/stores/{store_id}/play")
def play(store_id: int, session=Depends(get_session)):
    store = session.get(Store, store_id)
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    statement = select(BaseImage).where(
        BaseImage.store_id == store_id, BaseImage.is_active == True
    )
    active_images: List[BaseImage] = session.exec(statement).all()
    if not active_images:
        raise HTTPException(status_code=404, detail="No active base images")

    selected: BaseImage = choice(active_images)
    segments = selected.segments or {}

    return {
        "store_name": store.name,
        "original_image_url": selected.image_url,
        "modified_image_url": segments.get("modified_image_url", ""),
        "differences": segments.get("differences", []),
        "store_info": {
            "genre": store.genre,
            "recommendation": store.menu_description or "",
            "description": store.description,
        },
    }
