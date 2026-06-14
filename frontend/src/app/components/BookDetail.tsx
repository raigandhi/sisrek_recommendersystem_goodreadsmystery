import { ArrowLeft } from "lucide-react";
import { Book } from "../data/books";
import confetti from "canvas-confetti";

interface BookDetailProps {
  book: Book;
  onBack: () => void;
  onAddToReadingList: () => void;
  onAddToFavorites: () => void;
  isInReadingList: boolean;
  isInFavorites: boolean;
}

export function BookDetail({
  book,
  onBack,
  onAddToReadingList,
  onAddToFavorites,
  isInReadingList,
  isInFavorites,
}: BookDetailProps) {
  const handleAddToFavorites = () => {
    onAddToFavorites();
    if (!isInFavorites) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#810000", "#630000", "#EEEBDD"],
      });
    }
  };

  return (
    <div className="space-y-6">
      <div 
        className="rounded-[20px] p-12 min-h-[200px] flex flex-col justify-center shadow-2xl bg-cover bg-center relative overflow-hidden"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url('https://images.unsplash.com/photo-1502485019198-a625bd53ceb7?w=1200')` 
        }}
      >
        <h2 className="m-0">Detail Buku</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <img
            src={book.image_url}
            alt={book.title}
            className="w-full rounded-lg shadow-2xl"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/150x220/141111/EEEBDD?text=No+Cover";
            }}
          />
        </div>
        
        <div className="md:col-span-3 space-y-4">
          <h1 className="mb-2">{book.title}</h1>
          
          <p className="text-base">
            <strong>Penulis:</strong> {book.author_name} | <strong>Rating:</strong> {book.average_rating} | <strong>Tahun:</strong> {book.publication_year}
          </p>
          
          <p className="text-base">
            <strong>Seri Buku:</strong> {book.series_title}
          </p>
          
          <p className="text-base">
            <strong>Genre:</strong> {book.genres.join(", ")}
          </p>
          
          <div className="pt-4">
            <h3 className="mb-2">Sinopsis</h3>
            <p className="text-base leading-relaxed">
              {book.description || "Deskripsi tidak tersedia di dalam arsip data."}
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-6">
            <button
              onClick={onAddToReadingList}
              className="bg-primary hover:bg-secondary text-primary-foreground py-3 px-4 rounded-lg transition-all duration-200 hover:border-foreground border border-primary"
            >
              {isInReadingList ? "Sudah di Rak" : "Tambah ke Rak Buku"}
            </button>
            
            <button
              onClick={handleAddToFavorites}
              className="bg-primary hover:bg-secondary text-primary-foreground py-3 px-4 rounded-lg transition-all duration-200 hover:border-foreground border border-primary"
            >
              {isInFavorites ? "Sudah Difavoritkan" : "Jadikan Favorit"}
            </button>
            
            <button
              onClick={onBack}
              className="bg-muted hover:bg-secondary text-foreground py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-border hover:border-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
