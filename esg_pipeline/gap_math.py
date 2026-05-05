"""
Module 3: GAP-I Maths
===============================
The GAP-I (ESG Coherence Index) for each respondent.

The Logic (Apply per pillar):
1. Raw gap: Use pre-calculated boolean gap from transform.py (0 or 1)
2. Normalize gap to 0-100: norm_gap = (gap_raw / 1) * 100
3. Normalize visibility to 0-100 (Inverted): norm_vis = ((5 - visibility) / 4) * 100
4. Calculate GAP-I: GAP-I_pillar = (0.5 * norm_gap) + (0.3 * norm_vis)
5. Overall Score: GAP-I_overall = mean of four pillar GAP-I scores

Returns: pd.DataFrame - df_respondents with added GAP-I columns
"""

import numpy as np
import pandas as pd

from .config import PILLARS, GAP_I_WEIGHTS


def calculate_gap_i(df_respondents: pd.DataFrame) -> pd.DataFrame:
    print("\nGAP-I Maths:")
    
    try:
        gap_weight = GAP_I_WEIGHTS["gap_weight"]
        vis_weight = GAP_I_WEIGHTS["visibility_weight"]
        
        print(f"Using weights: gap={gap_weight}, visibility={vis_weight}")
        
        for pillar in PILLARS:
            print(f"Processing pillar: {pillar}")
            
            # Extract scores
            visibility = df_respondents[f"{pillar}_visibility"].fillna(3)
            
            # Step 1: Use pre-calculated boolean gap from transform.py
            gap_raw = df_respondents[f"{pillar}_gap_raw"].fillna(0)
            
            # Step 2: Normalize gap to 0-100 (binary max of 1)
            norm_gap = (gap_raw / 1) * 100
            df_respondents[f"{pillar}_norm_gap"] = norm_gap
            
            # Step 3: Normalize visibility to 0-100 (inverted)
            norm_vis = ((5 - visibility) / 4) * 100
            df_respondents[f"{pillar}_norm_visibility"] = norm_vis
            
            # Step 4: Calculate GAP-I for this pillar
            gap_i_pillar = (gap_weight * norm_gap) + (vis_weight * norm_vis)
            df_respondents[f"{pillar}_GAP_I"] = gap_i_pillar
            
            # Log statistics
            print(f"mean gap_raw: {gap_raw.mean():.2f}")
            print(f"mean norm_gap: {norm_gap.mean():.2f}")
            print(f"mean norm_visibility: {norm_vis.mean():.2f}")
            print(f"mean GAP-I: {gap_i_pillar.mean():.2f}")
        
        # Step 5: Overall GAP-I Score
        gap_i_columns = [f"{pillar}_GAP_I" for pillar in PILLARS]
        df_respondents["GAP_I_overall"] = df_respondents[gap_i_columns].mean(axis=1)
        
        print(f"Overall GAP-I calculated: mean={df_respondents['GAP_I_overall'].mean():.2f}")
        
        return df_respondents
        
    except Exception as e:
        print(f"ERROR in calculate_gap_i: {e}")
        raise