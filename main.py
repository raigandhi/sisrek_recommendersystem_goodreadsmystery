import pickle
import os
import pandas as pd # Pastikan pandas di-import
from src.data_loader import DataLoader
from src.preprocessor import Preprocessor
from src.recommender import ContentBasedRecommender, CollaborativeRecommender
from src.evaluator import Evaluator

def main():
    print("1. Loading Data...")
    loader = DataLoader("raw_data")
    books_df = loader.load_books(limit=50000) 
    interactions_df = loader.load_interactions(limit=500000)
    
    # Load data authors (Bisa tanpa limit karena file ini relatif ringan)
    authors_df = loader.load_authors() 

    print("1.5 Loading Extra Metadata (Genres, Works, & Series)...")
    genres_df = loader.load_genres()
    works_df = loader.load_works()
    series_df = loader.load_series() # <-- AMBIL DATA SERIES

    print("2. Preprocessing...")
    prep = Preprocessor(min_user_ratings=5, min_book_ratings=5)
    interactions_clean = prep.clean_interactions(interactions_df)
    books_clean = prep.prepare_text_features(books_df)

    print("2.5 Menyematkan Metadata Lanjutan...")
    
    # 1. Merge Authors Name
    if not authors_df.empty:
        books_clean = books_clean.merge(authors_df[['author_id', 'name']], on='author_id', how='left')
        books_clean.rename(columns={'name': 'author_name'}, inplace=True)
    books_clean['author_name'] = books_clean['author_name'].fillna('Unknown')

    # 2. Merge Original Publication Year
    if not works_df.empty:
        books_clean = books_clean.merge(works_df, on='work_id', how='left')
        books_clean['publication_year'] = books_clean.apply(
            lambda x: x['original_publication_year'] if x['original_publication_year'] > 0 else x['publication_year'], axis=1
        )

    # 3. Merge Explicit Genres
    if not genres_df.empty:
        books_clean = books_clean.merge(genres_df, on='book_id', how='left')
        books_clean['genres'] = books_clean.apply(
            lambda x: x['explicit_genres'] if isinstance(x['explicit_genres'], list) and len(x['explicit_genres']) > 0 else x['genres'], axis=1
        )

    # 4. Merge Series Title (PENGGABUNGAN DATA BARU)
    if not series_df.empty:
        books_clean = books_clean.merge(series_df[['series_id', 'series_title']], on='series_id', how='left')
    books_clean['series_title'] = books_clean['series_title'].fillna('Standalone Book (Bukan Serial)')
    # ------------------------------------------------

    print("3. Training Content-Based Model...")
    cbf = ContentBasedRecommender()
    cbf.fit(books_clean) 

    print("4. Training Collaborative Filtering Model...")
    cf = CollaborativeRecommender()
    cf.fit(interactions_clean)

    print("4.5 Menghitung Metrik Evaluasi Model (RMSE, MAE, Precision, Recall)...")
    from surprise import SVD
    rmse, mae, precision, recall = Evaluator.evaluate_cf(interactions_clean, SVD(), k=10, threshold=3.5)
    
    print("="*50)
    print(f"HASIL EVALUASI MODEL (K=10, Threshold=3.5 Bintang)")
    print(f"   -> RMSE             : {rmse:.4f}")
    print(f"   -> MAE              : {mae:.4f}")
    print(f"   -> Precision@10     : {precision:.4f} ({precision*100:.1f}%)")
    print(f"   -> Recall@10        : {recall:.4f} ({recall*100:.1f}%)")
    print("="*50)
    # ... (lanjut ke save model) ...

    print("5. Saving Models & Data for Streamlit...")
    os.makedirs('models', exist_ok=True)
    os.makedirs('processed_data', exist_ok=True)

    with open('models/cbf_model.pkl', 'wb') as f:
        pickle.dump(cbf, f)
    with open('models/cf_model.pkl', 'wb') as f:
        pickle.dump(cf, f)
        
    books_clean.to_csv('processed_data/books_list.csv', index=False)
    
    print("Pipeline Selesai! Jalankan 'streamlit run app.py' untuk melihat demo.")

if __name__ == "__main__":
    main()