from pathlib import Path
import json
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
    roc_auc_score,
    roc_curve
)
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

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

def build_preprocessor(feature_columns):
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
    return preprocess

def build_pipeline(model, feature_columns):
    preprocess = build_preprocessor(feature_columns)
    return Pipeline(
        steps=[
            ("preprocess", preprocess),
            ("model", model)
        ]
    )

def main():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Không tìm thấy file dữ liệu: {DATA_FILE}")

    df = pd.read_csv(DATA_FILE)
    print("[INFO] Kích thước dữ liệu:", df.shape)
    print("[INFO] Các cột:", df.columns.tolist())

    drop_cols = []
    if "source_target" in df.columns:
        drop_cols.append("source_target")

    X = df.drop(columns=drop_cols + ["target_binary"], errors="ignore")
    y = df["target_binary"].astype(int)

    feature_columns = X.columns.tolist()

    print("[INFO] Feature columns dùng cho AI v1:")
    for col in feature_columns:
        print(" -", col)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    models = {
        "LogisticRegression": LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            solver="liblinear",
            random_state=42
        ),
        "SVM": SVC(
            kernel="rbf",
            probability=True,
            class_weight="balanced",
            random_state=42
        ),
        "RandomForest": RandomForestClassifier(
            n_estimators=300,
            max_depth=8,
            class_weight="balanced",
            random_state=42
        ),
        "XGBoost": XGBClassifier(
            n_estimators=300,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.9,
            colsample_bytree=0.9,
            objective="binary:logistic",
            eval_metric="logloss",
            random_state=42
        )
    }

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    all_results = []
    best_pipeline = None
    best_model_name = None
    best_metrics = None
    best_cm = None
    best_score = -1

    for model_name, model in models.items():
        print(f"\n[INFO] Đang xử lý mô hình: {model_name}")

        pipeline = build_pipeline(model, feature_columns)

        # K-Fold Cross Validation để kiểm tra độ ổn định
        cv_scores = cross_val_score(
            pipeline,
            X_train,
            y_train,
            cv=skf,
            scoring="f1"
        )

        pipeline.fit(X_train, y_train)

        y_pred = pipeline.predict(X_test)
        y_proba = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else y_pred

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_proba)

        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()

        false_negative_rate = fn / (fn + tp) if (fn + tp) > 0 else 0

        metrics = {
            "model_name": model_name,
            "cv_f1_mean": float(np.mean(cv_scores)),
            "cv_f1_std": float(np.std(cv_scores)),
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc),
            "false_negative": int(fn),
            "false_positive": int(fp),
            "false_negative_rate": float(false_negative_rate)
        }

        print(json.dumps(metrics, ensure_ascii=False, indent=2))

        all_results.append(metrics)

        # Quy tắc chọn mô hình:
        # 1. FN rate thấp
        # 2. F1 cao
        # 3. ROC-AUC cao
        composite_score = (1 - false_negative_rate) * 0.5 + f1 * 0.3 + roc_auc * 0.2

        if composite_score > best_score:
            best_score = composite_score
            best_pipeline = pipeline
            best_model_name = model_name
            best_metrics = metrics
            best_cm = cm

        # Lưu confusion matrix riêng từng model
        cm_path = REPORTS_DIR / f"{model_name}_confusion_matrix.png"
        plot_confusion_matrix(cm, cm_path, f"Confusion Matrix - {model_name}")

        # Lưu ROC data
        fpr, tpr, thresholds = roc_curve(y_test, y_proba)
        roc_data = {
            "fpr": fpr.tolist(),
            "tpr": tpr.tolist(),
            "thresholds": thresholds.tolist()
        }
        save_json(roc_data, REPORTS_DIR / f"{model_name}_roc_data.json")

    results_df = pd.DataFrame(all_results).sort_values(
        by=["false_negative_rate", "f1_score", "roc_auc"],
        ascending=[True, False, False]
    )

    results_csv = REPORTS_DIR / "model_arena_cv_results.csv"
    best_model_path = ARTIFACTS_DIR / "best_model.pkl"
    best_meta_path = ARTIFACTS_DIR / "best_model_metadata.json"
    best_metrics_path = REPORTS_DIR / "best_model_metrics.json"
    best_cm_path = REPORTS_DIR / "best_model_confusion_matrix.png"

    results_df.to_csv(results_csv, index=False, encoding="utf-8-sig")
    joblib.dump(best_pipeline, best_model_path)

    metadata = {
        "best_model_name": best_model_name,
        "feature_columns": feature_columns,
        "target_column": "target_binary",
        "selection_rule": "Ưu tiên False Negative thấp, sau đó F1-score và ROC-AUC cao",
        "cross_validation": "Stratified K-Fold (k=5)"
    }

    save_json(metadata, best_meta_path)
    save_json(best_metrics, best_metrics_path)
    plot_confusion_matrix(best_cm, best_cm_path, f"Best Model - {best_model_name}")

    print("\n===== MODEL ARENA CV COMPLETED =====")
    print(results_df)
    print(f"\n[BEST MODEL] {best_model_name}")
    print(json.dumps(best_metrics, ensure_ascii=False, indent=2))
    print(f"[DONE] Results saved: {results_csv}")
    print(f"[DONE] Best model saved: {best_model_path}")
    print(f"[DONE] Metadata saved: {best_meta_path}")
    print(f"[DONE] Best metrics saved: {best_metrics_path}")
    print(f"[DONE] Best confusion matrix saved: {best_cm_path}")

if __name__ == "__main__":
    main()