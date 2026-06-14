from collections import defaultdict
from surprise import accuracy
from surprise.model_selection import train_test_split
from surprise import Dataset, Reader

class Evaluator:
    @staticmethod
    def evaluate_cf(interactions_df, model, k=10, threshold=3.5):
        # 1. Menyiapkan dan Membagi Data (Hold-out 80:20)
        reader = Reader(rating_scale=(1, 5))
        data = Dataset.load_from_df(interactions_df[['user_id', 'book_id', 'rating']], reader)
        trainset, testset = train_test_split(data, test_size=0.2)
        
        # 2. Melatih dan Menguji Model
        model.fit(trainset)
        predictions = model.test(testset)
        
        # 3. Metrik Error (Berdasarkan selisih prediksi nilai)
        rmse = accuracy.rmse(predictions, verbose=False)
        mae = accuracy.mae(predictions, verbose=False)
        
        # 4. Metrik Ranking Top-N (Precision@K & Recall@K)
        # Mengelompokkan prediksi berdasarkan setiap user
        user_est_true = defaultdict(list)
        for uid, _, true_r, est, _ in predictions:
            user_est_true[uid].append((est, true_r))
            
        precisions = dict()
        recalls = dict()
        
        for uid, user_ratings in user_est_true.items():
            # Urutkan buku dari prediksi rating tertinggi ke terendah
            user_ratings.sort(key=lambda x: x[0], reverse=True)
            
            # Hitung buku yang relevan (rating asli >= threshold yang dianggap "suka")
            n_rel = sum((true_r >= threshold) for (_, true_r) in user_ratings)
            
            # Hitung buku yang direkomendasikan di Top-K (prediksi >= threshold)
            n_rec_k = sum((est >= threshold) for (est, _) in user_ratings[:k])
            
            # Hitung buku yang relevan DAN masuk dalam Top-K
            n_rel_and_rec_k = sum(((true_r >= threshold) and (est >= threshold)) for (est, true_r) in user_ratings[:k])
            
            # Precision@K: Proporsi buku direkomendasikan yang relevan
            precisions[uid] = n_rel_and_rec_k / n_rec_k if n_rec_k != 0 else 1
            
            # Recall@K: Proporsi buku relevan yang berhasil direkomendasikan
            recalls[uid] = n_rel_and_rec_k / n_rel if n_rel != 0 else 1
            
        # Rata-ratakan Precision dan Recall untuk seluruh user
        precision_at_k = sum(precisions.values()) / len(precisions)
        recall_at_k = sum(recalls.values()) / len(recalls)
        
        return rmse, mae, precision_at_k, recall_at_k