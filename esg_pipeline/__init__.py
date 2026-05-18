"""
ESG Pipeline Package

Modules:
- config: Configuration constants
- extract: Module 1 - Google Sheets ingestion
- transform: Module 2 - Event log to wide format
- gap_math: Module 3 - GAP-I calculations
- ml_pipeline: Module 4 - NLP & Clustering
- export: Module 5 - Power BI export

Usage:
    python -m esg_pipeline
    or
    from esg_pipeline import run_full_pipeline
"""

from .config import PILLARS, GAP_I_WEIGHTS, RISK_TRIGGERS, DATA_DIR
from .extract import extract_data
from .transform import transform_data
from .gap_math import calculate_gap_i
from .ml_pipeline import run_ml_pipeline
from .export import export_for_powerbi


def run_full_pipeline():
    """Run the complete ETL pipeline using Google Sheets."""
    print("\n" + "=" * 70)
    print("ESG Pipeline - Starting (Google Sheets Mode)")
    print("=" * 70)
    print(f"Output: {DATA_DIR}")
    print("=" * 70)
    
    df_raw = extract_data()
    
    if df_raw.empty:
        print("No data loaded - check credentials.json and Google Sheets access")
        return None
    
    df_respondents = transform_data(df_raw)
    df_respondents = calculate_gap_i(df_respondents)
    df_respondents = run_ml_pipeline(df_respondents)
    export_for_powerbi(df_respondents)
    
    print("Pipeline complete")
    return df_respondents


__all__ = [
    "PILLARS",
    "GAP_I_WEIGHTS",
    "RISK_TRIGGERS",
    "DATA_DIR",
    "extract_data",
    "transform_data",
    "calculate_gap_i",
    "run_ml_pipeline",
    "export_for_powerbi",
    "run_full_pipeline",
]