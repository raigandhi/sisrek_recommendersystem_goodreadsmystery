import gzip
import json
import pandas as pd

class DataLoader:
    def __init__(self, raw_data_path):
        self.raw_data_path = raw_data_path

    def _parse_json_gz(self, file_path, limit=None):
        """Generator untuk membaca file gzip JSON baris per baris."""
        data = []
        with gzip.open(file_path, 'rt', encoding='utf-8') as f:
            for i, line in enumerate(f):
                if limit and i >= limit:
                    break
                data.append(json.loads(line))
        return pd.DataFrame(data)

    def load_books(self, limit=None):
        path = f"{self.raw_data_path}/goodreads_books_mystery_thriller_crime.json.gz"
        
        # 1. Pastikan work_id, series, dan authors masuk ke daftar ini
        target_cols = [
            'book_id', 'work_id', 'title', 'authors', 'average_rating', 
            'ratings_count', 'description', 'popular_shelves', 
            'publication_year', 'similar_books', 'series', 'image_url'
        ]
        
        df = self._parse_json_gz(path, limit)
        
        if not df.empty:
            available_cols = [col for col in target_cols if col in df.columns]
            df = df[available_cols]
            
            # --- EKSTRAKSI ID PENTING ---
            if 'authors' in df.columns:
                df['author_id'] = df['authors'].apply(lambda x: str(x[0].get('author_id', '0')) if isinstance(x, list) and len(x) > 0 else '0')
            if 'series' in df.columns:
                df['series_id'] = df['series'].apply(lambda x: str(x[0]) if isinstance(x, list) and len(x) > 0 else '0')
            else:
                df['series_id'] = '0'
                
            # --- EKSTRAKSI GENRE SEMENTARA ---
            if 'popular_shelves' in df.columns:
                ignore_tags = ['to-read', 'currently-reading', 'owned', 'books', 'default', 'library', 'wish-list', 'audiobook', 'ebook']
                df['genres'] = df['popular_shelves'].apply(lambda x: [s['name'] for s in x if s['name'] not in ignore_tags][:5] if isinstance(x, list) else [])
            else:
                df['genres'] = [["Mystery", "Crime"]] * len(df)
                
            # --- FORMATTING NUMERIK ---
            df['publication_year'] = pd.to_numeric(df['publication_year'], errors='coerce').fillna(0).astype(int)
            df['average_rating'] = pd.to_numeric(df['average_rating'], errors='coerce').fillna(0.0)
            df['ratings_count'] = pd.to_numeric(df['ratings_count'], errors='coerce').fillna(0).astype(int)
            
            if 'similar_books' in df.columns:
                df['similar_books'] = df['similar_books'].apply(lambda x: x if isinstance(x, list) else [])
                
            # --- DEDUPLIKASI (ANTI BUKU GANDA) ---
            if 'work_id' in df.columns:
                df['work_id'] = df['work_id'].astype(str) # KUNCI PENTING: Paksa jadi string
                df = df.drop_duplicates(subset=['work_id'], keep='first')
                
            clean_titles = df['title'].str.replace(r'\(.*?\)', '', regex=True).str.replace(r'#.*', '', regex=True).str.strip().str.lower()
            df = df.loc[~clean_titles.duplicated(keep='first')]
            
        return df

    def load_works(self):
        path = f"{self.raw_data_path}/goodreads_book_works.json.gz"
        df = self._parse_json_gz(path)
        
        if not df.empty and 'work_id' in df.columns:
            df['work_id'] = df['work_id'].astype(str) # KUNCI PENTING: Paksa jadi string agar bisa di-merge
            df['original_publication_year'] = pd.to_numeric(df['original_publication_year'], errors='coerce').fillna(0).astype(int)
            return df[['work_id', 'original_publication_year']]
        return pd.DataFrame(columns=['work_id', 'original_publication_year'])

    def load_genres(self):
        # Sesuaikan dengan nama file Anda
        path = f"{self.raw_data_path}/goodreads_book_genres_initial.json.gz"
        df = self._parse_json_gz(path)
        
        if not df.empty:
            # Ekstrak dictionary kunci menjadi list of strings
            # Contoh: {"history, historical fiction": 1} menjadi ['history', 'historical fiction']
            def extract_genre_keys(g_dict):
                if isinstance(g_dict, dict):
                    raw_keys = list(g_dict.keys())
                    # Pisahkan jika ada koma di dalam string kunci
                    flat_list = [g.strip() for k in raw_keys for g in k.split(',')]
                    return list(set(flat_list))[:5] # Ambil max 5
                return []
                
            df['explicit_genres'] = df['genres'].apply(extract_genre_keys)
            return df[['book_id', 'explicit_genres']]
        return pd.DataFrame(columns=['book_id', 'explicit_genres'])

    def load_series(self):
        path = f"{self.raw_data_path}/goodreads_book_series.json.gz"
        cols = ['series_id', 'title']
        df = self._parse_json_gz(path)
        
        if not df.empty:
            available_cols = [col for col in cols if col in df.columns]
            df = df[available_cols]
            if 'series_id' in df.columns:
                df['series_id'] = df['series_id'].astype(str)
            if 'title' in df.columns:
                df.rename(columns={'title': 'series_title'}, inplace=True)
        return df

    def load_interactions(self, limit=None):
        path = f"{self.raw_data_path}/goodreads_interactions_mystery_thriller_crime.json.gz"
        cols = ['user_id', 'book_id', 'rating', 'is_read', 'is_reviewed']
        df = self._parse_json_gz(path, limit)
        
        if not df.empty:
            available_cols = [col for col in cols if col in df.columns]
            df = df[available_cols]
            
        return df

    def load_authors(self, limit=None):
        path = f"{self.raw_data_path}/goodreads_book_authors.json.gz"
        cols = ['author_id', 'name']
        df = self._parse_json_gz(path, limit)
        
        if not df.empty:
            available_cols = [col for col in cols if col in df.columns]
            df = df[available_cols]
            
            # Pastikan author_id bertipe string agar bisa digabungkan (merge) dengan data buku
            if 'author_id' in df.columns:
                df['author_id'] = df['author_id'].astype(str)
                
        return df