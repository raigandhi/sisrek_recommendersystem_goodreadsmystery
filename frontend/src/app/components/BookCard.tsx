import { Book } from "../data/books";

interface BookCardProps {
  book: Book;
  matchScore?: number;
  badge?: string;
  onClick: () => void;
}

export function BookCard({ book, matchScore, badge, onClick }: BookCardProps) {
  return (
    <div className="relative group">
      <div className="bg-gradient-to-b from-card to-background border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(129,0,0,0.35)] hover:border-t-foreground p-4 h-full">
        {(badge || matchScore) && (
          <div className="absolute top-6 left-6 bg-primary text-primary-foreground px-2 py-1 rounded text-xs z-10 shadow-lg">
            {badge || `${matchScore}% Match`}
          </div>
        )}
        
        <img
          src={book.image_url}
          alt={book.title}
          className="w-full h-64 object-cover rounded-lg mb-3 bg-sidebar"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/150x220/141111/EEEBDD?text=No+Cover";
          }}
        />
        
        <h3 className="font-semibold text-sm line-clamp-2 mb-1 min-h-[2.5em]">
          {book.title}
        </h3>
        
        <p className="text-xs text-muted-foreground">
          ⭐ {book.average_rating} {book.publication_year && `| 📅 ${book.publication_year}`}
        </p>
        
        <button
          onClick={onClick}
          className="mt-3 w-full bg-primary hover:bg-secondary text-primary-foreground py-2 px-4 rounded-lg transition-all duration-200 hover:border-foreground border border-primary"
        >
          Lihat Detail
        </button>
      </div>
    </div>
  );
}
