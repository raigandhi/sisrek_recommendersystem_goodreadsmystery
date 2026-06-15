import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { BookDetail } from "./components/BookDetail";
import { Beranda } from "./pages/Beranda";
import { CariBuku } from "./pages/CariBuku";
import { ListPage } from "./pages/ListPage";
import { Riwayat } from "./pages/Riwayat";
import { Login } from "./pages/Login";

// Kita tidak lagi mengimpor mockBooks! 
import { Book } from "./data/books"; 

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState("beranda");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [readingList, setReadingList] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  // === STATE BARU UNTUK MENAMPUNG DATA DARI PYTHON ===
  const [realBooks, setRealBooks] = useState<Book[]>([]);
  const [availableTitles, setAvailableTitles] = useState<string[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [totalDatabaseBooks, setTotalDatabaseBooks] = useState<number>(0);

  // === FUNGSI MENYEDOT DATA SAAT APLIKASI PERTAMA KALI DIBUKA ===
  useEffect(() => {
    // 1. Ambil Metadata (Judul dan Genre) untuk Dropdown
    const fetchMetadata = async () => {
      try {
        const res = await fetch("https://raigandhi-sisrek-recommendersystem-goodreadsmystery.hf.space/api/metadata");
        const data = await res.json();
        if (data.status === "success") {
          setAvailableTitles(data.titles);
          setAvailableGenres(data.genres);
          setTotalDatabaseBooks(data.total_books); // TAMBAHKAN BARIS INI
        }
      } catch (error) {
        console.error("Gagal mengambil metadata:", error);
      }
    };

    // 2. Ambil Buku Top-Rated untuk tampilan awal Beranda (tanpa filter)
    const fetchInitialBooks = async () => {
      try {
        const res = await fetch("https://raigandhi-sisrek-recommendersystem-goodreadsmystery.hf.space/api/recommend?limit=100");
        const data = await res.json();
        if (data.status === "success") {
          setRealBooks(data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil buku awal:", error);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
    fetchInitialBooks();
  }, []); // Array kosong [] memastikan ini hanya berjalan 1 kali saat web di-refresh

  const handleLogin = (name: string) => {
    setUsername(name);
  };

  const handleLogout = () => {
    setUsername(null);
    setCurrentPage("beranda");
    setSelectedBook(null);
    setHistory([]);
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
  };

  const handleBackFromDetail = () => {
    setSelectedBook(null);
  };

  const handleAddToReadingList = () => {
    if (selectedBook && !readingList.some((b) => b.book_id === selectedBook.book_id)) {
      setReadingList([...readingList, selectedBook]);
    }
  };

  const handleAddToFavorites = () => {
    if (selectedBook && !favorites.some((b) => b.book_id === selectedBook.book_id)) {
      setFavorites([...favorites, selectedBook]);
    }
  };

  const handleAddToHistory = (title: string) => {
    setHistory([...history, title]);
  };

  if (!username) {
    return <Login onLogin={handleLogin} />;
  }

  // Tampilan Loading jika Python belum selesai mengirim data awal
  if (isLoadingMetadata) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <h2 className="text-primary animate-pulse">Menghubungkan ke Mesin Mystearch AI...</h2>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        username={username}
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setSelectedBook(null);
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-8">
          {selectedBook ? (
            <BookDetail
              book={selectedBook}
              onBack={handleBackFromDetail}
              onAddToReadingList={handleAddToReadingList}
              onAddToFavorites={handleAddToFavorites}
              isInReadingList={readingList.some((b) => b.book_id === selectedBook.book_id)}
              isInFavorites={favorites.some((b) => b.book_id === selectedBook.book_id)}
            />
          ) : (
            <>
              {currentPage === "beranda" && (
                <Beranda
                  books={realBooks} // KABEL PINTAR: Menggunakan data asli dari Python
                  totalDatabaseBooks={totalDatabaseBooks}
                  onBookClick={handleBookClick}
                  favoritesCount={favorites.length}
                  readingListCount={readingList.length}
                  historyCount={history.length}
                  history={history}
                />
              )}
              {currentPage === "cari" && (
                <CariBuku
                  // Karena CariBuku.tsx sudah kita ubah agar nembak API sendiri, kita cukup 
                  // passing array kosong atau data minimal agar strukturnya tidak error
                  books={[]} 
                  availableTitles={availableTitles} // Properti baru untuk dropdown
                  availableGenres={availableGenres} // Properti baru untuk dropdown
                  onBookClick={handleBookClick}
                  onAddToHistory={handleAddToHistory}
                />
              )}
              {currentPage === "riwayat" && <Riwayat history={history} />}
              {currentPage === "favorit" && (
                <ListPage
                  title="Koleksi Favorit"
                  emptyMessage="Belum ada buku yang ditandai favorit."
                  books={favorites}
                  onBookClick={handleBookClick}
                />
              )}
              {currentPage === "rak" && (
                <ListPage
                  title="Rak Buku Saya"
                  emptyMessage="Rak buku Anda masih kosong."
                  books={readingList}
                  onBookClick={handleBookClick}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}