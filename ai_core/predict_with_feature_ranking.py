from pathlib import Path
import json
import sys

import joblib
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "artifacts" / "best_model.pkl"
METADATA_PATH = BASE_DIR / "artifacts" / "best_model_metadata.json"
METRICS_PATH = BASE_DIR / "reports" / "best_model_metrics.json"
SAMPLE_INPUT_PATH = BASE_DIR / "reports" / "sample_predict_input.json"



def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))



def get_risk_level(probability: float) -> str:
    if probability >= 0.70:
        return "Danger"
    if probability >= 0.40:
        return "Warning"
    return "Safe"



def to_single_record(payload):
    if isinstance(payload, list):
        if not payload:
            raise ValueError("Input list is empty")
        return payload[0]
    if isinstance(payload, dict):
        return payload
    raise ValueError("Input must be a JSON object or non-empty JSON array")



def build_feature_importance(model, feature_columns):
    model_step = model
    if hasattr(model, "named_steps") and "model" in model.named_steps:
        model_step = model.named_steps["model"]

    importances = None
    if hasattr(model_step, "coef_"):
        coef = np.asarray(model_step.coef_)
        if coef.ndim == 2 and coef.shape[0] >= 1:
            importances = np.abs(coef[0])
    elif hasattr(model_step, "feature_importances_"):
        importances = np.asarray(model_step.feature_importances_)

    if importances is None or len(importances) != len(feature_columns):
        # Fallback: equal weight when importance is not available
        importances = np.ones(len(feature_columns), dtype=float)

    total = float(np.sum(importances))
    if total <= 0:
        normalized = np.ones(len(importances), dtype=float) / max(1, len(importances))
    else:
        normalized = importances / total

    ranking = [
        {
            "feature": feature_columns[i],
            "importance": float(importances[i]),
            "importance_pct": round(float(normalized[i] * 100), 2),
        }
        for i in range(len(feature_columns))
    ]
    ranking.sort(key=lambda x: x["importance"], reverse=True)
    return ranking



def estimate_probability_error(cv_f1_std, weighted_coverage, extra_feature_count):
    # Heuristic uncertainty bound for live demo scenarios.
    base = max(0.02, min(0.10, float(cv_f1_std) * 1.5))
    missing_penalty = (1.0 - weighted_coverage) * 0.25
    extra_penalty = min(extra_feature_count * 0.005, 0.03)
    error = base + missing_penalty + extra_penalty
    return float(min(0.35, max(0.03, error)))



def main():
    if not MODEL_PATH.exists() or not METADATA_PATH.exists():
        raise FileNotFoundError("Model artifacts are missing. Train model first.")

    model = joblib.load(MODEL_PATH)
    metadata = load_json(METADATA_PATH)
    metrics = load_json(METRICS_PATH) if METRICS_PATH.exists() else {}

    feature_columns = metadata.get("feature_columns", [])
    if not feature_columns:
        raise ValueError("feature_columns not found in metadata")

    if len(sys.argv) > 1:
        input_path = Path(sys.argv[1])
        if not input_path.exists():
            raise FileNotFoundError(f"Input file not found: {input_path}")
        payload = load_json(input_path)
    else:
        payload = load_json(SAMPLE_INPUT_PATH)

    row = to_single_record(payload)

    input_columns = set(row.keys())
    trained_columns = set(feature_columns)

    extra_features = sorted(list(input_columns - trained_columns))
    missing_features = sorted([col for col in feature_columns if col not in row or pd.isna(row.get(col))])
    provided_features = [col for col in feature_columns if col in row and not pd.isna(row.get(col))]

    ranking = build_feature_importance(model, feature_columns)
    importance_lookup = {item["feature"]: item["importance"] for item in ranking}
    total_importance = sum(importance_lookup.values()) or 1.0
    covered_importance = sum(importance_lookup.get(col, 0.0) for col in provided_features)
    weighted_coverage = float(covered_importance / total_importance)

    input_df = pd.DataFrame([row])
    for col in feature_columns:
        if col not in input_df.columns:
            input_df[col] = None
    input_df = input_df[feature_columns]

    prediction = int(model.predict(input_df)[0])
    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(input_df)[0][1])
    else:
        probability = float(prediction)

    cv_f1_std = float(metrics.get("cv_f1_std", 0.03))
    approx_error = estimate_probability_error(cv_f1_std, weighted_coverage, len(extra_features))

    result = {
        "prediction": prediction,
        "dropout_probability": round(probability, 4),
        "risk_level": get_risk_level(probability),
        "approximation": {
            "probability_interval": [
                round(max(0.0, probability - approx_error), 4),
                round(min(1.0, probability + approx_error), 4),
            ],
            "estimated_error": round(approx_error, 4),
            "confidence_score": round(max(0.0, 1.0 - approx_error), 4),
            "feature_coverage_ratio": round(len(provided_features) / len(feature_columns), 4),
            "weighted_coverage_ratio": round(weighted_coverage, 4),
        },
        "feature_diagnostics": {
            "trained_feature_count": len(feature_columns),
            "provided_feature_count": len(provided_features),
            "missing_features": missing_features,
            "extra_features_ignored": extra_features,
            "top_important_features": ranking[: min(10, len(ranking))],
        },
        "notes": [
            "Model keeps original training schema; unknown input features are ignored.",
            "Missing trained features are imputed by the model preprocessing pipeline.",
            "estimated_error is a heuristic for live-demo uncertainty, not retraining-equivalent error.",
        ],
    }

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
