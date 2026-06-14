# Raw Data Folder

Folder ini adalah tempat untuk menyimpan dataset mentah Goodreads Mystery. 
Karena ukuran datanya terlalu besar untuk diunggah ke GitHub, file aslinya tidak disertakan di sini.

**Cara Menjalankan Ulang Pipeline:**
1. Unduh dataset mentah dari link berikut: `https://cseweb.ucsd.edu/~jmcauley/datasets/goodreads.html`
2. Download dataset
    - goodreads_books_mystery_thriller_crime.json.gz
    - goodreads_interactions_mystery_thriller_crime.json.gz
    - goodreads_reviews_mystery_thriller_crime.json.gz
    - goodreads_book_authors.json.gz
    - goodreads_book_works.json.gz
    - goodreads_book_series.json.gz
    - goodreads_book_genres_initial.json.gz
3. Masukkan file `.json` atau `.csv` mentah tersebut ke dalam folder ini.
4. Jalankan perintah `python main.py`.