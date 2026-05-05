import pandas as pd

from .config import PILLARS, DATA_DIR, OUTPUT_FILE


def export_for_powerbi(df_respondents: pd.DataFrame):
    """
    Export clean CSVs for Power BI.
    
    Args:
        df_respondents: Complete DataFrame with all transformations
    """
    print("\nExport:")
    
    try:
        # Ensure data directory exists
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        
        # Table 1: Respondents Table
        respondents_cols = ["sessionId", "userId", "team", "country", "roleLevel"]
        
        # Add GAP-I columns
        for pillar in PILLARS:
            respondents_cols.append(f"{pillar}_GAP_I")
        respondents_cols.append("GAP_I_overall")
        
        # Add PCA and cluster
        respondents_cols.extend(["pca_1", "pca_2", "persona_cluster"])
        
        df_respondents_export = df_respondents[respondents_cols].copy()
        
        # Rename for Power BI clarity
        df_respondents_export = df_respondents_export.rename(columns={
            "country": "branch"
        })
        
        respondents_path = DATA_DIR / "respondents_table.csv"
        df_respondents_export.to_csv(respondents_path, index=False)
        print(f"Exported: {respondents_path}")
        print(f"Rows: {len(df_respondents_export)}, Columns: {len(df_respondents_export.columns)}")
        
        # Table 2: Themes Table
        themes_cols = ["sessionId", "team", "raw_session_text", "sentiment_score", "risk_flag"]
        
        df_themes_export = df_respondents[themes_cols].copy()
        
        themes_path = DATA_DIR / "themes_table.csv"
        df_themes_export.to_csv(themes_path, index=False)
        print(f"Exported: {themes_path}")
        print(f"Rows: {len(df_themes_export)}, Columns: {len(df_themes_export.columns)}")
        
        # Analysis Results (for Power BI)
        df_respondents.to_csv(OUTPUT_FILE, index=False)
        print(f"Exported: {OUTPUT_FILE}")
        print(f"Rows: {len(df_respondents)}, Columns: {len(df_respondents.columns)}")
        
        # Summary Statistics
        print("\n" + "=" * 70)
        print("Pipeline complete - summary statistics")
        print("=" * 70)
        
        print(f"\nTotal Respondents: {len(df_respondents)}")
        
        if "branch" in df_respondents.columns:
            print(f"\nBy Branch:")
            print(df_respondents["branch"].value_counts().to_string())
        
        if "roleLevel" in df_respondents.columns:
            print(f"\nBy Role Level:")
            print(df_respondents["roleLevel"].value_counts().to_string())
        
        print(f"\nGAP-I Overview:")
        for pillar in PILLARS:
            print(f"  {pillar}: {df_respondents[f'{pillar}_GAP_I'].mean():.2f}")
        print(f"  Overall: {df_respondents['GAP_I_overall'].mean():.2f}")
        
        print(f"\nPersona Clusters:")
        for c in range(4):
            count = (df_respondents["persona_cluster"] == c).sum()
            pct = 100 * count / len(df_respondents)
            print(f"  Cluster {c}: {count} ({pct:.1f}%)")
        
        print("\n" + "=" * 70)
        print("FILES SAVED TO esg_pipeline/data/")
        print(f"  - {respondents_path.name}")
        print(f"  - {themes_path.name}")
        print(f"  - {OUTPUT_FILE.name}")
        print("=" * 70)
        
    except Exception as e:
        print(f"ERROR in export_for_powerbi: {e}")
        raise