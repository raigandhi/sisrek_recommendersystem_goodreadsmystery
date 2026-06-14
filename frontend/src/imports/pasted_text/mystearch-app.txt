import streamlit as st
import pickle
import pandas as pd
import ast
import plotly.express as px
from src.recommender import HybridRecommender

# --- 1. KONFIGURASI HALAMAN & STATE ---
st.set_page_config(page_title="Mystearch", layout="wide", initial_sidebar_state="expanded")

# Pindahkan inisialisasi state ke PALING ATAS agar tidak terjadi KeyError/AttributeError
if 'username' not in st.session_state: st.session_state.username = None
if 'reading_list' not in st.session_state: st.session_state.reading_list = []
if 'favorites' not in st.session_state: st.session_state.favorites = []
if 'history' not in st.session_state: st.session_state.history = []
if 'detail_book' not in st.session_state: st.session_state.detail_book = None
if 'search_results' not in st.session_state: st.session_state.search_results = []
if 'top_books_sample' not in st.session_state: st.session_state.top_books_sample = None

# --- 2. INJEKSI CSS KUSTOM ---
def apply_custom_css():
    st.markdown("""
        <style>
        :root {
            --bg-dark: #1B1717; --text-light: #EEEBDD; --primary-red: #810000; 
            --secondary-red: #630000; --card-bg: #241f1f;
        }
        
        .stApp, .stApp > header { background-color: var(--bg-dark) !important; color: var(--text-light) !important; }
        h1, h2, h3, h4, p, span, label, div { color: var(--text-light) !important; font-family: 'Segoe UI', sans-serif;}
        #MainMenu, footer {visibility: hidden;}
        
        /* --- PERBAIKAN SIDEBAR (Menyembunyikan Bulatan Radio Button) --- */
        [data-testid="stSidebar"] { background-color: #141111 !important; border-right: 1px solid var(--secondary-red); }
        /* CSS Selektor agresif untuk Streamlit versi terbaru */
        [data-testid="stSidebar"] div[role="radiogroup"] label > div:first-of-type { display: none !important; }
        [data-testid="stSidebar"] div[role="radiogroup"] { gap: 8px; }
        [data-testid="stSidebar"] div[role="radiogroup"] label { 
            background-color: transparent; padding: 12px 15px; border-radius: 8px; cursor: pointer; 
            border: 1px solid transparent; transition: 0.3s; width: 100%; margin: 0;
            display: flex; align-items: center; justify-content: flex-start;
        }
        [data-testid="stSidebar"] div[role="radiogroup"] label:hover { background-color: var(--card-bg); border-color: var(--secondary-red); }
        [data-testid="stSidebar"] div[role="radiogroup"] label[data-selected="true"] { background-color: var(--primary-red) !important; }
        [data-testid="stSidebar"] div[role="radiogroup"] label p { font-weight: bold !important; font-size: 1rem !important; margin: 0; }

        /* --- PERBAIKAN FORM PENCARIAN --- */
        [data-testid="stForm"] {
            background: linear-gradient(135deg, rgba(129,0,0,0.8), rgba(27,23,23,1));
            border: 1px solid var(--secondary-red); border-radius: 12px; padding: 30px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }

        /* --- PERBAIKAN KARTU BUKU & GAMBAR --- */
        .book-card{
            background: linear-gradient(180deg, #241f1f 0%, #1b1717 100%);
            border: 1px solid rgba(238,235,221,.08);
            border-radius: 16px;
            overflow: hidden;
            transition: all .3s ease;
            position: relative;
            padding: 15px;
            height: 100%;
        }
        .book-card:hover{
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(129,0,0,.35);
            border-top-color: var(--text-light);
        }
        
        /* CSS GAMBAR (DIUPDATE) - Memaksa gambar mengisi penuh box */
        .cover-img { 
            width: 100%; height: 260px; object-fit: cover; object-position: center; 
            border-radius: 6px; margin-bottom: 10px; display: block; background-color: #141111;
        }
        
        .match-badge { 
            position: absolute; top: 10px; left: 10px; background-color: var(--primary-red); 
            color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5); z-index: 2;
        }
        .card-title-fix {
            font-weight: bold; font-size: 0.95rem; line-height: 1.2; 
            height: 2.4em; overflow: hidden; margin-bottom: 5px;
        }

        /* Banner & Modul */
        .hero-banner{
            background: linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.75)), url("https://images.unsplash.com/photo-1512820790803-83ca734da794");
            background-size: cover; background-position: center; border-radius: 20px;
            padding: 50px; min-height: 320px; display: flex; flex-direction: column;
            justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,.5);
        }
        .bottom-module { background-color: var(--card-bg); padding: 25px; border-radius: 12px; border: 1px solid #332b2b; height: 100%; }
        
        /* Tombol */
        div.stButton > button, [data-testid="stFormSubmitButton"] > button { 
            background-color: var(--primary-red); color: white !important; border: 1px solid var(--primary-red); 
            border-radius: 6px; font-weight:bold; width: 100%; transition: 0.3s;
        }
        div.stButton > button:hover, [data-testid="stFormSubmitButton"] > button:hover { background-color: var(--secondary-red); border-color: var(--text-light); }
        .stSlider { padding-top: 15px; }
        </style>
    """, unsafe_allow_html=True)

# --- 3. HELPER FUNCTIONS ---
@st.cache_resource
def load_models():
    with open('models/cbf_model.pkl', 'rb') as f: cbf = pickle.load(f)
    with open('models/cf_model.pkl', 'rb') as f: cf = pickle.load(f)
    books_df = cbf.books_df.copy()
    return cbf, cf, books_df

# FUNGSI GAMBAR (DIUPDATE) - Anti "nophoto" Goodreads
def get_high_res_img(url):
    fallback_img = "https://placehold.co/150x220/141111/EEEBDD?text=No+Cover"
    
    # 1. Cek apakah URL kosong/NaN
    if pd.isna(url) or not isinstance(url, str) or url.strip() == '': 
        return fallback_img
        
    # 2. Cek apakah Goodreads mengirimkan gambar placeholder 'g' bawaan mereka
    if 'nophoto' in url:
        return fallback_img

    # 3. Kembalikan URL asli dengan aman (tanpa memaksa ubah resolusi ke l/)
    url = url.replace('http://', 'https://')
    return url

# --- 4. KOMPONEN DETAIL BUKU ---
def show_book_detail(books_df):
    book = st.session_state.detail_book
    st.markdown("<div class='hero-banner'><h2 style='margin:0;'>Detail Buku</h2></div>", unsafe_allow_html=True)
    
    col_img, col_info = st.columns([1, 3])
    with col_img:
        img_url = get_high_res_img(book.get('image_url', ''))
        st.markdown(f"<img src='{img_url}' onerror=\"this.onerror=null; this.src='https://placehold.co/150x220/141111/EEEBDD?text=No+Cover';\" style='width:100%; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.5);'>", unsafe_allow_html=True)
    
    with col_info:
        st.title(book['title'])
        
        book_row = books_df[books_df["book_id"].astype(str) == str(book["book_id"])]
        
        # Ekstrak data Penulis dan Seri secara aman dari RAM
        author_name = book_row.iloc[0].get("author_name", "Unknown Author") if not book_row.empty else "Unknown Author"
        series_title = book_row.iloc[0].get("series_title", "Standalone Book") if not book_row.empty else "Standalone Book"
        
        # Tampilkan secara rapi di antarmuka web
        st.write(f"**Penulis:** {author_name} | **Rating:** {book.get('average_rating', 'N/A')} | **Tahun:** {book.get('publication_year', 'N/A')}")
        st.write(f"**Seri Buku:** {series_title}") 
        st.write(f"**Genre:** {', '.join(book.get('genres', ['Mystery']))}")
        
        desc = (book_row.iloc[0].get("description", "")) if not book_row.empty else ""
        
        st.markdown("### Sinopsis")
        st.write(desc if pd.notna(desc) and desc.strip() != "" else "Deskripsi tidak tersedia di dalam arsip data.")
        
        st.write("<br>", unsafe_allow_html=True)
        c1, c2, c3 = st.columns(3)
        with c1:
            if st.button("Tambah ke Rak Buku"):
                if str(book['book_id']) not in [str(b['book_id']) for b in st.session_state.reading_list]:
                    st.session_state.reading_list.append(book)
                    st.success("Tersimpan!")
                else: st.info("Sudah di rak.")
        with c2:
            if st.button("Jadikan Favorit"):
                if str(book['book_id']) not in [str(b['book_id']) for b in st.session_state.favorites]:
                    st.session_state.favorites.append(book)
                    st.balloons()
                else: st.info("Sudah difavoritkan.")
        with c3:
            if st.button("Kembali"):
                st.session_state.detail_book = None
                st.rerun()

# --- 5. HALAMAN-HALAMAN ---
def render_beranda(books_df):
    st.markdown("""<div class='hero-banner'><h1 style='margin-bottom:0;'>Temukan buku yang anda cari!</h1>
    <p style='font-size:1.1rem; color:#a8a397;'>Sistem rekomendasi Hybrid yang menganalisis preferensi kolaboratif dan fitur teks.</p></div>""", unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    c1, c2, c3, c4 = st.columns(4)
    with c1: st.metric("Total Buku", f"{len(books_df):,}")
    with c2: st.metric("Favorit", len(st.session_state.favorites))
    with c3: st.metric("Rak Buku", len(st.session_state.reading_list))
    with c4: st.metric("Riwayat", len(st.session_state.history))

    st.write("")
    search_query = st.text_input("", placeholder="Cari judul buku, penulis, atau genre...")

    if search_query:
        filtered = books_df[books_df["title"].str.contains(search_query, case=False, na=False)]
        st.markdown("### Hasil Pencarian")
        cols = st.columns(5)
        for idx, (_, row) in enumerate(filtered.head(10).iterrows()):
            with cols[idx % 5]:
                img_url = get_high_res_img(row["image_url"])
                st.markdown(f"""
                <div class='book-card'>
                    <img src='{img_url}' onerror="this.onerror=null; this.src='https://placehold.co/150x220/141111/EEEBDD?text=No+Cover';" class='cover-img'>
                    <div class='card-title-fix'>{row['title']}</div>
                </div>
                """, unsafe_allow_html=True)
                if st.button("Lihat Detail", key=f"search_home_btn_{row['book_id']}"):
                    st.session_state.detail_book = row.to_dict()
                    st.rerun()

    st.write("<br>", unsafe_allow_html=True)
    
    # --- BAGIAN YANG DIUBAH UNTUK TOMBOL REFRESH ---
    col_title, col_btn = st.columns([5, 1])
    with col_title:
        st.markdown("### Rekomendasi Buku Rating Tertinggi")
    with col_btn:
        if st.button("🔄 Segarkan", use_container_width=True):
            # Kosongkan memori agar sistem mengacak ulang saat tombol ditekan
            st.session_state.top_books_sample = None
            st.rerun()

    # Logika Pengacakan Cerdas: Ambil 5 acak dari 100 buku terbaik
    if st.session_state.top_books_sample is None:
        pool_top_books = books_df.sort_values(by=['average_rating', 'ratings_count'], ascending=[False, False]).head(100)
        st.session_state.top_books_sample = pool_top_books.sample(5)

    top_books = st.session_state.top_books_sample
    cols = st.columns(5)
    
    for i, (_, row) in enumerate(top_books.iterrows()):
        with cols[i]:
            img_url = get_high_res_img(row['image_url'])
            st.markdown(f"""
            <div class='book-card'>
                <div class='match-badge'>Top Rated</div>
                <img src='{img_url}' onerror="this.onerror=null; this.src='https://placehold.co/150x220/141111/EEEBDD?text=No+Cover';" class='cover-img'>
                <div class='card-title-fix'>{row['title']}</div>
                <div style='font-size:0.8rem; color:#a8a397;'>⭐ {row['average_rating']}</div>
            </div>
            """, unsafe_allow_html=True)
            # Menambahkan indeks 'i' pada key agar tidak error jika kebetulan buku teracak 2x (sangat jarang tapi aman)
            if st.button("Lihat Detail", key=f"home_btn_{row['book_id']}_{i}"):
                st.session_state.detail_book = row.to_dict()
                st.rerun()
    # --- AKHIR BAGIAN YANG DIUBAH ---

    st.write("---")
    
    col_a, col_b, col_c = st.columns(3)
    with col_a:
        st.markdown("<div class='bottom-module'>", unsafe_allow_html=True)
        st.markdown("#### Preferensi Genre Global")
        all_genres = []
        for gs in books_df['genres'].dropna(): all_genres.extend(gs)
        df_pie = pd.Series(all_genres).value_counts().head(4).reset_index()
        df_pie.columns = ['Genre', 'Count']
        fig = px.pie(df_pie, values='Count', names='Genre', hole=0.5, color_discrete_sequence=['#810000', '#630000', '#a32a2a', '#EEEBDD'])
        fig.update_layout(margin=dict(t=0,b=0,l=0,r=0), paper_bgcolor='rgba(0,0,0,0)', font=dict(color='#EEEBDD'), showlegend=True, legend=dict(orientation="h", yanchor="bottom", y=-0.3, xanchor="center", x=0.5))
        st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
        st.markdown("</div>", unsafe_allow_html=True)
        
    with col_b:
        st.markdown("<div class='bottom-module'>", unsafe_allow_html=True)
        st.markdown("#### Riwayat Acuan Terbaru")
        if not st.session_state.history: st.caption("Belum ada riwayat.")
        else:
            for h in list(dict.fromkeys(reversed(st.session_state.history)))[:4]: st.markdown(f"- 🔍 {h}")
        st.markdown("</div>", unsafe_allow_html=True)
        
    with col_c:
        st.markdown("<div class='bottom-module'>", unsafe_allow_html=True)
        st.markdown(f"#### Rak Buku ({len(st.session_state.reading_list)})")
        if not st.session_state.reading_list: st.caption("Rak masih kosong.")
        else:
            for b in reversed(st.session_state.reading_list[-4:]): st.markdown(f"- {b['title'][:30]}...")
        st.markdown("</div>", unsafe_allow_html=True)

def render_cari(hybrid_model, books_df):
    if st.session_state.get("detail_book") is not None:
        show_book_detail(books_df)
        return

    with st.form("search_form"):
        st.markdown("<h2 style='margin-bottom:0;'>Cari buku yang kamu mau!</h2>", unsafe_allow_html=True)
        st.markdown("<p style='color:#a8a397;'>Masukkan judul sebagai acuan atau filter berdasarkan kriteria.</p>", unsafe_allow_html=True)

        all_gs = set()
        for g in books_df['genres'].dropna(): all_gs.update(g)

        c1, c2, c3, c4 = st.columns(4)
        with c1: target_title = st.selectbox("Acuan Judul (Opsional):", [""] + books_df['title'].unique().tolist())
        with c2: target_genre = st.selectbox("Genre:", ["Semua"] + sorted(list(all_gs)))
        with c3: target_rating = st.slider("Min Rating:", 0.0, 5.0, 3.5, 0.1)
        with c4: target_years = st.slider("Tahun Terbit:", 1900, 2024, (2000, 2024))

        submitted = st.form_submit_button("Temukan Rekomendasi")

    if submitted:
        recs = []
        with st.spinner("Menganalisis matriks..."):
            if target_title:
                raw = hybrid_model.recommend(user_id=st.session_state.username, title=target_title, top_n=20, min_rating=target_rating, min_year=target_years[0], max_year=target_years[1])
                recs = [r for r in raw if target_genre == "Semua" or target_genre in r["genres"]][:10]
                st.session_state.history.append(target_title)
            else:
                kb = books_df[(books_df["average_rating"] >= target_rating) & (books_df["publication_year"] >= target_years[0]) & (books_df["publication_year"] <= target_years[1])]
                if target_genre != "Semua":
                    kb = kb[kb["genres"].apply(lambda x: target_genre in x if isinstance(x, list) else False)]
                recs = kb.sort_values(by="average_rating", ascending=False).head(10).to_dict("records")

        st.session_state.search_results = recs

    recs = st.session_state.search_results

    if recs:
        st.markdown("#### Rekomendasi untuk anda!")
        cols = st.columns(5)
        for idx, r in enumerate(recs):
            with cols[idx % 5]:
                score = r.get("hybrid_score", 1)
                match_pct = min(99, int(score * 100))
                img_url = get_high_res_img(r.get("image_url", ""))

                st.markdown(f"""
                <div class='book-card'>
                    <div class='match-badge'>{match_pct}% Match</div>
                    <img src='{img_url}' onerror="this.onerror=null; this.src='https://placehold.co/150x220/141111/EEEBDD?text=No+Cover';" class='cover-img'>
                    <div class='card-title-fix'>{r['title']}</div>
                    <div style='font-size:0.8rem;color:#a8a397;'>⭐ {r.get('average_rating','')} | 📅 {r.get('publication_year','')}</div>
                </div>
                """, unsafe_allow_html=True)

                if st.button("Lihat Detail", key=f"detail_{r['book_id']}"):
                    full_book = books_df[books_df["book_id"].astype(str) == str(r["book_id"])]
                    if not full_book.empty:
                        st.session_state.detail_book = full_book.iloc[0].to_dict()
                    else:
                        st.session_state.detail_book = r
                    st.rerun()

    elif st.session_state.search_results == []:
        st.warning("Tidak ada buku yang cocok dengan filter tersebut.")

def render_list_page(data_list, title, empty_msg, books_df):
    st.markdown(f"<div class='hero-banner'><h2 style='margin:0;'>{title}</h2></div>", unsafe_allow_html=True)
    if not data_list:
        st.info(empty_msg)
    else:
        cols = st.columns(5)
        for idx, r in enumerate(data_list):
            with cols[idx % 5]:
                img_url = get_high_res_img(r.get('image_url',''))
                st.markdown(f"""
                <div class='book-card'>
                    <img src='{img_url}' onerror="this.onerror=null; this.src='https://placehold.co/150x220/141111/EEEBDD?text=No+Cover';" class='cover-img'>
                    <div class='card-title-fix'>{r['title']}</div>
                </div>""", unsafe_allow_html=True)
                if st.button("Lihat Detail", key=f"list_btn_{idx}_{r['book_id']}"):
                    full_book = books_df[books_df["book_id"].astype(str) == str(r["book_id"])]
                    if not full_book.empty:
                        st.session_state.detail_book = full_book.iloc[0].to_dict()
                    else:
                        st.session_state.detail_book = r
                    st.rerun()

# --- 6. SISTEM LOGIN ---
def login_page():
    apply_custom_css()
    left, right = st.columns([1.3, 1])
    with left:
        st.markdown("""
            <div class='hero-banner'>
                <h1>Mystearch</h1>
                <h3>Cari Rekomendasi Buku Mystery, Thriller & Crime yang kamu mau!</h3>
                <p>Menggunakan Hybrid Collaborative Filtering dan Content-Based Filtering</p>
            </div>
            """, unsafe_allow_html=True)
    with right:
        st.markdown("## Login")
        with st.form("login_form"):
            name = st.text_input("Nama Pengguna")
            submit = st.form_submit_button("Masuk")
            if submit:
                if name.strip():
                    st.session_state.username = name
                    st.rerun()
                else:
                    st.error("Nama tidak boleh kosong")

# --- 7. MAIN ROUTER ---
def main():
    apply_custom_css()
    if not st.session_state.username:
        login_page()
        return

    cbf, cf, books_df = load_models()
    hybrid_model = HybridRecommender(cbf, cf)

    with st.sidebar:
        st.markdown(f"""
        <div style="text-align:center; padding:15px;">
        <h1 style="color:#EEEBDD; margin-bottom:0;">Mystearch</h1>
        <p>Halo, <b>{st.session_state.username}</b></p>
        <hr>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("<p style='font-size:0.8rem; color:#630000; font-weight:bold; margin-bottom:5px; text-transform:uppercase;'>Menu Utama</p>", unsafe_allow_html=True)
        menu = st.radio("Navigasi", ["Beranda", "Cari Buku", "Riwayat", "Favorit", "Rak Buku"], label_visibility="collapsed")
        
        st.markdown("<br><br>", unsafe_allow_html=True)
        if st.button("Log Out"):
            st.session_state.username = None
            st.session_state.history = []
            st.session_state.detail_book = None
            st.session_state.search_results = []
            st.rerun()

    if st.session_state.detail_book:
        show_book_detail(books_df)
    else:
        if menu == "Beranda": render_beranda(books_df)
        elif menu == "Cari Buku": render_cari(hybrid_model, books_df)
        elif menu == "Riwayat": 
            st.markdown("<div class='hero-banner'><h2 style='margin:0;'>Riwayat Pencarian Acuan</h2></div>", unsafe_allow_html=True)
            if not st.session_state.history: st.info("Anda belum melakukan pencarian acuan judul.")
            for h in list(dict.fromkeys(reversed(st.session_state.history))): st.markdown(f"#### 🔍 {h}")
        elif menu == "Favorit":
            render_list_page(st.session_state.favorites, "Koleksi Favorit", "Belum ada buku yang ditandai favorit.", books_df)
        elif menu == "Rak Buku":
            render_list_page(st.session_state.reading_list, "Rak Buku Saya", "Rak buku Anda masih kosong.", books_df)
            
if __name__ == "__main__":
    main()