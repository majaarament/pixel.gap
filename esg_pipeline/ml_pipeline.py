"""
Module 4: ML and NLP
=======================================
Execute NLP and ML pipeline for advanced clustering.

Step 4A: Sentiment Calibration

Step 4B: Risk Flag Logic

Step 4C: PCA + Hierarchical Clustering
"""

import pandas as pd
import numpy as np
import re
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import AgglomerativeClustering

# NLTK
import nltk
from nltk.stem.snowball import SnowballStemmer

# Tokenizers
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

from .config import PILLARS, RISK_TRIGGERS, RISK_SENTIMENT_THRESHOLD, N_CLUSTERS, PCA_COMPONENTS

# Initialize stemmer once
STEMMER = SnowballStemmer("english")

# Pre-stem the risk triggers
STEMMED_RISK_TRIGGERS = set(STEMMER.stem(trigger) for trigger in RISK_TRIGGERS)


def run_ml_pipeline(df_respondents: pd.DataFrame) -> pd.DataFrame:
    print("\nML and NLP Pipeline:")
    
    try:
        # Step 4A: Sentiment Calibration
        print("Step 4A: Sentiment Analysis (HuggingFace):")
        
        try:
            from transformers import pipeline
            
            print("Loading model:")
            sentiment_pipeline = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=-1
            )
            
            sentiment_scores = []
            
            for idx, row in df_respondents.iterrows():
                text = row.get("raw_session_text", "")
                
                if not text or pd.isna(text):
                    sentiment_scores.append(0.0)
                    continue
                    
                try:
                    # Truncate text to 512 tokens
                    text_truncated = text[:512]
                    result = sentiment_pipeline(text_truncated)[0]
                    
                    # Map to -1.0 to 1.0 scale
                    label = result["label"]
                    score = result["score"]
                    
                    if label == "positive":
                        mapped_score = score
                    elif label == "negative":
                        mapped_score = -score
                    else:  # neutral
                        mapped_score = 0.0
                    
                    sentiment_scores.append(mapped_score)
                    
                except Exception as e:
                    print(f"Sentiment failed for row {idx}: {e}")
                    sentiment_scores.append(0.0)
            
            df_respondents["sentiment_score"] = sentiment_scores
            print(f"Sentiment scores computed: mean={df_respondents['sentiment_score'].mean():.2f}")
            
        except Exception as e:
            print(f"HuggingFace import failed: {e}")
            df_respondents["sentiment_score"] = 0.0
        
        # Step 4B: Risk Flag Logic (NLTK Stemming)
        print("Step 4B: Risk Flag Detection (NLTK Stemming):")
        print(f"Stemmed risk triggers: {STEMMED_RISK_TRIGGERS}")
        
        risk_flags = []
        
        for idx, row in df_respondents.iterrows():
            text = str(row.get("raw_session_text", "")).lower()
            sentiment = row.get("sentiment_score", 0)
            
            # NLTK Stemming: Tokenize, stem, and check against stemmed triggers
            tokens = re.findall(r'\w+', text)
            stemmed_tokens = set(STEMMER.stem(token) for token in tokens)
            
            has_trigger = bool(stemmed_tokens & STEMMED_RISK_TRIGGERS)
            is_very_negative = sentiment < -0.5
            
            risk_flag = has_trigger or is_very_negative
            risk_flags.append(risk_flag)
        
        df_respondents["risk_flag"] = risk_flags
        
        risk_count = sum(risk_flags)
        print(f"Risk flags raised: {risk_count} / {len(risk_flags)} ({100*risk_count/len(risk_flags):.1f}%)")
        
        # Step 4C: PCA + Hierarchical Clustering
        print("Step 4C: PCA + Hierarchical Clustering:")
        
        # Create feature matrix: 4 gap_raw scores + 4 visibility scores
        feature_columns = []
        for pillar in PILLARS:
            feature_columns.append(f"{pillar}_gap_raw")
            feature_columns.append(f"{pillar}_visibility")
        
        # Fill NaN with median
        X = df_respondents[feature_columns].fillna(df_respondents[feature_columns].median())
        
        print(f"Feature matrix shape: {X.shape}")
        
        # Standardize
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        print("Standardized features")
        
        # PCA - use min of PCA_COMPONENTS or n_samples-1
        n_samples = X_scaled.shape[0]
        n_pca_components = min(PCA_COMPONENTS, n_samples - 1) if n_samples > 1 else 1
        
        pca = PCA(n_components=n_pca_components)
        X_pca = pca.fit_transform(X_scaled)
        print(f"PCA: {n_pca_components} components, explained variance = {pca.explained_variance_ratio_.sum():.2%}")
        
        # Hierarchical Clustering - dynamic based on sample size
        n_clusters = min(N_CLUSTERS, n_samples)
        if n_clusters < 2:
            print(f"Skipping clustering: only {n_samples} sample(s)")
            df_respondents["persona_cluster"] = range(n_samples)
            df_respondents["pca_1"] = X_pca[:, 0] if X_pca.shape[1] > 0 else 0
            df_respondents["pca_2"] = X_pca[:, 1] if X_pca.shape[1] > 1 else 0
        else:
            clusterer = AgglomerativeClustering(n_clusters=n_clusters, linkage="ward")
            clusters = clusterer.fit_predict(X_pca)
            df_respondents["persona_cluster"] = clusters
            df_respondents["pca_1"] = X_pca[:, 0] if X_pca.shape[1] > 0 else 0
            df_respondents["pca_2"] = X_pca[:, 1] if X_pca.shape[1] > 1 else 0
            print(f"Clustering: {n_clusters} clusters for {n_samples} samples")
            print(f"Cluster distribution:")
            for c in range(n_clusters):
                count = (clusters == c).sum()
                print(f"      - Cluster {c}: {count} respondents")
        
        print("ML pipeline complete")
        
        return df_respondents
        
    except Exception as e:
        print(f"ERROR in run_ml_pipeline: {e}")
        raise