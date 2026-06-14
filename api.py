import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pickle
import pandas as pd
import json
from src.recommender import HybridRecommender

app = FastAPI(title="Mystearch API")

# MENGATASI CORS: Buka untuk semua origin agar Vercel React bisa masuk
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LOGIKA JALUR FILE UNTUK VERCEL SERVERLESS
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
cbf_model_path = os.path.join(BASE_DIR, 'models', 'cbf_model.pkl')
cf_model_path = os.path.join(BASE_DIR, 'models', 'cf_model.pkl')

print("Memuat model ke memori...")
with open(cbf_model_path, 'rb') as f: 
    cbf = pickle.load(f)
with open(cf_model_path, 'rb') as f: 
    cf = pickle.load(f)

hybrid_model = HybridRecommender(cbf, cf)
books_df = cbf.books_df.copy()
print("Model siap!")

# --- ENDPOINT 1: Tes Koneksi ---
@app.get("/")
def read_root():
    return {"message": "Server Mystearch API Berjalan Sempurna di Vercel! 🚀"}

# --- ENDPOINT 2: Mengambil Rekomendasi ---
@app.get("/api/recommend")
def get_recommendations(user_id: str = "guest", title: str = "", target_genre: str = "Semua", limit: int = 10):
    if title:
        raw_recs = hybrid_model.recommend(user_id=user_id, title=title, top_n=20)
        recs = [r for r in raw_recs if target_genre == "Semua" or target_genre in r.get("genres", [])][:limit]
    else:
        recs = books_df.sort_values(by="average_rating", ascending=False).head(limit).to_dict("records")
    
    if len(recs) > 0:
        recs = json.loads(pd.DataFrame(recs).to_json(orient="records"))
    
    return {"status": "success", "data": recs}

# --- ENDPOINT 3: Mengambil Metadata ---
@app.get("/api/metadata")
def get_metadata():
    titles = books_df['title'].dropna().unique().tolist()
    all_genres = set()
    for g in books_df['genres'].dropna():
        if isinstance(g, list):
            all_genres.update(g)
            
    return {
        "status": "success",
        "total_books": len(books_df),
        "titles": titles,
        "genres": sorted(list(all_genres))
    }