"""
ESG Pipeline Package
====================
Master ETL & Analytics for Master's Thesis

Modules:
- config: Configuration constants (local file paths)
- extract: Module 1 - Local Seed CSV ingestion
- transform: Module 2 - Event log to wide format
- gap_math: Module 3 - GAP-I calculations
- ml_pipeline: Module 4 - NLP & Clustering
- export: Module 5 - Power BI export

Usage:
    python -m esg_pipeline
    or
    from esg_pipeline import run_full_pipeline
"""

from .config import (
    INPUT_FILE,
    OUTPUT_FILE,
    PILLARS,
    GAP_I_WEIGHTS,
    RISK_TRIGGERS,
)
from .extract import extract_data
from .transform import transform_data
from .gap_math import calculate_gap_i
from .ml_pipeline import run_ml_pipeline
from .export import export_for_powerbi


def run_full_pipeline():
    """Run the complete ETL pipeline using Local Seed CSV."""
    print("\n" + "=" * 70)
    print("ESG Pipeline - Starting (Local Seed CSV Mode)")
    print("=" * 70)
    print(f"Input:  {INPUT_FILE}")
    print(f"Output: {OUTPUT_FILE}")
    print("=" * 70)
    
    df_raw = extract_data()
    df_respondents = transform_data(df_raw)
    df_respondents = calculate_gap_i(df_respondents)
    df_respondents = run_ml_pipeline(df_respondents)
    export_for_powerbi(df_respondents)
    
    print("Pipeline complete")
    return df_respondents


__all__ = [
    "INPUT_FILE",
    "OUTPUT_FILE",
    "PILLARS",
    "GAP_I_WEIGHTS",
    "RISK_TRIGGERS",
    "extract_data",
    "transform_data",
    "calculate_gap_i",
    "run_ml_pipeline",
    "export_for_powerbi",
    "run_full_pipeline",
]