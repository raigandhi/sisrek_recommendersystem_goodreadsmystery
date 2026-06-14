import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import Dataset, Reader, SVD

class ContentBasedRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.tfidf_matrix = None # Kita simpan sparse matrix-nya saja
        self.books_df = None
        self.indices = None

    def fit(self, books_df):
        self.books_df = books_df.reset_index(drop=True)
        # tfidf_matrix ini aman untuk memori karena formatnya sparse (hanya menyimpan nilai bukan nol)
        self.tfidf_matrix = self.vectorizer.fit_transform(self.books_df['combined_features'])
        self.indices = pd.Series(self.books_df.index, index=self.books_df['title']).drop_duplicates()

    # --- PERHATIKAN INDENTASINYA DI SINI, HARUS SEJAJAR DENGAN 'def fit' ---
    def get_similar_books(self, title, top_n=10):
        if title not in self.indices:
            return []
        
        idx = self.indices[title]
        
        # --- TAMBAHKAN 2 BARIS INI UNTUK MENGATASI DUPLIKAT ---
        if isinstance(idx, pd.Series):
            idx = idx.iloc[0]
        # ------------------------------------------------------
        
        # 2. Ambil vektor TF-IDF HANYA untuk buku tersebut (1 baris)
        book_vector = self.tfidf_matrix[idx]
        
        # 3. Hitung cosine similarity
        sim_scores = cosine_similarity(book_vector, self.tfidf_matrix).flatten()
        
        # 4. Urutkan skor
        sim_scores_enum = list(enumerate(sim_scores))
        sim_scores_sorted = sorted(sim_scores_enum, key=lambda x: x[1], reverse=True)
        
        # Ambil Top N
        top_indices = [i[0] for i in sim_scores_sorted[1:top_n+1]]
        
        return self.books_df.iloc[top_indices][['book_id', 'title', 'genres']].to_dict('records')
class CollaborativeRecommender:
    def __init__(self):
        self.model = SVD(n_factors=50, n_epochs=20, lr_all=0.005, reg_all=0.02)
        
    def fit(self, interactions_df):
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(interactions_df[['user_id', 'book_id', 'rating']], reader)
        trainset = data.build_full_trainset()
        self.model.fit(trainset)

    def predict_rating(self, user_id, book_id):
        prediction = self.model.predict(user_id, book_id)
        return prediction.est


class HybridRecommender:
    def __init__(self, cbf_model, cf_model, alpha=0.5):
        self.cbf = cbf_model
        self.cf = cf_model
        self.alpha = alpha

    def recommend(self, user_id, title, top_n=10, min_rating=0.0, min_year=0, max_year=2024):
        # 1. Ambil data referensi buku yang dipilih
        if title not in self.cbf.indices:
            return []
        
        target_idx = self.cbf.indices[title]
        target_book = self.cbf.books_df.iloc[target_idx]
        target_author = target_book.get('author_id', '')
        target_series = target_book.get('series', [])
        target_similar_graph = target_book.get('similar_books', [])

        # 2. Dapatkan kandidat dari CBF (ambil lebih banyak untuk di-filter)
        cbf_candidates = self.cbf.get_similar_books(title, top_n=50)
        if not cbf_candidates:
            return []
        
        hybrid_scores = []
        for book_dict in cbf_candidates:
            # Ambil data lengkap kandidat dari DataFrame
            book_id = book_dict['book_id']
            full_book_data = self.cbf.books_df[self.cbf.books_df['book_id'] == book_id].iloc[0]
            
            # --- FILTERING ---
            if full_book_data['average_rating'] < min_rating:
                continue
            if not (min_year <= full_book_data['publication_year'] <= max_year):
                continue

            # --- PERHITUNGAN SKOR DASAR ---
            cf_score = self.cf.predict_rating(user_id, book_id)
            cf_norm = (cf_score - 1) / 4.0 
            base_score = self.alpha * 1.0 + (1 - self.alpha) * cf_norm 
            
            # --- BONUS KNOWLEDGE-GRAPH & METADATA ---
            bonus = 0.0
            # Bonus jika penulisnya sama
            if full_book_data.get('author_id') == target_author and target_author != '0':
                bonus += 0.15
            # Bonus jika berada di seri yang sama
            if any(s in target_series for s in full_book_data.get('series', [])) and target_series:
                bonus += 0.10
            # Bonus jika Goodreads secara eksplisit menyatakan ini mirip
            if book_id in target_similar_graph:
                bonus += 0.20

            final_score = min(base_score + bonus, 1.0) # Cap maksimal 1.0 (100%)
            
            book_dict['hybrid_score'] = final_score
            book_dict['average_rating'] = full_book_data['average_rating']
            book_dict['publication_year'] = full_book_data['publication_year']
            book_dict['image_url'] = full_book_data.get('image_url', '')
            hybrid_scores.append(book_dict)
            
        # Urutkan berdasarkan skor final
        hybrid_scores = sorted(hybrid_scores, key=lambda x: x['hybrid_score'], reverse=True)
        return hybrid_scores[:top_n]