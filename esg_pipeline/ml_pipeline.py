"""
Module 4: THE HONOURS COMPLEXITY ENGINE
=======================================
Execute NLP and ML pipeline for advanced clustering.

Step 4A: Per-Pillar Sentiment Calibration
Step 4B: Risk Flag Logic (NLTK Stemming)
Step 4C: PCA + Hierarchical Clustering

Returns: pd.DataFrame - df_respondents with ML columns added
"""

import re
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import AgglomerativeClustering

import nltk
from nltk.stem.snowball import SnowballStemmer
from nltk.tokenize import sent_tokenize

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

from .config import PILLARS, RISK_TRIGGERS, RISK_SENTIMENT_THRESHOLD, N_CLUSTERS, PCA_COMPONENTS

STEMMER = SnowballStemmer("english")
STEMMED_RISK_TRIGGERS = set(STEMMER.stem(trigger) for trigger in RISK_TRIGGERS)

PILLAR_KEYWORDS = {
    "env": ["energy", "green", "carbon", "sustainability", "environment", "climate", "emission", "renewable"],
    "people": ["team", "harass", "manager", "safe", "people", "culture", "hr", "employee", "stress", "burnout"],
    "conduct": ["rules", "compliance", "policy", "conduct", "ethics", "bribe", "corrupt", "fraud", "integrity"],
    "chain": ["supply", "chain", "vendor", "partner", "cost", "human rights", "supplier", "sourcing", "procurement"]
}


def run_ml_pipeline(df_respondents: pd.DataFrame) -> pd.DataFrame:
    """
    Execute NLP and ML pipeline.
    
    Args:
        df_respondents: DataFrame with GAP-I calculations
        
    Returns:
        pd.DataFrame: df_respondents with ML columns added
    """
    print("\n[MODULE 4] HONOURS COMPLEXITY ENGINE - NLP & ML Pipeline...")
    
    try:
        # -----------------------------------------------------------------
        # Step 4A: Per-Pillar Sentiment Calibration
        # -----------------------------------------------------------------
        print("  → Step 4A: Per-Pillar Sentiment Analysis...")
        
        try:
            from transformers import pipeline
            sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=-1
            )
            
            pillar_sentiments_mean = {pillar: [] for pillar in PILLARS}
            pillar_sentiments_min = {pillar: [] for pillar in PILLARS}
            overall_sentiments = []
            
            for idx, row in df_respondents.iterrows():
                text = str(row.get("raw_session_text", ""))
                pillar_scores = {pillar: [] for pillar in PILLARS}
                
                if not text:
                    for pillar in PILLARS:
                        pillar_sentiments_mean[pillar].append(0.0)
                        pillar_sentiments_min[pillar].append(0.0)
                    overall_sentiments.append(0.0)
                    continue
                
                try:
                    sentences = sent_tokenize(text)
                    
                    for sentence in sentences:
                        sentence_lower = sentence.lower()
                        tokens = re.findall(r'\w+', sentence_lower)
                        stemmed_words = set(STEMMER.stem(token) for token in tokens)

                        matched_pillars = []
                        for pillar, keywords in PILLAR_KEYWORDS.items():
                            for kw in keywords:
                                if " " in kw:
                                    if kw in sentence_lower:
                                        matched_pillars.append(pillar)
                                        break
                                else:
                                    if STEMMER.stem(kw) in stemmed_words:
                                        matched_pillars.append(pillar)
                                        break

                        if matched_pillars:
                            result = sentiment_pipeline(sentence, truncation=True)[0]
                            label = result["label"]
                            score = result["score"]

                            if label == "positive":
                                mapped_score = score
                            elif label == "negative":
                                mapped_score = -score
                            else:
                                mapped_score = 0.0

                            for pillar in matched_pillars:
                                pillar_scores[pillar].append(mapped_score)
                    
                    for pillar in PILLARS:
                        scores = pillar_scores[pillar]
                        pillar_sentiments_mean[pillar].append(sum(scores) / len(scores) if scores else 0.0)
                        pillar_sentiments_min[pillar].append(min(scores) if scores else 0.0)
                    
                    all_scores = [s for scores in pillar_scores.values() for s in scores]
                    overall_sentiments.append(sum(all_scores) / len(all_scores) if all_scores else 0.0)
                    
                except Exception as e:
                    print(f"    ⚠ Sentiment failed for row {idx}: {e}")
                    for pillar in PILLARS:
                        pillar_sentiments_mean[pillar].append(0.0)
                        pillar_sentiments_min[pillar].append(0.0)
                    overall_sentiments.append(0.0)
            
            for pillar in PILLARS:
                df_respondents[f"{pillar}_sentiment_mean"] = pillar_sentiments_mean[pillar]
                df_respondents[f"{pillar}_sentiment_min"] = pillar_sentiments_min[pillar]
            
            df_respondents["sentiment_score"] = overall_sentiments
            
            for pillar in PILLARS:
                print(f"    → {pillar}_sentiment_mean: {df_respondents[f'{pillar}_sentiment_mean'].mean():.2f}")
            print(f"    → sentiment_score mean: {df_respondents['sentiment_score'].mean():.2f}")
            
        except Exception as e:
            print(f"    ⚠ HuggingFace import failed: {e}")
            for pillar in PILLARS:
                df_respondents[f"{pillar}_sentiment"] = 0.0
            df_respondents["sentiment_score"] = 0.0
        
        # -----------------------------------------------------------------
        # Step 4B: Risk Flag Logic (NLTK Stemming)
        # -----------------------------------------------------------------
        print("  → Step 4B: Risk Flag Detection (NLTK Stemming)...")
        print(f"    → Stemmed risk triggers: {STEMMED_RISK_TRIGGERS}")
        
        risk_flags = []
        
        for idx, row in df_respondents.iterrows():
            text = str(row.get("raw_session_text", "")).lower()
            min_sentiment = min([row.get(f"{p}_sentiment_min", 0.0) for p in PILLARS])
            
            tokens = re.findall(r'\w+', text)
            stemmed_tokens = set(STEMMER.stem(token) for token in tokens)
            
            has_trigger = bool(stemmed_tokens & STEMMED_RISK_TRIGGERS)
            is_very_negative = min_sentiment <= RISK_SENTIMENT_THRESHOLD
            
            risk_flag = has_trigger or is_very_negative
            risk_flags.append(risk_flag)
        
        df_respondents["risk_flag"] = risk_flags
        
        risk_count = sum(risk_flags)
        print(f"    → Risk flags raised: {risk_count} / {len(risk_flags)} ({100*risk_count/len(risk_flags):.1f}%)")
        
        # -----------------------------------------------------------------
        # Step 4C: PCA + Hierarchical Clustering
        # -----------------------------------------------------------------
        print("  → Step 4C: PCA + Hierarchical Clustering...")
        
        feature_columns = []
        for pillar in PILLARS:
            feature_columns.append(f"{pillar}_gap_abs")
            feature_columns.append(f"{pillar}_visibility")
        
        X = df_respondents[feature_columns].fillna(df_respondents[feature_columns].median())
        
        for col in feature_columns:
            if X[col].isna().any():
                default_val = 3.0 if "visibility" in col else 0.0
                X[col] = X[col].fillna(default_val)
        
        print(f"    → Feature matrix shape: {X.shape}")
        
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        print("    → Standardized features")
        
        n_samples = X_scaled.shape[0]
        n_pca_components = min(PCA_COMPONENTS, n_samples - 1) if n_samples > 1 else 1
        
        pca = PCA(n_components=n_pca_components)
        X_pca = pca.fit_transform(X_scaled)
        print(f"    → PCA: {n_pca_components} components, explained variance = {pca.explained_variance_ratio_.sum():.2%}")
        
        n_clusters = min(N_CLUSTERS, n_samples)
        if n_clusters < 2:
            print(f"    → Skipping clustering: only {n_samples} sample(s)")
            df_respondents["persona_cluster"] = range(n_samples)
            df_respondents["pca_1"] = X_pca[:, 0] if X_pca.shape[1] > 0 else 0
            df_respondents["pca_2"] = X_pca[:, 1] if X_pca.shape[1] > 1 else 0
        else:
            clusterer = AgglomerativeClustering(n_clusters=n_clusters, linkage="ward")
            clusters = clusterer.fit_predict(X_pca)
            df_respondents["persona_cluster"] = clusters
            df_respondents["pca_1"] = X_pca[:, 0] if X_pca.shape[1] > 0 else 0
            df_respondents["pca_2"] = X_pca[:, 1] if X_pca.shape[1] > 1 else 0
            print(f"    → Clustering: {n_clusters} clusters for {n_samples} samples")
            print(f"    → Cluster distribution:")
            for c in range(n_clusters):
                count = (clusters == c).sum()
                print(f"      - Cluster {c}: {count} respondents")
        
        print("  ✓ ML pipeline complete")
        
        return df_respondents
        
    except Exception as e:
        print(f"  ✗ ERROR in run_ml_pipeline: {e}")
        raise
