"""
train_demo_sync.py - Train model on demo dataset from database

This script:
1. Loads training data from database view (vw_demo_train_reduced_sync)
2. Trains LogisticRegression model (best model from arena comparison)
3. Saves trained model and metrics to artifacts/reports
4. Returns model info and metrics as JSON
"""

from pathlib import Path
import json
import warnings
from datetime import datetime

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import mysql.connector
from mysql.connector import Error

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

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
REPORTS_DIR = BASE_DIR / "reports"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Database configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "student_risk_db",
    "charset": "utf8mb4",
    "use_unicode": True
}

def save_json(data, file_path: Path):
    """Save data to JSON file with numpy type handling"""
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
    """Plot and save confusion matrix"""
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


def load_data_from_db():
    """Load training data from database view"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)

        # Lấy dữ liệu từ view training
        query = """
            SELECT *
            FROM vw_demo_train_reduced_sync
            WHERE target_binary IS NOT NULL
        """

        cursor.execute(query)
        rows = cursor.fetchall()

        cursor.close()
        connection.close()

        if not rows:
            raise ValueError("Không có dữ liệu từ database")

        # Chuyển sang DataFrame
        df = pd.DataFrame(rows)
        print(f"[INFO] Tải từ database: {df.shape[0]} dòng, {df.shape[1]} cột")

        return df

    except Error as e:
        print(f"[ERROR] Lỗi kết nối database: {e}")
        raise


def build_preprocessor(feature_columns):
    """Build sklearn preprocessor pipeline"""
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
    """Build full sklearn pipeline with preprocessing and model"""
    preprocess = build_preprocessor(feature_columns)
    return Pipeline(
        steps=[
            ("preprocess", preprocess),
            ("model", model)
        ]
    )


def main():
    """Main training function"""
    try:
        print("===== TRAIN DEMO SYNC - START =====")
        print(f"[INFO] Thời gian bắt đầu: {datetime.now()}")

        # 1. Load dữ liệu từ database
        print("\n[STEP 1] Tải dữ liệu từ database...")
        df = load_data_from_db()
        print(f"[INFO] Kích thước dữ liệu: {df.shape}")
        print(f"[INFO] Các cột: {df.columns.tolist()}")

        # Kiểm tra cột target
        if "target_binary" not in df.columns:
            raise ValueError("Không tìm thấy cột 'target_binary' trong dữ liệu")

        # 2. Chuẩn bị features và target
        print("\n[STEP 2] Chuẩn bị features và target...")
        drop_cols = []
        if "source_target" in df.columns:
            drop_cols.append("source_target")
        if "id" in df.columns:
            drop_cols.append("id")

        X = df.drop(columns=drop_cols + ["target_binary"], errors="ignore")
        y = df["target_binary"].astype(int)

        feature_columns = X.columns.tolist()

        print(f"[INFO] Số features: {len(feature_columns)}")
        print("[INFO] Feature list:")
        for col in feature_columns:
            print(f"  - {col}")

        # 3. Split train-test
        print("\n[STEP 3] Chia dữ liệu train/test (80/20)...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=0.2,
            random_state=42,
            stratify=y
        )
        print(f"[INFO] Train: {X_train.shape[0]} mẫu, Test: {X_test.shape[0]} mẫu")

        # 4. Xây dựng mô hình LogisticRegression (best model từ arena)
        print("\n[STEP 4] Xây dựng mô hình LogisticRegression...")
        model = LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            solver="liblinear",
            random_state=42
        )

        # 5. Cross-validation để kiểm tra độ ổn định
        print("\n[STEP 5] Thực hiện Stratified K-Fold Cross-Validation (k=5)...")
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(
            build_pipeline(model, feature_columns),
            X_train,
            y_train,
            cv=skf,
            scoring="f1"
        )
        print(f"[INFO] CV F1-score: {np.mean(cv_scores):.4f} ± {np.std(cv_scores):.4f}")

        # 6. Huấn luyện mô hình
        print("\n[STEP 6] Huấn luyện mô hình...")
        pipeline = build_pipeline(model, feature_columns)
        pipeline.fit(X_train, y_train)
        print("[INFO] Hoàn thành huấn luyện")

        # 7. Dự đoán và tính metrics
        print("\n[STEP 7] Tính toán metrics...")
        y_pred = pipeline.predict(X_test)
        y_proba = pipeline.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_proba)

        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel()
        false_negative_rate = fn / (fn + tp) if (fn + tp) > 0 else 0

        metrics = {
            "model_name": "LogisticRegression",
            "cv_f1_mean": float(np.mean(cv_scores)),
            "cv_f1_std": float(np.std(cv_scores)),
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc),
            "false_negative": int(fn),
            "false_positive": int(fp),
            "false_negative_rate": float(false_negative_rate),
            "confusion_matrix": cm.tolist()
        }

        print(json.dumps(metrics, ensure_ascii=False, indent=2))

        # 8. Lưu mô hình và artifacts
        print("\n[STEP 8] Lưu artifacts...")
        
        # Tạo version label
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        version_label = f"LogisticRegression_demo_{timestamp}"

        # Lưu model
        model_path = ARTIFACTS_DIR / f"demo_model_{timestamp}.pkl"
        joblib.dump(pipeline, model_path)
        print(f"[SAVED] Model: {model_path}")

        # Lưu metrics
        metrics_path = REPORTS_DIR / f"demo_model_metrics_{timestamp}.json"
        save_json(metrics, metrics_path)
        print(f"[SAVED] Metrics: {metrics_path}")

        # Lưu confusion matrix
        cm_path = REPORTS_DIR / f"demo_model_confusion_matrix_{timestamp}.png"
        plot_confusion_matrix(cm, cm_path, f"Demo Model - LogisticRegression")
        print(f"[SAVED] Confusion Matrix: {cm_path}")

        # Lưu metadata
        metadata = {
            "best_model_name": "LogisticRegression",
            "feature_columns": feature_columns,
            "target_column": "target_binary",
            "version_label": version_label,
            "trained_at": datetime.now().isoformat(),
            "data_source": "vw_demo_train_reduced_sync",
            "train_samples": int(X_train.shape[0]),
            "test_samples": int(X_test.shape[0])
        }

        metadata_path = ARTIFACTS_DIR / f"demo_model_metadata_{timestamp}.json"
        save_json(metadata, metadata_path)
        print(f"[SAVED] Metadata: {metadata_path}")

        # Lưu ROC curve data
        fpr, tpr, thresholds = roc_curve(y_test, y_proba)
        roc_data = {
            "fpr": fpr.tolist(),
            "tpr": tpr.tolist(),
            "thresholds": thresholds.tolist()
        }
        roc_path = REPORTS_DIR / f"demo_model_roc_data_{timestamp}.json"
        save_json(roc_data, roc_path)
        print(f"[SAVED] ROC Data: {roc_path}")

        # 9. Output result
        result = {
            "success": True,
            "message": "Huấn luyện mô hình demo thành công",
            "version_label": version_label,
            "model_path": str(model_path),
            "metrics": metrics,
            "feature_columns": feature_columns,
            "train_samples": int(X_train.shape[0]),
            "test_samples": int(X_test.shape[0]),
            "timestamp": datetime.now().isoformat()
        }

        print("\n===== TRAIN DEMO SYNC - COMPLETED =====")
        print(json.dumps(result, ensure_ascii=False, indent=2))

        # In JSON để backend có thể parse
        print("\n[JSON_OUTPUT]")
        print(json.dumps(result, ensure_ascii=False))

        return result

    except Exception as e:
        error_result = {
            "success": False,
            "message": f"Lỗi khi huấn luyện mô hình: {str(e)}",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
        print("\n===== TRAIN DEMO SYNC - FAILED =====")
        print(json.dumps(error_result, ensure_ascii=False, indent=2))
        print("\n[JSON_OUTPUT]")
        print(json.dumps(error_result, ensure_ascii=False))
        raise


if __name__ == "__main__":
    main()
