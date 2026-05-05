"""
Module 1: EXTRACTION
==================
Extract data from local CSV file (seed data).

Source: esg_pipeline/data/game_results_seed.csv

Returns: pd.DataFrame - Raw telemetry data
"""

import pandas as pd

from .config import INPUT_FILE, DATA_DIR

HEADERS = [
    "receivedAt",
    "timestamp",
    "eventType",
    "userId",
    "sessionId",
    "questStage",
    "turnIndex",
    "conversationRole",
    "npcId",
    "npcName",
    "npcRole",
    "stepId",
    "prompt",
    "choiceKey",
    "choiceLabel",
    "text",
    "roleLevel",
    "branch",
    "country",
    "userAgent",
    "interviewee",  # Extra column found in some rows
]


def extract_data() -> pd.DataFrame:
    """
    Extract data from local CSV file.
    
    Returns:
        pd.DataFrame: Raw telemetry data from local CSV
    """
    print("\nIngestion:")
    
    try:
        if not INPUT_FILE.exists():
            print("Waiting for first game session to generate data...")
            print(f"Expected file: {INPUT_FILE}")
            print(f"Data directory: {DATA_DIR}")
            print("Run the game to generate events, then re-run this pipeline.")
            return pd.DataFrame(columns=HEADERS)
        
        # Read CSV - extra columns in data rows will be ignored
        df_raw = pd.read_csv(INPUT_FILE, on_bad_lines='warn', usecols=HEADERS[:20])
        
        if df_raw.empty:
            print("CSV exists but contains no data rows (headers only).")
            print("Run the game to generate events, then re-run this pipeline.")
            return df_raw
        
        print(f"Loaded {len(df_raw)} rows from {INPUT_FILE.name}")
        print(f"Columns: {list(df_raw.columns)}")
        
        return df_raw
        
    except Exception as e:
        print(f"ERROR in extract_data: {e}")
        raise