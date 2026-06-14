import { useState, useMemo } from "react";
import { BookCard } from "../components/BookCard";
import { Book } from "../data/books";

interface CariBukuProps {
  books: Book[];
  availableTitles?: string[]; 
  availableGenres?: string[]; 
  onBookClick: (book: Book) => void;
  onAddToHistory: (title: string) => void;
}

export function CariBuku({ 
  books, 
  availableTitles = [], 
  availableGenres = [], 
  onBookClick, 
  onAddToHistory 
}: CariBukuProps) {
  const [targetTitle, setTargetTitle] = useState("");
  
  // State baru khusus untuk Autocomplete
  const [titleSearch, setTitleSearch] = useState("");
  const [showTitleOptions, setShowTitleOptions] = useState(false);

  const [targetGenre, setTargetGenre] = useState("Semua");
  const [targetRating, setTargetRating] = useState(3.5);
  const [targetYearStart, setTargetYearStart] = useState(2000);
  const [targetYearEnd, setTargetYearEnd] = useState(2024);
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // LOGIKA ANTI-LAG: Hanya merender 50 judul maksimal yang sesuai dengan ketikan
  const filteredTitles = useMemo(() => {
    if (!titleSearch) return availableTitles.slice(0, 50);
    return availableTitles
      .filter((t) => t.toLowerCase().includes(titleSearch.toLowerCase()))
      .slice(0, 50);
  }, [titleSearch, availableTitles]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = new URL("http://127.0.0.1:8000/api/recommend");
      if (targetTitle) url.searchParams.append("title", targetTitle);
      url.searchParams.append("target_genre", targetGenre);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.status === "success") {
        setResults(data.data);
        if (targetTitle) {
          onAddToHistory(targetTitle);
        }
      } else {
        console.error("Gagal mendapatkan data:", data);
        setResults([]);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setResults([]);
      alert("🚨 Gagal terhubung ke Server Python.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSearch}
        className="bg-gradient-to-br from-[rgba(129,0,0,0.8)] to-background border border-secondary rounded-xl p-8 shadow-2xl"
      >
        <h2 className="m-0 mb-2">Cari buku yang kamu mau!</h2>
        <p className="text-muted-foreground mb-6">
          Masukkan judul sebagai acuan atau filter berdasarkan kriteria.
        </p>

        <div className="grid grid-cols-4 gap-4 mb-6 relative">
          
          {/* KOLOM AUTOCOMPLETE BARU (ANTI LAG) */}
          <div className="relative">
            <label className="block mb-2 text-sm">Acuan Judul (Opsional):</label>
            <input
              type="text"
              placeholder="Ketik judul buku..."
              value={titleSearch}
              onChange={(e) => {
                setTitleSearch(e.target.value);
                setTargetTitle(e.target.value); // Pastikan value utamanya juga berubah
                setShowTitleOptions(true);
              }}
              onFocus={() => setShowTitleOptions(true)}
              // Delay sedikit agar opsi bisa diklik sebelum menu ditutup
              onBlur={() => setTimeout(() => setShowTitleOptions(false), 200)}
              className="w-full bg-input-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            
            {showTitleOptions && (
              <ul className="absolute z-20 w-full mt-1 bg-input-background border border-input rounded-lg max-h-48 overflow-y-auto shadow-xl">
                {filteredTitles.length > 0 ? (
                  filteredTitles.map((title, idx) => (
                    <li
                      key={idx}
                      onMouseDown={() => {
                        setTitleSearch(title);
                        setTargetTitle(title);
                        setShowTitleOptions(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-primary hover:text-white text-sm border-b border-border last:border-0"
                    >
                      {title}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-muted-foreground">Tidak ditemukan</li>
                )}
              </ul>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm">Genre:</label>
            <select
              value={targetGenre}
              onChange={(e) => setTargetGenre(e.target.value)}
              className="w-full bg-input-background border border-input rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Semua">Semua</option>
              {availableGenres.map((genre, idx) => (
                <option key={idx} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm">Min Rating: {targetRating}</label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={targetRating}
              onChange={(e) => setTargetRating(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-3"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">Tahun Terbit:</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="1900"
                max="2024"
                value={targetYearStart}
                onChange={(e) => setTargetYearStart(parseInt(e.target.value))}
                className="w-full bg-input-background border border-input rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span>-</span>
              <input
                type="number"
                min="1900"
                max="2024"
                value={targetYearEnd}
                onChange={(e) => setTargetYearEnd(parseInt(e.target.value))}
                className="w-full bg-input-background border border-input rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-secondary text-primary-foreground py-3 px-4 rounded-lg transition-all duration-200 hover:border-foreground border border-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Menganalisis Matriks Python..." : "Temukan Rekomendasi"}
        </button>
      </form>

      {results.length > 0 && (
        <div>
          <h4 className="mb-4">🎯 Hasil Rekomendasi</h4>
          <div className="grid grid-cols-5 gap-6">
            {results.map((book: any) => {
              const score = book.hybrid_score || 1; 
              const matchScore = Math.min(99, Math.floor(score * 100));
              
              return (
                <BookCard
                  key={book.book_id}
                  book={book}
                  matchScore={matchScore}
                  onClick={() => onBookClick(book)}
                />
              );
            })}
          </div>
        </div>
      )}

      {results.length === 0 && targetTitle && !isLoading && (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            Tidak ada buku yang cocok dengan filter tersebut.
          </p>
        </div>
      )}
    </div>
  );
}