"""シードデータ投入スクリプト

image-pipeline の出力を使って、store + base_image をDBに登録する。
usage: uv run python seed.py
"""

import json
import shutil
from pathlib import Path

from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import BaseImage, Store

PIPELINE_OUTPUT = Path.home() / "marguerite_spec" / "image-pipeline" / "output"
STATIC_IMAGES = Path(__file__).resolve().parent / "static" / "images"

# image-pipeline/seeds/stores.json から店舗情報を読む
SEEDS_PATH = Path.home() / "marguerite_spec" / "image-pipeline" / "seeds" / "stores.json"

# 投入対象の store index (pipeline の store_N に対応)
SEED_STORES = [1]


def bbox_to_circle(bbox: dict, w: int, h: int) -> dict:
    """bbox (px) → cx, cy, radius (%) に変換"""
    cx = (bbox["x"] + bbox["w"] / 2) / w * 100
    cy = (bbox["y"] + bbox["h"] / 2) / h * 100
    radius = max(bbox["w"], bbox["h"]) / 2 / max(w, h) * 100
    return {"cx": round(cx, 1), "cy": round(cy, 1), "radius": round(radius, 1)}


def seed_store(session: Session, store_index: int, store_info: dict):
    """1店舗分のシードデータを投入"""
    store_dir = PIPELINE_OUTPUT / f"store_{store_index}"
    if not store_dir.exists():
        print(f"  SKIP: {store_dir} not found")
        return

    # diffs.json 読み込み
    diffs_path = store_dir / "diffs.json"
    if not diffs_path.exists():
        print(f"  SKIP: {diffs_path} not found")
        return
    diffs_data = json.loads(diffs_path.read_text())

    # 画像をstaticにコピー
    dest_dir = STATIC_IMAGES / f"store_{store_index}"
    dest_dir.mkdir(parents=True, exist_ok=True)

    orig_name = diffs_data["original"]
    shutil.copy2(store_dir / orig_name, dest_dir / "original.png")
    shutil.copy2(store_dir / "modified.png", dest_dir / "modified.png")

    # bbox → circle 変換
    img_w = diffs_data["image_size"]["w"]
    img_h = diffs_data["image_size"]["h"]
    differences = []
    for d in diffs_data["diffs"]:
        circle = bbox_to_circle(d["bbox"], img_w, img_h)
        differences.append(circle)

    # Store 作成
    store = Store(
        name=store_info["name"],
        genre=store_info["genre"],
        menu_description=store_info["menu_description"],
        description=store_info["description"],
    )
    session.add(store)
    session.flush()  # id を確定

    # BaseImage 作成
    base_image = BaseImage(
        store_id=store.id,
        image_url=f"/static/images/store_{store_index}/original.png",
        segments={
            "modified_image_url": f"/static/images/store_{store_index}/modified.png",
            "image_size": diffs_data["image_size"],
            "differences": differences,
            "diffs_detail": diffs_data["diffs"],
        },
        generation_input={
            "name": store_info["name"],
            "genre": store_info["genre"],
            "menu_description": store_info["menu_description"],
            "description": store_info["description"],
        },
        is_active=True,
    )
    session.add(base_image)
    session.commit()

    print(f"  Store #{store.id}: {store.name}")
    print(f"  BaseImage: {base_image.id} (active)")
    print(f"  Differences: {len(differences)}")


def main():
    create_db_and_tables()

    with open(SEEDS_PATH) as f:
        stores = json.load(f)

    with Session(engine) as session:
        # 既存データがあればスキップ
        existing = session.exec(select(Store)).all()
        if existing:
            print(f"DB already has {len(existing)} stores. Delete database.db to re-seed.")
            return

        for idx in SEED_STORES:
            print(f"\n=== Store {idx} ===")
            seed_store(session, idx, stores[idx])

    print("\nSeed complete.")


if __name__ == "__main__":
    main()
