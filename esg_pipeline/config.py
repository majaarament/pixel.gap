from pathlib import Path

# Local File Paths (relative to esg_pipeline package)
PACKAGE_DIR = Path(__file__).parent
DATA_DIR = PACKAGE_DIR / "data"

INPUT_FILE = DATA_DIR / "game_results_seed.csv"
OUTPUT_FILE = DATA_DIR / "analysis_results.csv"

# ESG Pillars
PILLARS = ["env", "people", "conduct", "chain"]

# GAP-I Weights
GAP_I_WEIGHTS = {
    "gap_weight": 0.5,
    "visibility_weight": 0.3
}

# Risk Detection
RISK_TRIGGERS = [
    "afraid",
    "harassed", 
    "uncomfortable",
    "burnout",
    "ignored",
    "retaliation"
]

# Risk threshold
RISK_SENTIMENT_THRESHOLD = -0.4

# ML Configuration
N_CLUSTERS = 4
PCA_COMPONENTS = 2