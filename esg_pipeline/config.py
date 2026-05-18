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
    "afraid", "harass", "unsafe", "pressured", "discriminated", "micro-manage",
    "whistleblow", "violated", "exploit", "abuse", "hostile", "toxic"
]
RISK_MULTIWORD = ["sexual harassment", "human rights", "psychological safety"]
RISK_SENTIMENT_THRESHOLD = -0.5

N_CLUSTERS = 4
PCA_COMPONENTS = 2