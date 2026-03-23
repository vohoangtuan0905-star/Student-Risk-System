from pathlib import Path
import json
from datetime import datetime
import warnings

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "processed" / "kaggle_demo_sync_from_data_csv.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
REPORTS_DIR = BASE_DIR / "reports"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

def save_json(data, file_path: Path):
    def default_converter(obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, (np.ndarray,)):
            return obj.tolist()
        raise TypeError(f"Cannot serialize {type(obj)}")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=default_converter)

def plot_confusion_matrix(cm, output_path: Path, title: str):
    fig, ax = plt.subplots(figsize=(5, 4))
    im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
    plt.colorbar(im)

    labels = ["Không bỏ học (0)", "Bỏ học (1)"]
    ax.set(
        xticks=np.arange(len(labels)),
        yticks=np.arange(len(labels)),
        xticklabels=labels,
        yticklabels=labels,
        xlabel="Predicted",
        ylabel="Actual",
        title=title
    )

    thresh = cm.max() / 2 if cm.size else 0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(
                j, i, format(cm[i, j], "d"),
                ha="center", va="center",
                color="white" if cm[i, j] > thresh else "black"
            )

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()

def main():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Không tìm thấy dữ liệu retrain: {DATA_FILE}")

    df = pd.read_csv(DATA_FILE)

    drop_cols = []
    if "source_target" in df.columns:
        drop_cols.append("source_target")

    X = df.drop(columns=drop_cols + ["target_binary"], errors="ignore")
    y = df["target_binary"].astype(int)

    feature_columns = X.columns.tolist()

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ]
    )

    preprocess = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, feature_columns)
        ]
    )

    model = LogisticRegression(
        max_iter=2000,
        class_weight="balanced",
        solver="liblinear",
        random_state=42
    )

    pipeline = Pipeline(
        steps=[
            ("preprocess", preprocess),
            ("model", model)
        ]
    )

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        "model_name": "LogisticRegression",
        "dataset": DATA_FILE.name,
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_proba))
    }

    cm = confusion_matrix(y_test, y_pred)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    version_label = f"logistic_regression_{timestamp}"

    model_path = ARTIFACTS_DIR / f"{version_label}.pkl"
    metadata_path = ARTIFACTS_DIR / f"{version_label}_metadata.json"
    metrics_path = REPORTS_DIR / f"{version_label}_metrics.json"
    cm_path = REPORTS_DIR / f"{version_label}_confusion_matrix.png"

    joblib.dump(pipeline, model_path)

    metadata = {
        "version_label": version_label,
        "algorithm": "LogisticRegression",
        "feature_columns": feature_columns,
        "target_column": "target_binary",
        "trained_at": datetime.now().isoformat(),
        "positive_class_definition": "1 = dropout, 0 = not_dropout"
    }

    save_json(metadata, metadata_path)
    save_json(metrics, metrics_path)
    plot_confusion_matrix(cm, cm_path, f"Retrain Model - {version_label}")

    output = {
        "success": True,
        "version_label": version_label,
        "model_path": str(model_path),
        "metadata_path": str(metadata_path),
        "metrics_path": str(metrics_path),
        "confusion_matrix_path": str(cm_path),
        "metrics": metrics
    }

    print(json.dumps(output, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()