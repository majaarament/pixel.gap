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

from .config import PILLARS, RISK_TRIGGERS, RISK_MULTIWORD, RISK_SENTIMENT_THRESHOLD, N_CLUSTERS, PCA_COMPONENTS

STEMMER = SnowballStemmer("english")
STEMMED_RISK_TRIGGERS = set(STEMMER.stem(trigger) for trigger in RISK_TRIGGERS)

NEGATION_WORDS = {"not", "never", "no", "without", "zero", "don", "isn", "aren", "doesn", "didn", "won", "wouldn", "cant", "cannot", "hardly", "barely", "rarely", "seldom", "scarcely"}

def build_ngram_set(tokens, n):
    return {" ".join(tokens[i:i+n]) for i in range(len(tokens) - n + 1)}

PILLAR_KEYWORDS = {
    "env": [
        "carbon", "emission", "sustainab", "environment", "climate",
        "renewable", "green", "waste", "pollution", "footprint",
        "biodiversity", "water", "co2", "carbon neutral", "carbon footprint"
    ],
    "people": [
        "harass", "burnout", "safe", "voice", "psychological", "inclusion",
        "belonging", "mental", "toxic", "discriminat", "harassment",
        "team conflict", "employee wellbeing", "psychological safety", "speak up",
        "wellbeing", "unfair", "micro-manage", "hostile"
    ],
    "conduct": [
        "policy", "ethics", "bribe", "corrupt", "fraud", "integrity",
        "whistleblow", "misconduct", "bias", "confidential", "compliance rules",
        "data privacy", "nepotism", "discriminat", "obey"
    ],
    "chain": [
        "supply chain", "vendor", "human rights", "supplier", "sourcing",
        "procurement", "subcontract", "outsourcing", "third party", "labor",
        "child labor", "modern slavery", "esg questionnaire"
    ]
}


def run_ml_pipeline(df_respondents: pd.DataFrame) -> pd.DataFrame:
    """
    Execute NLP and ML pipeline.
    
    Args:
        df_respondents: DataFrame with GAP-I calculations
        
    Returns:
        pd.DataFrame: df_respondents with ML columns added
    """
    print("\nNLP & ML Pipeline")
    
    try:
        # Step 4A: Per-Pillar Sentiment Calibration
        print("Step 4A: Per-Pillar Sentiment Analysis:")
        
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

                        bigrams = build_ngram_set(tokens, 2)
                        trigrams = build_ngram_set(tokens, 3)

                        matched_pillars = []
                        for pillar, keywords in PILLAR_KEYWORDS.items():
                            for kw in keywords:
                                if " " in kw:
                                    word_count = len(kw.split())
                                    ngram_set = trigrams if word_count == 3 else bigrams
                                    if kw in ngram_set:
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
                    print(f"Sentiment failed for row {idx}: {e}")
                    for pillar in PILLARS:
                        pillar_sentiments_mean[pillar].append(0.0)
                        pillar_sentiments_min[pillar].append(0.0)
                    overall_sentiments.append(0.0)
            
            for pillar in PILLARS:
                df_respondents[f"{pillar}_sentiment_mean"] = pillar_sentiments_mean[pillar]
                df_respondents[f"{pillar}_sentiment_min"] = pillar_sentiments_min[pillar]
            
            df_respondents["sentiment_score"] = overall_sentiments
            
            for pillar in PILLARS:
                print(f"{pillar}_sentiment_mean: {df_respondents[f'{pillar}_sentiment_mean'].mean():.2f}")
            print(f"sentiment_score mean: {df_respondents['sentiment_score'].mean():.2f}")
            
        except Exception as e:
            print(f"HuggingFace import failed: {e}")
            for pillar in PILLARS:
                df_respondents[f"{pillar}_sentiment_mean"] = 0.0
                df_respondents[f"{pillar}_sentiment_min"] = 0.0
            df_respondents["sentiment_score"] = 0.0
        
        # Step 4B: Risk Flag Logic (Sentence-Isolated Negation Engine)
        print("Step 4B: Risk Flag Detection")
        print(f"Stemmed risk triggers: {STEMMED_RISK_TRIGGERS}")
        print(f"Multi-word patterns: {RISK_MULTIWORD}")
        print(f"Negation words: {NEGATION_WORDS}")
        print(f"Sentiment threshold: {RISK_SENTIMENT_THRESHOLD}")

        risk_flags = []

        for idx, row in df_respondents.iterrows():
            text = str(row.get("raw_session_text", ""))
            min_sentiment = min([row.get(f"{p}_sentiment_min", 0.0) for p in PILLARS])

            sentences = sent_tokenize(text.lower())

            has_trigger = False
            has_multiword = False

            for sentence in sentences:
                tokens = re.findall(r'\w+', sentence)
                stemmed_tokens = [STEMMER.stem(t) for t in tokens]

                for i, stemmed in enumerate(stemmed_tokens):
                    if stemmed in STEMMED_RISK_TRIGGERS:
                        context = stemmed_tokens[max(0, i - 15):i]
                        if not any(n in context for n in NEGATION_WORDS):
                            has_trigger = True
                            break

                tokens_bigrams = build_ngram_set(tokens, 2)
                tokens_trigrams = build_ngram_set(tokens, 3)

                for phrase in RISK_MULTIWORD:
                    word_count = len(phrase.split())
                    ngram_set = tokens_trigrams if word_count == 3 else tokens_bigrams
                    if phrase in ngram_set:
                        phrase_stems = [STEMMER.stem(w) for w in phrase.split()]
                        for i, st in enumerate(stemmed_tokens):
                            if st == phrase_stems[0]:
                                window = stemmed_tokens[max(0, i - 15):i]
                                if all(i+j < len(stemmed_tokens) and stemmed_tokens[i+j] == phrase_stems[j] for j in range(word_count)):
                                    if not any(n in window for n in NEGATION_WORDS):
                                        has_multiword = True
                                        break
                        if has_multiword:
                            break

                if has_trigger or has_multiword:
                    break

            is_very_negative = min_sentiment <= RISK_SENTIMENT_THRESHOLD

            risk_flag = (has_trigger and min_sentiment < 0.0) or has_multiword or is_very_negative
            risk_flags.append(risk_flag)

        df_respondents["risk_flag"] = risk_flags

        risk_count = sum(risk_flags)
        print(f"Risk flags raised: {risk_count} / {len(risk_flags)} ({100*risk_count/len(risk_flags):.1f}%)")
        
        # Step 4C: PCA + Hierarchical Clustering
        print("Step 4C: PCA + Hierarchical Clustering")
        
        feature_columns = []
        for pillar in PILLARS:
            feature_columns.append(f"{pillar}_gap_abs")
            feature_columns.append(f"{pillar}_visibility")
        
        X = df_respondents[feature_columns].fillna(df_respondents[feature_columns].median())
        
        for col in feature_columns:
            if X[col].isna().any():
                default_val = 3.0 if "visibility" in col else 0.0
                X[col] = X[col].fillna(default_val)
        
        print(f"Feature matrix shape: {X.shape}")
        
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        print("Standardized features")
        
        n_samples = X_scaled.shape[0]

        if n_samples < 2:
            print(f"Skipping PCA and clustering: only {n_samples} sample(s)")
            df_respondents["persona_cluster"] = range(n_samples)
            df_respondents["pca_1"] = 0.0
            df_respondents["pca_2"] = 0.0
        else:
            n_pca_components = min(PCA_COMPONENTS, n_samples - 1)
            pca = PCA(n_components=n_pca_components)
            X_pca = pca.fit_transform(X_scaled)
            print(f"PCA: {n_pca_components} components, explained variance = {pca.explained_variance_ratio_.sum():.2%}")

            n_clusters = min(N_CLUSTERS, n_samples)
            clusterer = AgglomerativeClustering(n_clusters=n_clusters, linkage="ward")
            clusters = clusterer.fit_predict(X_pca)
            df_respondents["persona_cluster"] = clusters
            df_respondents["pca_1"] = X_pca[:, 0] if X_pca.shape[1] > 0 else 0.0
            df_respondents["pca_2"] = X_pca[:, 1] if X_pca.shape[1] > 1 else 0.0
            print(f"Clustering: {n_clusters} clusters for {n_samples} samples")
            print(f"Cluster distribution:")
            for c in range(n_clusters):
                count = (clusters == c).sum()
                print(f"Cluster {c}: {count} respondents")
        
        print("ML pipeline complete")
        
        return df_respondents
        
    except Exception as e:
        print(f"ERROR in run_ml_pipeline: {e}")
        raise
