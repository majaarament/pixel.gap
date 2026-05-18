from pathlib import Path

PACKAGE_DIR = Path(__file__).parent
DATA_DIR = PACKAGE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

PILLARS = ["env", "people", "conduct", "chain"]

GAP_I_WEIGHTS = {
    "gap_weight": 0.7,
    "visibility_weight": 0.3
}

RISK_TRIGGERS = [
    "afraid",
    "harassed", 
    "uncomfortable",
    "burnout",
    "ignored",
    "retaliation"
]

RISK_SENTIMENT_THRESHOLD = -0.4

N_CLUSTERS = 4
PCA_COMPONENTS = 2