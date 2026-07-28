"""
retrain_best_model.py — Huấn luyện lại mô hình từ DỮ LIỆU THỰC + Kaggle

Nguồn dữ liệu:
1. Dữ liệu Kaggle gốc (kaggle_demo_sync_from_data_csv.csv) — base dataset
2. Dữ liệu thực từ Database (student_academic_records + students) — dữ liệu mới

Khi dữ liệu sinh viên thay đổi (import mới, cập nhật GPA...) → retrain có ý nghĩa thực sự.
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from pathlib import Path
import json
from datetime import datetime
import warnings
import os

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
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore")

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "processed" / "kaggle_demo_sync_from_data_csv.csv"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
REPORTS_DIR = BASE_DIR / "reports"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# 9 feature columns chuẩn AI v1
FEATURE_COLUMNS = [
    "gender",
    "age_at_enrollment",
    "gpa",
    "tuition_debt",
    "scholarship",
    "failed_subjects",
    "credits_enrolled",
    "credits_passed",
    "warning_level"
]


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


def load_kaggle_data():
    """Tải dữ liệu Kaggle gốc"""
    if not DATA_FILE.exists():
        print("[WARN] Không tìm thấy file Kaggle, bỏ qua")
        return pd.DataFrame()

    df = pd.read_csv(DATA_FILE)
    print(f"[INFO] Kaggle data: {df.shape[0]} dòng")

    drop_cols = []
    if "source_target" in df.columns:
        drop_cols.append("source_target")

    feature_cols = [c for c in FEATURE_COLUMNS if c in df.columns]
    if "target_binary" not in df.columns:
        print("[WARN] Kaggle data thiếu cột target_binary")
        return pd.DataFrame()

    result = df[feature_cols + ["target_binary"]].copy()
    result["data_source"] = "kaggle"
    return result


def load_db_data():
    """Tải dữ liệu thực từ database (student_academic_records + students)"""
    try:
        import mysql.connector
        from dotenv import load_dotenv

        # Load .env từ thư mục backend
        env_path = BASE_DIR.parent / "backend" / ".env"
        if env_path.exists():
            load_dotenv(env_path)

        db_config = {
            "host": os.getenv("DB_HOST", "localhost"),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", ""),
            "database": os.getenv("DB_NAME", "student_risk_db"),
            "charset": "utf8mb4",
            "use_unicode": True
        }

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Truy vấn: lấy academic records kết hợp thông tin sinh viên
        # target_binary: Dropout = 1, còn lại (Enrolled, Graduated) = 0
        query = """
            SELECT
                CASE WHEN s.gender = 'Male' THEN 1 ELSE 0 END AS gender,
                COALESCE(s.age_at_enrollment, 18) AS age_at_enrollment,
                COALESCE(sar.gpa, 0) AS gpa,
                COALESCE(sar.tuition_debt, 0) AS tuition_debt,
                COALESCE(sar.scholarship, 0) AS scholarship,
                COALESCE(sar.failed_subjects, 0) AS failed_subjects,
                COALESCE(sar.credits_enrolled, 0) AS credits_enrolled,
                COALESCE(sar.credits_passed, 0) AS credits_passed,
                COALESCE(sar.warning_level, 0) AS warning_level,
                CASE
                    WHEN s.actual_status = 'Dropout' THEN 1
                    ELSE 0
                END AS target_binary
            FROM student_academic_records sar
            INNER JOIN students s ON sar.student_id = s.id
            WHERE s.actual_status IS NOT NULL
              AND s.actual_status != ''
        """

        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        if not rows:
            print("[INFO] Database không có dữ liệu academic records")
            return pd.DataFrame()

        df = pd.DataFrame(rows)
        # Đảm bảo tất cả cột numeric
        for col in FEATURE_COLUMNS:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        df["target_binary"] = df["target_binary"].astype(int)
        df["data_source"] = "database"

        print(f"[INFO] Database data: {df.shape[0]} dòng (Dropout={int(df['target_binary'].sum())}, Not={int((df['target_binary']==0).sum())})")
        return df

    except ImportError:
        print("[WARN] mysql-connector-python chưa được cài đặt, bỏ qua dữ liệu DB")
        return pd.DataFrame()
    except Exception as e:
        print(f"[WARN] Không thể kết nối database: {e}")
        return pd.DataFrame()


def main():
    print("===== RETRAIN MODEL - START =====")
    print(f"[INFO] Thời gian: {datetime.now()}")

    # 1. Tải dữ liệu từ cả 2 nguồn
    print("\n[STEP 1] Tải dữ liệu từ Kaggle + Database...")
    kaggle_df = load_kaggle_data()
    db_df = load_db_data()

    # Kết hợp 2 nguồn
    dfs_to_concat = []
    if not kaggle_df.empty:
        dfs_to_concat.append(kaggle_df)
    if not db_df.empty:
        dfs_to_concat.append(db_df)

    if not dfs_to_concat:
        raise ValueError("Không có dữ liệu nào để huấn luyện (cả Kaggle lẫn Database đều trống)")

    combined_df = pd.concat(dfs_to_concat, ignore_index=True)

    # Thống kê nguồn dữ liệu
    source_counts = combined_df["data_source"].value_counts().to_dict()
    print(f"[INFO] Tổng dữ liệu: {len(combined_df)} dòng")
    for src, cnt in source_counts.items():
        print(f"  - {src}: {cnt} dòng")

    # Lấy features và target
    feature_cols = [c for c in FEATURE_COLUMNS if c in combined_df.columns]
    X = combined_df[feature_cols].copy()
    y = combined_df["target_binary"].astype(int)

    print(f"\n[STEP 2] Features: {feature_cols}")
    print(f"[INFO] Target distribution: 0={int((y==0).sum())}, 1={int((y==1).sum())}")

    # 2. Split train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.3,
        random_state=42,
        stratify=y
    )
    print(f"[INFO] Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")

    # 3. Build pipeline
    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ]
    )

    preprocess = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, feature_cols)
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

    # 4. Cross-validation
    print("\n[STEP 3] Cross-validation (K=5)...")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=skf, scoring="f1")
    print(f"[INFO] CV F1: {np.mean(cv_scores):.4f} ± {np.std(cv_scores):.4f}")

    # 5. Train
    print("\n[STEP 4] Huấn luyện mô hình...")
    pipeline.fit(X_train, y_train)

    # 6. Evaluate
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        "model_name": "LogisticRegression",
        "data_sources": source_counts,
        "total_samples": len(combined_df),
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1_score": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_proba)),
        "cv_f1_mean": float(np.mean(cv_scores)),
        "cv_f1_std": float(np.std(cv_scores))
    }

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    metrics["false_negative"] = int(fn)
    metrics["false_positive"] = int(fp)
    metrics["false_negative_rate"] = float(fn / (fn + tp)) if (fn + tp) > 0 else 0.0

    print("\n[STEP 5] Metrics:")
    print(json.dumps(metrics, ensure_ascii=False, indent=2))

    # 7. Save artifacts
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    version_label = f"logistic_regression_{timestamp}"

    # Lưu model mới làm best_model.pkl (thay thế model cũ)
    best_model_path = ARTIFACTS_DIR / "best_model.pkl"
    best_meta_path = ARTIFACTS_DIR / "best_model_metadata.json"

    model_path = ARTIFACTS_DIR / f"{version_label}.pkl"
    metadata_path = ARTIFACTS_DIR / f"{version_label}_metadata.json"
    metrics_path = REPORTS_DIR / f"{version_label}_metrics.json"
    cm_path = REPORTS_DIR / f"{version_label}_confusion_matrix.png"
    best_metrics_path = REPORTS_DIR / "best_model_metrics.json"

    joblib.dump(pipeline, model_path)
    joblib.dump(pipeline, best_model_path)  # Cập nhật best_model

    metadata = {
        "best_model_name": "LogisticRegression",
        "version_label": version_label,
        "feature_columns": feature_cols,
        "target_column": "target_binary",
        "trained_at": datetime.now().isoformat(),
        "data_sources": source_counts,
        "total_samples": len(combined_df),
        "positive_class_definition": "1 = dropout, 0 = not_dropout"
    }

    save_json(metadata, metadata_path)
    save_json(metadata, best_meta_path)  # Cập nhật best_model_metadata
    save_json(metrics, metrics_path)
    save_json(metrics, best_metrics_path)  # Cập nhật best_model_metrics
    plot_confusion_matrix(cm, cm_path, f"Retrain Model - {version_label}")

    output = {
        "success": True,
        "version_label": version_label,
        "model_path": str(model_path),
        "metadata_path": str(metadata_path),
        "metrics_path": str(metrics_path),
        "confusion_matrix_path": str(cm_path),
        "metrics": metrics,
        "data_sources": source_counts,
        "total_samples": len(combined_df)
    }

    print("\n===== RETRAIN MODEL - COMPLETED =====")
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()