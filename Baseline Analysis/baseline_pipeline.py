import pandas as pd
import numpy as np
import sys
from pathlib import Path

# STEP 1: SAFE PATHS & ISOLATION
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_DIR = BASE_DIR / "output"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# importing only the theme extraction tool
sys.path.insert(0, str(BASE_DIR.parent))
try:
    from esg_pipeline.ml_pipeline import extract_themes
    print("Linked to production NLP dictionary.")
except ImportError as e:
    print(f"Warning: Could not import ml_pipeline ({e}). Ensure esg_pipeline is in the parent directory.")
    def extract_themes(text): return []

# Sentiment Model
try:
    from transformers import pipeline
    sentiment_model = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
    USING_ROBERTA = True
except Exception as e:
    print("RoBERTa model failed to load. Falling back to TextBlob.")
    from textblob import TextBlob
    USING_ROBERTA = False

# STEP 2: LOAD BASELINE DATA
print("Loading data")
df_raw = pd.read_csv(DATA_DIR / "delaware_survey_2025.csv", encoding="latin-1")

# STEP 3: COLUMN RENAMING & SCHEMA GUARDS
exact_rename_map = {
    "Id": "id",
    "How are you connected to delaware?": "connection_type",
    "What is your role or position within your organization?": "role",
    "Which delaware entity are you in contact with?": "entity",
    "How important is sustainability to you on a personal level?": "personal_importance",
    "In your view, how committed is your organization to sustainability? (optional)": "org_commitment"
}
df_raw.rename(columns=lambda x: exact_rename_map.get(x, x), inplace=True)

# peer_comparison handled separately 
for col in list(df_raw.columns):
    if 'rate delaware' in col and 'peers' in col.lower():
        df_raw.rename(columns={col: 'peer_comparison'}, inplace=True)

for col in list(df_raw.columns):
    if col.startswith("Which sustainability topics"): df_raw.rename(columns={col: "topics"}, inplace=True)
    elif col.startswith("From the list below, please select the sustainability initiatives"): df_raw.rename(columns={col: "initiatives"}, inplace=True)
    elif col.startswith("In your professional opinion, which of the following certifications"): df_raw.rename(columns={col: "certifications"}, inplace=True)
    elif col.startswith("What is one idea you have"): df_raw.rename(columns={col: "idea_text"}, inplace=True)
    elif col.startswith("Are you open to partnering"): df_raw.rename(columns={col: "partnership_text"}, inplace=True)
    elif col.startswith("Thank you for your time"): df_raw.rename(columns={col: "feedback_text"}, inplace=True)

perf_cols = [c for c in df_raw.columns if "performing on sustainability" in c.lower()]
perf_rename = {col: f"perf_area{i+1}" for i, col in enumerate(perf_cols)}
df_raw.rename(columns=perf_rename, inplace=True)

if not perf_rename:
    print("WARNING: No performance columns detected.")
else:
    print(f"Performance columns mapped: {list(perf_rename.values())}")

# STEP 4: FILTER TO EMPLOYEES
if "connection_type" in df_raw.columns:
    df_raw["connection_type"] = df_raw["connection_type"].astype(str).str.strip()

df_emp = df_raw[df_raw["connection_type"] == "Employee (#peopleofdelaware)"].copy()

if df_emp.empty:
    print("CRITICAL: No employee records found after filtering. Halting pipeline.")
    sys.exit(1)

df_emp.reset_index(drop=True, inplace=True)
print(f"Isolated {len(df_emp)} employee records.")

# STEP 5: ENTITY PARSING & SENIORITY BUCKETING
df_emp['country'] = df_emp['entity'].str.replace(r'(?i)^delaware\s+', '', regex=True).str.strip()
df_emp['country'] = df_emp['country'].replace('', 'Unknown').fillna('Unknown')

def map_seniority(role_str):
    if pd.isna(role_str): return "Mid"
    r = str(role_str).lower()
    if any(x in r for x in ['senior', 'manager', 'director', 'lead', 'head', 'principal', 'partner', 'ceo', 'cto', 'cfo', 'vp']): return "Senior"
    if any(x in r for x in ['analyst', 'young professional', 'intern', 'trainee', 'junior', 'associate']): return "Junior"
    return "Mid"

df_emp['seniority'] = df_emp['role'].apply(map_seniority)

# STEP 6: NORMALIZE SCALES, PILLARS, & BLINDSPOT DETECTION 
importance_map = {"Very important": 100, "Somewhat important": 75, "Neutral": 50, "Somewhat not important": 25, "Not important": 0}
commitment_map = {"Very committed": 100.0, "Somewhat committed": 66.7, "Neutral": 33.3, "Not committed": 0.0}
perf_val_map = {"Excellent": 100, "Very good": 75, "Good": 50, "Fair": 25, "Poor": 0, "I don't have enough information to answer": np.nan, "I don't have enough information": np.nan}
peer_map = {"Excellent": 100, "Very good": 75, "Good": 50, "Average": 50, "Fair": 25, "Poor": 0, "I don't have enough information to answer": np.nan, "I don't have enough information": np.nan}

perf_area_cols = list(perf_rename.values())

for col in ['personal_importance', 'org_commitment', 'peer_comparison'] + perf_area_cols:
    if col in df_emp.columns:
        df_emp[col] = df_emp[col].astype(str).str.strip().replace('nan', np.nan)

df_emp['personal_importance_norm'] = df_emp['personal_importance'].map(importance_map)
df_emp['org_commitment_norm'] = df_emp['org_commitment'].map(commitment_map)
if 'peer_comparison' in df_emp.columns: 
    df_emp['peer_comparison_norm'] = df_emp['peer_comparison'].map(peer_map)

for col in perf_area_cols:
    df_emp[col + '_norm'] = df_emp[col].map(perf_val_map)

norm_perf_cols = [c + '_norm' for c in perf_area_cols]
df_emp['perf_rating_missing_count'] = df_emp[norm_perf_cols].isna().sum(axis=1)
df_emp['avg_performance_norm'] = df_emp[norm_perf_cols].mean(axis=1, skipna=True)

# NOTE: Importance uses 5-point intervals (25pts), commitment uses 4-point intervals (33.3pts).
df_emp['importance_commitment_gap'] = (df_emp['personal_importance_norm'] - df_emp['org_commitment_norm']).round(2)

# STEP 7: NLP SENTIMENT ANALYSIS
print("Running Sentiment Analysis...")
for col in ['idea_text', 'partnership_text', 'feedback_text']:
    if col not in df_emp.columns: df_emp[col] = ''

negative_responses = ['nan', 'no', 'none', 'n/a', 'na', 'no thanks', 'not really', 'not relevant']

df_emp['partnership_open_binary'] = df_emp['partnership_text'].apply(
    lambda x: 1 if (
        pd.notna(x) and 
        len(str(x).strip()) > 1 and 
        str(x).strip().lower() not in negative_responses
    ) else 0
)

def combine_text(row):
    parts = [str(p).strip() for p in [row['idea_text'], row['feedback_text']] if pd.notna(p) and str(p).strip() != '' and str(p).strip().lower() != 'nan']
    return '. '.join(parts)

df_emp['combined_text'] = df_emp.apply(combine_text, axis=1)

def get_sentiment(text):
    if len(text) < 5: return "neutral", 0.0, 0.0
    if USING_ROBERTA:
        res = sentiment_model(text[:512])[0]
        label = res['label'].lower()
        score = res['score']
        polarity = score if label == 'positive' else (-score if label == 'negative' else 0.0)
        return label, score, polarity
    else:
        pol = TextBlob(text).sentiment.polarity
        label = "positive" if pol > 0.1 else ("negative" if pol < -0.1 else "neutral")
        return label, abs(pol), pol

total = len(df_emp)
results = []
for i, text in enumerate(df_emp["combined_text"]):
    if i % 10 == 0: print(f"  Sentiment inference progress: {i}/{total}")
    results.append(get_sentiment(text))

df_emp[['sentiment_label', 'sentiment_score', 'polarity']] = pd.DataFrame(results, index=df_emp.index)

# STEP 8: THEME EXTRACTION
print("Extracting Themes")
df_emp['extracted_themes'] = df_emp['combined_text'].apply(extract_themes)

# text coverage metric 
n_with_text = (df_emp['combined_text'].str.len() >= 5).sum()

# perf_rating_missing_count rate
perf_rating_missing_rate = (df_emp['perf_rating_missing_count'].sum() / max(1, len(df_emp) * len(norm_perf_cols))) * 100

# STEP 9: POWER BI RELATIONAL SCHEMA 
print("Building Power BI Relational Schema")

# CSV 1: Fact Table (baseline_respondents.csv)
master_cols = ['id', 'country', 'seniority', 'partnership_open_binary',
               'personal_importance_norm', 'org_commitment_norm', 'importance_commitment_gap',
               'avg_performance_norm', 'perf_rating_missing_count',
               'combined_text', 'sentiment_label', 'polarity']
if 'peer_comparison_norm' in df_emp.columns: master_cols.insert(7, 'peer_comparison_norm')
df_emp[master_cols].to_csv(OUTPUT_DIR / "baseline_respondents.csv", index=False)

# CSV 2: Dimension Table (baseline_exploded_items.csv)
TOPIC_PILLAR_MAP = {
    "Climate action": "Environmental", "Clean energy": "Environmental", "Innovative sustainable IT solutions": "Environmental",
    "Shift to renewable energies": "Environmental", "Reduction of greenhouse gas emissions in business travel": "Environmental",
    "ISO14001 - Environmental management system": "Environmental", "CDP - Carbon disclosure project": "Environmental",
    "SBTi - Science based 1.5°C target": "Environmental", "Health & wellbeing": "People & Culture",
    "Diversity, equity & inclusion": "People & Culture", "Education": "People & Culture", "Employee sustainability trainings": "People & Culture",
    "Awareness campaigns on diversity and inclusion": "People & Culture", "Community outreach programs": "People & Culture",
    "ISO26000 - Social responsibility": "People & Culture", "Partnerships for sustainability": "Value Chain",
    "Ecovadis rating": "Value Chain", "B Corp certification": "Business Conduct", "Société à mission": "Business Conduct",
    "Société à mission (specific to French market)": "Business Conduct"
}

def explode_multiselect(col_name, category_name):
    if col_name not in df_emp.columns: return pd.DataFrame()
    s = df_emp[['id', col_name]].copy()
    s[col_name] = s[col_name].astype(str).str.split(r';\s*')
    s = s.explode(col_name).dropna()
    s['value'] = s[col_name].str.strip()
    # Filter out empty strings and the string 'nan' coerced from Pandas
    s = s[(s['value'] != '') & (s['value'].str.lower() != 'nan')]
    if s.empty: return pd.DataFrame()
    
    # Filter out noise phrases from certifications
    if category_name == 'Certification':
        noise_phrases = [
            'i have no clue', 'none of them', 'no clue what these mean',
            'i dont know enough to form an opinion', 'no clue', 'i have no opinion'
        ]
        # Normalize fancy apostrophes (\x92) and other quote variants before matching
        s_normalized = s['value'].str.lower().str.replace(r"[\x92\'\"]", '', regex=True)
        s = s[~s_normalized.isin(noise_phrases)]
        if s.empty: return pd.DataFrame()
    
    s['category'] = category_name
    s['pillar'] = s['value'].map(TOPIC_PILLAR_MAP).fillna('Other')
    return s[['id', 'category', 'value', 'pillar']]

def explode_themes():
    s = df_emp[['id', 'extracted_themes']].copy()
    s['extracted_themes'] = s['extracted_themes'].apply(lambda x: x if isinstance(x, list) else [])
    s = s.explode('extracted_themes').dropna()
    s.rename(columns={'extracted_themes': 'value'}, inplace=True)
    if s.empty: return pd.DataFrame()
    s['category'] = 'NLP Theme'
    s['pillar'] = 'Unprompted NLP' 
    return s[['id', 'category', 'value', 'pillar']]

df_exploded = pd.concat([
    explode_multiselect('topics', 'Topic'),
    explode_multiselect('initiatives', 'Initiative'),
    explode_multiselect('certifications', 'Certification'),
    explode_themes()
], ignore_index=True)

df_exploded.to_csv(OUTPUT_DIR / "baseline_exploded_items.csv", index=False)

# STEP 10: TERMINAL SUMMARY
print("BASELINE ANALYSIS COMPLETE")
print(f"Population: {len(df_emp)} employees")
print(f"Countries represented: {df_emp['country'].nunique()}")
print(f"Open to partnership: {df_emp['partnership_open_binary'].mean()*100:.1f}%")
print()
print("TEXT ENGAGEMENT:")
print(f"  Raw responses (≥5 chars): {n_with_text}/{len(df_emp)} ({n_with_text/len(df_emp)*100:.1f}%)")
print()
print("ORGANIZATIONAL SENTIMENT:")
print(f"  Optimistic: {(df_emp['sentiment_label']=='positive').mean()*100:.1f}%")
print(f"  Neutral: {(df_emp['sentiment_label']=='neutral').mean()*100:.1f}%")
print(f"  Frustrated: {(df_emp['sentiment_label']=='negative').mean()*100:.1f}%")
print()
print("DATA QUALITY:")
print(f"  Avg performance ratings missing: {perf_rating_missing_rate:.1f}%")
print()
print(f"Relational schema exported to: {OUTPUT_DIR}")
print(f" 1. baseline_respondents.csv ({len(df_emp)} rows)")
print(f" 2. baseline_exploded_items.csv ({len(df_exploded)} dimension mappings)")
