"""
Module 3: THE GAP-I MATH ENGINE
===============================
Calculate the GAP-I (ESG Coherence Index) for each respondent.

The Logic (Apply per pillar):
1. Gap abs: Use pre-calculated absolute gap from transform.py (0-3)
2. Normalize gap to 0-100: norm_gap = (gap_abs / 3.0) * 100
3. Normalize visibility to 0-100 (Inverted): norm_vis = ((5 - visibility) / 4) * 100
4. Calculate GAP-I: GAP-I_pillar = (0.7 * norm_gap) + (0.3 * norm_vis)
5. Overall Score: GAP-I_overall = mean of four pillar GAP-I scores

Returns: pd.DataFrame - df_respondents with added GAP-I columns
"""

import pandas as pd

from .config import PILLARS, GAP_I_WEIGHTS


def calculate_gap_i(df_respondents: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate GAP-I for each respondent.
    
    Args:
        df_respondents: Wide-format DataFrame from transform_data
        
    Returns:
        pd.DataFrame: df_respondents with added GAP-I columns
    """
    print("\n[MODULE 3] GAP-I MATH ENGINE - Computing ESG Coherence Index...")
    
    try:
        gap_weight = GAP_I_WEIGHTS["gap_weight"]
        vis_weight = GAP_I_WEIGHTS["visibility_weight"]
        
        print(f"  → Using weights: gap={gap_weight}, visibility={vis_weight}")
        
        for pillar in PILLARS:
            print(f"  → Processing pillar: {pillar}")
            
            visibility = df_respondents[f"{pillar}_visibility"].fillna(3)
            gap_abs = df_respondents[f"{pillar}_gap_abs"].fillna(0)
            
            norm_gap = (gap_abs / 3.0) * 100
            df_respondents[f"{pillar}_norm_gap"] = norm_gap
            
            norm_vis = ((5 - visibility) / 4) * 100
            df_respondents[f"{pillar}_norm_visibility"] = norm_vis
            
            gap_i_pillar = (gap_weight * norm_gap) + (vis_weight * norm_vis)
            df_respondents[f"{pillar}_GAP_I"] = gap_i_pillar
            
            print(f"    → mean gap_abs: {gap_abs.mean():.2f}")
            print(f"    → mean norm_gap: {norm_gap.mean():.2f}")
            print(f"    → mean norm_visibility: {norm_vis.mean():.2f}")
            print(f"    → mean GAP-I: {gap_i_pillar.mean():.2f}")
        
        gap_i_columns = [f"{pillar}_GAP_I" for pillar in PILLARS]
        df_respondents["GAP_I_overall"] = df_respondents[gap_i_columns].mean(axis=1)
        
        print(f"  ✓ Overall GAP-I calculated: mean={df_respondents['GAP_I_overall'].mean():.2f}")
        
        return df_respondents
        
    except Exception as e:
        print(f"  ✗ ERROR in calculate_gap_i: {e}")
        raise
