"""
Module 2: TRANSFORMATION & PIVOTING
===================================
Transform event-driven log (long format) to wide format (one row per sessionId).

Step 2A: Demographics & JSON Parsing with Ordinal Mapping
Step 2B: NLP Text Aggregation
Step 3C: Merge

Returns: pd.DataFrame - Wide format with one row per sessionId
"""

import json
import pandas as pd

from .config import PILLARS

ORDINAL_MAP = {
    "flag_energy": 3, "full_info": 3, "note_internally": 2, "lighter_model": 2,
    "raise_now": 3, "check_in": 2, "document": 1, "let_lead": 0,
    "follow_proper": 3, "flag_up": 3, "suggest_review": 2, "use_workaround": 0,
    "responsible": 3, "negotiate": 2, "escalate": 1, "cost": 0
}


def transform_data(df_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Transform event log to wide format.
    
    Args:
        df_raw: Raw telemetry DataFrame
        
    Returns:
        pd.DataFrame: Wide format with one row per sessionId
    """
    print("\n[MODULE 2] TRANSFORMATION & PIVOTING - Building respondent table...")
    
    try:
        # -----------------------------------------------------------------
        # Step 2A: Demographics & JSON Parsing with Ordinal Mapping
        # -----------------------------------------------------------------
        print("  → Step 2A: Parsing demographics and JSON from final_report events...")
        
        final_report_df = df_raw[df_raw["eventType"] == "final_report"].copy()
        print(f"    → Found {len(final_report_df)} final_report events")
        
        respondent_rows = []
        
        for idx, row in final_report_df.iterrows():
            try:
                json_blob = json.loads(row.get("text", "{}"))
                report = json_blob.get("report", {})
                
                respondent = {
                    "sessionId": row.get("sessionId", ""),
                    "timestamp": row.get("timestamp", ""),
                    "userId": row.get("userId", ""),
                    "roleLevel": report.get("playerProfile", {}).get("roleLevel", "") or row.get("roleLevel", ""),
                    "country": report.get("playerProfile", {}).get("country", "") or row.get("country", ""),
                    "team": report.get("playerProfile", {}).get("team", "") or report.get("playerProfile", {}).get("branch", ""),
                    "department": report.get("playerProfile", {}).get("department", ""),
                    "entity": report.get("playerProfile", {}).get("entity", ""),
                    "entityCity": report.get("playerProfile", {}).get("entityCity", ""),
                    "entityOfficeType": report.get("playerProfile", {}).get("entityOfficeType", ""),
                    "entityLabel": report.get("playerProfile", {}).get("entityLabel", ""),
                    "departmentPrimaryEntities": report.get("playerProfile", {}).get("departmentPrimaryEntities", ""),
                    "departmentSupportingEntities": report.get("playerProfile", {}).get("departmentSupportingEntities", ""),
                }
                
                respondent["openingDilemma"] = report.get("openingDilemma", "")
                respondent["final_important"] = report.get("finalReflection", {}).get("mostImportant", "")
                respondent["final_strongest"] = report.get("finalReflection", {}).get("strongest", "")
                respondent["final_gap"] = report.get("finalReflection", {}).get("biggestGap", "")
                pre_val = report.get("baseline", {}).get("understanding")
                respondent["understanding_pre"] = 3 if pre_val in [None, ""] else int(pre_val)
                
                post_val = report.get("postGame", {}).get("understanding")
                respondent["understanding_post"] = 3 if post_val in [None, ""] else int(post_val)
                
                for pillar in PILLARS:
                    pillar_obj = report.get("pillars", {}).get(pillar, {})
                    
                    personal_value = pillar_obj.get("personal", "")
                    delaware_value = pillar_obj.get("delaware", "")
                    
                    personal_score = ORDINAL_MAP.get(personal_value, 0)
                    delaware_score = ORDINAL_MAP.get(delaware_value, 0)
                    
                    respondent[f"{pillar}_gap_direction"] = personal_score - delaware_score
                    respondent[f"{pillar}_gap_abs"] = abs(personal_score - delaware_score)
                    respondent[f"{pillar}_visibility"] = pillar_obj.get("visibility", 3)
                
                respondent_rows.append(respondent)
                
            except (json.JSONDecodeError, KeyError, TypeError) as e:
                print(f"    ⚠ Skipping row {idx}: {e}")
                continue
        
        df_demographics = pd.DataFrame(respondent_rows)
        if "timestamp" in df_demographics.columns:
            df_demographics["timestamp"] = pd.to_datetime(df_demographics["timestamp"], errors="coerce")
            df_demographics = df_demographics.sort_values("timestamp", na_position="first")
        
        df_demographics = df_demographics.drop_duplicates(subset=["sessionId"], keep="last")
        print(f"    → Parsed and chronologically deduped to {len(df_demographics)} unique respondents")
        
        # -----------------------------------------------------------------
        # Step 2B: NLP Text Aggregation
        # -----------------------------------------------------------------
        print("  → Step 2B: Aggregating council dialogue text...")
        
        council_df = df_raw[
            (df_raw["eventType"] == "council_message") & 
            (df_raw["conversationRole"] == "user")
        ].copy()
        
        print(f"    → Found {len(council_df)} user council messages")
        
        df_text = council_df.groupby("sessionId")["text"].apply(
            lambda x: " ".join(x.dropna().astype(str))
        ).reset_index()
        
        df_text.columns = ["sessionId", "raw_session_text"]
        print(f"    → Aggregated into {len(df_text)} unique session texts")
        
        # -----------------------------------------------------------------
        # Step 2C: Merge
        # -----------------------------------------------------------------
        print("  → Step 2C: Merging into final respondent table...")
        
        df_respondents = pd.merge(df_demographics, df_text, on="sessionId", how="left")
        df_respondents["raw_session_text"] = df_respondents["raw_session_text"].fillna("")
        
        print(f"  ✓ Created df_respondents with {len(df_respondents)} rows and {len(df_respondents.columns)} columns")
        
        return df_respondents
        
    except Exception as e:
        print(f"  ✗ ERROR in transform_data: {e}")
        raise
