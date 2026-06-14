import pandas as pd
import numpy as np

class Preprocessor:
    def __init__(self, min_user_ratings=10, min_book_ratings=5):
        self.min_user_ratings = min_user_ratings
        self.min_book_ratings = min_book_ratings

    def clean_interactions(self, df):
        # Filter rating eksplisit (> 0)
        df = df[df['rating'] > 0].copy()
        
        # Hapus user dengan < 10 rating
        user_counts = df['user_id'].value_counts()
        valid_users = user_counts[user_counts >= self.min_user_ratings].index
        df = df[df['user_id'].isin(valid_users)]
        
        # Hapus buku dengan < 5 rating
        book_counts = df['book_id'].value_counts()
        valid_books = book_counts[book_counts >= self.min_book_ratings].index
        df = df[df['book_id'].isin(valid_books)]
        
        return df

    def prepare_text_features(self, books_df):
        books_df = books_df.copy()
        # Menggabungkan fitur teks untuk TF-IDF
        books_df['description'] = books_df['description'].fillna('')
        books_df['title'] = books_df['title'].fillna('')
        # Asumsi genres dalam format list/string
        books_df['genres_str'] = books_df['genres'].apply(lambda x: ' '.join(x) if isinstance(x, list) else str(x))
        
        books_df['combined_features'] = books_df['title'] + " " + books_df['description'] + " " + books_df['genres_str']
        return books_df