"""
Module 2: TRANSFORMATION
===================================

Step 2A: Demographics & JSON Parsing
- Filter for eventType == 'final_report'
- Parse JSON blob from 'text' column to extract: team, roleLevel, country

Step 2B: NLP Text Aggregation  
- Filter for eventType == 'council_message' AND conversationRole == 'user'
- Group by sessionId and concatenate text into raw_session_text

Step 2C: Merge
- Combine demographics + JSON variables + raw_session_text
"""

import json
import pandas as pd

from .config import PILLARS


def transform_data(df_raw: pd.DataFrame) -> pd.DataFrame:

    print("Transformation:")
    
    try:

        # Step 2A: Demographics & JSON Parsing
        print("Step 2A: Parsing demographics and JSON from final_report events:")
        
        final_report_df = df_raw[df_raw["eventType"] == "final_report"].copy()
        print(f"Found {len(final_report_df)} final_report events")
        
        respondent_rows = []
        
        for idx, row in final_report_df.iterrows():
            try:
                # Parse JSON from 'text' column
                json_blob = json.loads(row.get("text", "{}"))
                
                respondent = {
                    "sessionId": row.get("sessionId", ""),
                    "userId": row.get("userId", ""),
                    "roleLevel": row.get("roleLevel", ""),
                    "country": row.get("country", ""),
                }
                
                # Extract nested fields from JSON
                respondent["team"] = json_blob.get("team", "")
                
                # Extract choices from the JSON blob
                choices = json_blob.get("choices", [])
                
                # Initialize pillar scores
                pillar_data = {pillar: {} for pillar in PILLARS}
                
                for choice in choices:
                    step_id = choice.get("stepId", "")
                    choice_key = choice.get("choiceKey", "")
                    choice_label = choice.get("choiceLabel", "")
                    
                    # Parse personal scores
                    for pillar in PILLARS:
                        if f"{pillar}_scenario_personal" in step_id:
                            try:
                                pillar_data[pillar]["personal_score"] = int(choice_key)
                            except (ValueError, TypeError):
                                pillar_data[pillar]["personal_score"] = 0
                                
                        elif f"{pillar}_scenario_delaware" in step_id:
                            try:
                                pillar_data[pillar]["delaware_score"] = int(choice_key)
                            except (ValueError, TypeError):
                                pillar_data[pillar]["delaware_score"] = 0
                                
                        elif f"{pillar}_scale" in step_id:
                            try:
                                pillar_data[pillar]["visibility"] = int(choice_label)
                            except (ValueError, TypeError):
                                pillar_data[pillar]["visibility"] = 3
                
                # Add parsed pillar data to respondent
                for pillar in PILLARS:
                    respondent[f"{pillar}_personal_score"] = pillar_data[pillar].get("personal_score", 0)
                    respondent[f"{pillar}_delaware_score"] = pillar_data[pillar].get("delaware_score", 0)
                    respondent[f"{pillar}_visibility"] = pillar_data[pillar].get("visibility", 3)
                    
                    # Extract the pre-calculated gap boolean from report.pillars.{pillar}.gap
                    pillar_obj = json_blob.get("report", {}).get("pillars", {}).get(pillar, {})
                    respondent[f"{pillar}_gap_raw"] = 1 if pillar_obj.get("gap", False) else 0
                
                # Extract understanding scales (pre/post) if available
                reflections = json_blob.get("reflections", {})
                respondent["understanding_pre"] = reflections.get("baseline", 3)
                respondent["understanding_post"] = reflections.get("postGame", 3)
                
                respondent_rows.append(respondent)
                
            except (json.JSONDecodeError, KeyError) as e:
                print(f"Skipping row {idx}: {e}")
                continue
        
        df_demographics = pd.DataFrame(respondent_rows)
        print(f"Parsed {len(df_demographics)} respondents with complete data")
        
        # Step 2B: NLP Text Aggregation
        print("Step 2B: Aggregating council dialogue text:")
        
        council_df = df_raw[
            (df_raw["eventType"] == "council_message") & 
            (df_raw["conversationRole"] == "user")
        ].copy()
        
        print(f"Found {len(council_df)} user council messages")
        
        # Group by sessionId and concatenate text
        df_text = council_df.groupby("sessionId")["text"].apply(
            lambda x: " ".join(x.dropna().astype(str))
        ).reset_index()
        
        df_text.columns = ["sessionId", "raw_session_text"]
        print(f"Aggregated into {len(df_text)} unique session texts")
        
        # Step 2C: Merge
        print("Step 2C: Merging into final respondent table:")
        
        df_respondents = pd.merge(df_demographics, df_text, on="sessionId", how="left")
        
        # Fill missing text with empty string
        df_respondents["raw_session_text"] = df_respondents["raw_session_text"].fillna("")
        
        print(f"Created df_respondents with {len(df_respondents)} rows and {len(df_respondents.columns)} columns")
        
        return df_respondents
        
    except Exception as e:
        print(f"ERROR in transform_data: {e}")
        raise