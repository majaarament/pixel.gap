"""
Module 1: INGESTION
==================
Extract data from Google Sheets using gspread.

Returns: pd.DataFrame - Raw telemetry data
"""

import pandas as pd
from pathlib import Path

GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1xaDTwzQklHjr9fdTwynUB4_wWTmxx3wE3qRFe7nRsEU/edit"

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
    "team",
    "branch",
    "department",
    "departmentPrimaryEntities",
    "departmentSupportingEntities",
    "entity",
    "entityCity",
    "entityOfficeType",
    "entityLabel",
    "country",
    "userAgent",
]


def extract_data() -> pd.DataFrame:
    """
    Extract data from Google Sheets.
    
    Returns:
        pd.DataFrame: Raw telemetry data from Google Sheets
    """
    print("\nINGESTION")
    
    creds_path = Path(__file__).parent / "credentials.json"
    
    if not creds_path.exists():
        print(f"credentials.json not found at {creds_path}")
        print("Download from Google Cloud Console and place in esg_pipeline/ directory")
        return pd.DataFrame(columns=HEADERS)
    
    try:
        import gspread
        
        gc = gspread.service_account(filename=str(creds_path))
        spreadsheet = gc.open_by_url(GOOGLE_SHEET_URL)
        worksheet = spreadsheet.sheet1
        
        all_values = worksheet.get_all_values()
        
        if not all_values:
            print("Sheet is empty")
            return pd.DataFrame(columns=HEADERS)
        
        headers = all_values[0]
        data_rows = all_values[1:]
        
        df_raw = pd.DataFrame(data_rows, columns=headers)
        
        valid_columns = [col for col in df_raw.columns if col in HEADERS]
        df_raw = df_raw[valid_columns]
        
        for col in HEADERS:
            if col not in df_raw.columns:
                df_raw[col] = ""
        
        df_raw = df_raw[HEADERS]
        
        print(f"Loaded {len(df_raw)} rows from Google Sheets")
        print(f"Columns: {list(df_raw.columns)}")
        
        return df_raw
        
    except Exception as e:
        print(f"ERROR connecting to Google Sheets: {e}")
        return pd.DataFrame(columns=HEADERS)