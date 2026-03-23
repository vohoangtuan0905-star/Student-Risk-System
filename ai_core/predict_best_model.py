from pathlib import Path
import json
import sys

import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "artifacts" / "best_model.pkl"
METADATA_PATH = BASE_DIR / "artifacts" / "best_model_metadata.json"
SAMPLE_INPUT_PATH = BASE_DIR / "reports" / "sample_predict_input.json"
DEPLOY_INFO_PATH = BASE_DIR / "artifacts" / "deployed_model_info.json"

def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def save_json(data, path: Path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_risk_level(probability: float) -> str:
    if probability >= 0.70:
        return "Danger"
    if probability >= 0.40:
        return "Warning"
    return "Safe"

def build_output(prediction: int, probability: float):
    return {
        "prediction": int(prediction),
        "dropout_probability": round(float(probability), 4),
        "risk_level": get_risk_level(float(probability))
    }

def main():
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Không tìm thấy best_model.pkl. Hãy chạy model_arena_cv.py trước.")

    if not METADATA_PATH.exists():
        raise FileNotFoundError("Không tìm thấy best_model_metadata.json. Hãy chạy model_arena_cv.py trước.")

    model = joblib.load(MODEL_PATH)
    metadata = load_json(METADATA_PATH)

    feature_columns = metadata["feature_columns"]

    # Nhận input từ file JSON truyền vào, hoặc dùng sample mặc định
    if len(sys.argv) > 1:
        input_path = Path(sys.argv[1])
        if not input_path.exists():
            raise FileNotFoundError(f"Không tìm thấy file input: {input_path}")
        payload = load_json(input_path)
    else:
        if not SAMPLE_INPUT_PATH.exists():
            raise FileNotFoundError("Không có file input mẫu. Hãy tạo sample_predict_input.json trước.")
        payload = load_json(SAMPLE_INPUT_PATH)

    if isinstance(payload, dict):
        df = pd.DataFrame([payload])
    else:
        df = pd.DataFrame(payload)

    # Bổ sung cột thiếu bằng None
    for col in feature_columns:
        if col not in df.columns:
            df[col] = None

    # Chỉ giữ đúng cột AI v1
    df = df[feature_columns]

    prediction = model.predict(df)[0]

    if hasattr(model, "predict_proba"):
        probability = model.predict_proba(df)[0][1]
    else:
        probability = float(prediction)

    result = build_output(prediction, probability)
    print(json.dumps(result, ensure_ascii=False, indent=2))

    deploy_info = {
        "deployed_model_name": metadata.get("best_model_name", "Unknown"),
        "feature_columns": feature_columns,
        "output_schema": {
            "prediction": "0 hoặc 1",
            "dropout_probability": "xác suất bỏ học từ 0 đến 1",
            "risk_level": "Safe / Warning / Danger"
        },
        "risk_rule": {
            "Danger": "probability >= 0.70",
            "Warning": "0.40 <= probability < 0.70",
            "Safe": "probability < 0.40"
        }
    }
    save_json(deploy_info, DEPLOY_INFO_PATH)

if __name__ == "__main__":
    main()