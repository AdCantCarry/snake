import os
import json
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(BASE_DIR, "data", "snake_data.json")
SCORES_FILE = os.path.join(BASE_DIR, "data", "scores.json")

def load_snake_config():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"skins": []}

def load_scores_data():
    if os.path.exists(SCORES_FILE):
        with open(SCORES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

def save_scores_data(data):
    os.makedirs(os.path.dirname(SCORES_FILE), exist_ok=True)
    with open(SCORES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route("/")
def index():
    """Trang duy nhất chứa Game Rắn Săn Mồi Đỉnh Cao 2026"""
    return render_template("index.html")

@app.route("/api/config", methods=["GET"])
def get_config():
    return jsonify({"status": "success", "config": load_snake_config()})

@app.route("/api/scores", methods=["GET", "POST"])
def handle_scores():
    scores_db = load_scores_data()
    if not isinstance(scores_db, list):
        scores_db = []

    if request.method == "POST":
        payload = request.get_json() or {}
        player_name = str(payload.get("player", "ProGamer")).strip()[:15]
        score = int(payload.get("score", 0))

        scores_db.append({
            "player": player_name,
            "score": score,
            "date": "Hôm nay"
        })

        scores_db = sorted(scores_db, key=lambda x: x["score"], reverse=True)[:10]
        save_scores_data(scores_db)

        return jsonify({"status": "success", "message": "Đã ghi danh Kỷ lục Điểm cao!", "scores": scores_db})

    return jsonify({"status": "success", "scores": scores_db})

if __name__ == "__main__":
    print("STARTING: Ultimate Snake Cyber 2026 Server running on http://127.0.0.1:5000 ...")
    app.run(host="0.0.0.0", port=5000, debug=True)
