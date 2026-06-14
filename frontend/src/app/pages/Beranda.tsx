import { useState, useMemo } from "react";
import { HeroBanner } from "../components/HeroBanner";
import { BookCard } from "../components/BookCard";
import { Book } from "../data/books";
import { RefreshCw } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface BerandaProps {
  books: Book[];
  totalDatabaseBooks?: number; // KABEL BARU DARI APP.TSX
  onBookClick: (book: Book) => void;
  favoritesCount: number;
  readingListCount: number;
  historyCount: number;
  history: string[];
}

export function Beranda({
  books,
  totalDatabaseBooks = 0, // NILAI DEFAULT JIKA BELUM ADA DATA
  onBookClick,
  favoritesCount,
  readingListCount,
  historyCount,
  history,
}: BerandaProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return [];
    return books.filter((book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.author_name && book.author_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (book.genres && book.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())))
    ).slice(0, 10);
  }, [searchQuery, books]);

  const topBooks = useMemo(() => {
    // Pastikan books tidak kosong sebelum diolah
    if (!books || books.length === 0) return [];

    const sortedBooks = [...books].sort((a, b) => {
      // Menangani kemungkinan undefined
      const ratingA = a.average_rating || 0;
      const ratingB = b.average_rating || 0;
      const countA = a.ratings_count || 0;
      const countB = b.ratings_count || 0;

      if (ratingB !== ratingA) {
        return ratingB - ratingA;
      }
      return countB - countA;
    });
    const top100 = sortedBooks.slice(0, 100);
    // Shuffle and take 5
    const shuffled = [...top100].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, [books, refreshKey]);

  const genreData = useMemo(() => {
    const genreCounts: Record<string, number> = {};
    if (books && books.length > 0) {
      books.forEach((book) => {
        if (book.genres && Array.isArray(book.genres)) {
          book.genres.forEach((genre) => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        }
      });
    }
    
    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([genre, count]) => ({ name: genre, value: count }));
  }, [books]);

  const COLORS = ["#810000", "#630000", "#a32a2a", "#EEEBDD"];

  // Jika totalDatabaseBooks lebih besar dari jumlah kartu yang dimuat (books.length),
  // gunakan totalDatabaseBooks. Jika tidak, fallback ke books.length.
  const displayTotalBooks = totalDatabaseBooks > books.length ? totalDatabaseBooks : books.length;

  return (
    <div className="space-y-8">
      <HeroBanner
        title="Temukan buku yang anda cari!"
        subtitle="Sistem rekomendasi Hybrid yang menganalisis preferensi kolaboratif dan fitur teks."
      />

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Buku</p>
          {/* MENGGUNAKAN DISPLAY TOTAL BOOKS DI SINI */}
          <p className="text-3xl">{displayTotalBooks.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Favorit</p>
          <p className="text-3xl">{favoritesCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Rak Buku</p>
          <p className="text-3xl">{readingListCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-1">Riwayat</p>
          <p className="text-3xl">{historyCount}</p>
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Cari judul buku, penulis, atau genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-input-background border border-input rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {searchQuery && (
        <div>
          <h3 className="mb-4">Hasil Pencarian Cepat</h3>
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-5 gap-6">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.book_id}
                  book={book}
                  onClick={() => onBookClick(book)}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Tidak ada hasil di memori lokal. Gunakan menu 'Cari Buku' untuk analisis mendalam.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3>Rekomendasi Buku Rating Tertinggi</h3>
        <button
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="flex items-center gap-2 bg-primary hover:bg-secondary text-primary-foreground py-2 px-4 rounded-lg transition-all duration-200 border border-primary hover:border-foreground"
        >
          <RefreshCw className="w-4 h-4" />
          Segarkan
        </button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {topBooks.map((book, idx) => (
          <BookCard
            key={`${book.book_id}-${idx}`}
            book={book}
            badge="Top Rated"
            onClick={() => onBookClick(book)}
          />
        ))}
      </div>

      <div className="border-t border-border pt-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-card border border-muted rounded-xl p-6">
            <h4 className="mb-4">Preferensi Genre Global</h4>
            {genreData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-1">
                  {genreData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Menghitung matriks genre...</p>
            )}
          </div>

          <div className="bg-card border border-muted rounded-xl p-6">
            <h4 className="mb-4">Riwayat Acuan Terbaru</h4>
            {/* LOGIKA RIWAYAT DINAMIS */}
            {history.length > 0 ? (
              <ul className="space-y-3">
                {/* Hanya mengambil 4 riwayat terakhir dan membaliknya agar yang terbaru di atas */}
                {history.slice(-4).reverse().map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-foreground border-b border-border pb-2 last:border-0 last:pb-0">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
            )}
          </div>

          <div className="bg-card border border-muted rounded-xl p-6">
            <h4 className="mb-4">Rak Buku ({readingListCount})</h4>
            <p className="text-sm text-muted-foreground">
              {readingListCount === 0 ? "Rak masih kosong." : `${readingListCount} buku tersimpan`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}