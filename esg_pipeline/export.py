"""
Module 5: EXPORT & LOAD
=======================
Export clean CSVs for Power BI dashboard.
"""

import pandas as pd

from .config import PILLARS, DATA_DIR


def export_for_powerbi(df_respondents: pd.DataFrame):
    """
    Export clean CSVs for Power BI.
    
    Args:
        df_respondents: Complete DataFrame with all transformations
    """
    print("\n[MODULE 5] EXPORT & LOAD - Writing Power BI CSVs...")
    
    try:
        # Table 1: Respondents Table
        respondents_cols = [
            "sessionId",
            "userId",
            "team",
            "department",
            "country",
            "roleLevel",
            "entity",
            "entityCity",
            "entityOfficeType",
            "entityLabel",
            "departmentPrimaryEntities",
            "departmentSupportingEntities",
            "timestamp",
            "openingDilemma",
            "final_important",
            "final_strongest",
            "final_gap",
            "understanding_pre",
            "understanding_post",
        ]
        
        if "understanding_pre" in df_respondents.columns and "understanding_post" in df_respondents.columns:
            df_respondents["learning_gain"] = pd.to_numeric(df_respondents["understanding_post"], errors="coerce") - pd.to_numeric(df_respondents["understanding_pre"], errors="coerce")
            respondents_cols.append("learning_gain")
        
        for pillar in PILLARS:
            respondents_cols.append(f"{pillar}_gap_direction")
            respondents_cols.append(f"{pillar}_GAP_I")
        
        respondents_cols.append("GAP_I_overall")
        respondents_cols.extend(["pca_1", "pca_2", "persona_cluster"])
        
        available_cols = [col for col in respondents_cols if col in df_respondents.columns]
        df_respondents_export = df_respondents[available_cols].copy()
        
        respondents_path = DATA_DIR / "respondents_table.csv"
        df_respondents_export.to_csv(respondents_path, index=False)
        print(f"Exported: {respondents_path}")
        print(f"Rows: {len(df_respondents_export)}, Columns: {len(df_respondents_export.columns)}")
        
        # Table 2: Themes Table
        themes_cols = [
            "sessionId",
            "team",
            "raw_session_text",
            "sentiment_score",
            "env_sentiment_mean",
            "env_sentiment_min",
            "people_sentiment_mean",
            "people_sentiment_min",
            "conduct_sentiment_mean",
            "conduct_sentiment_min",
            "chain_sentiment_mean",
            "chain_sentiment_min",
            "risk_flag",
        ]
        
        available_themes = [col for col in themes_cols if col in df_respondents.columns]
        df_themes_export = df_respondents[available_themes].copy()
        
        themes_path = DATA_DIR / "themes_table.csv"
        df_themes_export.to_csv(themes_path, index=False)
        print(f"Exported: {themes_path}")
        print(f"Rows: {len(df_themes_export)}, Columns: {len(df_themes_export.columns)}")
        
        # Summary Statistics
        print("\n" + "=" * 70)
        print("PIPELINE COMPLETE - SUMMARY STATISTICS")
        print("=" * 70)
        
        print(f"\nTotal Respondents: {len(df_respondents)}")
        
        if "country" in df_respondents.columns:
            print(f"\nBy Country:")
            print(df_respondents["country"].value_counts().to_string())
            
            if "risk_flag" in df_respondents.columns:
                print(f"\nRisk Flags by Country:")
                risk_by_country = df_respondents.groupby("country")["risk_flag"].agg(["sum", "count"])
                risk_by_country.columns = ["flagged", "total"]
                risk_by_country["rate"] = (risk_by_country["flagged"] / risk_by_country["total"] * 100).round(1).astype(str) + "%"
                print(risk_by_country.to_string())
        
        if "roleLevel" in df_respondents.columns:
            print(f"\nBy Role Level:")
            print(df_respondents["roleLevel"].value_counts().to_string())
        
        print(f"\nGAP-I Overview:")
        for pillar in PILLARS:
            if f"{pillar}_GAP_I" in df_respondents.columns:
                print(f"  {pillar}: {df_respondents[f'{pillar}_GAP_I'].mean():.2f}")
        
        if "GAP_I_overall" in df_respondents.columns:
            print(f"  Overall: {df_respondents['GAP_I_overall'].mean():.2f}")
        
        print(f"\nPer-Pillar Sentiment:")
        for pillar in PILLARS:
            if f"{pillar}_sentiment_mean" in df_respondents.columns:
                mean_val = df_respondents[f'{pillar}_sentiment_mean'].mean()
                min_val = df_respondents[f'{pillar}_sentiment_min'].mean()
                print(f"  {pillar}: mean={mean_val:.2f}, min={min_val:.2f}")
        
        print(f"\nPersona Clusters:")
        for c in range(4):
            if "persona_cluster" in df_respondents.columns:
                count = (df_respondents["persona_cluster"] == c).sum()
                pct = 100 * count / len(df_respondents)
                print(f"  Cluster {c}: {count} ({pct:.1f}%)")
        
        print("\n" + "=" * 70)
        print("FILES SAVED TO esg_pipeline/data/")
        print(f"  - {respondents_path.name}")
        print(f"  - {themes_path.name}")
        print("=" * 70)
        
    except Exception as e:
        print(f"ERROR in export_for_powerbi: {e}")
        raise
