from pathlib import Path
import argparse
import json
import re
import subprocess
import sys
import unicodedata

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = BASE_DIR / "reports" / "sample_predict_input_approx.json"
SCRIPT_PATH = BASE_DIR / "predict_with_feature_ranking.py"

FEATURE_KEY_ALIASES = {
    "gender": ["gender", "gioi_tinh", "gioitinh", "phai", "sex"],
    "age_at_enrollment": ["age_at_enrollment", "age", "tuoi_nhap_hoc", "tuoinhaphoc", "tuoi_vao_hoc", "tuoivaohoc"],
    "gpa": ["gpa", "diem_trung_binh", "diemtrungbinh", "diem_tb", "diemtb"],
    "tuition_debt": ["tuition_debt", "no_hoc_phi", "nohocphi", "hoc_phi_no", "hocphino"],
    "scholarship": ["scholarship", "hoc_bong", "hocbong"],
    "failed_subjects": ["failed_subjects", "so_mon_truot", "somontruot", "mon_truot", "montruot"],
    "credits_enrolled": ["credits_enrolled", "tin_chi_dang_ky", "tinchidangky", "so_tin_chi_dang_ky", "sotinchidangky"],
    "credits_passed": ["credits_passed", "tin_chi_dat", "tinchidat", "so_tin_chi_dat", "sotinchidat"],
    "warning_level": ["warning_level", "muc_canh_bao", "muccanhbao", "canh_bao", "canhbao"],
}

def normalize_feature_token(value: str) -> str:
    text = str(value or "").lower()
    text = unicodedata.normalize("NFD", text)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return re.sub(r"[^a-z0-9]", "", text)


FEATURE_ALIAS_INDEX = {}
for canonical, aliases in FEATURE_KEY_ALIASES.items():
    for alias in aliases:
        FEATURE_ALIAS_INDEX[normalize_feature_token(alias)] = canonical


def normalize_record(record: dict) -> dict:
    normalized = {}
    for raw_key, value in record.items():
        token = normalize_feature_token(raw_key)
        mapped_key = FEATURE_ALIAS_INDEX.get(token, raw_key)
        if mapped_key not in normalized:
            normalized[mapped_key] = value
    return normalized


def normalize_payload(payload):
    if isinstance(payload, list):
        return [normalize_record(item) if isinstance(item, dict) else item for item in payload]
    if isinstance(payload, dict):
        return normalize_record(payload)
    return payload


def parse_value(raw: str):
    value = raw.strip()
    if value.lower() in ("true", "false"):
        return value.lower() == "true"
    try:
        if "." in value:
            return float(value)
        return int(value)
    except ValueError:
        return value


def apply_overrides(payload, overrides):
    if not overrides:
        return payload
    if isinstance(payload, list):
        if not payload:
            payload.append({})
        if not isinstance(payload[0], dict):
            raise SystemExit("Payload list must contain a JSON object")
        payload[0].update(overrides)
        return payload
    if isinstance(payload, dict):
        payload.update(overrides)
        return payload
    raise SystemExit("Payload must be a JSON object or list")


def run_prediction(payload):
    reports_dir = BASE_DIR / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)
    temp_input_path = reports_dir / "temp_predict_input_demo.json"

    normalized_payload = normalize_payload(payload)
    temp_input_path.write_text(
        json.dumps(normalized_payload, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    result = subprocess.run(
        [sys.executable, str(SCRIPT_PATH), str(temp_input_path)],
        cwd=str(BASE_DIR),
        text=True,
        capture_output=True
    )

    if result.returncode != 0:
        print(result.stderr or "Unknown error", file=sys.stderr)
        return result.returncode

    print(result.stdout.strip())
    return 0


def interactive_session(initial_payload):
    if isinstance(initial_payload, list):
        payload = initial_payload[0] if initial_payload else {}
    elif isinstance(initial_payload, dict):
        payload = dict(initial_payload)
    else:
        payload = {}

    print("Interactive approx demo. Type 'help' for commands.")
    while True:
        try:
            command = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not command:
            continue
        if command in {"exit", "quit", "q"}:
            break
        if command in {"help", "?"}:
            print("Commands:")
            print("  show                 Show current payload")
            print("  set key value         Set a field")
            print("  set key=value         Set a field")
            print("  del key               Remove a field")
            print("  run                  Run prediction")
            print("  reset                Reset to original payload")
            print("  exit                 Quit")
            continue
        if command == "show":
            print(json.dumps(payload, ensure_ascii=False, indent=2))
            continue
        if command == "reset":
            if isinstance(initial_payload, dict):
                payload = dict(initial_payload)
            elif isinstance(initial_payload, list) and initial_payload:
                payload = dict(initial_payload[0])
            else:
                payload = {}
            print("Reset payload.")
            continue
        if command == "run":
            code = run_prediction(payload)
            if code != 0:
                print("Prediction failed.")
            continue
        if command.startswith("set "):
            raw = command[4:].strip()
            if "=" in raw:
                key, raw_value = raw.split("=", 1)
            else:
                parts = raw.split(maxsplit=1)
                if len(parts) != 2:
                    print("Usage: set key value")
                    continue
                key, raw_value = parts
            payload[key.strip()] = parse_value(raw_value)
            continue
        if command.startswith("del "):
            key = command[4:].strip()
            if not key:
                print("Usage: del key")
                continue
            payload.pop(key, None)
            continue

        print("Unknown command. Type 'help' for usage.")


def main() -> None:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("file", nargs="?")
    parser.add_argument("--set", dest="sets", nargs="*", default=[])
    parser.add_argument("--interactive", action="store_true")
    args = parser.parse_args()

    input_path = Path(args.file) if args.file else DEFAULT_INPUT
    if not input_path.exists():
        raise SystemExit(f"Input file not found: {input_path}")
    if not SCRIPT_PATH.exists():
        raise SystemExit(f"Script not found: {SCRIPT_PATH}")

    payload = json.loads(input_path.read_text(encoding="utf-8-sig"))

    overrides = {}
    for item in args.sets:
        if "=" not in item:
            raise SystemExit(f"Invalid --set value: {item}")
        key, raw_value = item.split("=", 1)
        overrides[key.strip()] = parse_value(raw_value)

    payload = apply_overrides(payload, overrides)

    if args.interactive:
        interactive_session(payload)
        return

    code = run_prediction(payload)
    if code != 0:
        raise SystemExit(code)


if __name__ == "__main__":
    main()
