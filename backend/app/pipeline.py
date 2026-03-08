"""画像生成パイプラインの実行

image-pipeline のモジュールを呼び出して、
プロンプト生成 → 画像生成 → セグメント分割 → 間違い生成 を実行する。
"""

import json
import shutil
import sys
import traceback
from pathlib import Path

from dotenv import load_dotenv
from sqlmodel import Session

# .envを読み込み (OPENAI_API_KEY, GROQ_API_KEY)
_backend_env = Path(__file__).resolve().parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(_backend_env)

from app.database import engine
from app.models import BaseImage

# image-pipeline/src をインポートパスに追加
PIPELINE_SRC = Path.home() / "marguerite_spec" / "image-pipeline" / "src"
if str(PIPELINE_SRC) not in sys.path:
    sys.path.insert(0, str(PIPELINE_SRC))

STATIC_IMAGES = Path(__file__).resolve().parent.parent / "static" / "images"


def bbox_to_circle(bbox: dict, w: int, h: int) -> dict:
    cx = (bbox["x"] + bbox["w"] / 2) / w * 100
    cy = (bbox["y"] + bbox["h"] / 2) / h * 100
    radius = max(bbox["w"], bbox["h"]) / 2 / max(w, h) * 100
    return {"cx": round(cx, 1), "cy": round(cy, 1), "radius": round(radius, 1)}


def run_pipeline(base_image_id: str, store_info: dict):
    """バックグラウンドでパイプラインを実行し、結果をDBに反映する"""
    try:
        _run_pipeline_inner(base_image_id, store_info)
    except Exception:
        traceback.print_exc()
        # エラー時はDB更新してステータスを反映
        with Session(engine) as session:
            base_image = session.get(BaseImage, base_image_id)
            if base_image:
                base_image.segments = {"error": traceback.format_exc()}
                session.add(base_image)
                session.commit()


def _run_pipeline_inner(base_image_id: str, store_info: dict):
    from pathlib import Path as _Path
    import tempfile

    # 一時ディレクトリで作業
    work_dir = _Path(tempfile.mkdtemp(prefix="pipeline_"))
    print(f"[pipeline] Working in {work_dir}")

    try:
        # Step 0: プロンプト生成
        from prompt import generate_prompt
        prompt_text = generate_prompt(store_info)
        prompt_path = work_dir / "prompt.txt"
        prompt_path.write_text(prompt_text)
        print(f"[pipeline] Prompt generated: {prompt_text[:100]}...")

        # Step 1: 画像生成
        from generate_openai import generate
        image_path = work_dir / "base_openai.png"
        generate(prompt_text, image_path)
        print(f"[pipeline] Image generated: {image_path}")

        # Step 2: セグメント分割
        from segment_floodfill import segment
        segment(image_path, work_dir)
        print("[pipeline] Segmentation done")

        # Step 3-4: 間違い生成
        from inpaint_openai import generate_diffs
        generate_diffs(work_dir, count=3)
        print("[pipeline] Diffs generated")

        # 結果をstaticにコピー
        dest_dir = STATIC_IMAGES / base_image_id
        dest_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(work_dir / "base_openai.png", dest_dir / "original.png")
        shutil.copy2(work_dir / "modified.png", dest_dir / "modified.png")

        # diffs.json を読んで座標取得
        diffs_data = json.loads((work_dir / "diffs.json").read_text())
        differences = []
        for d in diffs_data["diffs"]:
            if "cx" in d:
                # 既にcx/cy/radius形式
                differences.append({"cx": d["cx"], "cy": d["cy"], "radius": d["radius"]})
            else:
                # bbox形式 → 変換
                img_w = diffs_data["image_size"]["w"]
                img_h = diffs_data["image_size"]["h"]
                differences.append(bbox_to_circle(d["bbox"], img_w, img_h))

        # DB更新
        with Session(engine) as session:
            base_image = session.get(BaseImage, base_image_id)
            if base_image:
                base_image.image_url = f"/static/images/{base_image_id}/original.png"
                base_image.segments = {
                    "modified_image_url": f"/static/images/{base_image_id}/modified.png",
                    "image_size": diffs_data["image_size"],
                    "differences": differences,
                    "diffs_detail": diffs_data["diffs"],
                }
                session.add(base_image)
                session.commit()

        print(f"[pipeline] Complete! base_image_id={base_image_id}")

    finally:
        # 一時ディレクトリの削除
        shutil.rmtree(work_dir, ignore_errors=True)
